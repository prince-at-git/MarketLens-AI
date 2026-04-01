import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generatePDF }  from './pdf.js';
import { generateDOCX } from './docx.js';
import { researchAllCompanies as researchTinyFish } from './tinyfish.js';
import { researchAllCompanies as researchTavily }   from './tavily.js';

const app  = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', process.env.FRONT_END_URL].filter(Boolean),
}));
app.use(express.json({ limit: '10mb' }));

// ── Health ────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Research — SSE streaming ──────────────────────────────────────────────────
// Streams progress events while research runs, then sends the final result.
// Frontend uses fetch + ReadableStream (EventSource doesn't support POST).

app.post('/api/research', async (req, res) => {
  const { companies, provider = 'tavily' } = req.body;

  if (!companies?.length) {
    return res.status(400).json({ error: 'No companies provided.' });
  }
  if (companies.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 companies allowed.' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');   // disable nginx buffering if proxied
  res.flushHeaders();

  // Helper to push a single SSE event
  const send = (payload) => {
    try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch (_) {}
  };

  // onProgress callback passed into research modules
  const emit = (message) => send({ type: 'log', message });

  try {
    emit(`Research started — provider: ${provider}, companies: ${companies.join(', ')}`);

    const results = provider === 'tinyfish'
      ? await researchTinyFish(companies, emit)
      : await researchTavily(companies, emit);

    emit('Building report...');
    send({ type: 'complete', rawData: results });
  } catch (err) {
    console.error('Research route error:', err);
    send({ type: 'error', message: err.message });
  }

  res.end();
});

// ── PDF download ──────────────────────────────────────────────────────────────

app.post('/api/download/pdf', async (req, res) => {
  const { rawData } = req.body;
  if (!rawData) return res.status(400).json({ error: 'No data provided.' });
  try {
    const buffer = await generatePDF(rawData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="market-research-report.pdf"');
    res.send(buffer);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DOCX download ─────────────────────────────────────────────────────────────

app.post('/api/download/docx', async (req, res) => {
  const { rawData } = req.body;
  if (!rawData) return res.status(400).json({ error: 'No data provided.' });
  try {
    const buffer = await generateDOCX(rawData);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="market-research-report.docx"');
    res.send(buffer);
  } catch (err) {
    console.error('DOCX error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
