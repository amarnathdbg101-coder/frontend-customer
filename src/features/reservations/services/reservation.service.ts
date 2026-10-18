import { reservationApi } from '../../../api/reservation.api';
import { Reservation, ApiResponse } from '../../../types';

export interface CreateReservationPayload {
  shop_id?: string;
  product_id?: string;
  quantity?: number;
  hold_hours?: number;
  items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  pickup_time?: string;
  notes?: string;
}

export const reservationService = {
  /**
   * Get all customer reservations / pickup orders
   */
  async getReservations(): Promise<Reservation[]> {
    const list = await reservationApi.listUserReservations();
    return Array.isArray(list) ? list : [];
  },

  /**
   * Create a new product pickup reservation
   */
  async createReservation(payload: CreateReservationPayload): Promise<Reservation> {
    const res = await reservationApi.createReservation(payload);
    return res;
  },

  /**
   * Cancel an existing reservation
   */
  async cancelReservation(reservationId: string): Promise<ApiResponse<any>> {
    const res = await reservationApi.cancelUserReservation(reservationId);
    return { success: true, data: res };
  },
};
