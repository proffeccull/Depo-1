import React, { Suspense } from 'react';
import LoadingScreen from './LoadingScreen';

interface LazyScreenProps {
  children: React.ReactNode;
}

export const LazyScreen: React.FC<LazyScreenProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading..." />}>
      {children}
    </Suspense>
  );
};