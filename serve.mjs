import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const PORT = 3000;

// --- Limits ---
const MAX_URL_BYTES = 2048;
const MAX_HEADER_BYTES = 8192;
const MAX_CONNECTIONS = 256;
const HEADERS_TIMEOUT_MS = 8_000;     // slowloris: must send headers within 8s
const REQUEST_TIMEOUT_MS = 30_000;    // full request must complete in 30s
const KEEPALIVE_TIMEOUT_MS = 10_000;  // close idle keep-alive after 10s

// --- Rate limit: per-IP sliding window ---
const RL_WINDOW_MS = 60_000;
const RL_MAX_REQUESTS = 120;  // 2 req/sec average sustained; bursts allowed
const ipBuckets = new Map(); // ip -> { windowStart, count }

function rateLimited(ip) {
  const now = Date.now();
  const b = ipBuckets.get(ip);
  if (!b || now - b.windowStart > RL_WINDOW_MS) {
    ipBuckets.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  b.count++;
  return b.count > RL_MAX_REQUESTS;
}
// GC stale buckets every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, b] of ipBuckets) {
    if (now - b.windowStart > RL_WINDOW_MS * 2) ipBuckets.delete(ip);
  }
}, 60_000).unref();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
};

// Locked-down CSP: only the CDNs this site actually uses.
// 'unsafe-inline' is required for Tailwind CDN's runtime config + this site's
// inline <style>/<script> blocks; tighten with nonces if moving to a build pipeline.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://formsubmit.co https://esm.sh",
  "form-action 'self' https://formsubmit.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-XSS-Protection': '0',
  'X-Permitted-Cross-Domain-Policies': 'none',
};

function clientIp(req) {
  // Behind a proxy you'd trust X-Forwarded-For; localhost we use remoteAddress
  return (req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
}

const server = http.createServer(async (req, res) => {
  try {
    // 1. Rate limit
    const ip = clientIp(req);
    if (rateLimited(ip)) {
      res.writeHead(429, { ...SECURITY_HEADERS, 'Retry-After': '60' });
      return res.end('Too many requests');
    }

    // 2. URL length cap (URL-based DoS)
    if ((req.url || '').length > MAX_URL_BYTES) {
      res.writeHead(414, SECURITY_HEADERS); return res.end('URI too long');
    }

    // 3. Method allow-list
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, 'Allow': 'GET, HEAD' });
      return res.end('Method not allowed');
    }

    // 4. Decode + sanitize URL
    let urlPath;
    try { urlPath = decodeURIComponent(req.url.split('?')[0]); }
    catch { res.writeHead(400, SECURITY_HEADERS); return res.end('Bad request'); }

    // Null bytes, backslashes, raw control chars — reject
    if (/[\0-\x1f\\]/.test(urlPath)) {
      res.writeHead(400, SECURITY_HEADERS); return res.end('Bad request');
    }

    // 5. Resolve to a candidate path
    let filePath = resolve(join(ROOT, urlPath === '/' ? '/index.html' : urlPath));

    // 6. Path traversal (lexical) — must be inside ROOT
    if (!filePath.startsWith(ROOT + sep) && filePath !== ROOT) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    // 7. Dotfile block (except /.well-known/)
    const rel = filePath.slice(ROOT.length).replace(/\\/g, '/');
    if (/(^|\/)\.(?!well-known\/)/.test(rel)) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    // 8. Internal/dev artifacts block
    if (
      /(^|\/)node_modules(\/|$)/i.test(rel) ||
      /(^|\/)temporary_screenshots(\/|$)/i.test(rel) ||
      /\.(mjs|cjs|lock|log)$/i.test(rel) ||
      /(^|\/)(package(-lock)?\.json|claude\.md|readme\.md)$/i.test(rel)
    ) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    // 9. lstat first (so we never follow a symlink we don't know about),
    //    then realpath, then verify the real path is still inside ROOT.
    //    Defeats symlink-based path traversal.
    let s;
    try {
      const realPath = await realpath(filePath);
      if (!realPath.startsWith(ROOT + sep) && realPath !== ROOT) {
        res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
      }
      filePath = realPath;
      s = await stat(filePath);
    } catch {
      res.writeHead(404, SECURITY_HEADERS); return res.end('Not found');
    }

    if (s.isDirectory()) filePath = join(filePath, 'index.html');

    const data = await readFile(filePath);
    const mime = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': mime,
      'Cache-Control': 'no-store',
    });
    res.end(req.method === 'HEAD' ? '' : data);
  } catch (err) {
    // Never leak err.message to the client
    res.writeHead(500, SECURITY_HEADERS); res.end('Server error');
  }
});

// Slowloris + connection-exhaustion defenses
server.maxHeadersCount = 50;
server.maxConnections = MAX_CONNECTIONS;
server.headersTimeout = HEADERS_TIMEOUT_MS;
server.requestTimeout = REQUEST_TIMEOUT_MS;
server.keepAliveTimeout = KEEPALIVE_TIMEOUT_MS;

server.listen(PORT, () => {
  console.log(`serving ${ROOT} on http://localhost:${PORT}`);
});
