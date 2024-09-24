import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const CREDITS_PER_PURCHASE = 3;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id;
      if (userId) {
        const userRef = db.collection('users').doc(userId);
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) {
            throw new Error('User document does not exist');
          }
          const currentCredits = userDoc.data()?.loraCredits || 0;
          transaction.update(userRef, {
            loraCredits: currentCredits + CREDITS_PER_PURCHASE
          });
        });
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json({ success: false });
  } catch (error) {
    console.error('Error checking payment:', error);
    return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 });
  }
}