import { reservationService } from '../services/reservation.service';

describe('Reservation Feature Service Tests', () => {
  it('should have reservationService functions defined', () => {
    expect(typeof reservationService.getReservations).toBe('function');
    expect(typeof reservationService.createReservation).toBe('function');
    expect(typeof reservationService.cancelReservation).toBe('function');
  });
});
