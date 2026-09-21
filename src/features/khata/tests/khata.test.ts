import { khataService } from '../services/khata.service';

describe('Khata Feature Service Tests', () => {
  it('should have khataService functions defined', () => {
    expect(typeof khataService.getCustomerKhatas).toBe('function');
    expect(typeof khataService.getKhataTransactions).toBe('function');
    expect(typeof khataService.recordPayment).toBe('function');
  });
});
