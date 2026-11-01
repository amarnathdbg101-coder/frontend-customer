/**
 * Re-export the single unified API client from src/api/client.js
 * Eliminates duplicate Axios instances and ensures 100% consistent auth, interceptors & timeouts.
 */

import client, { API_BASE_URL, getActiveToken } from '../../api/client';

export const apiClient = client;
export { API_BASE_URL, getActiveToken };
export default client;
