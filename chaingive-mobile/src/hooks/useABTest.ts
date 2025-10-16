import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface ABTest {
  name: string;
  variants: string[];
  allocation: Record<string, number>; // variant -> percentage
}

const tests: Record<string, ABTest> = {
  donation_button: {
    name: 'donation_button',
    variants: ['blue', 'green', 'orange'],
    allocation: { blue: 33, green: 33, orange: 34 },
  },
  onboarding_flow: {
    name: 'onboarding_flow',
    variants: ['standard', 'gamified'],
    allocation: { standard: 50, gamified: 50 },
  },
};

export const useABTest = (testName: string) => {
  const [variant, setVariant] = useState<string>('');
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user?.id) return;

    const test = tests[testName];
    if (!test) {
      setVariant('');
      return;
    }

    // Deterministic variant assignment based on user ID
    const hash = user.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const percentage = Math.abs(hash) % 100;
    let cumulative = 0;
    
    for (const [variantName, allocation] of Object.entries(test.allocation)) {
      cumulative += allocation;
      if (percentage < cumulative) {
        setVariant(variantName);
        break;
      }
    }
  }, [testName, user?.id]);

  return variant;
};