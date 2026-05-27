import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("Webhook secret not configured, skipping verification.");
      return res.status(200).send('OK');
    }

    const signature = req.headers['x-razorpay-signature'];
    
    // Express rawBody setup is required in server.js to compute the signature exactly
    const bodyString = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay Webhook Signature");
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'order.paid' || event === 'payment.captured') {
      const razorpayOrderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      
      if (razorpayOrderId) {
        // Initialize Supabase with SERVICE KEY — must bypass RLS for webhook updates
        const razorpayPaymentId = payload.payment?.entity?.id;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('[webhook] Supabase service credentials missing');
          return res.status(500).json({ error: 'Database configuration missing' });
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update the order — support both original and migrated schema fields
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',              // Valid in order_status enum
            is_paid: true,                    // Original schema field
            payment_ref: razorpayPaymentId,   // Original schema field
            payment_status: 'paid',           // Migration-added field
            tracking_number: razorpayPaymentId, // Migration-added field
          })
          .eq('tracking_number', razorpayOrderId);
          
        if (error) {
          console.error('[webhook] Failed to update order:', error);
        } else {
          console.log(`[webhook] Order ${razorpayOrderId} confirmed as paid`);
        }

      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
