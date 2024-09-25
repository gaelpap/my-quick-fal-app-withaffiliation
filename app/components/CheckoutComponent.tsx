import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

function CheckoutComponent() {
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setError(null);
      console.log('Starting purchase process...');
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('Fetching checkout session...');
      const response = await fetch('/api/purchase-image-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const session = await response.json();
      console.log('Checkout session received:', session.id);

      console.log('Redirecting to Stripe checkout...');
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error('Stripe redirect error:', result.error);
        throw new Error(result.error.message);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div>
      <button onClick={handlePurchase}>Purchase Credits</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CheckoutComponent;