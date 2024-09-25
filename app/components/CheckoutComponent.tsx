import { useState } from 'react';

function CheckoutComponent() {
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    try {
      console.log('Initiating purchase...');
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

      console.log('Redirecting to:', data.url);
      window.location.href = data.url;
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