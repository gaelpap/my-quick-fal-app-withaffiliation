import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

const CREDITS_PER_PURCHASE = 3;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      try {
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
        console.log(`Added ${CREDITS_PER_PURCHASE} credits to user ${userId}`);
      } catch (error) {
        console.error('Error updating user credits:', error);
        return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 });
      }
    } else {
      console.error('No userId found in session');
      return NextResponse.json({ error: 'No userId found in session' }, { status: 400 });
    }
  }

  return NextResponse.json({ received: true });
}