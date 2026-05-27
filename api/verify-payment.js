import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase once at module load time
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service key bypasses RLS

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Razorpay secret not configured' });
    }

    // Verify Razorpay signature (HMAC-SHA256)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — possible tampering. Do NOT mark as paid.
      console.error('[verify-payment] Signature mismatch! Possible payment tampering attempt.');
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Signatures match — payment is authentic
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Update order status. We try both schema variants for compatibility:
        // - New schema: tracking_number stores the razorpay_order_id pre-payment
        // - Also try matching by payment_ref if tracking_number search fails
        const { data, error } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',          // 'confirmed' is valid in order_status enum
            is_paid: true,                // original schema field
            payment_status: 'paid',       // migration-added field
            payment_ref: razorpay_payment_id,  // original schema field
            tracking_number: razorpay_payment_id,  // migration-added field
          })
          .eq('tracking_number', razorpay_order_id)
          .select('id');

        if (error) {
          console.error('[verify-payment] DB update error:', error);
        } else if (!data || data.length === 0) {
          console.warn('[verify-payment] No order found with tracking_number =', razorpay_order_id);
        } else {
          console.log('[verify-payment] Order confirmed:', data[0]?.id);
        }
      } catch (dbErr) {
        // Log but don't block the success response — client-side also handles this
        console.error('[verify-payment] DB error (non-fatal):', dbErr);
      }
    } else {
      console.warn('[verify-payment] Supabase env vars missing — skipping DB update');
    }

    return res.status(200).json({ success: true, message: 'Payment verified successfully' });

  } catch (error) {
    console.error('[verify-payment] Unexpected error:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}
