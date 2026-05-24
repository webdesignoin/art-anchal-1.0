import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Import Vercel handlers dynamically
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock Vercel environment locally / Handle API routes
app.post('/api/init-rzp', async (req, res) => {
  const handler = await import('./api/create-order.js');
  return handler.default(req, res);
});

app.post('/api/verify-payment', async (req, res) => {
  const handler = await import('./api/verify-payment.js');
  return handler.default(req, res);
});

app.post('/api/webhook-rzp', async (req, res) => {
  const handler = await import('./api/webhook-rzp.js');
  return handler.default(req, res);
});

// Serve frontend static files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle React Router SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
