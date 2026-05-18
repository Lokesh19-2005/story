// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    productsAPI.list(params)
      .then(d => { setProducts(d.products || []); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [key]);

  return { products, loading, error };
}
