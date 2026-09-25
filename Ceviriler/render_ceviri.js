const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve('ceviri.html'), { waitUntil: 'load' });
  const hdr = `<div style="width:100%;font-family:'Liberation Sans',sans-serif;font-size:7.5pt;font-style:italic;color:#222;padding:0 22mm;display:flex;justify-content:space-between;margin-top:9mm;">
     <span>Turk J Fam Pract 2026;30(2):97-106</span><span>Cenberlitaş E ve ark. Sigara Bırakma Durumu (Türkçe çeviri)</span></div>`;
  const ftr = `<div style="width:100%;font-family:'Liberation Sans',sans-serif;font-size:8pt;font-weight:bold;color:#222;padding:0 22mm;text-align:right;margin-bottom:7mm;"><span class="pageNumber"></span></div>`;
  await page.pdf({
    path: 'ceviri.pdf',
    width: '215mm', height: '285mm',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: hdr,
    footerTemplate: ftr,
    margin: { top: '24mm', bottom: '22mm', left: '22mm', right: '22mm' },
  });
  await browser.close();
})();
