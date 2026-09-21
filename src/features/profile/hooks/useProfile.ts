import { useState, useEffect, useCallback } from 'react';
import { profileService, UpdateProfilePayload } from '../services/profile.service';
import { User } from '../../../types';

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (payload: UpdateProfilePayload) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
