/**
 * Item Reservation (Click & Collect) API Service
 * 
 * Resilient Multi-Endpoint Fallback Engine for Customer & Merchant Counter Pickups:
 * - Creates instant counter pickup token (#4812) & QR pass
 * - Automatic fallback endpoints for backend API compatibility
 * - Supports idempotency keys to prevent duplicate reservations
 */

import client from './client';

function extractData(res) {
  if (!res) return null;
  if (res.data !== undefined) return res.data;
  return res;
}

function extractArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.reservations)) return res.reservations;
  if (res.data && Array.isArray(res.data.reservations)) return res.data.reservations;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

export const reservationApi = {
  /**
   * Create a new pickup reservation
   * Payload: { product_id, shop_id, quantity, hold_hours, notes }
   */
  createReservation: async (data) => {
    const idempotencyKey = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const headers = { 'X-Idempotency-Key': idempotencyKey };

    try {
      const res = await client.post('/reservations', data, { headers });
      const extracted = extractData(res);
      return extracted?.data || extracted?.reservation || extracted || res;
    } catch (err) {
      // Fallback endpoint if /reservations is mounted under /shops/:id/reservations
      if (data?.shop_id || data?.shopId) {
        const shopId = data.shop_id || data.shopId;
        try {
          const res = await client.post(`/shops/${shopId}/reservations`, data, { headers });
          const extracted = extractData(res);
          return extracted?.data || extracted?.reservation || extracted || res;
        } catch {
          // Re-throw original error
        }
      }
      throw err;
    }
  },

  /**
   * Fetch customer pickup reservations list
   */
  listUserReservations: async () => {
    try {
      const res = await client.get('/reservations');
      return extractArray(res);
    } catch (err) {
      // Fallback endpoints for alternative backend routes
      try {
        const fallback1 = await client.get('/customer/reservations');
        return extractArray(fallback1);
      } catch {
        try {
          const fallback2 = await client.get('/users/me/reservations');
          return extractArray(fallback2);
        } catch {
          throw err;
        }
      }
    }
  },

  /**
   * Alias for listUserReservations
   */
  listReservations: async () => {
    return reservationApi.listUserReservations();
  },

  /**
   * Cancel an existing reservation
   */
  cancelUserReservation: async (id) => {
    try {
      const res = await client.post(`/reservations/${id}/cancel`);
      return extractData(res);
    } catch (err) {
      try {
        const resPut = await client.put(`/reservations/${id}/cancel`);
        return extractData(resPut);
      } catch {
        try {
          const resDel = await client.delete(`/reservations/${id}`);
          return extractData(resDel);
        } catch {
          throw err;
        }
      }
    }
  },

  /**
   * Alias for cancelUserReservation
   */
  cancelReservation: async (id) => {
    return reservationApi.cancelUserReservation(id);
  },

  /**
   * Merchant: List shop reservations for counter pickup
   */
  listShopReservations: async () => {
    try {
      const res = await client.get('/shops/me/reservations');
      return extractArray(res);
    } catch (err) {
      try {
        const resMerchant = await client.get('/merchant/reservations');
        return extractArray(resMerchant);
      } catch {
        throw err;
      }
    }
  },

  /**
   * Merchant: Verify customer pickup OTP / token (#4812) at counter POS
   */
  verifyShopReservation: async (data) => {
    try {
      const res = await client.post('/shops/me/reservations/verify', data);
      return extractData(res);
    } catch (err) {
      try {
        const resMerchant = await client.post('/merchant/reservations/verify', data);
        return extractData(resMerchant);
      } catch {
        try {
          const resVerify = await client.post('/reservations/verify', data);
          return extractData(resVerify);
        } catch {
          throw err;
        }
      }
    }
  },
};

export default reservationApi;
