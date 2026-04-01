import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  AlignmentType,
  WidthType,
  ShadingType,
  PageBreak,
} from 'docx';

// ── Helpers ──────────────────────────────────────────────────────────────────

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 100 },
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
  });
}

function heading3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 60 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: String(text || 'N/A'),
        size: 22,
        color: opts.muted ? '71717a' : '18181b',
      }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function bold(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, color: '18181b' }),
      new TextRun({ text: String(value || 'N/A'), size: 22, color: '27272a' }),
    ],
    spacing: { before: 40, after: 40 },
  });
}

function bullet(text) {
  return new Paragraph({
    text: String(text || ''),
    bullet: { level: 0 },
    spacing: { before: 30, after: 30 },
  });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e4e4e7' } },
    spacing: { before: 160, after: 160 },
  });
}

function tableHeaderCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: 'ffffff' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
      }),
    ],
    shading: { type: ShadingType.SOLID, color: '18181b' },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });
}

function tableCell(text) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text || 'N/A'), size: 20, color: '27272a' })],
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });
}

function simpleTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(tableHeaderCell), tableHeader: true }),
      ...rows.map(
        row => new TableRow({ children: row.map(tableCell) })
      ),
    ],
  });
}

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateDOCX(rawData) {
  const allChildren = [];

  // Cover title
  allChildren.push(
    new Paragraph({
      children: [new TextRun({ text: 'Market Research Report', bold: true, size: 52, color: '09090b' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString()}`, size: 20, color: '71717a' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
    })
  );

  rawData.forEach((item, idx) => {
    // Page break between companies (not before first)
    if (idx > 0) {
      allChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    if (item.error) {
      allChildren.push(heading1(item.company), para(`Research failed: ${item.error}`, { muted: true }));
      return;
    }

    const d = item.data || {};
    const fin = d.financials || {};
    const ops = d.operational || {};

    // ── Company Name & Meta ─────────────────────────────────────────────────
    allChildren.push(heading1(d.company_name || item.company));
    allChildren.push(
      bold('Status', d.status),
      bold('Core Sector', d.core_sector),
      bold('Sub Sector', d.sub_sector),
      bold('Products / Categories', (d.product_categories || []).join(', ')),
      bold('Geographic Presence', (d.geographic_presence || []).join(', ')),
    );
    allChildren.push(divider());

    // ── Strategic Summary ──────────────────────────────────────────────────
    allChildren.push(heading2('Strategic Summary'));
    allChildren.push(para(d.strategy_summary));
    allChildren.push(divider());

    // ── Financial Metrics ──────────────────────────────────────────────────
    allChildren.push(heading2('Financial Metrics'));
    allChildren.push(
      simpleTable(
        ['Metric', 'Value', 'Period', 'Source'],
        [
          ['Total Revenue',      fin.revenue?.value,          fin.revenue?.period,          fin.revenue?.source],
          ['YoY Growth Rate',    fin.yoy_growth?.value,       fin.yoy_growth?.period,       fin.yoy_growth?.source],
          ['Operating Margin',   fin.operating_margin?.value, fin.operating_margin?.period, fin.operating_margin?.source],
          ['Gross Margin',       fin.gross_margin?.value,     fin.gross_margin?.period,     fin.gross_margin?.source],
          ['Net Profit',         fin.net_profit?.value,       fin.net_profit?.period,       fin.net_profit?.source],
          ['Market Share',       fin.market_share?.value,     fin.market_share?.period,     fin.market_share?.source],
          ['Market Valuation',   fin.market_valuation?.value, fin.market_valuation?.date,   fin.market_valuation?.source],
        ]
      )
    );
    allChildren.push(divider());

    // ── Innovative Products ────────────────────────────────────────────────
    if ((d.innovative_products || []).length > 0) {
      allChildren.push(heading2('Innovative Products & Offerings'));
      d.innovative_products.forEach(p => {
        allChildren.push(bullet(`${p.name}${p.description && p.description !== 'N/A' ? ` — ${p.description}` : ''}`));
      });
      allChildren.push(divider());
    }

    // ── Operational Metrics ────────────────────────────────────────────────
    allChildren.push(heading2('Operational Metrics'));
    allChildren.push(
      simpleTable(
        ['Metric', 'Value', 'Period', 'Source'],
        [
          ['Employee Count',       ops.employee_count?.value,       ops.employee_count?.period,       ops.employee_count?.source],
          ['Distribution Centers', ops.distribution_centers?.value, ops.distribution_centers?.period, ops.distribution_centers?.source],
          ['Number of Customers',  ops.customer_count?.value,       ops.customer_count?.period,       ops.customer_count?.source],
        ]
      )
    );
    allChildren.push(
      bold('Supply Chain Model', ops.supply_chain_model?.description),
      bold('Technology Infrastructure', ops.tech_infrastructure?.description),
      bold('Certifications', ops.certifications?.description),
    );
    allChildren.push(divider());

    // ── Key Customers ──────────────────────────────────────────────────────
    if ((d.key_customers || []).length > 0) {
      allChildren.push(heading2('Key Customers & Contracts'));
      allChildren.push(
        simpleTable(
          ['Customer', 'Contract Type', 'Annual Value', 'Status', 'Source'],
          d.key_customers.map(c => [c.name, c.contract_type, c.annual_value, c.status, c.source])
        )
      );
      allChildren.push(divider());
    }

    // ── Competitors ────────────────────────────────────────────────────────
    allChildren.push(heading2('Key Sector Competitors'));
    (d.competitors || []).forEach(c => allChildren.push(bullet(c)));
    if (!(d.competitors || []).length) allChildren.push(para('N/A'));
    allChildren.push(divider());

    // ── Intelligence Entries ───────────────────────────────────────────────
    if ((d.intelligence_entries || []).length > 0) {
      allChildren.push(heading2('Recent Intelligence Entries'));
      allChildren.push(
        simpleTable(
          ['Title', 'Details', 'Importance', 'Source', 'Date'],
          d.intelligence_entries.map(e => [e.title, e.details, e.importance, e.source, e.date])
        )
      );
      allChildren.push(divider());
    }

    // ── Categorization ─────────────────────────────────────────────────────
    allChildren.push(heading2('Categorization & Tags'));
    allChildren.push(
      bold('Sectors Served', (d.sectors_served || []).join(', ')),
      bold('Geographic Tags', (d.geographic_tags || []).join(', ')),
      bold('Strategic Tags', (d.strategic_tags || []).join(', ')),
    );
    allChildren.push(divider());

    // ── Analysis ───────────────────────────────────────────────────────────
    allChildren.push(heading2('Analysis & Context'));
    allChildren.push(heading3('Competitive Positioning'));
    allChildren.push(para(d.competitive_positioning));
    allChildren.push(heading3('Growth Trajectory'));
    allChildren.push(para(d.growth_trajectory));
    allChildren.push(heading3('Risk Factors'));
    allChildren.push(para(d.risk_factors));
    allChildren.push(heading3('Opportunities'));
    allChildren.push(para(d.opportunities));
    allChildren.push(divider());

    // ── Sources ────────────────────────────────────────────────────────────
    if ((item.sources || []).length > 0) {
      allChildren.push(heading2('Sources'));
      item.sources.forEach((url, i) => allChildren.push(bullet(`[${i + 1}] ${url}`)));
    }
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{ children: allChildren }],
  });

  return Packer.toBuffer(doc);
}
