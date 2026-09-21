import apiClient from '../../../shared/services/apiClient';
import { Shop, Product, Category, PaginatedResponse, ApiResponse } from '../../../types';

export interface NearbyShopsParams {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  radius_km?: number;
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
   * Get public shops based on location or filters
   */
  async getNearbyShops(params: NearbyShopsParams): Promise<Shop[]> {
    const formattedParams = {
      lat: params.latitude || params.lat,
      lng: params.longitude || params.lng,
      radius_km: params.radius || params.radius_km,
      search: params.search,
      category: params.category,
      limit: params.limit,
      page: params.page,
    };
    const response = await apiClient.get<ApiResponse<Shop[]> | Shop[]>('/shops', { params: formattedParams });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    const dataObj = response.data as any;
    return dataObj?.data?.shops || dataObj?.data || dataObj?.shops || [];
  },

  /**
   * Get home feed multi-section recommendations
   */
  async getHomeFeed(latitude?: number, longitude?: number): Promise<any> {
    const response = await apiClient.get('/home-feed', {
      params: {
        latitude: latitude || 26.1542,
        longitude: longitude || 85.8918,
      },
    });
    return response.data;
  },

  /**
   * Get shop storefront details by ID or Slug
   */
  async getShopDetails(shopIdOrSlug: string): Promise<Shop> {
    const endpoint = shopIdOrSlug.length === 36 ? `/shops/${shopIdOrSlug}` : `/shops/slug/${shopIdOrSlug}`;
    const response = await apiClient.get<ApiResponse<Shop>>(endpoint);
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
    const dataObj = response.data as any;
    return dataObj?.data?.products || dataObj?.data || dataObj?.products || [];
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
    const dataObj = response.data as any;
    return dataObj?.data?.categories || dataObj?.data || [];
  },

  /**
   * Get trending deals and discounts
   */
  async getDeals(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]> | Product[]>('/deals');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    const dataObj = response.data as any;
    return dataObj?.data?.deals || dataObj?.data || [];
  },
};
