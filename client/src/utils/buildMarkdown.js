export function buildMarkdown(rawData) {
  return rawData.map(item => {
    if (item.error) {
      return `# ${item.company}\n\n> Research failed for this company.\n\n---`
    }
    const d = item.data

    // capitalize first letter of company name
    const companyName = item.company.charAt(0).toUpperCase() + item.company.slice(1)

    const risks = Array.isArray(d.risks_opportunities?.risks)
      ? d.risks_opportunities.risks.map(r => `- ${r}`).join('\n')
      : d.risks_opportunities?.risks || 'N/A'

    const opportunities = Array.isArray(d.risks_opportunities?.opportunities)
      ? d.risks_opportunities.opportunities.map(o => `- ${o}`).join('\n')
      : d.risks_opportunities?.opportunities || 'N/A'

    const competitors = Array.isArray(d.competitors)
      ? d.competitors.map(c => `- ${c}`).join('\n')
      : d.competitors || 'N/A'

    const news = Array.isArray(d.recent_news)
      ? d.recent_news.map(n => `- ${n}`).join('\n')
      : d.recent_news || 'N/A'

    // fix citations — handle both string URLs and object URLs
    const citations = Array.isArray(item.citations) && item.citations.length > 0
      ? item.citations
          .map(url => typeof url === 'string' ? url : url?.url || url?.href || JSON.stringify(url))
          .filter(Boolean)
          .map((url, i) => `- [${i + 1}] ${url}`)
          .join('\n')
      : '- No sources recorded.'

    return `# ${companyName}

## Overview
${d.company_overview || 'N/A'}

## Business Model
${d.business_model || 'N/A'}

## Financials
- **Revenue:** ${d.financials?.revenue || 'N/A'}
- **Funding:** ${d.financials?.funding || 'N/A'}
- **Valuation:** ${d.financials?.valuation || 'N/A'}
- **Profitability:** ${d.financials?.profitability || 'N/A'}

## Market Position
${d.market_position || 'N/A'}

## Competitors
${competitors}

## Recent News & Trends
${news}

## Risks
${risks}

## Opportunities
${opportunities}

## Sources
${citations}

---`
  }).join('\n\n')
}