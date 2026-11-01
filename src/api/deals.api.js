import client from './client';

export const dealsApi = {
  // Public: Get all active deals across shops
  listDeals: async (params = {}) => {
    const res = await client.get('/deals', { params });
    return Array.isArray(res) ? res : (res?.deals || res?.data || []);
  },

  // Public: Get offers for a specific shop with optional day-of-week filtering
  getShopOffers: async (slug, day = '') => {
    const params = day ? { day } : {};
    const res = await client.get(`/shops/${slug}/offers`, { params });
    return Array.isArray(res) ? res : (res?.offers || res?.data || []);
  },
};
