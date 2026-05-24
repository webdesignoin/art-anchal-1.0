import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Import Vercel handlers dynamically
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Vercel environment locally
app.post('/api/init-rzp', async (req, res) => {
  const handler = await import('./api/create-order.js');
  return handler.default(req, res);
});

app.post('/api/verify-payment', async (req, res) => {
  const handler = await import('./api/verify-payment.js');
  return handler.default(req, res);
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
});
