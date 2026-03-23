/**
 * Verify Stripe payment session
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  
  if (!sessionId) {
    return NextResponse.json({ paid: false, error: 'No session ID' });
  }
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Check if payment was successful
    const paid = session.payment_status === 'paid';
    
    return NextResponse.json({ 
      paid,
      status: session.payment_status,
    });
  } catch (error) {
    console.error('Stripe verification error:', error);
    return NextResponse.json({ paid: false, error: 'Invalid session' });
  }
}
