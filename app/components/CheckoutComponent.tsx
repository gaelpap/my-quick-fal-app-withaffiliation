import { useEffect } from 'react';

function CheckoutComponent() {
  const handleConversion = (email: string) => {
    console.log('Attempting to track conversion for:', email);
    if (typeof window !== 'undefined' && window.rewardful) {
      window.rewardful('convert', { email: email });
      console.log('Conversion tracked successfully');
    } else {
      console.error('Rewardful not available');
    }
  };

  // Call handleConversion when a purchase is completed
  // For example:
  // handleConversion('customer@example.com');

  return (
    <div>
      {/* Your checkout component JSX */}
    </div>
  );
}

export default CheckoutComponent;