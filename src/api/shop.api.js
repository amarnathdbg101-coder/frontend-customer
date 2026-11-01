import client from './client';

export const shopApi = {
  getMyShop: async () => {
    const res = await client.get('/shops/me');
    return res.data || res;
  },

  createShop: async (shopData) => {
    const res = await client.post('/shops', shopData);
    return res.data || res;
  },

  updateMyShop: async (updateData) => {
    const res = await client.put('/shops/me', updateData);
    return res.data || res;
  },

  toggleShopStatus: async () => {
    const res = await client.patch('/shops/me/status');
    return res.data || res;
  },

  getMyShopQR: async () => {
    const res = await client.get('/shops/me/qr');
    return res.data || res;
  },

  // Public: 1-Call Consolidated Home Feed (Categories, Nearby Shops, In-Stock Products)
  getHomeFeed: async (params = {}) => {
    const res = await client.get('/catalog/home-feed', { params });
    return res.data?.data || res.data || res;
  },

  listPublicShops: async (params = {}) => {
    const res = await client.get('/shops', { params });
    return res.data || res;
  },

  getShopBySlug: async (slug) => {
    try {
      const res = await client.get(`/shops/slug/${slug}`);
      return res.data || res;
    } catch {
      try {
        const res2 = await client.get(`/shops/${slug}`);
        return res2.data || res2;
      } catch (e) {
        throw e;
      }
    }
  },

  getBySlug: async (slug) => {
    return shopApi.getShopBySlug(slug);
  },

  // Public: Counter Standee PDF Download URL
  getStandeePdfUrl: (slug) => {
    const baseURL = client.defaults?.baseURL || '';
    return `${baseURL}/shops/${slug}/standee.pdf`;
  },

  getShopReviews: async (slug) => {
    const res = await client.get(`/shops/${slug}/reviews`);
    return res.data?.data || res.data || res;
  },

  addShopReview: async (slug, reviewData) => {
    const res = await client.post(`/shops/${slug}/reviews`, reviewData);
    return res.data || res;
  },

  getShopOffers: async (slug) => {
    const res = await client.get(`/shops/${slug}/offers`);
    return res.data?.data || res.data || res;
  },
};

export default shopApi;
