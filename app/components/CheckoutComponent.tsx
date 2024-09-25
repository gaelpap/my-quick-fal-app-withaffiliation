import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutComponent() {
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      setError(null);
      const stripe = await stripePromise;
      const response = await fetch('/api/purchase-image-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const session = await response.json();
      const result = await stripe!.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
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