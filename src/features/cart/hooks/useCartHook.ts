import { useState, useCallback } from 'react';
import { cartService, CheckoutPayload } from '../services/cart.service';

export function useCartCheckout() {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (payload: CheckoutPayload) => {
    try {
      setSubmitting(true);
      setError(null);
      const result = await cartService.checkout(payload);
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Checkout failed';
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { checkout, submitting, error };
}
