'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateImage } from './actions'
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { UserImages } from './UserImages'
import { User } from 'firebase/auth';
import { doc, getDoc, collection, setDoc } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import { Select } from "@/components/ui/select"

interface LoRA {
  path: string;
  scale: number;
}

export function Page() {
  const [prompt, setPrompt] = useState('')
  const [loras, setLoras] = useState<LoRA[]>([])
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [disableSafetyChecker, setDisableSafetyChecker] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [language, setLanguage] = useState('en')
  const [translatedPrompt, setTranslatedPrompt] = useState('')

  const router = useRouter()

  useEffect(() => {
    const checkSubscription = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const subscriptionStatus = userDoc.data()?.isSubscribed || false;
        setIsSubscribed(subscriptionStatus);
        console.log('Subscription status:', subscriptionStatus);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkSubscription();
      } else {
        setIsSubscribed(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadStripeKey() {
      try {
        const response = await fetch('/api/get-stripe-publishable-key');
        const data = await response.json();
        if (data.error) {
          console.error('Error fetching Stripe Publishable Key:', data.error);
          return;
        }
        console.log('Received Stripe Publishable Key:', data.publishableKey);
        if (!data.publishableKey) {
          console.error('Received empty Stripe Publishable Key');
          return;
        }
        const stripePromise = loadStripe(data.publishableKey);
        setStripePromise(stripePromise);
      } catch (error) {
        console.error('Error loading Stripe Publishable Key:', error);
      }
    }

    loadStripeKey();
  }, []);

  const handleAddLora = () => {
    if (loras.length < 2) {
      setLoras([...loras, { path: '', scale: 1 }])
    }
  }

  const handleRemoveLora = (index: number) => {
    setLoras(loras.filter((_, i) => i !== index))
  }

  const handleLoraChange = (index: number, field: keyof LoRA, value: string | number) => {
    const newLoras = [...loras]
    newLoras[index] = { ...newLoras[index], [field]: value }
    setLoras(newLoras)
  }

  const translatePrompt = async (text: string, targetLang: string) => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to generate images.');
      return;
    }
    setIsLoading(true);
    setImageUrl(''); // Clear previous image
    try {
      // Translate prompt only if language is French
      const promptToUse = language === 'fr' ? await translatePrompt(prompt, 'en') : prompt;
      setTranslatedPrompt(language === 'fr' ? promptToUse : '');

      console.log('Submitting image generation request');
      const idToken = await user.getIdToken();
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ prompt: promptToUse, loras, disableSafetyChecker }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Generation result:', result);
      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
        console.log('Image URL set:', result.imageUrl);
        // Save the generated image to Firestore
        const imageRef = doc(collection(db, 'users', user.uid, 'images'));
        await setDoc(imageRef, {
          prompt: prompt,
          imageUrl: result.imageUrl,
          createdAt: new Date().toISOString(),
        });
        console.log('Image saved to Firestore');
      } else {
        throw new Error('No image URL in the response');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      if (error instanceof Error) {
        alert(`Error generating image: ${error.message}`);
      } else {
        alert('An unknown error occurred while generating the image');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleRedirectToSubscription = () => {
    router.push('/subscription');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Image Generator</h1>
        <Button onClick={handleLogout} className="bg-red-500 text-white">
          Logout
        </Button>
      </div>
      {!isSubscribed ? (
        <div className="text-center py-8">
          <h2 className="text-xl mb-4">Subscribe to start generating images</h2>
          <Button onClick={handleRedirectToSubscription} className="bg-blue-500 text-white">
            Choose Subscription
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex mb-2">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={language === 'en' ? "Enter your prompt" : "Entrez votre prompt"}
              className="flex-grow p-2 mr-2 border rounded"
            />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          {loras.map((lora, index) => (
            <div key={index} className="flex mb-2">
              <Input
                type="text"
                value={lora.path}
                onChange={(e) => handleLoraChange(index, 'path', e.target.value)}
                placeholder="LoRA path"
                className="flex-grow p-2 mr-2 border rounded"
              />
              <Input
                type="number"
                value={lora.scale}
                onChange={(e) => handleLoraChange(index, 'scale', parseFloat(e.target.value))}
                step="0.1"
                min="0"
                max="1"
                className="w-20 p-2 border rounded mr-2"
              />
              <Button 
                type="button" 
                onClick={() => handleRemoveLora(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={handleAddLora}
            disabled={loras.length >= 2}
            className="bg-blue-500 text-white p-2 rounded mb-2 mr-2"
          >
            Add LoRA
          </Button>
          <label className="inline-flex items-center mb-2">
            <input
              type="checkbox"
              checked={disableSafetyChecker}
              onChange={(e) => setDisableSafetyChecker(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Disable Safety Checker</span>
          </label>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-500 text-white p-2 rounded w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </Button>
        </form>
      )}
      {imageUrl && (
        <div>
          <h2 className="text-xl font-bold mb-2">Generated Image:</h2>
          <Image 
            src={imageUrl} 
            alt="Generated image"
            width={500}
            height={500}
            layout="responsive"
            onError={(e) => {
              console.error('Error loading image:', imageUrl);
              e.currentTarget.src = '/placeholder-image.jpg'; // Replace with a placeholder image
            }}
          />
        </div>
      )}
      <UserImages />
      {translatedPrompt && language === 'fr' && (
        <p className="mt-2 text-sm text-gray-600">
          Translated prompt: {translatedPrompt}
        </p>
      )}
    </div>
  )
}