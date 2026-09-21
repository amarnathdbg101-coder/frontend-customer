import apiClient from '../../../shared/services/apiClient';
import { Shop, Product, Category, PaginatedResponse, ApiResponse } from '../../../types';

export interface NearbyShopsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}

export interface ProductsParams {
  shop_id?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const catalogService = {
  /**
   * Get nearby shops based on lat/lng or filters
   */
  async getNearbyShops(params: NearbyShopsParams): Promise<Shop[]> {
    const response = await apiClient.get<ApiResponse<Shop[]> | Shop[]>('/shops/nearby', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<Shop[]>).data || [];
  },

  /**
   * Get shop storefront details by ID or Slug
   */
  async getShopDetails(shopIdOrSlug: string): Promise<Shop> {
    const response = await apiClient.get<ApiResponse<Shop>>(`/shops/${shopIdOrSlug}`);
    return (response.data as any).data || response.data;
  },

  /**
   * Get products list with filters
   */
  async getProducts(params: ProductsParams): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]> | Product[]>('/products', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<Product[]>).data || [];
  },

  /**
   * Get product details by ID
   */
  async getProductDetails(productId: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${productId}`);
    return (response.data as any).data || response.data;
  },

  /**
   * Get product categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]> | Category[]>('/categories');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<Category[]>).data || [];
  },

  /**
   * Get trending deals and discounts
   */
  async getDeals(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]> | Product[]>('/deals');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return (response.data as ApiResponse<Product[]>).data || [];
  },
};
