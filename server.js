import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Import API handlers statically at startup (not per-request)
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';
import webhookHandler from './api/webhook-rzp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://artandanchal.com',
  'https://www.artandanchal.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, same-origin server calls)
    if (!origin || isDev) return callback(null, true);
    
    // Check if origin matches allowed list or any Netlify subdomain
    if (
      allowedOrigins.includes(origin) || 
      origin.endsWith('.netlify.app') || 
      origin.includes('art-anchal') ||
      origin.includes('netlify')
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));


// ── Security headers ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!isDev) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// General API limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
  skip: () => isDev,       // Skip in development
});

// Strict limiter for payment routes: 10 requests per 15 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please wait before trying again.' },
  skip: () => isDev,
});

// Webhook limiter: 60 requests per minute (Razorpay can send bursts)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Webhook rate limit exceeded.' },
  skip: () => isDev,
});

// Apply general limiter to all API routes
app.use('/api/', generalLimiter);

// ── Body Parser — preserve rawBody for Razorpay webhook HMAC verification ─────
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.post('/api/init-rzp', paymentLimiter, createOrderHandler);
app.post('/api/verify-payment', paymentLimiter, verifyPaymentHandler);
app.post('/api/webhook-rzp', webhookLimiter, webhookHandler);

// ── Serve frontend (production) ────────────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback — let React Router handle client-side routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start server ───────────────────────────────────────────────────────────────
if (!process.env.NETLIFY && !process.env.LAMBDA_TASK_ROOT) {
  app.listen(PORT, () => {
    console.log(`[Art&Anchal] Server running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

export default app;
