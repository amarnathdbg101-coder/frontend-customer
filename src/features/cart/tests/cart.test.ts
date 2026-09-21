import { cartService } from '../services/cart.service';

describe('Cart Feature Service Tests', () => {
  it('should have cartService functions defined', () => {
    expect(typeof cartService.checkout).toBe('function');
    expect(typeof cartService.applyPromoCode).toBe('function');
  });
});
