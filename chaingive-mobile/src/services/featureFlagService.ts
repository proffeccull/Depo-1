import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  userGroups?: string[];
}

interface FeatureFlagState {
  flags: Record<string, FeatureFlag>;
  isEnabled: (key: string, userId?: string) => boolean;
  setFlag: (key: string, flag: FeatureFlag) => void;
  loadFlags: () => Promise<void>;
}

export const useFeatureFlags = create<FeatureFlagState>((set, get) => ({
  flags: {},
  
  isEnabled: (key: string, userId?: string) => {
    const flag = get().flags[key];
    if (!flag) return false;
    if (!flag.enabled) return false;
    
    // Simple rollout percentage check
    if (flag.rolloutPercentage && userId) {
      const hash = userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const percentage = Math.abs(hash) % 100;
      return percentage < flag.rolloutPercentage;
    }
    
    return flag.enabled;
  },
  
  setFlag: (key: string, flag: FeatureFlag) => {
    set(state => ({
      flags: { ...state.flags, [key]: flag }
    }));
  },
  
  loadFlags: async () => {
    try {
      const stored = await AsyncStorage.getItem('feature_flags');
      const flags = stored ? JSON.parse(stored) : {};
      set({ flags });
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  },
}));

// Default flags
export const defaultFlags: Record<string, FeatureFlag> = {
  nft_gallery: { key: 'nft_gallery', enabled: true },
  social_feed: { key: 'social_feed', enabled: false, rolloutPercentage: 50 },
  advanced_analytics: { key: 'advanced_analytics', enabled: false },
};