import apiClient from '../../../shared/services/apiClient';
import { STORAGE_KEYS } from '../../../config/constants';
import { storage } from '../../../shared/utils/storage';
import { User, AuthResponse, ApiResponse } from '../../../types';

export const authService = {
  /**
   * Send OTP to customer phone
   */
  async sendOtp(phone: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  },

  /**
   * Verify OTP and Login
   */
  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { phone, otp });
    if (response.data?.token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      storage.set(STORAGE_KEYS.USER_INFO, response.data.user);
    }
    return response.data;
  },

  /**
   * Google OAuth Login / Token exchange
   */
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google', { credential });
    if (response.data?.token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      storage.set(STORAGE_KEYS.USER_INFO, response.data.user);
    }
    return response.data;
  },

  /**
   * Email/Password Login
   */
  async login(emailOrPhone: string, password?: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: emailOrPhone,
      password,
    });
    if (response.data?.token) {
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      storage.set(STORAGE_KEYS.USER_INFO, response.data.user);
    }
    return response.data;
  },

  /**
   * Logout user and clear local session
   */
  logout(): void {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_INFO);
  },

  /**
   * Get current stored user
   */
  getCurrentUser(): User | null {
    return storage.get<User>(STORAGE_KEYS.USER_INFO);
  },

  /**
   * Check if token exists
   */
  isAuthenticated(): boolean {
    return !!storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },
};
