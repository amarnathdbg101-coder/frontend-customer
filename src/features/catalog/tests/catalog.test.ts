import { catalogService } from '../services/catalog.service';

describe('Catalog Feature Service Tests', () => {
  it('should have catalogService functions defined', () => {
    expect(typeof catalogService.getNearbyShops).toBe('function');
    expect(typeof catalogService.getShopDetails).toBe('function');
    expect(typeof catalogService.getProducts).toBe('function');
    expect(typeof catalogService.getCategories).toBe('function');
    expect(typeof catalogService.getDeals).toBe('function');
  });
});
