import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.rewardful) {
      window.rewardful('ready', function() {
        console.log('Rewardful is ready');
      });
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;