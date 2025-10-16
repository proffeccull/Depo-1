import { lazy } from 'react';

// Lazy load heavy screens
export const NFTGalleryScreen = lazy(() => import('./nft/NFTGalleryScreen'));
export const SocialFeedScreen = lazy(() => import('./social/SocialFeedScreen'));
export const AnalyticsScreen = lazy(() => import('./analytics/PredictiveInsightsScreen'));
export const MarketplaceScreen = lazy(() => import('./marketplace/P2PMarketplaceScreen'));