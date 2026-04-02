import HTMLtoDOCX from 'html-to-docx';
import { buildHTML } from './buildHTML.js';

export async function generateDOCX(rawData) {
  const html = buildHTML(rawData);

  const buffer = await HTMLtoDOCX(html, null, {
    table:     { row: { cantSplit: true } },
    footer:    true,
    pageNumber: true,
    font:      'Calibri',
    fontSize:  22,
    margins:   { top: 1080, right: 1080, bottom: 1080, left: 1080 },
  });

  return buffer;
}
