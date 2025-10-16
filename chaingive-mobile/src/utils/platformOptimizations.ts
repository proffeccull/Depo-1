import { Platform } from 'react-native';

export const platformOptimizations = {
  // Image optimization
  getOptimizedImageUri: (uri: string, width: number, height: number) => {
    if (Platform.OS === 'web') {
      return `${uri}?w=${width}&h=${height}&q=80`;
    }
    return uri;
  },

  // Storage optimization
  getStorageKey: (key: string) => {
    return Platform.OS === 'web' ? `chaingive_${key}` : key;
  },

  // Animation optimization
  getAnimationConfig: () => ({
    useNativeDriver: Platform.OS !== 'web',
    duration: Platform.OS === 'web' ? 200 : 300,
  }),

  // Network optimization
  getRequestConfig: () => ({
    timeout: Platform.OS === 'web' ? 5000 : 10000,
    retries: Platform.OS === 'web' ? 1 : 3,
  }),

  // Bundle optimization
  shouldLazyLoad: (component: string) => {
    const heavyComponents = ['NFTGallery', 'Analytics', 'Marketplace'];
    return Platform.OS === 'web' || heavyComponents.includes(component);
  },
};