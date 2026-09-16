import client from './client';

export const shopApi = {
  getMyShop: async () => {
    const res = await client.get('/shops/me');
    return res.data;
  },

  createShop: async (shopData) => {
    const res = await client.post('/shops', shopData);
    return res.data;
  },

  updateMyShop: async (updateData) => {
    const res = await client.put('/shops/me', updateData);
    return res.data;
  },

  toggleShopStatus: async () => {
    const res = await client.patch('/shops/me/status');
    return res.data;
  },

  getMyShopQR: async () => {
    const res = await client.get('/shops/me/qr');
    return res.data;
  },

  listPublicShops: async (params = {}) => {
    const res = await client.get('/shops', { params });
    return res.data;
  },

  getShopBySlug: async (slug) => {
    const res = await client.get(`/shops/slug/${slug}`);
    return res.data;
  },

  getShopReviews: async (slug) => {
    const res = await client.get(`/shops/${slug}/reviews`);
    return res.data?.data || res.data;
  },

  addShopReview: async (slug, reviewData) => {
    const res = await client.post(`/shops/${slug}/reviews`, reviewData);
    return res.data;
  },

  getShopOffers: async (slug) => {
    const res = await client.get(`/shops/${slug}/offers`);
    return res.data?.data || res.data;
  },
};
