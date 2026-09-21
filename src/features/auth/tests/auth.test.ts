import { authService } from '../services/auth.service';

describe('Auth Feature Service Tests', () => {
  it('should verify authentication status when token is empty', () => {
    localStorage.clear();
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
  });
});
