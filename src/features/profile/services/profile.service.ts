import apiClient from '../../../shared/services/apiClient';
import { User, ApiResponse } from '../../../types';
import { STORAGE_KEYS } from '../../../config/constants';
import { storage } from '../../../shared/utils/storage';

export interface UpdateProfilePayload {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const profileService = {
  /**
   * Fetch current user profile details
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/user/me');
    const user = (response.data as any).data || response.data;
    if (user) {
      storage.set(STORAGE_KEYS.USER, user);
    }
    return user;
  },

  /**
   * Update current user profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const body = {
      full_name: payload.full_name || payload.name,
      phone: payload.phone,
      address: payload.address,
    };
    const response = await apiClient.put<ApiResponse<User>>('/user/profile', body);
    const updatedUser = (response.data as any).data || response.data;
    if (updatedUser) {
      storage.set(STORAGE_KEYS.USER, updatedUser);
    }
    return updatedUser;
  },
};
