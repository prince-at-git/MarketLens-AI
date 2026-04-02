// Builds a fully-styled, self-contained HTML report from rawData.
// All CSS is scoped to .report-root to prevent bleed into the parent app.

const NA = 'Not Available'

function s(val) {
  const v = val != null ? String(val).trim() : ''
  return v && v !== 'N/A' && v !== 'n/a' ? v : NA
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function titleCase(str) {
  return (str || '').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
}

// ── HTML fragments ────────────────────────────────────────────────────────────

function kvRow(label, value) {
  return `<div class="kv-label">${esc(label)}</div><div class="kv-value">${esc(s(value))}</div>`
}

function finRow(label, obj) {
  const v    = esc(s(obj?.value))
  const p    = esc(s(obj?.period))
  const note = esc(s(obj?.notes))
  const src  = obj?.source && obj.source !== NA && obj.source !== 'N/A' && obj.source !== '—'
    ? `<a href="${esc(obj.source)}" target="_blank">link ↗</a>`
    : esc(s(obj?.source))
  return `<tr>
    <td>${esc(label)}</td>
    <td>${v}</td>
    <td>${p}</td>
    <td>${src}</td>
    <td>${note}</td>
  </tr>`
}

function dataRow(cells) {
  return `<tr>${cells.map(c => `<td>${esc(s(c))}</td>`).join('')}</tr>`
}

function theadRow(headers) {
  return `<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>`
}

function checklist(selected = [], options) {
  return options.map(opt => {
    const on = selected.some(
      t => t.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(t.toLowerCase())
    )
    return `<li class="${on ? 'checked' : ''}">
      <span class="check-box">${on ? '&#10003;' : ''}</span>
      ${esc(opt)}
    </li>`
  }).join('\n')
}

function extraTags(selected = [], options) {
  return selected
    .filter(t => !options.some(o =>
      o.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(o.toLowerCase())
    ))
    .map(t => `<li class="checked"><span class="check-box">&#10003;</span>${esc(t)}</li>`)
    .join('\n')
}

// ── CSS (scoped to .report-root) ──────────────────────────────────────────────

const CSS = `
  .report-root *, .report-root *::before, .report-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .report-root {
    font-family: 'Segoe UI', -apple-system, Arial, sans-serif;
    font-size: 11pt;
    color: #18181b;
    background: #ffffff;
    line-height: 1.55;
  }

  .report-root a { color: #2563eb; text-decoration: none; }
  .report-root a:hover { text-decoration: underline; }

  /* ── COVER ── */
  .report-root .report-cover {
    text-align: center;
    padding: 56px 48px 40px;
    border-bottom: 3px solid #09090b;
  }
  .report-root .report-cover h1 {
    font-size: 24pt;
    font-weight: 800;
    color: #09090b;
    letter-spacing: 0.4px;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  .report-root .report-cover .cover-sub {
    font-size: 10.5pt;
    color: #52525b;
    margin-top: 6px;
  }

  /* ── COMPANY SECTION ── */
  .report-root .company-section { padding: 40px 48px 48px; }
  .report-root .company-section + .company-section { border-top: 3px solid #09090b; }

  /* ── COMPANY HEADER ── */
  .report-root .company-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #09090b;
  }
  .report-root .company-name {
    font-size: 22pt;
    font-weight: 800;
    color: #09090b;
    margin-bottom: 8px;
  }
  .report-root .company-meta-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    font-size: 9.5pt;
    color: #52525b;
  }
  .report-root .company-meta-bar .meta-item strong { color: #18181b; }

  /* ── SECTION HEADINGS ── */
  .report-root h2 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #ffffff;
    background: #18181b;
    padding: 7px 12px;
    margin: 32px 0 14px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  .report-root h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #27272a;
    margin: 18px 0 8px;
    padding-bottom: 3px;
    border-bottom: 1px solid #e4e4e7;
  }

  /* ── KV GRID ── */
  .report-root .kv-grid {
    display: grid;
    grid-template-columns: 210px 1fr;
    gap: 5px 16px;
    margin: 8px 0 18px;
    font-size: 10.5pt;
  }
  .report-root .kv-label { font-weight: 600; color: #18181b; }
  .report-root .kv-value { color: #3f3f46; }

  /* ── BULLET LISTS ── */
  .report-root .bullet-list { margin: 8px 0 14px 20px; padding: 0; }
  .report-root .bullet-list li {
    margin-bottom: 5px;
    font-size: 10.5pt;
    color: #3f3f46;
    line-height: 1.5;
  }
  .report-root .bullet-list li strong { color: #18181b; }

  /* ── CHECKLISTS ── */
  .report-root .checklist {
    list-style: none;
    padding: 0;
    margin: 8px 0 14px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px 24px;
  }
  .report-root .checklist li {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10pt;
    color: #52525b;
  }
  .report-root .checklist li.checked { color: #18181b; font-weight: 500; }
  .report-root .check-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    min-width: 14px;
    border: 1.5px solid #a1a1aa;
    border-radius: 3px;
    font-size: 9pt;
    color: #18181b;
  }
  .report-root .checklist li.checked .check-box {
    background: #18181b;
    border-color: #18181b;
    color: #ffffff;
  }

  /* ── TABLES ── */
  .report-root table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 20px;
    font-size: 10pt;
  }
  .report-root thead tr { background: #18181b; }
  .report-root thead th {
    padding: 9px 12px;
    text-align: left;
    font-weight: 600;
    color: #ffffff;
    font-size: 9.5pt;
    letter-spacing: 0.2px;
  }
  .report-root tbody tr:nth-child(even) { background: #f4f4f5; }
  .report-root tbody tr:nth-child(odd)  { background: #fafafa; }
  .report-root tbody td {
    padding: 8px 12px;
    color: #27272a;
    border-bottom: 1px solid #e4e4e7;
    vertical-align: top;
    font-size: 10pt;
  }
  .report-root tbody td:first-child { font-weight: 600; color: #18181b; }
  .report-root tbody tr:hover { background: #f0f0f1; }

  /* ── ANALYSIS PARAGRAPHS ── */
  .report-root .analysis-block { margin-bottom: 18px; }
  .report-root .analysis-block p {
    font-size: 10.5pt;
    color: #3f3f46;
    line-height: 1.7;
  }

  /* ── SOURCES ── */
  .report-root .sources-list {
    list-style: none;
    padding: 0;
    margin: 8px 0;
    columns: 2;
    column-gap: 24px;
  }
  .report-root .sources-list li {
    font-size: 8.5pt;
    color: #52525b;
    margin-bottom: 4px;
    break-inside: avoid;
    word-break: break-all;
  }

  /* ── DIVIDER ── */
  .report-root .divider {
    border: none;
    border-top: 1px solid #e4e4e7;
    margin: 22px 0;
  }

  /* ── PRINT / PDF ── */
  @media print {
    .report-root { font-size: 10pt; }
    .report-root .report-cover { page-break-after: always; }
    .report-root .company-section + .company-section { page-break-before: always; }
    .report-root h2  { page-break-after: avoid; }
    .report-root h3  { page-break-after: avoid; }
    .report-root table { page-break-inside: avoid; }
    .report-root .analysis-block { page-break-inside: avoid; }
    .report-root a { color: #18181b; }
  }
`

// ── Per-company section ───────────────────────────────────────────────────────

function buildSection(item) {
  if (item.error) {
    return `<div class="company-section">
      <div class="company-header">
        <div class="company-name">${esc(titleCase(item.company))}</div>
      </div>
      <p style="color:#cc0000;font-size:10.5pt">Research failed: ${esc(item.error)}</p>
    </div>`
  }

  const d      = item.data || {}
  const fin    = d.financials            || {}
  const ops    = d.operational           || {}
  const meta   = d.form_metadata         || {}
  const srcDoc = d.source_documentation  || {}
  const verif  = d.verification          || {}

  const name      = esc(titleCase(d.company_name || item.company))
  const today     = esc(meta.last_updated || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
  const reviewDue = esc(s(meta.review_due_date))

  // ── Product categories & geo presence ──
  const productCategories = Array.isArray(d.product_categories) && d.product_categories.length
    ? `<ul class="bullet-list">${d.product_categories.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`
    : `<span style="color:#71717a">${NA}</span>`

  const geoPresence = Array.isArray(d.geographic_presence) && d.geographic_presence.length
    ? `<ul class="bullet-list">${d.geographic_presence.map(g => `<li>${esc(g)}</li>`).join('')}</ul>`
    : `<span style="color:#71717a">${NA}</span>`

  // ── Innovative products ──
  const innovativeProducts = Array.isArray(d.innovative_products) && d.innovative_products.length
    ? `<ul class="bullet-list">${d.innovative_products.map(p =>
        `<li><strong>${esc(s(p.name))}</strong> — ${esc(s(p.description))}</li>`
      ).join('')}</ul>`
    : `<ul class="bullet-list"><li>${NA}</li></ul>`

  // ── Competitors ──
  const competitors = Array.isArray(d.competitors) && d.competitors.length
    ? `<ul class="bullet-list">${d.competitors.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`
    : `<ul class="bullet-list"><li>${NA}</li></ul>`

  // ── Customers table ──
  const customersRows = Array.isArray(d.key_customers) && d.key_customers.length
    ? d.key_customers.map(c => dataRow([c.name, c.contract_type, c.annual_value, c.status, c.source])).join('')
    : dataRow([NA, '—', '—', '—', '—'])

  // ── Intelligence table ──
  const intelRows = Array.isArray(d.intelligence_entries) && d.intelligence_entries.length
    ? d.intelligence_entries.map(e => {
        const det = (e.details || NA).substring(0, 200) + ((e.details || '').length > 200 ? '…' : '')
        const src = e.source && e.source !== NA && e.source !== 'N/A'
          ? `<a href="${esc(e.source)}" target="_blank">link ↗</a>`
          : esc(s(e.source))
        const impColor = e.importance === 'High' ? '#cc0000' : e.importance === 'Medium' ? '#d97706' : '#3f3f46'
        return `<tr>
          <td>${esc(s(e.title))}</td>
          <td>${esc(det)}</td>
          <td style="font-weight:600;color:${impColor}">${esc(s(e.importance))}</td>
          <td>${src}</td>
          <td>${esc(s(e.date))}</td>
        </tr>`
      }).join('')
    : dataRow([NA, '—', '—', '—', '—'])

  // ── Checklist options ──
  const sectorOpts = ['Safety & PPE', 'Healthcare & Medical', 'Grocery & Food Distribution', 'Foodservice & Catering', 'Retail & Consumables', 'Technology & Office']
  const geoOpts    = ['United Kingdom', 'Ireland', 'Europe', 'North America', 'Asia Pacific']
  const stratOpts  = ['Consolidation', 'Acquisition Target', 'Acquirer', 'Growth Stage', 'Mature Market']

  // ── Sources ──
  const sourcesHtml = (item.sources || []).length
    ? item.sources.slice(0, 20).map((url, i) =>
        `<li><a href="${esc(url)}" target="_blank">[${i + 1}] ${esc(url)}</a></li>`
      ).join('')
    : `<li>${NA}</li>`

  return `
<div class="company-section">

  <!-- COMPANY HEADER -->
  <div class="company-header">
    <div class="company-name">${name}</div>
    <div class="company-meta-bar">
      <span class="meta-item"><strong>Status:</strong> ${esc(s(d.status))}</span>
      <span class="meta-item"><strong>Last Updated:</strong> ${today}</span>
      <span class="meta-item"><strong>Core Sector:</strong> ${esc(s(d.core_sector))}</span>
    </div>
  </div>

  <!-- 1. COMPANY OVERVIEW -->
  <h2>Company Overview</h2>

  <h3>Basic Information</h3>
  <div class="kv-grid">
    ${kvRow('Company Name', d.company_name || item.company)}
    ${kvRow('Status', d.status)}
    ${kvRow('Data Last Updated', today.replace(/&amp;/g, '&'))}
  </div>

  <h3>Core Business Classification</h3>
  <div class="kv-grid">
    ${kvRow('Core Sector', d.core_sector)}
    ${kvRow('Sub Sector', d.sub_sector)}
  </div>
  <div class="kv-grid">
    <div class="kv-label">Headline Product Categories</div>
    <div class="kv-value">${productCategories}</div>
    <div class="kv-label">Geographic Presence</div>
    <div class="kv-value">${geoPresence}</div>
  </div>

  <hr class="divider">

  <!-- 2. FINANCIAL METRICS -->
  <h2>Financial Metrics</h2>

  <h3>Revenue &amp; Growth</h3>
  <table>
    ${theadRow(['Metric', 'Value', 'Time Period', 'Source', 'Notes'])}
    <tbody>
      ${finRow('Total Revenue', fin.revenue)}
      ${finRow('YoY Growth Rate', fin.yoy_growth)}
      ${finRow('Regional Revenue Breakdown', fin.regional_revenue)}
      ${finRow('Key Market Revenue', fin.key_market_revenue)}
    </tbody>
  </table>

  <h3>Profitability Metrics</h3>
  <table>
    ${theadRow(['Metric', 'Value', 'Time Period', 'Source', 'Notes'])}
    <tbody>
      ${finRow('Operating Margin', fin.operating_margin)}
      ${finRow('Gross Margin', fin.gross_margin)}
      ${finRow('Net Profit', fin.net_profit)}
    </tbody>
  </table>

  <h3>Market Position</h3>
  <table>
    ${theadRow(['Metric', 'Value', 'Time Period', 'Source', 'Notes'])}
    <tbody>
      ${finRow('Market Share', fin.market_share)}
      ${finRow('Market Valuation (ETBC)', fin.market_valuation)}
    </tbody>
  </table>

  <hr class="divider">

  <!-- 3. STRATEGIC POSITIONING -->
  <h2>Strategic Positioning</h2>

  <h3>Strategy Summary</h3>
  <div class="analysis-block">
    <p><strong>Key Strategic Focus:</strong></p>
    <p style="margin-top:6px">${esc(s(d.strategy_summary))}</p>
  </div>

  <h3>Innovative Products &amp; Offerings</h3>
  <p style="font-size:10pt;color:#52525b;margin-bottom:6px"><strong>Product Areas:</strong></p>
  ${innovativeProducts}

  <hr class="divider">

  <!-- 4. OPERATIONAL METRICS -->
  <h2>Operational Metrics</h2>

  <h3>Scale Metrics</h3>
  <table>
    ${theadRow(['Metric', 'Value', 'Time Period', 'Source', 'Notes'])}
    <tbody>
      ${finRow('Annual Turnover', ops.annual_turnover)}
      ${finRow('Employee Count', ops.employee_count)}
      ${finRow('Number of Distribution Centers', ops.distribution_centers)}
      ${finRow('Number of Customers', ops.customer_count)}
    </tbody>
  </table>

  <h3>Operational Focus</h3>
  <table>
    ${theadRow(['Area', 'Details', 'Source'])}
    <tbody>
      <tr>
        <td>Supply Chain Model</td>
        <td>${esc(s(ops.supply_chain_model?.description))}</td>
        <td>${esc(s(ops.supply_chain_model?.source))}</td>
      </tr>
      <tr>
        <td>Technology Infrastructure</td>
        <td>${esc(s(ops.tech_infrastructure?.description))}</td>
        <td>${esc(s(ops.tech_infrastructure?.source))}</td>
      </tr>
      <tr>
        <td>Quality / Certifications</td>
        <td>${esc(s(ops.certifications?.description))}</td>
        <td>${esc(s(ops.certifications?.source))}</td>
      </tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- 5. KEY CUSTOMERS & CONTRACTS -->
  <h2>Key Customers &amp; Contracts</h2>

  <h3>Major Customers</h3>
  <table>
    ${theadRow(['Customer', 'Contract Type', 'Annual Value', 'Contract Status', 'Data Source'])}
    <tbody>${customersRows}</tbody>
  </table>

  <h3>Key Sector Competitors</h3>
  ${competitors}

  <hr class="divider">

  <!-- 6. INTELLIGENCE ENTRIES -->
  <h2>Intelligence Entries</h2>

  <h3>Recent Significant Developments</h3>
  <table>
    ${theadRow(['Development', 'Details', 'Importance', 'Source', 'Date'])}
    <tbody>${intelRows}</tbody>
  </table>

  <hr class="divider">

  <!-- 7. CATEGORIZATION & TAGGING -->
  <h2>Categorization &amp; Tagging</h2>

  <h3>Sectors Served</h3>
  <ul class="checklist">
    ${checklist(d.sectors_served || [], sectorOpts)}
  </ul>

  <h3>Geographic Tags</h3>
  <ul class="checklist">
    ${checklist(d.geographic_tags || [], geoOpts)}
    ${extraTags(d.geographic_presence || [], geoOpts)}
  </ul>

  <h3>Strategic Tags</h3>
  <ul class="checklist">
    ${checklist(d.strategic_tags || [], stratOpts)}
    ${extraTags(d.strategic_tags || [], stratOpts)}
  </ul>

  <hr class="divider">

  <!-- 8. DATA QUALITY & SOURCING -->
  <h2>Data Quality &amp; Sourcing</h2>

  <h3>Source Documentation</h3>
  <table>
    ${theadRow(['Metric Category', 'Primary Source', 'Secondary Source', 'Confidence Level', 'Notes'])}
    <tbody>
      ${dataRow(['Financial Data', srcDoc.financial_data?.primary, srcDoc.financial_data?.secondary, srcDoc.financial_data?.confidence, srcDoc.financial_data?.notes])}
      ${dataRow(['Customer Data',  srcDoc.customer_data?.primary,  srcDoc.customer_data?.secondary,  srcDoc.customer_data?.confidence,  srcDoc.customer_data?.notes])}
      ${dataRow(['Strategic Info', srcDoc.strategic_info?.primary, srcDoc.strategic_info?.secondary, srcDoc.strategic_info?.confidence, srcDoc.strategic_info?.notes])}
      ${dataRow(['Product Info',   srcDoc.product_info?.primary,   srcDoc.product_info?.secondary,   srcDoc.product_info?.confidence,   srcDoc.product_info?.notes])}
    </tbody>
  </table>

  <h3>Data Verification Checklist</h3>
  <ul class="checklist" style="grid-template-columns:1fr">
    <li class="${verif.financial_figures_verified ? 'checked' : ''}">
      <span class="check-box">${verif.financial_figures_verified ? '&#10003;' : ''}</span>
      Financial figures verified against company announcements or filings
    </li>
    <li class="${verif.customer_contracts_confirmed ? 'checked' : ''}">
      <span class="check-box">${verif.customer_contracts_confirmed ? '&#10003;' : ''}</span>
      Customer contracts confirmed through primary/secondary sources
    </li>
    <li class="${verif.strategic_info_cross_referenced ? 'checked' : ''}">
      <span class="check-box">${verif.strategic_info_cross_referenced ? '&#10003;' : ''}</span>
      Strategic information cross-referenced with multiple sources
    </li>
    <li class="${verif.changes_documented ? 'checked' : ''}">
      <span class="check-box">${verif.changes_documented ? '&#10003;' : ''}</span>
      All changes documented with update dates and sources
    </li>
    <li class="${verif.sensitive_data_flagged ? 'checked' : ''}">
      <span class="check-box">${verif.sensitive_data_flagged ? '&#10003;' : ''}</span>
      Sensitive/confidential data appropriately flagged
    </li>
  </ul>

  <hr class="divider">

  <!-- 9. SPECIAL NOTES & CONTEXT -->
  <h2>Special Notes &amp; Context</h2>

  <h3>Competitive Positioning</h3>
  <div class="analysis-block"><p>${esc(s(d.competitive_positioning))}</p></div>

  <h3>Growth Trajectory</h3>
  <div class="analysis-block"><p>${esc(s(d.growth_trajectory))}</p></div>

  <h3>Risk Factors</h3>
  <div class="analysis-block"><p>${esc(s(d.risk_factors))}</p></div>

  <h3>Opportunities for Engagement</h3>
  <div class="analysis-block"><p>${esc(s(d.opportunities))}</p></div>

  <hr class="divider">

  <!-- 10. FORM METADATA -->
  <h2>Form Metadata</h2>
  <table>
    ${theadRow(['Field', 'Value'])}
    <tbody>
      ${dataRow(['Form Created Date', meta.created_date || today.replace(/&amp;/g, '&')])}
      ${dataRow(['Last Updated', today.replace(/&amp;/g, '&')])}
      ${dataRow(['Review Due Date', reviewDue.replace(/&amp;/g, '&')])}
      ${dataRow(['Form Status', meta.form_status || 'In Progress'])}
      ${dataRow(['Data Classification', 'Internal Use Only'])}
    </tbody>
  </table>

  <hr class="divider">

  <!-- 11. SOURCES -->
  <h2>Sources</h2>
  <ul class="sources-list">
    ${sourcesHtml}
  </ul>

</div>`
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildHTML(rawData) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const sections = rawData.map(item => buildSection(item)).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Competitor Metrics Extraction Report</title>
  <style>${CSS}</style>
</head>
<body>
<div class="report-root">

  <div class="report-cover">
    <h1>Competitor Metrics Extraction Report</h1>
    <p class="cover-sub">Generated on ${today} &nbsp;|&nbsp; Central Directory – Internal Business Intelligence</p>
  </div>

  ${sections}

</div>
</body>
</html>`
}
