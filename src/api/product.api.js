/**
 * Product & Catalog API Service
 * 
 * Resilient Product Catalog & GPS Search API Client
 */

import client from './client';

export const productApi = {
  // Public: Single product details by ID
  getById: async (id) => {
    const res = await client.get(`/products/${id}`);
    return res.data?.data || res.data || res;
  },

  getProductById: async (id) => {
    return productApi.getById(id);
  },

  // Public: Single product details by slug
  getBySlug: async (slug) => {
    const res = await client.get(`/products/slug/${slug}`);
    return res.data?.data || res.data || res;
  },

  getProductBySlug: async (slug) => {
    return productApi.getBySlug(slug);
  },

  // Public: Shop ke products list karna
  listByShopSlug: async (slug, params = {}) => {
    const res = await client.get(`/shops/${slug}/products`, { params });
    return res.data || res;
  },

  // Public: Global products search
  listProducts: async (params = {}) => {
    const res = await client.get('/products', { params });
    return res.data || res;
  },

  getProducts: async (params = {}) => {
    return productApi.listProducts(params);
  },

  listPublicProducts: async (params = {}) => {
    const res = await client.get('/products', { params });
    return res.data || res;
  },

  // Public: GPS nearby in-stock products across open local shops
  findNearbyProducts: async (params = {}) => {
    const res = await client.get('/products/nearby', { params });
    return res.data || res;
  },

  // Public/Customer: Bhav-Taav Negotiation (Make Offer)
  makeOffer: async (productId, offerData) => {
    const res = await client.post(`/products/${productId}/make-offer`, offerData);
    return res.data || res;
  },

  // Public/Customer: Out-of-Stock Item Notify Me
  subscribeStockAlert: async (productId, alertData) => {
    const res = await client.post(`/products/${productId}/notify-me`, alertData);
    return res.data || res;
  },

  // Barcode / SKU Scan se product turant dhundna
  scanProduct: async (barcode) => {
    const res = await client.get(`/products/scan/${barcode}`);
    return res.data || res;
  },

  // Merchant: Naya product catalog me add karna
  createProduct: async (productData) => {
    const res = await client.post('/products', productData);
    return res.data || res;
  },

  // Merchant: Product edit karna
  updateProduct: async (id, updateData) => {
    const res = await client.put(`/products/${id}`, updateData);
    return res.data || res;
  },

  // Merchant: Product delete karna
  deleteProduct: async (id) => {
    const res = await client.delete(`/products/${id}`);
    return res.data || res;
  },

  // Public: Fast autocomplete search suggestions
  getSearchSuggestions: async (query, shopId = '', limit = 5) => {
    if (!query || !query.trim()) return [];
    try {
      const res = await client.get('/products/search/suggestions', {
        params: { q: query.trim(), shop_id: shopId, limit },
      });
      return res.data?.data?.suggestions || res.data?.suggestions || [];
    } catch {
      return [];
    }
  },

  // Public: Categories list
  getCategories: async () => {
    const res = await client.get('/categories');
    return res.data || res;
  },
};

export default productApi;
