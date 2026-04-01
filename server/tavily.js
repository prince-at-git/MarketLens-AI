import axios from 'axios';
import OpenAI from 'openai';

const TAVILY_KEY = process.env.TAVILY_API_KEY;
const SEARCH_URL  = 'https://api.tavily.com/search';
const EXTRACT_URL = 'https://api.tavily.com/extract';

const openai = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-your'))
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ── Credit costs ──────────────────────────────────────────────────────────────
const CREDITS = {
  search_basic:     1,
  search_advanced:  2,
  extract_basic:    1,   // per 5 URLs (we always do ≤5 so it's always 1)
};

// ── API wrappers ──────────────────────────────────────────────────────────────

async function search(query, { depth = 'basic', topic = 'general' } = {}) {
  const res = await axios.post(SEARCH_URL, {
    api_key: TAVILY_KEY, query,
    search_depth: depth, include_answer: true,
    include_raw_content: false, max_results: 5, topic,
  });
  return res.data;
}

async function extract(urls) {
  if (!urls || urls.length === 0) return { results: [] };
  const res = await axios.post(EXTRACT_URL, {
    api_key: TAVILY_KEY,
    urls: urls.slice(0, 5),      // max 5 = 1 credit basic
    extract_depth: 'basic',
  });
  return res.data;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ans  = r => r?.answer?.trim() || 'Not Available';
const url0 = r => r?.results?.[0]?.url;

function titleCase(str) {
  return (str || '').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

// ── LLM synthesis ─────────────────────────────────────────────────────────────

async function synthesise(companyName, answers, extractedPages, newsResults, allSourceUrls) {
  const today     = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const reviewDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Extracted page content (truncated to avoid context overflow)
  const pageContext = extractedPages.length > 0
    ? extractedPages.map(p =>
        `--- ${p.url} ---\n${(p.raw_content || '').substring(0, 1500)}`
      ).join('\n\n')
    : 'Not Available';

  const newsSnippets = (newsResults?.results || []).slice(0, 6).map(r =>
    `URL: ${r.url}\nTitle: ${r.title}\nContent: ${(r.content || '').substring(0, 250)}`
  ).join('\n\n');

  const sourceList = allSourceUrls.slice(0, 25).map((u, i) => `[${i + 1}] ${u}`).join('\n');

  const userPrompt = `You are a senior business intelligence analyst. Using ONLY the data below, produce a competitor intelligence report for "${companyName}". Use actual numbers, currencies, percentages, and dates. All output in English. Use "Not Available" only when genuinely unavailable — never fabricate.

=== SEARCH ANSWERS ===
Company Overview & Sector: ${answers.overview}
Revenue & Growth: ${answers.revenue_growth}
Margins & Profitability: ${answers.margins}
Market Share & Valuation: ${answers.market}
Key Customers & Contracts: ${answers.customers}
Operations & Scale: ${answers.operations}
Competitors: ${answers.competitors}
Strategy & Innovation: ${answers.strategy}
Risks & Opportunities: ${answers.risks}

=== FULL PAGE CONTENT (extracted from top sources) ===
${pageContext}

=== RECENT NEWS ===
${newsSnippets || 'Not Available'}

=== COLLECTED SOURCES ===
${sourceList}

Return ONLY valid JSON (no markdown fences) matching this schema exactly:

{
  "company_name": "${titleCase(companyName)}",
  "status": "Active | Inactive | Acquired",
  "completion_percent": "number string e.g. 82",

  "core_sector": "Primary industry/sector in 3-6 words",
  "sub_sector": "Secondary classification in 4-8 words",
  "product_categories": ["Up to 6 specific product lines or service categories"],
  "geographic_presence": ["Specific countries — never just 'Europe', list countries"],

  "financials": {
    "revenue":            { "value": "exact figure + currency", "period": "e.g. FY2025", "source": "source name", "notes": "worldwide or regional note" },
    "yoy_growth":         { "value": "% with + or - sign",      "period": "e.g. FY2024-25", "source": "source", "notes": "growth drivers" },
    "regional_revenue":   { "value": "breakdown if available",  "period": "year", "source": "source", "notes": "% of global revenue" },
    "key_market_revenue": { "value": "key market if available", "period": "year", "source": "source", "notes": "e.g. UK or US market" },
    "operating_margin":   { "value": "% figure",                "period": "year", "source": "source", "notes": "drivers of change" },
    "gross_margin":       { "value": "% or Not Available",      "period": "year or —", "source": "source or —", "notes": "segment breakdown if available" },
    "net_profit":         { "value": "exact figure + currency", "period": "year", "source": "source", "notes": "% of revenue if calculable" },
    "market_share":       { "value": "% or range",              "period": "year", "source": "source", "notes": "specify market definition" },
    "market_valuation":   { "value": "market cap + currency",   "period": "date", "source": "source", "notes": "Estimated or Confirmed" }
  },

  "strategy_summary": "2-3 concise sentences. No marketing language.",
  "innovative_products": [
    { "name": "product/service name", "description": "one sentence on market impact" }
  ],

  "operational": {
    "annual_turnover":      { "value": "figure + currency", "period": "year", "source": "source", "notes": "global or regional" },
    "employee_count":       { "value": "headcount",         "period": "year", "source": "source", "notes": "YoY growth if known" },
    "distribution_centers": { "value": "number or Not Available", "period": "year", "source": "source", "notes": "geographic spread" },
    "customer_count":       { "value": "number or Not Available", "period": "year", "source": "source", "notes": "active accounts" },
    "supply_chain_model":   { "description": "one clear sentence", "source": "source" },
    "tech_infrastructure":  { "description": "key systems or Not Available", "source": "source or —" },
    "certifications":       { "description": "certifications or Not Available", "source": "source or —" }
  },

  "key_customers": [
    { "name": "customer name", "contract_type": "supply relationship type", "annual_value": "value or Undisclosed", "status": "Active | Inactive", "source": "Desk Research | Press Release | Annual Report" }
  ],

  "competitors": ["5-8 direct competitor names only — no extra text per item"],

  "intelligence_entries": [
    { "title": "short headline", "details": "1-2 sentence factual description", "importance": "High | Medium | Low", "source": "URL or publication", "date": "date or year" }
  ],

  "sectors_served": ["select from: Safety & PPE, Healthcare & Medical, Grocery & Food Distribution, Foodservice & Catering, Retail & Consumables, Technology & Office"],
  "geographic_tags": ["select from: United Kingdom, Ireland, Europe, North America, Asia Pacific — add specific countries"],
  "strategic_tags": ["select from: Consolidation, Acquisition Target, Acquirer, Growth Stage, Mature Market — add others"],

  "source_documentation": {
    "financial_data": { "primary": "source type", "secondary": "source type", "confidence": "High | Medium | Low", "notes": "caveats" },
    "customer_data":  { "primary": "source type", "secondary": "source type", "confidence": "High | Medium | Low", "notes": "caveats" },
    "strategic_info": { "primary": "source type", "secondary": "source type", "confidence": "High | Medium | Low", "notes": "caveats" },
    "product_info":   { "primary": "source type", "secondary": "source type", "confidence": "High | Medium | Low", "notes": "caveats" }
  },

  "verification": {
    "financial_figures_verified": true,
    "customer_contracts_confirmed": false,
    "strategic_info_cross_referenced": true,
    "changes_documented": true,
    "sensitive_data_flagged": false
  },

  "competitive_positioning": "2-3 sentences comparing company to market peers",
  "growth_trajectory":       "2-3 sentences on growth path and projected direction",
  "risk_factors":            "paragraph: 3-5 specific named risks (regulatory, competitive, financial, operational)",
  "opportunities":           "paragraph: 3-5 specific growth opportunities",

  "form_metadata": {
    "created_date": "${today}",
    "last_updated": "${today}",
    "updated_by": "AI Research System (Tavily Search + Extract + GPT-4o-mini)",
    "review_due_date": "${reviewDue}",
    "form_status": "In Progress",
    "data_classification": "Internal Use Only"
  }
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a senior business intelligence analyst. Return only valid JSON with no markdown fences and no additional text.' },
      { role: 'user',   content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ── No-LLM fallback ───────────────────────────────────────────────────────────

function buildFromAnswers(companyName, answers, R) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const makeField = (val, period, src) => ({ value: val, period, source: src || 'N/A', notes: '' });

  return {
    company_name: titleCase(companyName), status: 'Active', completion_percent: '40',
    core_sector: answers.overview.split('.')[0] || 'Not Available',
    sub_sector: 'Not Available', product_categories: [], geographic_presence: ['Not Available'],
    financials: {
      revenue: makeField(answers.revenue_growth, '2025', url0(R.revenue_growth)),
      yoy_growth: makeField(answers.revenue_growth, 'YoY', url0(R.revenue_growth)),
      regional_revenue: makeField('Not Available', '—', '—'),
      key_market_revenue: makeField('Not Available', '—', '—'),
      operating_margin: makeField(answers.margins, '2025', url0(R.margins)),
      gross_margin: makeField('Not Available', '—', '—'),
      net_profit: makeField(answers.margins, '2025', url0(R.margins)),
      market_share: makeField(answers.market, '2025', url0(R.market)),
      market_valuation: makeField(answers.market, '2025', url0(R.market)),
    },
    strategy_summary: answers.strategy,
    innovative_products: [],
    operational: {
      annual_turnover: makeField(answers.revenue_growth, '2025', url0(R.revenue_growth)),
      employee_count: makeField(answers.operations, '2025', url0(R.operations)),
      distribution_centers: makeField('Not Available', '—', '—'),
      customer_count: makeField('Not Available', '—', '—'),
      supply_chain_model: { description: answers.operations, source: url0(R.operations) || 'N/A' },
      tech_infrastructure: { description: 'Not Available', source: '—' },
      certifications: { description: 'Not Available', source: '—' },
    },
    key_customers: [], competitors: answers.competitors.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 8),
    intelligence_entries: (R.news?.results || []).slice(0, 5).map(r => ({
      title: r.title || 'Update', details: (r.content || '').substring(0, 200),
      importance: 'Medium', source: r.url || 'N/A', date: 'Not Available',
    })),
    sectors_served: [], geographic_tags: [], strategic_tags: [],
    source_documentation: {
      financial_data: { primary: 'Desk Research', secondary: 'N/A', confidence: 'Medium', notes: 'LLM unavailable' },
      customer_data:  { primary: 'Desk Research', secondary: 'N/A', confidence: 'Low',    notes: 'LLM unavailable' },
      strategic_info: { primary: 'Desk Research', secondary: 'N/A', confidence: 'Medium', notes: 'LLM unavailable' },
      product_info:   { primary: 'Desk Research', secondary: 'N/A', confidence: 'Low',    notes: 'LLM unavailable' },
    },
    verification: { financial_figures_verified: false, customer_contracts_confirmed: false, strategic_info_cross_referenced: false, changes_documented: false, sensitive_data_flagged: false },
    competitive_positioning: answers.market, growth_trajectory: answers.revenue_growth,
    risk_factors: answers.risks, opportunities: answers.strategy,
    form_metadata: { created_date: today, last_updated: today, updated_by: 'Tavily Search only (no LLM)', review_due_date: 'N/A', form_status: 'Draft', data_classification: 'Internal Use Only' },
  };
}

// ── Core research ─────────────────────────────────────────────────────────────

async function researchCompany(companyName, emit) {
  const log = (msg) => { console.log(msg); emit(msg); };
  let totalCredits = 0;

  log(`[${companyName}] Starting research | LLM: ${openai ? 'GPT-4o-mini ON' : 'OFF — add OPENAI_API_KEY'}`);

  // Define queries with label and credit cost
  const queryDefs = [
    { key: 'overview',       depth: 'basic',    topic: 'general', label: 'Company overview & sector',      credits: CREDITS.search_basic    },
    { key: 'revenue_growth', depth: 'advanced', topic: 'general', label: 'Revenue & YoY growth',           credits: CREDITS.search_advanced },
    { key: 'margins',        depth: 'advanced', topic: 'general', label: 'Margins & profitability',        credits: CREDITS.search_advanced },
    { key: 'market',         depth: 'advanced', topic: 'general', label: 'Market share & valuation',       credits: CREDITS.search_advanced },
    { key: 'customers',      depth: 'advanced', topic: 'general', label: 'Key customers & contracts',      credits: CREDITS.search_advanced },
    { key: 'operations',     depth: 'basic',    topic: 'general', label: 'Operations & headcount',         credits: CREDITS.search_basic    },
    { key: 'competitors',    depth: 'basic',    topic: 'general', label: 'Competitors & landscape',        credits: CREDITS.search_basic    },
    { key: 'news',           depth: 'basic',    topic: 'news',    label: 'Recent news & announcements',    credits: CREDITS.search_basic    },
    { key: 'strategy',       depth: 'basic',    topic: 'general', label: 'Strategy & innovation',          credits: CREDITS.search_basic    },
    { key: 'risks',          depth: 'basic',    topic: 'general', label: 'Risks & opportunities',          credits: CREDITS.search_basic    },
  ];

  // Build queries with the company name
  const queries = queryDefs.map(def => ({
    ...def,
    q: {
      overview:       `${companyName} company overview business model founded headquarters industry sector`,
      revenue_growth: `${companyName} annual revenue total revenue YoY growth rate 2024 2025`,
      margins:        `${companyName} operating margin gross margin net profit profitability 2024 2025`,
      market:         `${companyName} market share market position valuation enterprise value 2025`,
      customers:      `${companyName} key customers major clients enterprise contracts named accounts`,
      operations:     `${companyName} employee headcount offices distribution centers global presence`,
      competitors:    `${companyName} direct competitors competitive landscape main rivals`,
      news:           `${companyName} latest news acquisitions announcements 2024 2025`,
      strategy:       `${companyName} business strategy innovation product roadmap growth plans 2025`,
      risks:          `${companyName} risks challenges threats regulatory competitive opportunities`,
    }[def.key],
  }));

  // Run all searches in parallel, logging each result as it resolves
  const R = {};
  const allUrls = [];

  await Promise.all(
    queries.map(({ key, q, depth, topic, label, credits: c }) =>
      search(q, { depth, topic })
        .then(res => {
          R[key] = res;
          totalCredits += c;
          (res?.results || []).forEach(r => { if (r.url && !allUrls.includes(r.url)) allUrls.push(r.url); });
          log(`[${companyName}] Search: ${label} — ${c} credit${c > 1 ? 's' : ''}`);
        })
        .catch(err => {
          log(`[${companyName}] Search failed (${label}): ${err.message}`);
        })
    )
  );

  log(`[${companyName}] ${allUrls.length} sources collected so far`);

  // ── Extract top pages from high-value queries ─────────────────────────────
  const extractTargets = [
    url0(R.revenue_growth),
    url0(R.customers),
    url0(R.market),
    url0(R.operations),
  ].filter(Boolean).filter((u, i, arr) => arr.indexOf(u) === i).slice(0, 5);

  let extractedPages = [];
  if (extractTargets.length > 0) {
    log(`[${companyName}] Extracting ${extractTargets.length} key pages — 1 credit`);
    try {
      const extracted = await extract(extractTargets);
      extractedPages = (extracted.results || []).filter(r => r.raw_content);
      totalCredits += CREDITS.extract_basic;
      log(`[${companyName}] Extracted ${extractedPages.length} pages successfully`);
    } catch (err) {
      log(`[${companyName}] Extract step failed (non-fatal): ${err.message}`);
    }
  }

  // Collect answers
  const answers = {
    overview:       ans(R.overview),
    revenue_growth: ans(R.revenue_growth),
    margins:        ans(R.margins),
    market:         ans(R.market),
    customers:      ans(R.customers),
    operations:     ans(R.operations),
    competitors:    ans(R.competitors),
    strategy:       ans(R.strategy),
    risks:          ans(R.risks),
  };

  // ── LLM synthesis ──────────────────────────────────────────────────────────
  let data;
  try {
    if (openai) {
      log(`[${companyName}] GPT-4o-mini synthesising report...`);
      data = await synthesise(companyName, answers, extractedPages, R.news, allUrls);
      log(`[${companyName}] Synthesis complete — total: ${totalCredits} Tavily credits`);
    } else {
      data = buildFromAnswers(companyName, answers, R);
      log(`[${companyName}] Done (no LLM) — ${totalCredits} Tavily credits used`);
    }
  } catch (err) {
    console.error(`[${companyName}] LLM failed:`, err.message);
    log(`[${companyName}] LLM synthesis failed, using raw answers — ${totalCredits} credits used`);
    data = buildFromAnswers(companyName, answers, R);
  }

  data.company_name = titleCase(data.company_name || companyName);

  return { company: companyName, provider: 'tavily', data, sources: allUrls.slice(0, 25) };
}

// ── Batch runner ──────────────────────────────────────────────────────────────

async function researchAllCompanies(companies, emit) {
  const batchSize = 3;
  const results = [];
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(name => researchCompany(name, emit)));
    results.push(...batchResults);
  }
  return results;
}

export { researchAllCompanies };
