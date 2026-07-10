import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REF_PATH = 'C:/Work/website development/team portfolio freelancing - Copy (2)/team portfolio freelancing/index.html';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
});

// REF
const refPage = await browser.newPage();
await refPage.goto(`file:///${REF_PATH}`, { waitUntil: 'networkidle0', timeout: 30000 });
await refPage.evaluate(() => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 500));
const refRanges = await refPage.evaluate(() =>
  [...document.querySelectorAll('.range-row')].map(r => r.innerText)
);

// BUILD
const buildPage = await browser.newPage();
await buildPage.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
await buildPage.evaluate(() => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 500));
const buildRanges = await buildPage.evaluate(() =>
  [...document.querySelectorAll('.range-row')].map(r => r.innerText)
);

await browser.close();

console.log('\n=== RANGE ROW TEXT COMPARISON ===\n');
for (let i = 0; i < Math.max(refRanges.length, buildRanges.length); i++) {
  const r = refRanges[i] || '(missing)';
  const b = buildRanges[i] || '(missing)';
  const match = r === b;
  console.log(`Row ${i}: ${match ? '✓' : '✗'}`);
  if (!match) {
    console.log(`  REF:  ${JSON.stringify(r)}`);
    console.log(`  BUILD: ${JSON.stringify(b)}`);
  }
}
