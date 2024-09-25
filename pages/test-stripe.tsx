import { useState } from 'react';

export default function TestStripe() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const response = await fetch('/api/purchase-image-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { id } = await response.json();
      setSessionId(id);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div>
      <h1>Test Stripe Integration</h1>
      <button onClick={handleClick}>Create Checkout Session</button>
      {sessionId && (
        <p>
          Session ID: {sessionId}{' '}
          <a href={`https://checkout.stripe.com/pay/${sessionId}`} target="_blank" rel="noopener noreferrer">
            Go to Checkout
          </a>
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}