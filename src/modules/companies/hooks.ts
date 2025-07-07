import { useState, useCallback } from 'react';
import { ApiResponse } from './types';

// 自定义 Hook: API 请求
export const useApiRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const request = useCallback(async <T,>(
    url: string, 
    options?: RequestInit
  ): Promise<T> => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      const data: ApiResponse<T> = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || '请求失败');
      }
      
      return data as T;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error, setError };
}; 