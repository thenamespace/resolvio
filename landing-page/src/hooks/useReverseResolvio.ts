import { useState } from 'react';
import { API_CONFIG } from '@/config/api';

export interface ReverseResolveResult {
  address: string;
  name: string | null;
}

export interface UseReverseResolvioReturn {
  data: ReverseResolveResult[] | null;
  error: string | null;
  loading: boolean;
  resolve: (addresses: string[]) => Promise<void>;
  reset: () => void;
}

export const useReverseResolvio = (): UseReverseResolvioReturn => {
  const [data, setData] = useState<ReverseResolveResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolve = async (addresses: string[]) => {
    const validAddresses = addresses.filter((addr) => addr.trim());

    if (validAddresses.length === 0) {
      setError('Please enter at least one address');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const apiUrl = `${API_CONFIG.baseUrl}/ens/v1/reverse/bulk`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses: validAddresses }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error (${response.status}): ${errorText || response.statusText}`
        );
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          'Cannot connect to API server. Please check your internet connection and try again.'
        );
      } else {
        setError(
          err instanceof Error ? err.message : 'Failed to reverse resolve addresses'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    error,
    loading,
    resolve,
    reset,
  };
};
