'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PurchaseSuccess() {
  const [credits, setCredits] = useState<number | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const creditsPurchased = searchParams.get('credits');
    setCredits(creditsPurchased ? parseInt(creditsPurchased) : null);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Purchase Successful!</h1>
        {credits !== null ? (
          <p className="text-lg mb-6">
            You've successfully purchased {credits} credit{credits !== 1 ? 's' : ''} for Lora training.
          </p>
        ) : (
          <p className="text-lg mb-6">Your purchase was successful.</p>
        )}
        <Link 
          href="/lora-training"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Click here to go back to train your Lora
        </Link>
      </div>
    </div>
  );
}