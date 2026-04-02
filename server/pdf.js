import puppeteer from 'puppeteer';
import { buildHTML } from './buildHTML.js';

export async function generatePDF(rawData) {
  const html = buildHTML(rawData);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8pt;color:#71717a;width:100%;text-align:center;padding-top:4mm;">
        Competitor Metrics Extraction Report — Internal Use Only
      </div>`,
      footerTemplate: `<div style="font-size:8pt;color:#71717a;width:100%;text-align:center;padding-bottom:4mm;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
