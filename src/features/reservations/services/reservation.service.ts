import apiClient from '../../../shared/services/apiClient';
import { Reservation, ApiResponse } from '../../../types';

export interface CreateReservationPayload {
  shop_id: string;
  items: Array<{
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
    const response = await apiClient.get<ApiResponse<Reservation[]> | Reservation[]>('/reservations');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<Reservation[]>).data || [];
  },

  /**
   * Create a new product pickup reservation
   */
  async createReservation(payload: CreateReservationPayload): Promise<Reservation> {
    const response = await apiClient.post<ApiResponse<Reservation>>('/reservations', payload);
    return (response.data as any).data || response.data;
  },

  /**
   * Cancel an existing reservation
   */
  async cancelReservation(reservationId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.put(`/reservations/${reservationId}/cancel`);
    return response.data;
  },
};
