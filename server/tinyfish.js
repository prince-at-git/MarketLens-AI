import { TinyFish, RunStatus } from '@tiny-fish/sdk';

const client = new TinyFish();

async function researchCompany(companyName, emit) {
  emit(`[${companyName}] TinyFish agent starting...`);
  const stream = await client.agent.stream({
    url: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' company')}`,
    goal: `You are a professional business intelligence analyst. Research the company "${companyName}" thoroughly by visiting multiple sources including the company's official website, Crunchbase, LinkedIn, Wikipedia, news articles, investor relations pages, and financial databases.

Extract and return ONLY a valid JSON object with exactly these keys and structure:

{
  "company_name": "${companyName}",
  "status": "Active or Inactive or Acquired",
  "core_sector": "primary industry sector",
  "sub_sector": "secondary classification",
  "product_categories": ["list of major product lines or services"],
  "geographic_presence": ["list of countries or regions where the company operates"],

  "financials": {
    "revenue":          { "value": "e.g. $500M", "period": "e.g. FY2024", "source": "N/A" },
    "yoy_growth":       { "value": "e.g. 12%",   "period": "YoY 2024",   "source": "N/A" },
    "operating_margin": { "value": "e.g. 18%",   "period": "FY2024",     "source": "N/A" },
    "gross_margin":     { "value": "e.g. 40%",   "period": "FY2024",     "source": "N/A" },
    "net_profit":       { "value": "e.g. $80M",  "period": "FY2024",     "source": "N/A" },
    "market_share":     { "value": "e.g. 15%",   "period": "2024",       "source": "N/A" },
    "market_valuation": { "value": "e.g. $2.5B", "date":   "2024",       "source": "N/A" }
  },

  "strategic_positioning": {
    "summary": "2-3 sentence description of the company's strategic focus and competitive differentiation",
    "innovative_products": [
      { "name": "product or service name", "description": "brief description and market impact" }
    ]
  },

  "operational_metrics": {
    "employee_count":       { "value": "e.g. 12,000", "period": "2024", "source": "N/A" },
    "distribution_centers": { "value": "e.g. 45",     "period": "2024", "source": "N/A" },
    "customer_count":       { "value": "e.g. 5,000+", "period": "2024", "source": "N/A" },
    "supply_chain_model":   "description of supply chain approach",
    "tech_infrastructure":  "key systems and capabilities",
    "certifications":       "relevant certifications and standards"
  },

  "key_customers": [
    { "name": "customer name", "contract_type": "type of relationship", "annual_value": "estimated value or N/A", "status": "Active", "source": "N/A" }
  ],

  "competitors": ["list of 5-8 direct competitors with one-line description each"],

  "intelligence_entries": [
    { "title": "event title", "details": "description of the development", "importance": "High or Medium or Low", "source": "N/A", "date": "approximate date if known" }
  ],

  "sectors_served": ["list of industry sectors served"],
  "geographic_tags": ["same as geographic_presence"],
  "strategic_tags": ["e.g. Consolidation, Growth Stage, Acquirer"],

  "analysis": {
    "competitive_positioning": "2-3 sentences on how this company compares to peers",
    "growth_trajectory":       "description of growth path and projected direction",
    "risk_factors":            "4-5 specific risks: regulatory, competitive, financial, operational",
    "opportunities":           "4-5 specific growth opportunities"
  },

  "company_overview": "3-5 sentence description covering what the company does, when founded, headquarters, business model, and target market",
  "business_model":   "one paragraph explaining exactly how the company makes money"
}

Be specific — use actual numbers, dates, and company names wherever possible. Use "N/A" only when data is genuinely unavailable after thorough research. Return ONLY the JSON object, no markdown fences, no extra text.`,
  });

  const visitedUrls = [];

  for await (const event of stream) {
    if (event.type === 'PROGRESS') {
      const msg = `[${companyName}] ${event.purpose}`;
      console.log(msg); emit(msg);
      if (event.url && !visitedUrls.includes(event.url)) {
        visitedUrls.push(event.url);
      }
    }

    if (event.type === 'COMPLETE') {
      if (event.status === RunStatus.COMPLETED) {
        console.log(`✅ [TinyFish][${companyName}] Research complete.`);

        let result = event.result;

        if (result && typeof result === 'object' && typeof result.result === 'string') {
          result = result.result;
        }

        if (typeof result === 'string') {
          result = result
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          try {
            result = JSON.parse(result);
          } catch (e) {
            console.error(`[TinyFish][${companyName}] JSON parse failed:`, e.message);
            return { company: companyName, provider: 'tinyfish', error: 'Failed to parse research result' };
          }
        }

        return {
          company: companyName,
          provider: 'tinyfish',
          data: result,
          sources: visitedUrls,
        };
      } else {
        console.log(`❌ [TinyFish][${companyName}] Research failed.`);
        return { company: companyName, provider: 'tinyfish', error: 'Research failed' };
      }
    }
  }
}

async function researchAllCompanies(companies, emit) {
  const results = await Promise.all(companies.map(name => researchCompany(name, emit)));
  return results;
}

export { researchAllCompanies };
