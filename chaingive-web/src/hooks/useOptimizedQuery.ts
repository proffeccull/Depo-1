import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function useOptimizedQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  const isVisible = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisible.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: isVisible.current,
    ...options,
  });
}