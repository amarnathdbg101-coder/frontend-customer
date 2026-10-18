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
