import { TinyFish, RunStatus } from '@tiny-fish/sdk';

const client = new TinyFish();

async function researchCompany(companyName) {
  const stream = await client.agent.stream({
    url: `https://www.google.com/search?q=${encodeURIComponent(companyName + " company")}`,
    goal: `You are a professional market research analyst. Research the company "${companyName}" thoroughly by visiting multiple sources including Crunchbase, LinkedIn, official website, news articles, and financial databases.

    Extract and return the following in detail:

    1. company_overview: A detailed description (3-5 sentences) covering what the company does, when it was founded, where it is headquartered, its business model, and target market.

    2. financials: An object with:
       - revenue: Latest annual revenue with the fiscal year (e.g. "$500M ARR as of FY2024")
       - funding: Total funding raised, latest round details, lead investors, and date
       - valuation: Latest known valuation with date and context
       - profitability: Whether the company is profitable or not if available

    3. market_position: 2-3 sentences on where the company stands in its industry, market share if available, and what differentiates it from competitors.

    4. competitors: A list of 5-8 direct competitors with one line about each explaining how they compare.

    5. recent_news: A list of 4-6 specific recent developments from the last 12 months — product launches, partnerships, leadership changes, expansions, or controversies.

    6. risks_opportunities: An object with:
       - risks: 4-5 specific risks the company faces (regulatory, competitive, financial, operational)
       - opportunities: 4-5 specific growth opportunities available to the company

    7. business_model: One paragraph explaining exactly how the company makes money.

    Return ONLY as a JSON object with exactly these keys. Be specific with numbers, dates, and facts. Do not use vague language like "significant growth" — use actual figures wherever possible.`,
  });

  const visitedUrls = []

  for await (const event of stream) {
    if (event.type === "PROGRESS") {
      console.log(`[${companyName}] ${event.purpose}`)
      if (event.url && !visitedUrls.includes(event.url)) {
        visitedUrls.push(event.url)
      }
    }

    if (event.type === "COMPLETE") {
      if (event.status === RunStatus.COMPLETED) {
        console.log(`✅ [${companyName}] Research complete.`)

        let result = event.result

        if (result && typeof result === 'object' && typeof result.result === 'string') {
          result = result.result
        }

        
        if (typeof result === 'string') {
          result = result
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim()
          try {
            result = JSON.parse(result)
            console.log(`[${companyName}] parsed successfully`)
          } catch (e) {
            console.error(`[${companyName}] JSON parse failed:`, e.message)
            return { company: companyName, error: 'Failed to parse research result' }
          }
        }

        return {
          company: companyName,
          data: result,
          citations: visitedUrls
        }
      } else {
        console.log(`❌ [${companyName}] Research failed.`)
        return { company: companyName, error: "Research failed" }
      }
    }
  }
}

async function researchAllCompanies(companies) {
  const results = await Promise.all(
    companies.map(name => researchCompany(name))
  );
  return results;
}

export { researchAllCompanies };