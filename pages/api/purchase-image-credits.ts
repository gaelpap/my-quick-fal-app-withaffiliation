import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Update to the latest stable API version
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ai-photo-creator.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Attempting to create Stripe checkout session...')
      console.log('Base URL:', baseUrl)
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
      res.status(200).json({ id: session.id })
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