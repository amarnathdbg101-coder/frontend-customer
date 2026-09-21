import apiClient from '../../../shared/services/apiClient';
import { CustomerKhata, KhataTransaction, ApiResponse } from '../../../types';

export const khataService = {
  /**
   * Get all active khata ledgers / shops for current customer
   */
  async getCustomerKhatas(): Promise<CustomerKhata[]> {
    const response = await apiClient.get<ApiResponse<CustomerKhata[]> | CustomerKhata[]>('/customer/khata');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<CustomerKhata[]>).data || [];
  },

  /**
   * Get transaction history for a specific khata/shop
   */
  async getKhataTransactions(khataId: string): Promise<KhataTransaction[]> {
    const response = await apiClient.get<ApiResponse<KhataTransaction[]> | KhataTransaction[]>(
      `/customer/khata/${khataId}/transactions`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<KhataTransaction[]>).data || [];
  },

  /**
   * Record a payment or transaction settlement via UPI
   */
  async recordPayment(khataId: string, amount: number, referenceId?: string): Promise<KhataTransaction> {
    const response = await apiClient.post<ApiResponse<KhataTransaction>>(`/customer/khata/${khataId}/payment`, {
      amount,
      reference_id: referenceId,
    });
    return (response.data as any).data || response.data;
  },
};
