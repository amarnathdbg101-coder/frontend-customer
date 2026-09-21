import { useState, useEffect, useCallback } from 'react';
import { khataService } from '../services/khata.service';
import { CustomerKhata, KhataTransaction } from '../../../types';

export function useCustomerKhatas() {
  const [khatas, setKhatas] = useState<CustomerKhata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKhatas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await khataService.getCustomerKhatas();
      setKhatas(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load khata accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKhatas();
  }, [fetchKhatas]);

  return { khatas, loading, error, refetch: fetchKhatas };
}

export function useKhataTransactions(khataId: string) {
  const [transactions, setTransactions] = useState<KhataTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!khataId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await khataService.getKhataTransactions(khataId);
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load khata transactions');
    } finally {
      setLoading(false);
    }
  }, [khataId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}
