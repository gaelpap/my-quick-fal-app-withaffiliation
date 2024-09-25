import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    const { session_id } = router.query;
    if (session_id) {
      // Here you would typically verify the session with Stripe
      // and update your database to reflect the successful purchase
      console.log('Successful purchase with session ID:', session_id);
    }
  }, [router.query]);

  return (
    <div>
      <h1>Purchase Successful!</h1>
      <p>Thank you for your purchase. Your credits have been added to your account.</p>
    </div>
  );
}