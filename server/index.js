import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generatePDF } from './pdf.js'
import { researchAllCompanies } from './tinyfish.js';


const app = express();
const port = 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONT_END_URL
  ]
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/research', async (req, res) => {
  try {
    const { companies } = req.body;
    const tinyfishResults = await researchAllCompanies(companies);
    res.json({ rawData: tinyfishResults });
  } catch (err) {
    console.error('Research route error:', err)
    res.status(500).json({ error: err.message })
  }
});

app.post('/api/download/pdf', async (req, res) => {
  const { rawData } = req.body;
  if (!rawData) {
    return res.status(400).json({ error: 'No research data available. Run a search first.' });
  }
  const buffer = await generatePDF(rawData);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="market-research-report.pdf"');
  res.send(buffer);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
