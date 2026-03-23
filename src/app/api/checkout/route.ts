/**
 * Stripe Checkout API
 * Creates a checkout session for the $5 report
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { submissionId, email } = await request.json();
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    // Get the base URL for redirects
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Am I Cooked? Full Report',
              description: 'AI-powered financial analysis with personalized action plan',
            },
            unit_amount: 500, // $5.00 in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        submissionId,
      },
      success_url: `${origin}/report/${submissionId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results/${submissionId}`,
      // Enable Apple Pay, Google Pay, etc.
      payment_method_options: {
        card: {
          setup_future_usage: undefined,
        },
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
    });
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
