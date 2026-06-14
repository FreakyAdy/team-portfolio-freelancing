import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const PORT = 3000;

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
  'X-XSS-Protection': '0', // modern best practice — disable legacy auditor, rely on CSP
  'X-Permitted-Cross-Domain-Policies': 'none',
};

const server = http.createServer(async (req, res) => {
  try {
    // Reject anything that isn't GET/HEAD — no PUT/POST/etc. against a static server
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, 'Allow': 'GET, HEAD' });
      return res.end('Method not allowed');
    }

    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Hard-reject null bytes and other obviously malicious patterns
    if (urlPath.includes('\0') || urlPath.includes('\\')) {
      res.writeHead(400, SECURITY_HEADERS); return res.end('Bad request');
    }

    let filePath = resolve(join(ROOT, urlPath === '/' ? '/index.html' : urlPath));

    // Block path traversal
    if (!filePath.startsWith(ROOT + sep) && filePath !== ROOT) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    // Block access to dotfiles (.env, .git, .claude, etc) except /.well-known/
    const rel = filePath.slice(ROOT.length).replace(/\\/g, '/');
    if (/(^|\/)\.(?!well-known\/)/.test(rel)) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    // Block server-internals: node_modules, server scripts, lockfiles, manifests
    if (
      /(^|\/)node_modules(\/|$)/i.test(rel) ||
      /\.(mjs|cjs|lock|log)$/i.test(rel) ||
      /(^|\/)(package(-lock)?\.json|claude\.md|readme\.md)$/i.test(rel)
    ) {
      res.writeHead(403, SECURITY_HEADERS); return res.end('Forbidden');
    }

    let s;
    try { s = await stat(filePath); }
    catch { res.writeHead(404, SECURITY_HEADERS); return res.end('Not found'); }

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
    res.writeHead(500, SECURITY_HEADERS); res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`serving ${ROOT} on http://localhost:${PORT}`);
});
