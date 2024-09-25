import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Update to the latest version
});

export async function POST(request: Request) {
  try {
    const { credits } = await request.json();

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1234',
          quantity: credits,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/purchase-success?credits=${credits}`,
      cancel_url: `${request.headers.get('origin')}/purchase-credits?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
  }
}