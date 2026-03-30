# MarketLens AI

A AI-powered market research tool built as a hiring task project.
Users enter up to 10 company names and receive a comprehensive, 
structured market research report generated automatically.

## What it does

MarketLens AI takes a list of company names and autonomously browses 
the web to research each one in real time. It compiles everything into 
a clean, readable report covering:

- Company overview
- Financials (revenue, funding, valuation)
- Market position
- Competitors
- Recent news and trends
- Risks and opportunities

Reports can be downloaded as **PDF** or **Markdown** files.

## Key Features

- Enter up to 10 companies at once
- Companies are researched in parallel
- Report renders directly in the browser as formatted text
- One-click export to PDF or Markdown


## Project Structure
```
MarketLens-AI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Header, InputBar, CompanyChips, LogFeed, Report, LoadingScreen
│   │   ├── api/            # API call logic
│   │   ├── utils/          # Markdown builder
│   │   └── App.jsx         # Root component, holds all state
│   └── package.json
└── server/                 # Express backend
    ├── index.js            # Routes
    ├── tinyfish.js         # Research agent integration
    ├── pdf.js              # PDF generation
    └── package.json
```

## Local Setup

### Prerequisites
- Node.js v18+
- API key for the research agent service

### 1. Clone the repo
```bash
git clone https://github.com/prince-at-git/MarketLens-AI.git
cd MarketLens-AI
```

### 2. Set up the server
```bash
cd server
npm install
```

Create `server/.env`:
```
RESEARCH_API_KEY=your_key_here
```

Start the server:
```bash
node index.js
```

### 3. Set up the client (new terminal)
```bash
cd client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000
```

Start the client:
```bash
npm run dev
```

### 4. Open the app
Go to `http://localhost:5173` in your browser.

## How it works

1. User enters company names one by one and hits Send
2. The backend receives the list and fires parallel research jobs
3. Each company is researched live from the web in real time
4. Raw research data is compiled into a structured markdown report
5. The report is displayed in the browser and available to download
