/**
 * Stripe Webhook Handler
 * Processes successful payments and triggers AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submissionId;
    const customerEmail = session.customer_email;

    if (submissionId) {
      const supabase = createClient();

      // Update submission with payment info
      await supabase
        .from('submissions')
        .update({
          paid: true,
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
          email: customerEmail || undefined,
        })
        .eq('id', submissionId);

      console.log(`Payment successful for submission ${submissionId}`);
    }
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhook
export const config = {
  api: {
    bodyParser: false,
  },
};
