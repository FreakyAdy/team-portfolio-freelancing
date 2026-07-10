import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REF_PATH = 'C:/Work/website development/team portfolio freelancing - Copy (2)/team portfolio freelancing/index.html';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
});

const refPage = await browser.newPage();
await refPage.goto(`file:///${REF_PATH}`, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 500));
const refRow = await refPage.evaluate(() =>
  [...document.querySelectorAll('.range-row')][2].innerText
);

const buildPage = await browser.newPage();
await buildPage.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 1000));
const buildRow = await buildPage.evaluate(() =>
  [...document.querySelectorAll('.range-row')][2].innerText
);

await browser.close();

console.log('REF bytes around "don":');
const refIdx = refRow.indexOf('don');
for (let i = refIdx; i < refIdx + 10; i++) {
  console.log(`  [${i}] char=${refRow[i]} code=${refRow.charCodeAt(i)}`);
}

console.log('\nBUILD bytes around "don":');
const buildIdx = buildRow.indexOf('don');
for (let i = buildIdx; i < buildIdx + 10; i++) {
  console.log(`  [${i}] char=${buildRow[i]} code=${buildRow.charCodeAt(i)}`);
}
