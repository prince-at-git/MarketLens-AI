export function buildMarkdown(rawData) {
  return rawData.map(item => {
    if (item.error) {
      return `# ${item.company}\n\n> Research failed for this company.\n\n---`
    }
    const d = item.data

    const risks = Array.isArray(d.risks_opportunities?.risks)
      ? d.risks_opportunities.risks.map(r => `- ${r}`).join('\n')
      : d.risks_opportunities?.risks || 'N/A'

    const opportunities = Array.isArray(d.risks_opportunities?.opportunities)
      ? d.risks_opportunities.opportunities.map(o => `- ${o}`).join('\n')
      : d.risks_opportunities?.opportunities || 'N/A'

    const competitors = Array.isArray(d.competitors)
      ? d.competitors.join(', ')
      : d.competitors || 'N/A'

    const news = Array.isArray(d.recent_news)
      ? d.recent_news.map(n => `- ${n}`).join('\n')
      : d.recent_news || 'N/A'

    return `# ${item.company}

## Overview
${d.company_overview || 'N/A'}

## Financials
- **Revenue:** ${d.financials?.revenue || 'N/A'}
- **Funding:** ${d.financials?.funding || 'N/A'}
- **Valuation:** ${d.financials?.valuation || 'N/A'}

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

---`
  }).join('\n\n')
}