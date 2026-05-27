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

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      console.error('[create-order] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.');
      return res.status(500).json({ error: 'Payment gateway credentials are not configured.' });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: parsedAmount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json(order);
  } catch (error) {
    // Log masked key for debugging auth failures
    const maskedKey = process.env.RAZORPAY_KEY_ID
      ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...${process.env.RAZORPAY_KEY_ID.slice(-4)}`
      : '(not set)';
    console.error(`[create-order] Error (key_id: ${maskedKey}):`, error);

    // Surface Razorpay-specific error description when available
    const rzpDescription = error?.error?.description || error?.description;
    const clientMessage = rzpDescription
      ? `Payment gateway error: ${rzpDescription}`
      : 'Failed to create order. Please try again.';

    return res.status(500).json({ error: clientMessage });
  }
}
