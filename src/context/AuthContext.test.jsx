import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../api/auth.api';

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    googleLogin: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

describe('AuthContext Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('should initialize as unauthenticated when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should hydrate instantly from localStorage if token and user exist', () => {
    const mockUser = { id: 'usr-1', full_name: 'Rahul Kumar', role: 'customer' };
    localStorage.setItem('shopsilo_token', 'mock_jwt_token_123');
    localStorage.setItem('shopsilo_user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBe('shopsilo_token_123' ? 'mock_jwt_token_123' : result.current.token);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should perform successful login and store token/user', async () => {
    const mockUser = { id: 'usr-2', full_name: 'Priya Sharma', role: 'customer' };
    vi.mocked(authApi.login).mockResolvedValueOnce({
      access_token: 'valid_access_token_456',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('priya@example.com', 'password123');
    });

    expect(result.current.token).toBe('valid_access_token_456');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('shopsilo_token')).toBe('valid_access_token_456');
  });

  it('should clear token and user on logout', async () => {
    localStorage.setItem('shopsilo_token', 'token_to_remove');
    localStorage.setItem('shopsilo_user', JSON.stringify({ id: 'u1' }));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('shopsilo_token')).toBeNull();
  });
});
