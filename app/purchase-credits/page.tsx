'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";

export default function PurchaseCredits() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsLoading(true);
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to purchase credits');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        await stripe?.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to initiate purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Lora Training Credits</h1>
      <p className="mb-4">Each purchase gives you 3 credits for Lora training.</p>
      <Button onClick={handlePurchase} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Purchase Credits'}
      </Button>
    </div>
  );
}