import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

const POLL_INTERVAL = 5000; // 5 seconds

export function usePollingQuery<T>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn,
    refetchInterval: POLL_INTERVAL,
    staleTime: 3000,
    ...options,
  });
}
