import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // Update this to match your Stripe library version
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ai-photo-creator.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called');
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method === 'POST') {
    try {
      console.log('Attempting to create Stripe checkout session...')
      console.log('Base URL:', baseUrl)
      console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set')

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Image Credits',
              },
              unit_amount: 1000,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      })

      console.log('Checkout session created successfully:', session.id)
      console.log('Full session object:', JSON.stringify(session, null, 2))
      res.status(200).json({ id: session.id, url: session.url })
    } catch (err) {
      console.error('Error creating checkout session:', err)
      if (err instanceof Stripe.errors.StripeError) {
        console.error('Stripe error details:', err.type, err.raw)
        res.status(500).json({ statusCode: 500, message: err.message, type: err.type })
      } else {
        console.error('Unexpected error details:', err)
        res.status(500).json({ statusCode: 500, message: 'An unexpected error occurred' })
      }
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}