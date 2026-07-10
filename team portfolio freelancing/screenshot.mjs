// Usage: node screenshot.mjs http://localhost:3000 [label]
// Saves to ./temporary_screenshots/screenshot-N.png (or -N-label.png)
import puppeteer from 'puppeteer-core';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const OUT = './temporary_screenshots';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

await mkdir(OUT, { recursive: true });

// next sequential number
const existing = (await readdir(OUT)).filter(f => /^screenshot-\d+/.test(f));
const next = existing.length + 1;
const fname = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const out = join(OUT, fname);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// Park mouse offscreen
await page.mouse.move(-100, -100);
// Inject style to hide custom cursor (after page scripts have run)
await page.addStyleTag({ content: '.cur-dot,.cur-ring{display:none!important}' });
// Also nuke them from DOM as belt-and-suspenders
await page.evaluate(() => {
  document.querySelectorAll('.cur-dot,.cur-ring').forEach(n => n.remove());
});
await new Promise(r => setTimeout(r, 1500)); // settle animations + 3D warmup

// Scroll-pass: walk down the page so IntersectionObserver-based reveals fire
const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const viewHeight = await page.evaluate(() => window.innerHeight);
for (let y = 0; y < docHeight; y += Math.floor(viewHeight * 0.7)) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
  await new Promise(r => setTimeout(r, 180));
}
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await new Promise(r => setTimeout(r, 600));

// Full-page screenshot
await page.screenshot({ path: out, fullPage: true });

// Also capture viewport-only snapshots of each section
const sections = await page.$$eval('section[id]', els => els.map(e => ({ id: e.id, top: e.getBoundingClientRect().top + window.scrollY })));
for (const s of sections) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s.top);
  await new Promise(r => setTimeout(r, 700));
  const sectionFile = join(OUT, `screenshot-${next}-${s.id}.png`);
  await page.screenshot({ path: sectionFile, fullPage: false });
}

await browser.close();
console.log('saved:', out);
