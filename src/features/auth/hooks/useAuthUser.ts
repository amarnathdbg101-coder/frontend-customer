import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../../../types';

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
}
