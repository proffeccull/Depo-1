import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

export function useOptimizedQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  const isScreenFocused = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isScreenFocused.current = true;
      return () => {
        isScreenFocused.current = false;
      };
    }, [])
  );

  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: isScreenFocused.current,
    ...options,
  });
}