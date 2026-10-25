/**
 * ShopSilo Customer Web App - Enterprise WebSocket URL Resolver
 * Dynamically resolves secure wss:// or development ws:// endpoints
 * matching the active GoBackend API configuration.
 */

import { API_BASE_URL } from '../api/client';

export const getWebSocketUrl = (path = '') => {
  let baseUrl = API_BASE_URL;
  if (!baseUrl || baseUrl === '/') {
    if (typeof window !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      baseUrl = `${isHttps ? 'https' : 'http'}://${window.location.host}`;
    } else {
      baseUrl = 'http://localhost:8080';
    }
  }

  const isSecure =
    baseUrl.startsWith('https://') ||
    (typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      !baseUrl.startsWith('http://'));

  const host = baseUrl.replace(/^https?:\/\//, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const wsProto = isSecure ? 'wss://' : 'ws://';

  return `${wsProto}${host}${cleanPath}`;
};
