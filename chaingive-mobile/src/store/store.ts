import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import communityReducer from './slices/communitySlice';
import authReducer from './slices/authSlice';
import gamificationReducer from './slices/gamificationSlice';
import coinPurchaseReducer from './slices/coinPurchaseSlice';
import coinReducer from './slices/coinSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import analyticsReducer from './slices/analyticsSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import socialReducer from './slices/socialSlice';
import challengesReducer from './slices/challengesSlice';
import aiReducer from './slices/aiSlice';
import nftReducer from './slices/nftSlice';
import predictiveAnalyticsReducer from './slices/predictiveAnalyticsSlice';
import charityCategoriesReducer from './slices/charityCategoriesSlice';
import crewReducer from './slices/crewSlice';
import trustReducer from './slices/trustSlice';
import weeklyTargetsReducer from './slices/weeklyTargetsSlice';
import userLevelsReducer from './slices/userLevelsSlice';
import charitableNFTReducer from './slices/charitableNFTSlice';
import userManagementReducer from './slices/userManagementSlice';
import auctionReducer from '../redux/slices/auctionSlice';
import circlesReducer from '../redux/slices/circlesSlice';
import eventsReducer from '../redux/slices/eventsSlice';
import cryptoGatewayReducer from '../redux/slices/cryptoGatewaySlice';
import merchantReducer from '../redux/slices/merchantSlice';
import corporateReducer from '../redux/slices/corporateSlice';
import battlePassReducer from '../redux/slices/battlePassSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'coin', 'subscription'],
};
  community: communityReducer,

const rootReducer = combineReducers({
  auth: authReducer,
  gamification: gamificationReducer,
  coinPurchase: coinPurchaseReducer,
  coin: coinReducer,
  marketplace: marketplaceReducer,
  leaderboard: leaderboardReducer,
  analytics: analyticsReducer,
  subscription: subscriptionReducer,
  social: socialReducer,
  challenges: challengesReducer,
  ai: aiReducer,
  nft: nftReducer,
  predictiveAnalytics: predictiveAnalyticsReducer,
  charityCategories: charityCategoriesReducer,
  crew: crewReducer,
  trust: trustReducer,
  weeklyTargets: weeklyTargetsReducer,
  userLevels: userLevelsReducer,
  charitableNFT: charitableNFTReducer,
  userManagement: userManagementReducer,
  auction: auctionReducer,
  circles: circlesReducer,
  events: eventsReducer,
  cryptoGateway: cryptoGatewayReducer,
  merchant: merchantReducer,
  corporate: corporateReducer,
  battlePass: battlePassReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;