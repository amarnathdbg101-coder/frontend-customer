/**
 * Item Reservation (Click & Collect) API Service
 * 
 * Hinglish Hint:
 * Grahak dukan pe aane se pehle item hold/reserve kar sakta hai:
 * - Naya reservation create karna (/reservations)
 * - Apne active reservations dekhna
 * - Counter par dukaandar pickup code verify karke samaan deta hai
 */

import client from './client';

export const reservationApi = {
  // Grahak ke dwara item reserve karna
  // payload: { product_id, quantity, hold_hours, notes }
  createReservation: async (data) => {
    // Generate unique client-side idempotency key to prevent double-charging / duplicate reservations
    const idempotencyKey = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const res = await client.post('/reservations', data, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
    return res.data;
  },

  // Grahak ke apne reservations list karna
  listUserReservations: async () => {
    const res = await client.get('/reservations');
    return res.data;
  },

  // Reservation cancel karna
  cancelUserReservation: async (id) => {
    const res = await client.post(`/reservations/${id}/cancel`);
    return res.data;
  },

  // Dukaandar ke counter par reservations check karna
  listShopReservations: async () => {
    const res = await client.get('/shops/me/reservations');
    return res.data;
  },

  // Dukaandar counter par customer ka OTP / Pickup Code verify karta hai
  // payload: { pickup_code, reservation_number }
  verifyShopReservation: async (data) => {
    const res = await client.post('/shops/me/reservations/verify', data);
    return res.data;
  },
};
