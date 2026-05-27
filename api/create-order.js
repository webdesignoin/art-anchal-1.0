import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt = `receipt_${Date.now()}` } = req.body;

    // Validate and sanitize amount
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return res.status(400).json({ error: 'Amount must be at least 100 paise (₹1)' });
    }
    // Cap at 10 crore paise (₹1,00,000) to prevent abuse
    const MAX_AMOUNT_PAISE = 100_000_00; // ₹1,00,000 in paise
    if (parsedAmount > MAX_AMOUNT_PAISE) {
      return res.status(400).json({ error: 'Amount exceeds maximum allowed order value' });
    }
    // Validate currency
    const ALLOWED_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'];
    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency code' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay keys are missing' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: parsedAmount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
}
