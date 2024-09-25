import { useState } from 'react';

export default function TestStripe() {
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
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

      const { id, url } = await response.json();
      setSessionUrl(url);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div>
      <h1>Test Stripe Integration</h1>
      <button onClick={handleClick}>Create Checkout Session</button>
      {sessionUrl && (
        <p>
          <a href={sessionUrl} target="_blank" rel="noopener noreferrer">
            Go to Checkout
          </a>
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}