import { TinyFish, RunStatus } from '@tiny-fish/sdk';

const client = new TinyFish();

async function researchCompany(companyName) {
  const stream = await client.agent.stream({
    url: `https://www.google.com/search?q=${encodeURIComponent(companyName + " company")}`,
    goal: `Research the company "${companyName}" and extract:
      - company_overview: brief description of what they do
      - financials: revenue, funding, valuation if available (null if not found)
      - market_position: their position in their industry
      - competitors: list of main competitors
      - recent_news: latest developments or trends
      - risks_opportunities: key risks and opportunities
      Return ONLY as JSON with exactly these keys.`,
  });

  for await (const event of stream) {
    if (event.type === "PROGRESS") {
      console.log(`[${companyName}] ${event.purpose}`);
    }
    // if (event.type === "COMPLETE") {
    //   if (event.status === RunStatus.COMPLETED) {
    //     console.log(`[${companyName}] Research complete.`)
    //     return { company: companyName, data: event.result };
    //   } else {
    //     console.log(`[${companyName}] Research failed.`)
    //     return { company: companyName, error: "Research failed" };
    //   }
    // }

    if (event.type === "COMPLETE") {
      console.log(`[${companyName}] COMPLETE event received`)
      console.log(`[${companyName}] status:`, event.status)
      console.log(`[${companyName}] result type:`, typeof event.result)
      console.log(`[${companyName}] result:`, JSON.stringify(event.result).slice(0, 200))

      if (event.status === RunStatus.COMPLETED) {
        console.log(`✅ [${companyName}] Research complete.`)
        return { company: companyName, data: event.result };
      } else {
        console.log(`❌ [${companyName}] Research failed. Status: ${event.status}`)
        return { company: companyName, error: "Research failed" };
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