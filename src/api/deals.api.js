import client from './client';

export const dealsApi = {
  // Public: Get all active deals across shops
  listDeals: async (params = {}) => {
    const res = await client.get('/deals', { params });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
    return res?.data || res || [];
  },

  // Public: Get offers for a specific shop with optional day-of-week filtering
  getShopOffers: async (slug, day = '') => {
    const params = day ? { day } : {};
    const res = await client.get(`/shops/${slug}/offers`, { params });
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
    return res?.data || res || [];
  },
};
