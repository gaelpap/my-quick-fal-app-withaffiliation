import { useState } from 'react';

export default function TestStripe() {
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      console.log('Initiating test purchase...');
      const response = await fetch('/api/purchase-image-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (!data.url) {
        throw new Error('No checkout URL provided');
      }

      setSessionUrl(data.url);
      console.log('Checkout URL:', data.url);
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