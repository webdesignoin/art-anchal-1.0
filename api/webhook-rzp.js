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
        // Initialize Supabase client
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.VITE_SUPABASE_ANON_KEY
        );

        // Update the order in the database
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            is_paid: true,
            notes: 'Verified via Webhook'
          })
          .eq('transaction_id', razorpayOrderId);
          
        if (error) {
          console.error('Failed to update order via webhook:', error);
        } else {
          console.log(`Order ${razorpayOrderId} marked as paid via webhook!`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
