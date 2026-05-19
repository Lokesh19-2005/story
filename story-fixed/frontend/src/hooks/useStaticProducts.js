// src/hooks/useStaticProducts.js
// =============================================================================
//  STATIC-DATA REPLACEMENT FOR useProducts()
// =============================================================================
//
//  Drop-in replacement for the API-backed useProducts() hook. Exposes the
//  same `{ products, loading, error, refetch }` shape so every existing
//  callsite (HomePage, ShopPage, App quickAdd) works unchanged.
//
//  The backend hook (src/hooks/useProducts.js) is left in place for any
//  future flow that needs the live API (cart, orders, admin).
//
//  Supported params (matches the legacy API contract):
//    - category : legacy backend slug ('shoes' | 'tops' | 'bottoms' |
//                 'outerwear' | 'accessories')
//    - sort     : 'newest' | 'price_asc' | 'price_desc'
//    - search   : substring match against name + brand + description
//    - limit    : optional cap on returned products
//
//  The static catalog is adapted once at module load and memoised at module
//  scope; the per-call useMemo only re-runs when the params actually change.
// =============================================================================

import { useMemo } from 'react';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';

// One-time adaptation. Stable referential identity for the lifetime of the
// module so consumers can rely on `===` comparisons across renders.
const ADAPTED = adaptProducts(PRODUCTS);

const SORTERS = {
  // 'newest' is a no-op against static data - PRODUCTS is already in the
  // editorial order set by the catalog; we preserve that order here.
  newest:     () => 0,
  price_asc:  (a, b) => Number(a.price) - Number(b.price),
  price_desc: (a, b) => Number(b.price) - Number(a.price),
};

function searchMatch(p, q) {
  const needle = String(q || '').trim().toLowerCase();
  if (!needle) return true;
  const hay = `${p.name || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
  return hay.includes(needle);
}

export function useStaticProducts(params = {}) {
  const { category, sort, search, limit } = params || {};

  const products = useMemo(() => {
    let list = ADAPTED.slice();

    if (category) {
      list = list.filter(p => p.category_slug === category);
    }
    if (search) {
      list = list.filter(p => searchMatch(p, search));
    }

    const cmp = SORTERS[sort] || SORTERS.newest;
    list.sort(cmp);

    const lim = Number(limit);
    if (Number.isFinite(lim) && lim > 0) list = list.slice(0, lim);

    return list;
  }, [category, sort, search, limit]);

  return {
    products,
    loading: false,
    error:   null,
    refetch: () => {},
  };
}

export default useStaticProducts;
