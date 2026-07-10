import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();

// Capture console errors
page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
});
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

// Test portal/invoices
console.log('--- Testing /portal/invoices ---');
const res1 = await page.goto('http://localhost:3000/portal/invoices', { waitUntil: 'networkidle0', timeout: 15000 });
console.log('Status:', res1.status());
const title1 = await page.title();
console.log('Title:', title1);
const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log('Body:', bodyText);

// Test studio/dashboard
console.log('\n--- Testing /studio/dashboard ---');
const res2 = await page.goto('http://localhost:3000/studio/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
console.log('Status:', res2.status());
const bodyText2 = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log('Body:', bodyText2);

await browser.close();
