import { QueryClient } from "@tanstack/react-query";

/**
 * React Query Client Configuration
 * Handles caching, retries, and query behavior
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries 3 times
      retry: 3,
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});
