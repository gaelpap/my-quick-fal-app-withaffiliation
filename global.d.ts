interface Window {
  rewardful?: (action: string, data?: any) => void;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_REWARDFUL_ID?: string;
    STRIPE_SECRET_KEY?: string;
    NEXT_PUBLIC_BASE_URL?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  }
}