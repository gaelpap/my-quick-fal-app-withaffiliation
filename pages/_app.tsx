import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import ErrorBoundary from '../components/ErrorBoundary';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.rewardful) {
      window.rewardful('ready', function() {
        console.log('Rewardful is ready');
      });
    }

    // Global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log to your error tracking service here
      console.log('Caught in global error handler:', ...args);
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;