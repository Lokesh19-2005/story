// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const key = JSON.stringify(params);

  const load = useCallback(() => {
    setLoading(true);
    productsAPI.list(params)
      .then(d => {
        setProducts(Array.isArray(d?.products) ? d.products : []);
        setError(null);
      })
      .catch(e => {
        setProducts([]);
        setError(e?.message || 'Failed to load products');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { load(); }, [load]);

  return { products, loading, error, refetch: load };
}
