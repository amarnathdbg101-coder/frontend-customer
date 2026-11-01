/**
 * ShopSilo API Client (Axios Instance)
 * 
 * Performance & Resilient Auth:
 * 1. Automatic JWT Bearer attachment.
 * 2. Standardized response formatting.
 * 3. Soft 401 handling without disruptive hard page reloads.
 */

import axios from 'axios';

// Backend server URL configuration
const DEFAULT_PROD_API = 'https://shopsiloapi.shopsilo.in';
const rawUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = rawUrl ? rawUrl.replace(/\/+$/, '') : DEFAULT_PROD_API;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Helper to get active token
export const getActiveToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('shopsilo_token') || null;
};

// Request Interceptor: Attach JWT Token automatically
client.interceptors.request.use(
  (config) => {
    const token = getActiveToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API responses & unwrap payload with defensive self-referential property
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body && ('success' in body || 'message' in body)) {
      const payload = body.data;
      if (payload && typeof payload === 'object' && !('data' in payload)) {
        // Self-referential .data property ensures legacy callers (res.data) never encounter undefined
        Object.defineProperty(payload, 'data', {
          value: payload,
          enumerable: false,
          configurable: true,
          writable: true,
        });
      }
      return payload !== undefined ? payload : body;
    }
    return body;
  },
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || (typeof error.message === 'string' && error.message.toLowerCase().includes('network error')));

    // Localhost down fallback: If local Go backend is not running, seamlessly fallback to live API
    if (isNetworkError && originalRequest && !originalRequest._retry && API_BASE_URL.includes('localhost')) {
      originalRequest._retry = true;
      const fallbackUrl = rawUrl && !rawUrl.includes('localhost') ? rawUrl : DEFAULT_PROD_API;
      console.warn(`[ShopSilo API] Local backend not reachable at ${API_BASE_URL}. Retrying with production API: ${fallbackUrl}`);
      originalRequest.baseURL = fallbackUrl;
      try {
        const retryRes = await axios(originalRequest);
        return retryRes.data;
      } catch (retryErr) {
        // Continue to standard error handler with fallback error
        error = retryErr;
      }
    }

    const status = error.response?.status;
    const backendMessage = error.response?.data?.error || error.response?.data?.message;
    const fallbackMessage = error.message || 'Something went wrong. Please try again. / तकनीकी समस्या आई, पुनः प्रयास करें।';
    const requestUrl = error.config?.url || '';

    // Handle 401 Unauthorized or Session Expiry gracefully
    const msgLower = typeof backendMessage === 'string' ? backendMessage.toLowerCase() : '';
    const isSessionExpired =
      status === 401 ||
      (status === 404 && msgLower.includes('user not found')) ||
      msgLower.includes('user not found') ||
      msgLower.includes('session expired') ||
      msgLower.includes('reservations_user_id_fkey');

    if (isSessionExpired && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      const hadToken = !!getActiveToken();
      if (hadToken) {
        // Clear expired local tokens
        localStorage.removeItem('shopsilo_token');
        localStorage.removeItem('shopsilo_user');

        // Notify active React AuthContext without violent browser reload
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shopsilo:auth_expired'));
        }
      }
    }

    return Promise.reject(new Error(backendMessage || fallbackMessage));
  }
);

export default client;
export const apiClient = client;
