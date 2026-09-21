import { profileService } from '../services/profile.service';

describe('Profile Feature Service Tests', () => {
  it('should have profileService functions defined', () => {
    expect(typeof profileService.getProfile).toBe('function');
    expect(typeof profileService.updateProfile).toBe('function');
  });
});
