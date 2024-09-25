import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20', // Update to the latest API version
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ai-photo-creator.com' // Add a fallback URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Image Credits',
              },
              unit_amount: 1000, // $10.00
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      })

      res.status(200).json({ id: session.id })
    } catch (err) {
      console.error('Error creating checkout session:', err)
      res.status(500).json({ statusCode: 500, message: err instanceof Error ? err.message : 'Error creating checkout session' })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}