import { useState } from 'react';
import { API_CONFIG } from '@/config/api';

export interface EnsProfile {
  name: string;
  addresses?: Record<string, string>;
  texts?: Record<string, string>;
  contenthash?: string;
}

export interface ResolveOptions {
  includeAddresses?: boolean;
  includeTexts?: boolean;
  includeContenthash?: boolean;
}

export interface UseResolvioReturn {
  data: EnsProfile | null;
  error: string | null;
  loading: boolean;
  resolve: (ensName: string, options?: ResolveOptions) => Promise<void>;
  reset: () => void;
}

export const useResolvio = (): UseResolvioReturn => {
  const [data, setData] = useState<EnsProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resolve = async (ensName: string, options: ResolveOptions = {}) => {
    if (!ensName.trim()) {
      setError('Please enter an ENS name');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams();
      
      if (options.includeAddresses) {
        params.append('addresses', 'true');
      }
      
      if (options.includeTexts) {
        params.append('texts', 'true');
      }
      
      if (options.includeContenthash) {
        params.append('contenthash', 'true');
      }

      const apiUrl = `${API_CONFIG.baseUrl}/ens/v1/profile/${ensName}?${params.toString()}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          'Cannot connect to API server. Please check your internet connection and try again.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Failed to resolve ENS name');
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

