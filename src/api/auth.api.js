/**
 * Authentication API Service
 * 
 * Hinglish Hint:
 * Backend ke /auth routes se baat karta hai:
 * - Login (Dukaandar ya Customer)
 * - Register (Naya account banana)
 * - Google Login
 * - Forgot/Reset Password
 */

import client from './client';

export const authApi = {
  // User login (returns access_token, user object)
  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    return res;
  },

  // Google OAuth Login
  googleLogin: async (idToken, role = 'customer') => {
    const res = await client.post('/auth/google', {
      id_token: idToken,
      role: role,
    });
    return res;
  },

  // New user registration
  register: async ({ full_name, email, password, phone }) => {
    const res = await client.post('/auth/register', {
      full_name,
      email,
      password,
      phone,
    });
    return res;
  },

  // Request password reset token via email
  forgotPassword: async (email) => {
    const res = await client.post('/auth/forgot-password', { email });
    return res;
  },

  // Reset password using token
  resetPassword: async (token, newPassword) => {
    const res = await client.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return res;
  },

  // Get current user profile
  getProfile: async () => {
    const res = await client.get('/user/me');
    return res;
  },

  // Update user personal profile (Full name, phone)
  updateProfile: async ({ full_name, phone }) => {
    const res = await client.put('/user/profile', { full_name, phone });
    return res.data;
  },
};
