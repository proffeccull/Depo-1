import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Refetch all queries when coming back online
        queryClient.refetchQueries();
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return {
    syncOfflineData: () => queryClient.refetchQueries(),
  };
};