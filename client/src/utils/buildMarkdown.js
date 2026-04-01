// Renders the structured JSON data into the exact Competitor Metrics Extraction Template format.

const NA = 'Not Available'

function s(val) {
  return val && String(val).trim() && String(val).trim() !== 'N/A' ? String(val).trim() : NA
}

function titleCase(str) {
  return (str || '').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1))
}

function finRow(label, obj, extraNote = '') {
  const v    = s(obj?.value)
  const p    = s(obj?.period)
  const src  = obj?.source && obj.source !== NA && obj.source !== 'N/A'
    ? `[link](${obj.source})`
    : s(obj?.source)
  const note = s(obj?.notes) + (extraNote ? ` ${extraNote}` : '')
  return `| **${label}** | ${v} | ${p} | ${src} | ${note} |`
}

function opsTableRow(label, obj) {
  return finRow(label, obj)
}

function check(bool) {
  return bool ? '- [x]' : '- [ ]'
}

function tagChecklist(selected = [], options) {
  return options.map(opt => {
    const checked = selected.some(s => s.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(s.toLowerCase()))
    return `${checked ? '- [x]' : '- [ ]'} ${opt}`
  }).join('\n')
}

function sourceRows(allUrls = []) {
  return allUrls.slice(0, 20)
    .filter(Boolean)
    .map((url, i) => `- [${i + 1}] ${url}`)
    .join('\n') || `- ${NA}`
}

export function buildMarkdown(rawData) {
  return rawData.map(item => {
    if (item.error) {
      return `# COMPETITOR METRICS EXTRACTION REPORT — ${titleCase(item.company).toUpperCase()}\n\n> Research failed: ${item.error}\n\n---`
    }

    const d    = item.data || {}
    const fin  = d.financials || {}
    const ops  = d.operational || {}
    const meta = d.form_metadata || {}
    const srcDoc = d.source_documentation || {}
    const verif  = d.verification || {}

    const name        = titleCase(d.company_name || item.company)
    const today       = meta.last_updated || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const reviewDue   = meta.review_due_date || NA
    const completePct = d.completion_percent ? `${d.completion_percent}% Complete` : NA

    // Customers table
    const customersTable = Array.isArray(d.key_customers) && d.key_customers.length > 0
      ? [
          '| Customer | Contract Type | Annual Value | Contract Status | Data Source |',
          '|----------|--------------|--------------|-----------------|-------------|',
          ...d.key_customers.map(c =>
            `| ${s(c.name)} | ${s(c.contract_type)} | ${s(c.annual_value)} | ${s(c.status)} | ${s(c.source)} |`
          ),
        ].join('\n')
      : `| ${NA} | — | — | — | — |`

    // Intelligence entries table
    const intelTable = Array.isArray(d.intelligence_entries) && d.intelligence_entries.length > 0
      ? [
          '| Development | Details | Importance | Source | Date |',
          '|-------------|---------|-----------|--------|------|',
          ...d.intelligence_entries.map(e => {
            const det = (e.details || NA).substring(0, 160).replace(/\|/g, '\\|')
            const ellip = (e.details || '').length > 160 ? '...' : ''
            const src = e.source && e.source !== NA && e.source !== 'N/A'
              ? `[link](${e.source})`
              : s(e.source)
            return `| ${s(e.title)} | ${det}${ellip} | ${s(e.importance)} | ${src} | ${s(e.date)} |`
          }),
        ].join('\n')
      : `| ${NA} | — | — | — | — |`

    // Innovative products
    const products = Array.isArray(d.innovative_products) && d.innovative_products.length > 0
      ? d.innovative_products.map(p =>
          `- **${s(p.name)}** — ${s(p.description)}`
        ).join('\n')
      : `- ${NA}`

    // Competitors
    const competitors = Array.isArray(d.competitors) && d.competitors.length > 0
      ? d.competitors.map(c => `- ${c}`).join('\n')
      : `- ${NA}`

    // Sector checkboxes
    const sectorOpts = ['Safety & PPE', 'Healthcare & Medical', 'Grocery & Food Distribution', 'Foodservice & Catering', 'Retail & Consumables', 'Technology & Office']
    const geoOpts    = ['United Kingdom', 'Ireland', 'Europe', 'North America', 'Asia Pacific']
    const stratOpts  = ['Consolidation', 'Acquisition Target', 'Acquirer', 'Growth Stage', 'Mature Market']

    return `# COMPETITOR METRICS EXTRACTION REPORT — ${name.toUpperCase()}

**System:** Central Directory – Internal Business Intelligence
**Template Version:** 1.0
**Last Updated:** ${today}

---

## COMPANY OVERVIEW

### Basic Information
- **Company Name:** ${name}
- **Status:** ${s(d.status)}
- **Data Last Updated:** ${today}
- **Updated By:** ${s(meta.updated_by) !== NA ? s(meta.updated_by) : 'AI Research System'}
- **Completion %:** ${completePct}

### Core Business Classification
- **Core Sector:** ${s(d.core_sector)}
- **Sub Sector:** ${s(d.sub_sector)}
- **Headline Product Categories:**
${(d.product_categories || []).length ? d.product_categories.map(c => `  - ${c}`).join('\n') : `  - ${NA}`}
- **Geographic Presence:**
${(d.geographic_presence || []).length ? d.geographic_presence.map(g => `  - ${g}`).join('\n') : `  - ${NA}`}

---

## FINANCIAL METRICS

### Revenue & Growth

| Metric | Value | Time Period | Source | Notes |
|--------|-------|-------------|--------|-------|
${finRow('Total Revenue', fin.revenue)}
${finRow('YoY Growth Rate', fin.yoy_growth)}
${finRow('Regional Revenue Breakdown', fin.regional_revenue)}
${finRow('Key Market Revenue', fin.key_market_revenue)}

### Profitability Metrics

| Metric | Value | Time Period | Source | Notes |
|--------|-------|-------------|--------|-------|
${finRow('Operating Margin', fin.operating_margin)}
${finRow('Gross Margin', fin.gross_margin)}
${finRow('Net Profit', fin.net_profit)}

### Market Position

| Metric | Value | Time Period | Source | Notes |
|--------|-------|-------------|--------|-------|
${finRow('Market Share', fin.market_share)}
${finRow('Market Valuation (ETBC)', fin.market_valuation)}

---

## STRATEGIC POSITIONING

### Strategy Summary

**Key Strategic Focus:**
${s(d.strategy_summary)}

### Innovative Products & Offerings

**Product Areas:**
${products}

---

## OPERATIONAL METRICS

### Scale Metrics

| Metric | Value | Time Period | Source | Notes |
|--------|-------|-------------|--------|-------|
${opsTableRow('Annual Turnover', ops.annual_turnover)}
${opsTableRow('Employee Count', ops.employee_count)}
${opsTableRow('Number of Distribution Centers', ops.distribution_centers)}
${opsTableRow('Number of Customers', ops.customer_count)}

### Operational Focus

| Area | Details | Source |
|------|---------|--------|
| **Supply Chain Model** | ${s(ops.supply_chain_model?.description)} | ${s(ops.supply_chain_model?.source)} |
| **Technology Infrastructure** | ${s(ops.tech_infrastructure?.description)} | ${s(ops.tech_infrastructure?.source)} |
| **Quality / Certifications** | ${s(ops.certifications?.description)} | ${s(ops.certifications?.source)} |

---

## KEY CUSTOMERS & CONTRACTS

### Major Customers

${customersTable}

### Key Sector Competitors

${competitors}

---

## INTELLIGENCE ENTRIES

### Recent Significant Developments

${intelTable}

---

## CATEGORIZATION & TAGGING

### Sectors Served

${tagChecklist(d.sectors_served || [], sectorOpts)}

### Geographic Tags

${tagChecklist(d.geographic_tags || [], geoOpts)}
${(d.geographic_presence || []).filter(g => !geoOpts.some(o => o.toLowerCase().includes(g.toLowerCase()))).map(g => `- [x] ${g}`).join('\n')}

### Strategic Tags

${tagChecklist(d.strategic_tags || [], stratOpts)}
${(d.strategic_tags || []).filter(t => !stratOpts.some(o => o.toLowerCase().includes(t.toLowerCase()))).map(t => `- [x] ${t}`).join('\n')}

---

## DATA QUALITY & SOURCING

### Source Documentation

| Metric Category | Primary Source | Secondary Source | Confidence Level | Notes |
|-----------------|----------------|-----------------|-----------------|-------|
| **Financial Data** | ${s(srcDoc.financial_data?.primary)} | ${s(srcDoc.financial_data?.secondary)} | ${s(srcDoc.financial_data?.confidence)} | ${s(srcDoc.financial_data?.notes)} |
| **Customer Data** | ${s(srcDoc.customer_data?.primary)} | ${s(srcDoc.customer_data?.secondary)} | ${s(srcDoc.customer_data?.confidence)} | ${s(srcDoc.customer_data?.notes)} |
| **Strategic Info** | ${s(srcDoc.strategic_info?.primary)} | ${s(srcDoc.strategic_info?.secondary)} | ${s(srcDoc.strategic_info?.confidence)} | ${s(srcDoc.strategic_info?.notes)} |
| **Product Info** | ${s(srcDoc.product_info?.primary)} | ${s(srcDoc.product_info?.secondary)} | ${s(srcDoc.product_info?.confidence)} | ${s(srcDoc.product_info?.notes)} |

### Data Verification Checklist

${check(verif.financial_figures_verified)} Financial figures verified against company announcements or filings
${check(verif.customer_contracts_confirmed)} Customer contracts confirmed through primary/secondary sources
${check(verif.strategic_info_cross_referenced)} Strategic information cross-referenced with multiple sources
${check(verif.changes_documented)} All changes documented with update dates and sources
${check(verif.sensitive_data_flagged)} Sensitive/confidential data appropriately flagged

---

## SPECIAL NOTES & CONTEXT

### Competitive Positioning

${s(d.competitive_positioning)}

### Growth Trajectory

${s(d.growth_trajectory)}

### Risk Factors

${s(d.risk_factors)}

### Opportunities for Engagement

${s(d.opportunities)}

---

## FORM METADATA

| Field | Value |
|-------|-------|
| **Form Created Date** | ${s(meta.created_date) !== NA ? s(meta.created_date) : today} |
| **Last Updated** | ${today} |
| **Updated By** | ${s(meta.updated_by) !== NA ? s(meta.updated_by) : 'AI Research System'} |
| **Review Due Date** | ${reviewDue} |
| **Form Status** | ${s(meta.form_status) !== NA ? s(meta.form_status) : 'In Progress'} |
| **Data Classification** | Internal Use Only |

---

## SOURCES

${sourceRows(item.sources)}

---`
  }).join('\n\n')
}
