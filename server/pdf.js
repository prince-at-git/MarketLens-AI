import PDFDocument from 'pdfkit';

// ── Helpers ───────────────────────────────────────────────────────────────────

function section(doc, title) {
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#18181b')
    .text(title.toUpperCase(), { characterSpacing: 0.8 })
    .moveDown(0.2);
  doc.font('Helvetica').fontSize(10).fillColor('#27272a');
}
function kv(doc, label, value) {
  doc
    .font('Helvetica-Bold').fontSize(10).fillColor('#27272a')
    .text(`${label}: `, { continued: true })
    .font('Helvetica').fillColor('#3f3f46')
    .text(String(value || 'N/A'))
    .moveDown(0.15);
}

function divider(doc) {
  doc
    .moveTo(50, doc.y + 4)
    .lineTo(550, doc.y + 4)
    .strokeColor('#e4e4e7')
    .lineWidth(0.5)
    .stroke()
    .moveDown(0.6);
}

// Simple row-based table
function table(doc, headers, rows) {
  const colCount = headers.length;
  const pageWidth = 500;
  const colWidth = pageWidth / colCount;
  const startX = 50;
  let y = doc.y;

  // Header row
  doc.rect(startX, y, pageWidth, 18).fill('#18181b');
  headers.forEach((h, i) => {
    doc
      .font('Helvetica-Bold').fontSize(8.5)
      .fillColor('#ffffff')
      .text(h, startX + i * colWidth + 4, y + 4, { width: colWidth - 8, ellipsis: true });
  });
  y += 18;

  // Data rows
  rows.forEach((row, rowIdx) => {
    const rowColor = rowIdx % 2 === 0 ? '#fafafa' : '#f4f4f5';
    const cellHeight = 20;
    doc.rect(startX, y, pageWidth, cellHeight).fill(rowColor);
    row.forEach((cell, i) => {
      doc
        .font('Helvetica').fontSize(8.5)
        .fillColor('#27272a')
        .text(String(cell || 'N/A'), startX + i * colWidth + 4, y + 5, {
          width: colWidth - 8,
          ellipsis: true,
          lineBreak: false,
        });
    });
    y += cellHeight;
  });

  doc.y = y + 8;
  doc.moveDown(0.4);
}

// ── Main generator ────────────────────────────────────────────────────────────

export function generatePDF(rawData) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Cover
    doc
      .fontSize(22).font('Helvetica-Bold').fillColor('#09090b')
      .text('Market Research Report', { align: 'center' })
      .moveDown(0.3)
      .fontSize(10).font('Helvetica').fillColor('#71717a')
      .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' })
      .moveDown(2);

    rawData.forEach((item, idx) => {
      if (idx > 0) doc.addPage();

      if (item.error) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#09090b').text(item.company).moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor('#cc0000').text(`Research failed: ${item.error}`);
        return;
      }

      const d = item.data || {};
      const fin = d.financials || {};
      const ops = d.operational || {};

      // Company heading
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#09090b').text(d.company_name || item.company).moveDown(0.2);
      divider(doc);

      // Meta
      section(doc, 'Company Profile');
      kv(doc, 'Status', d.status);
      kv(doc, 'Core Sector', d.core_sector);
      kv(doc, 'Sub Sector', d.sub_sector);
      kv(doc, 'Products / Categories', (d.product_categories || []).join(', '));
      kv(doc, 'Geographic Presence', (d.geographic_presence || []).join(', '));
      doc.moveDown(0.5);

      // Strategy summary
      section(doc, 'Strategic Summary');
      doc.text(d.strategy_summary || 'N/A', { lineGap: 3 }).moveDown(0.5);
      divider(doc);

      // Financials table
      section(doc, 'Financial Metrics');
      table(doc,
        ['Metric', 'Value', 'Period', 'Source'],
        [
          ['Total Revenue',      fin.revenue?.value,          fin.revenue?.period,          fin.revenue?.source],
          ['YoY Growth',         fin.yoy_growth?.value,       fin.yoy_growth?.period,       fin.yoy_growth?.source],
          ['Operating Margin',   fin.operating_margin?.value, fin.operating_margin?.period, fin.operating_margin?.source],
          ['Gross Margin',       fin.gross_margin?.value,     fin.gross_margin?.period,     fin.gross_margin?.source],
          ['Net Profit',         fin.net_profit?.value,       fin.net_profit?.period,       fin.net_profit?.source],
          ['Market Share',       fin.market_share?.value,     fin.market_share?.period,     fin.market_share?.source],
          ['Market Valuation',   fin.market_valuation?.value, fin.market_valuation?.date,   fin.market_valuation?.source],
        ]
      );
      divider(doc);

      // Innovative Products
      if ((d.innovative_products || []).length > 0) {
        section(doc, 'Innovative Products & Offerings');
        doc.font('Helvetica').fontSize(10).fillColor('#3f3f46');
        d.innovative_products.forEach(p => {
          doc.text(`• ${p.name}${p.description && p.description !== 'N/A' ? ` — ${p.description}` : ''}`, { indent: 8 });
        });
        doc.moveDown(0.4);
      }
      divider(doc);

      // Operational Metrics table
      section(doc, 'Operational Metrics');
      table(doc,
        ['Metric', 'Value', 'Period', 'Source'],
        [
          ['Employee Count',       ops.employee_count?.value,       ops.employee_count?.period,       ops.employee_count?.source],
          ['Distribution Centers', ops.distribution_centers?.value, ops.distribution_centers?.period, ops.distribution_centers?.source],
          ['Customer Count',       ops.customer_count?.value,       ops.customer_count?.period,       ops.customer_count?.source],
        ]
      );
      kv(doc, 'Supply Chain', ops.supply_chain_model?.description);
      kv(doc, 'Technology', ops.tech_infrastructure?.description);
      kv(doc, 'Certifications', ops.certifications?.description);
      doc.moveDown(0.4);
      divider(doc);

      // Key Customers
      if ((d.key_customers || []).length > 0) {
        section(doc, 'Key Customers & Contracts');
        table(doc,
          ['Customer', 'Contract Type', 'Annual Value', 'Status'],
          d.key_customers.map(c => [c.name, c.contract_type, c.annual_value, c.status])
        );
        divider(doc);
      }

      // Competitors
      section(doc, 'Key Competitors');
      doc.font('Helvetica').fontSize(10).fillColor('#3f3f46');
      (d.competitors || []).forEach(c => doc.text(`• ${c}`, { indent: 8 }));
      if (!(d.competitors || []).length) doc.text('N/A');
      doc.moveDown(0.4);
      divider(doc);

      // Intelligence Entries
      if ((d.intelligence_entries || []).length > 0) {
        section(doc, 'Recent Intelligence');
        d.intelligence_entries.slice(0, 5).forEach(e => {
          doc
            .font('Helvetica-Bold').fontSize(9.5).fillColor('#18181b')
            .text(`[${e.importance}] ${e.title}`, { continued: false })
            .font('Helvetica').fontSize(9).fillColor('#3f3f46')
            .text(e.details?.substring(0, 240) + (e.details?.length > 240 ? '...' : ''), { indent: 8, lineGap: 2 })
            .moveDown(0.3);
        });
        divider(doc);
      }

      // Tags
      section(doc, 'Categorization');
      kv(doc, 'Sectors Served', (d.sectors_served || []).join(', '));
      kv(doc, 'Geographic Tags', (d.geographic_tags || []).join(', '));
      kv(doc, 'Strategic Tags', (d.strategic_tags || []).join(', '));
      doc.moveDown(0.4);
      divider(doc);

      // Analysis
      section(doc, 'Analysis');
      kv(doc, 'Competitive Positioning', d.competitive_positioning);
      kv(doc, 'Growth Trajectory', d.growth_trajectory);
      kv(doc, 'Risk Factors', d.risk_factors);
      kv(doc, 'Opportunities', d.opportunities);
      doc.moveDown(0.4);

      // Sources
      if ((item.sources || []).length > 0) {
        divider(doc);
        section(doc, 'Sources');
        doc.font('Helvetica').fontSize(8).fillColor('#52525b');
        item.sources.slice(0, 15).forEach((url, i) => {
          doc.text(`[${i + 1}] ${url}`, { lineGap: 2 });
        });
      }
    });

    doc.end();
  });
}
