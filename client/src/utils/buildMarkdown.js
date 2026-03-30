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
      ? d.competitors.map(c => `- ${c}`).join('\n')
      : d.competitors || 'N/A'

    const news = Array.isArray(d.recent_news)
      ? d.recent_news.map(n => `- ${n}`).join('\n')
      : d.recent_news || 'N/A'

    const keyPeople = Array.isArray(d.key_people)
      ? d.key_people.map(p => `- ${p}`).join('\n')
      : d.key_people || 'N/A'

    const citations = Array.isArray(item.citations) && item.citations.length > 0
      ? item.citations.map((url, i) => `- [${i + 1}] ${url}`).join('\n')
      : '- No sources recorded.'

    return `# ${item.company}

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

## Key People
${keyPeople}

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