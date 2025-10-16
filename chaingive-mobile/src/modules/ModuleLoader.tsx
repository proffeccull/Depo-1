import React, { Suspense } from 'react';
import LoadingScreen from '../components/LoadingScreen';

interface ModuleLoaderProps {
  module: 'nft' | 'marketplace' | 'analytics' | 'social';
  component: string;
  props?: any;
}

const moduleMap = {
  nft: () => import('./nft/NFTModule'),
  marketplace: () => import('./marketplace/MarketplaceModule'),
  analytics: () => import('./analytics/AnalyticsModule'),
  social: () => import('./social/SocialModule'),
};

export const ModuleLoader: React.FC<ModuleLoaderProps> = ({ module, component, props }) => {
  const LazyModule = React.lazy(moduleMap[module]);

  return (
    <Suspense fallback={<LoadingScreen message={`Loading ${module}...`} />}>
      <LazyModule component={component} {...props} />
    </Suspense>
  );
};