import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const REF_PATH = 'C:/Work/website development/team portfolio freelancing - Copy (2)/team portfolio freelancing/index.html';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
});

// --- REFERENCE ---
const refPage = await browser.newPage();
await refPage.goto(`file:///${REF_PATH}`, { waitUntil: 'networkidle0', timeout: 30000 });
await refPage.evaluate(() => {
  const vh = window.innerHeight;
  for (let y = 0; y < document.documentElement.scrollHeight; y += vh * 0.7) {
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 1000));

const refData = await refPage.evaluate(() => {
  const sections = [...document.querySelectorAll('section[id]')].map(s => ({
    id: s.id,
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    height: Math.round(s.getBoundingClientRect().height),
    text: s.innerText.substring(0, 200),
  }));
  const nav = document.querySelector('nav');
  const heroH1 = document.querySelector('.hero-h');
  const marquee = document.querySelector('.marquee-track');
  const form = document.querySelector('form');
  const footer = document.querySelector('footer');
  const tocLines = [...document.querySelectorAll('.toc-line')];
  const chapterRoms = [...document.querySelectorAll('.chapter-rom')];
  const processRows = [...document.querySelectorAll('.process-row')];
  const teamCards = [...document.querySelectorAll('.team-card')];
  const rangeRows = [...document.querySelectorAll('.range-row')];
  const antiItems = [...document.querySelectorAll('.anti-item')];
  const compareRows = [...document.querySelectorAll('.compare-row')];
  const heroRule = document.querySelector('.hero-rule');
  const words = [...document.querySelectorAll('.word')];
  const manifesto = document.querySelector('#manifesto');
  const manifestoQuote = document.querySelector('.manifesto-quote');

  return {
    sections,
    navText: nav ? nav.innerText.substring(0, 200) : null,
    heroText: heroH1 ? heroH1.innerText : null,
    heroWordCount: words.length,
    marqueeText: marquee ? marquee.innerText : null,
    formAction: form ? form.action : null,
    formFields: form ? [...form.querySelectorAll('input, textarea, select')].map(f => ({ name: f.name, type: f.type, placeholder: f.placeholder })) : [],
    hasFooter: !!footer,
    footerText: footer ? footer.innerText.substring(0, 300) : null,
    tocLineCount: tocLines.length,
    tocLineTexts: tocLines.map(l => l.innerText),
    chapterRomCount: chapterRoms.length,
    chapterRomTexts: chapterRoms.map(c => c.innerText),
    processRowCount: processRows.length,
    processTexts: processRows.map(r => r.innerText.substring(0, 100)),
    teamCardCount: teamCards.length,
    teamNames: teamCards.map(c => {
      const h3 = c.querySelector('h3');
      return h3 ? h3.innerText : c.innerText.substring(0, 50);
    }),
    rangeRowCount: rangeRows.length,
    rangeTexts: rangeRows.map(r => r.innerText.substring(0, 100)),
    antiItemCount: antiItems.length,
    compareRowCount: compareRows.length,
    hasHeroRule: !!heroRule,
    hasManifesto: !!manifesto,
    manifestoText: manifestoQuote ? manifestoQuote.innerText.substring(0, 200) : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    totalHeight: document.documentElement.scrollHeight,
  };
});

// --- CURRENT BUILD ---
const buildPage = await browser.newPage();
await buildPage.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
await buildPage.evaluate(() => {
  const vh = window.innerHeight;
  for (let y = 0; y < document.documentElement.scrollHeight; y += vh * 0.7) {
    window.scrollTo({ top: y, behavior: 'instant' });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
});
await new Promise(r => setTimeout(r, 1000));

const buildData = await buildPage.evaluate(() => {
  const sections = [...document.querySelectorAll('section[id]')].map(s => ({
    id: s.id,
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    height: Math.round(s.getBoundingClientRect().height),
    text: s.innerText.substring(0, 200),
  }));
  const nav = document.querySelector('nav');
  const heroH1 = document.querySelector('.hero-h');
  const marquee = document.querySelector('.marquee-track');
  const form = document.querySelector('form');
  const footer = document.querySelector('footer');
  const tocLines = [...document.querySelectorAll('.toc-line')];
  const chapterRoms = [...document.querySelectorAll('.chapter-rom')];
  const processRows = [...document.querySelectorAll('.process-row')];
  const teamCards = [...document.querySelectorAll('.team-card')];
  const rangeRows = [...document.querySelectorAll('.range-row')];
  const antiItems = [...document.querySelectorAll('.anti-item')];
  const compareRows = [...document.querySelectorAll('.compare-row')];
  const heroRule = document.querySelector('.hero-rule');
  const words = [...document.querySelectorAll('.word')];
  const manifesto = document.querySelector('#manifesto');
  const manifestoQuote = document.querySelector('.manifesto-quote');

  return {
    sections,
    navText: nav ? nav.innerText.substring(0, 200) : null,
    heroText: heroH1 ? heroH1.innerText : null,
    heroWordCount: words.length,
    marqueeText: marquee ? marquee.innerText : null,
    formAction: form ? form.action : null,
    formFields: form ? [...form.querySelectorAll('input, textarea, select')].map(f => ({ name: f.name, type: f.type, placeholder: f.placeholder })) : [],
    hasFooter: !!footer,
    footerText: footer ? footer.innerText.substring(0, 300) : null,
    tocLineCount: tocLines.length,
    tocLineTexts: tocLines.map(l => l.innerText),
    chapterRomCount: chapterRoms.length,
    chapterRomTexts: chapterRoms.map(c => c.innerText),
    processRowCount: processRows.length,
    processTexts: processRows.map(r => r.innerText.substring(0, 100)),
    teamCardCount: teamCards.length,
    teamNames: teamCards.map(c => {
      const h3 = c.querySelector('h3');
      return h3 ? h3.innerText : c.innerText.substring(0, 50);
    }),
    rangeRowCount: rangeRows.length,
    rangeTexts: rangeRows.map(r => r.innerText.substring(0, 100)),
    antiItemCount: antiItems.length,
    compareRowCount: compareRows.length,
    hasHeroRule: !!heroRule,
    hasManifesto: !!manifesto,
    manifestoText: manifestoQuote ? manifestoQuote.innerText.substring(0, 200) : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    totalHeight: document.documentElement.scrollHeight,
  };
});

await browser.close();

// --- COMPARE ---
console.log('\n===== COMPARISON REPORT =====\n');

function check(label, refVal, buildVal) {
  const match = JSON.stringify(refVal) === JSON.stringify(buildVal);
  const icon = match ? '✓' : '✗';
  console.log(`${icon} ${label}`);
  if (!match) {
    console.log(`  REF:  ${JSON.stringify(refVal).substring(0, 150)}`);
    console.log(`  BUILD: ${JSON.stringify(buildVal).substring(0, 150)}`);
  }
  return match;
}

let pass = 0, fail = 0;
function result(label, match) { match ? pass++ : fail++; }

result('Hero text', check('Hero text', refData.heroText, buildData.heroText));
result('Hero word-reveal count', check('Hero word-reveal count', refData.heroWordCount, buildData.heroWordCount));
result('TOC line count', check('TOC line count', refData.tocLineCount, buildData.tocLineCount));
result('TOC line texts', check('TOC line texts', refData.tocLineTexts, buildData.tocLineTexts));
result('Chapter rom count', check('Chapter rom count', refData.chapterRomCount, buildData.chapterRomCount));
result('Chapter rom texts', check('Chapter rom texts', refData.chapterRomTexts, buildData.chapterRomTexts));
result('Section count', check('Section count', refData.sections.length, buildData.sections.length));
result('Section IDs', check('Section IDs', refData.sections.map(s=>s.id), buildData.sections.map(s=>s.id)));
result('Marquee text', check('Marquee text', refData.marqueeText, buildData.marqueeText));
result('Process row count', check('Process row count', refData.processRowCount, buildData.processRowCount));
result('Team card count', check('Team card count', refData.teamCardCount, buildData.teamCardCount));
result('Team names', check('Team names', refData.teamNames, buildData.teamNames));
result('Range row count', check('Range row count', refData.rangeRowCount, buildData.rangeRowCount));
result('Range texts', check('Range texts', refData.rangeTexts, buildData.rangeTexts));
result('Anti-item count', check('Anti-item count', refData.antiItemCount, buildData.antiItemCount));
result('Compare row count', check('Compare row count', refData.compareRowCount, buildData.compareRowCount));
result('Hero rule', check('Hero rule', refData.hasHeroRule, buildData.hasHeroRule));
result('Manifesto section', check('Manifesto section', refData.hasManifesto, buildData.hasManifesto));
result('Manifesto quote', check('Manifesto quote', refData.manifestoText, buildData.manifestoText));
result('Footer exists', check('Footer exists', refData.hasFooter, buildData.hasFooter));
result('Form action', check('Form action', refData.formAction, buildData.formAction));
result('Form fields', check('Form fields', refData.formFields.length, buildData.formFields.length));

console.log(`\n===== RESULTS: ${pass} passed, ${fail} failed =====\n`);
