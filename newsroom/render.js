// Renders one edition of the morning carousel.
//   node newsroom/render.js newsroom/editions/2026-10-19
// Reads edition.json from that folder and writes:
//   carousel.html   viewer page (published as the artifact)
//   slides/NN.png   one 1080x1350 image per slide
//   carousel.pdf    all slides, one per page
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dir = path.resolve(process.argv[2] || '.');
  const edition = JSON.parse(fs.readFileSync(path.join(dir, 'edition.json'), 'utf8'));
  // once the site is live, the carousel's links point at it instead of at Claude artifacts
  const site = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json'), 'utf8'));
  const siteUrl = (site.siteUrl || '').replace(/\/+$/, '');
  if (siteUrl) edition.floorUrl = siteUrl + '/';
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const json = JSON.stringify(edition).replace(/</g, '\\u003c');
  const html = template.replace('<script id="edition" type="application/json">{}</script>',
    '<script id="edition" type="application/json">' + json + '</script>');
  fs.writeFileSync(path.join(dir, 'carousel.html'), html);

  // logos travel with the edition so the page works on its own
  const logoSrc = path.join(__dirname, '..', 'prototype', 'logos');
  fs.mkdirSync(path.join(dir, 'logos'), { recursive: true });
  for (const f of fs.readdirSync(logoSrc)) fs.copyFileSync(path.join(logoSrc, f), path.join(dir, 'logos', f));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  // loaded from a file next to the logos so relative image paths resolve
  const printFile = path.join(dir, '_print.html');
  fs.writeFileSync(printFile, '<!doctype html><html><head><meta charset="utf-8"></head><body data-mode="print">' + html + '</body></html>');
  await page.goto('file://' + printFile, { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.body.dataset.mode = 'print'; return document.fonts.ready; });
  await page.waitForTimeout(400);

  const out = path.join(dir, 'slides');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].screenshot({ path: path.join(out, String(i + 1).padStart(2, '0') + '.png') });
  }
  await page.pdf({ path: path.join(dir, 'carousel.pdf'), width: '1080px', height: '1350px', printBackground: true });
  await browser.close();
  fs.rmSync(printFile);
  console.log('Rendered ' + slides.length + ' slides to ' + dir);
})();
