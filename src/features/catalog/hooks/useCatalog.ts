import { useState, useEffect, useCallback } from 'react';
import { catalogService, NearbyShopsParams } from '../services/catalog.service';
import { Shop, Product, Category } from '../../../types';

export function useNearbyShops(params: NearbyShopsParams) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await catalogService.getNearbyShops(params);
      setShops(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [params.latitude, params.longitude, params.radius, params.search, params.category]);

  useEffect(() => {
    if (params.latitude && params.longitude) {
      fetchShops();
    }
  }, [fetchShops, params.latitude, params.longitude]);

  return { shops, loading, error, refetch: fetchShops };
}

export function useShopProducts(shopId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await catalogService.getProducts({ shop_id: shopId });
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
