/**
 * Product & Catalog API Service
 * 
 * Hinglish Hint:
 * Dukan ke samano (Products) ko browse aur interact karne ke liye:
 * - Products ki list lena
 * - GPS nearby in-stock products dhundna (/products/nearby)
 * - Bhav-Taav Offer place karna (/products/:id/make-offer)
 * - Out-of-Stock alert subscribe karna (/products/:id/notify-me)
 * - Categories list lana
 */

import client from './client';

export const productApi = {
  // Public: Shop ke products list karna
  listByShopSlug: async (slug, params = {}) => {
    const res = await client.get(`/shops/${slug}/products`, { params });
    return res.data;
  },

  // Public: Global products search
  listProducts: async (params = {}) => {
    const res = await client.get('/products', { params });
    return res.data;
  },
  listPublicProducts: async (params = {}) => {
    const res = await client.get('/products', { params });
    return res.data;
  },

  // Public: GPS nearby in-stock products across open local shops
  // params: { lat, lng, radius_km, q, category, open_now, page, limit }
  findNearbyProducts: async (params = {}) => {
    const res = await client.get('/products/nearby', { params });
    return res.data;
  },

  // Public/Customer: Bhav-Taav Negotiation (Make Offer)
  // offerData: { offered_price, quantity, customer_phone, customer_name }
  makeOffer: async (productId, offerData) => {
    const res = await client.post(`/products/${productId}/make-offer`, offerData);
    return res.data;
  },

  // Public/Customer: Out-of-Stock Item Notify Me
  // alertData: { customer_phone, customer_name }
  subscribeStockAlert: async (productId, alertData) => {
    const res = await client.post(`/products/${productId}/notify-me`, alertData);
    return res.data;
  },

  // Barcode / SKU Scan se product turant dhundna
  scanProduct: async (barcode) => {
    const res = await client.get(`/products/scan/${barcode}`);
    return res.data;
  },

  // Merchant: Naya product catalog me add karna
  createProduct: async (productData) => {
    const res = await client.post('/products', productData);
    return res.data;
  },

  // Merchant: Product edit karna
  updateProduct: async (id, updateData) => {
    const res = await client.put(`/products/${id}`, updateData);
    return res.data;
  },

  // Merchant: Product delete karna
  deleteProduct: async (id) => {
    const res = await client.delete(`/products/${id}`);
    return res.data;
  },

  // Public: Categories list
  getCategories: async () => {
    const res = await client.get('/categories');
    return res.data;
  },
};
