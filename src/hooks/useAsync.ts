import { useState, useCallback } from 'react';

type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  initialLoading = false
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    data,
    error,
    isLoading,
    execute,
    setData,
    setError,
  };
}
