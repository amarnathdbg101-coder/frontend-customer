import apiClient from '../../../shared/services/apiClient';
import { CartItem, ApiResponse } from '../../../types';

export interface CheckoutPayload {
  shop_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  payment_method: 'cash' | 'online' | 'khata';
  customer_name?: string;
  customer_phone?: string;
  delivery_type?: 'pickup' | 'delivery';
  address?: string;
}

export const cartService = {
  /**
   * Submit an order / checkout
   */
  async checkout(payload: CheckoutPayload): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  /**
   * Validate coupon / promo code
   */
  async applyPromoCode(code: string, shopId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/promos/validate', { code, shop_id: shopId });
    return response.data;
  },
};
