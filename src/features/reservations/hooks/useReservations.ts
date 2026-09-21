import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../services/reservation.service';
import { Reservation } from '../../../types';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getReservations();
      setReservations(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return { reservations, loading, error, refetch: fetchReservations };
}
