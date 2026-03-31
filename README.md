# MarketLens AI

MarketLens AI is an AI-powered market research tool built as a hiring task.That lets users queue up to 10 companies, run research across them in parallel, preview the compiled report in the browser, and export the result as Markdown or PDF.

## What it does

The app generates a structured market research brief for each submitted company. The report is organized around:

- Company overview
- Business model
- Financials
- Market position
- Competitors
- Recent news and trends
- Risks
- Opportunities

After the run completes, the report is rendered directly in the browser and can be downloaded in:

- Markdown
- PDF

## Current UI Features

- Add up to 10 companies to the queue
- See a live `x/10 companies added` counter
- Remove individual company chips
- Clear the entire queue with `Clear all`
- Submit research with `Generate Research Report`
- See a loading state while research is running
- View a lightweight terminal-style activity log
- Preview the final report in a light document-style reading surface
- Download the finished report as Markdown or PDF


### Frontend

- React
- Vite
- Axios
- React Markdown

### Backend

- Node.js
- Express
- CORS
- PDFKit

## Project Structure

```text
market-research-app/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── research.js         
│   │   ├── components/
│   │   │   ├── Header.jsx          
│   │   │   ├── InputBar.jsx        
│   │   │   ├── CompanyChips.jsx    
│   │   │   ├── LogFeed.jsx         
│   │   │   └── Report.jsx          
│   │   ├── utils/
│   │   │   └── buildMarkdown.js    
│   │   ├── App.jsx                 
│   │   ├── main.jsx                
│   │   └── index.css               
│   ├── .env
│   └── package.json
├── server/
│   ├── index.js                    
│   ├── tinyfish.js                 
│   ├── pdf.js                      
│   ├── .env
│   └── package.json
└── README.md
```


## Local Setup

### Prerequisites

- Node.js 18+
- A configured server-side research API key in `server/.env`

### 1. Install server dependencies

```bash
cd server
npm install
```

Create `server/.env` and add:

- the required server-side API key expected by your local server setup
- `FRONT_END_URL` for any deployed frontend origin you want to allow

Start the backend:

```bash
node index.js
```

### 2. Install client dependencies

```bash
cd client
npm install
```

Create `client/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 3. Open the app

Visit:

```text
http://localhost:5173
```

## Available Routes

### `GET /health`

Basic server health check.

Response:

```json
{ "status": "ok" }
```

### `POST /api/research`

Accepts a list of company names and returns structured research data.

### `POST /api/download/pdf`

Accepts the previously returned `rawData` and returns a generated PDF file.

## Notes

- The UI log feed is a lightweight progress display for the user experience.
- Markdown preview and PDF export are built from the same raw research payload.
- Markdown is generated on the frontend.
- PDF is generated on the backend.
