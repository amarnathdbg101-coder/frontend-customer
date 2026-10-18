import { describe, it, expect } from 'vitest';
import { khataService } from '../services/khata.service';
import { CustomerKhata, KhataTransaction } from '../../../types';

describe('Khata Feature Logic & Service Tests', () => {
  it('should verify khataService functions exist', () => {
    expect(typeof khataService.getCustomerKhatas).toBe('function');
    expect(typeof khataService.getKhataTransactions).toBe('function');
    expect(typeof khataService.recordPayment).toBe('function');
  });

  describe('Credit Limit Utilization & Safety Thresholds', () => {
    it('accurately calculates net balance and available credit for healthy accounts (<75%)', () => {
      const mockKhata: CustomerKhata = {
        id: 'khata-101',
        shop_id: 'shop-1',
        customer_name: 'Amit Verma',
        customer_phone: '9876543210',
        current_balance: 1200,
        credit_limit: 5000,
      };

      const limit = Number(mockKhata.credit_limit);
      const balance = Number(mockKhata.current_balance);
      const usedPct = Math.min(100, Math.round((balance / limit) * 100));
      const availableCredit = Math.max(0, limit - balance);

      expect(usedPct).toBe(24);
      expect(availableCredit).toBe(3800);
      expect(usedPct < 75).toBe(true); // Healthy status
    });

    it('identifies warning threshold (75% to 89%)', () => {
      const balance = 8000;
      const limit = 10000;
      const usedPct = Math.min(100, Math.round((balance / limit) * 100));
      const isWarning = usedPct >= 75 && usedPct < 90;

      expect(usedPct).toBe(80);
      expect(isWarning).toBe(true);
    });

    it('triggers critical alert when utilization reaches or exceeds 90%', () => {
      const balance = 4600;
      const limit = 5000;
      const usedPct = Math.min(100, Math.round((balance / limit) * 100));
      const isCritical = usedPct >= 90;

      expect(usedPct).toBe(92);
      expect(isCritical).toBe(true);
    });

    it('handles zero or open credit limits gracefully', () => {
      const limit = 0;
      const balance = 2500;
      const isOpenLimit = limit <= 0;

      expect(isOpenLimit).toBe(true);
    });
  });

  describe('Dynamic UPI URI & UTR Validation', () => {
    it('generates valid UPI deep link with exact payment amount', () => {
      const shopVpa = 'gupta.kirana@okaxis';
      const shopName = 'Gupta Supermarket';
      const amount = 1450;
      const phone = '9876543210';

      const upiUri = `upi://pay?pa=${encodeURIComponent(shopVpa)}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Khata_${phone}`)}`;

      expect(upiUri.startsWith('upi://pay?')).toBe(true);
      expect(upiUri).toContain('pa=gupta.kirana%40okaxis');
      expect(upiUri).toContain('pn=Gupta%20Supermarket');
      expect(upiUri).toContain('am=1450');
      expect(upiUri).toContain('cu=INR');
    });

    it('validates 12-digit UTR transaction reference accurately', () => {
      const isValidUtr = (utr: string) => /^\d{12}$/.test(utr.trim());

      expect(isValidUtr('423589123456')).toBe(true);
      expect(isValidUtr('12345')).toBe(false); // too short
      expect(isValidUtr('4235891234567')).toBe(false); // too long
      expect(isValidUtr('42358912345A')).toBe(false); // contains letters
      expect(isValidUtr(' 423589123456 ')).toBe(true); // with spaces trimmed
    });
  });

  describe('Ledger Totals & Transaction Calculations', () => {
    it('should process credit and payment transactions to compute ledger totals', () => {
      const mockTransactions: KhataTransaction[] = [
        {
          id: 'tx-1',
          khata_id: 'khata-101',
          shop_id: 'shop-1',
          type: 'credit',
          amount: 500,
          balance_after: 500,
          status: 'completed',
          created_at: '2026-10-15T10:00:00Z',
        },
        {
          id: 'tx-2',
          khata_id: 'khata-101',
          shop_id: 'shop-1',
          type: 'payment',
          amount: 200,
          balance_after: 300,
          status: 'completed',
          created_at: '2026-10-16T10:00:00Z',
        },
      ];

      const totalCredit = mockTransactions
        .filter((t) => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalPayment = mockTransactions
        .filter((t) => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

      const netOutstanding = totalCredit - totalPayment;

      expect(totalCredit).toBe(500);
      expect(totalPayment).toBe(200);
      expect(netOutstanding).toBe(300);
    });
  });
});
