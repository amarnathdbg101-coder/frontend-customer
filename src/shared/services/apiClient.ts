/**
 * Shared Resilient Axios API Client
 * - Automatic JWT bearer injection
 * - Standardized response unwrapping
 * - Soft 401 session expiration without page reload
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../../config/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Helper to get active JWT token
export const getActiveToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('shopme_token') || null;
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getActiveToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.error || error.response?.data?.message;
    const fallbackMessage = error.message || 'Kuch galat ho gaya, kripya dobara koshish karein';
    const requestUrl = error.config?.url || '';

    // Graceful 401 handling for expired tokens
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      const hadToken = !!getActiveToken();
      if (hadToken) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shopsilo:auth_expired'));
        }
      }
    }

    return Promise.reject(new Error(backendMessage || fallbackMessage));
  }
);

export default apiClient;
