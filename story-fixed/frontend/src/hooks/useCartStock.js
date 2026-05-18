// src/hooks/useCartStock.js
// Real-stock lookup for cart line items, backed by productsAPI.detail
// — preserves existing backend stockMap shape (`${size}__${color_name}`).
import { useEffect, useRef, useState } from 'react';
import { productsAPI } from '../services/api.js';

const STATUS_OK   = 'ok';
const STATUS_LOW  = 'low';
const STATUS_OOS  = 'oos';
const STATUS_OVER = 'over'; // qty in cart > available stock
const LOW_THRESHOLD = 5;

/**
 * @param {Array} cart  — items shaped like { id, product_id, slug, size, color_name, quantity }
 * @returns {{
 *   stockByLineId: Record<string, number>,
 *   statusByLineId: Record<string, 'ok'|'low'|'oos'|'over'>,
 *   loading: boolean,
 *   issues: Array<{ id: string, status: string, stock: number }>,
 *   hasIssues: boolean,
 *   refresh: () => void,
 * }}
 */
export function useCartStock(cart) {
  const [stockByLineId, setStockByLineId] = useState({});
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const slugCache = useRef(new Map()); // slug -> stockMap

  // Build a stable signature so we only refetch on real changes
  const signature = (cart || []).map(i => `${i.id}|${i.slug}|${i.size}|${i.color_name}|${i.quantity}`).join('§');

  useEffect(() => {
    if (!cart || cart.length === 0) {
      setStockByLineId({});
      return;
    }

    let cancelled = false;
    const slugsNeeded = Array.from(new Set(cart.map(i => i?.slug).filter(Boolean)));

    setLoading(true);

    Promise.all(slugsNeeded.map(slug => {
      if (slugCache.current.has(slug)) {
        return Promise.resolve({ slug, map: slugCache.current.get(slug) });
      }
      return productsAPI.detail(slug)
        .then(d => {
          const map = (d?.product?.stockMap && typeof d.product.stockMap === 'object')
            ? d.product.stockMap
            : {};
          slugCache.current.set(slug, map);
          return { slug, map };
        })
        .catch(() => ({ slug, map: null })); // unknown — treat as no-restriction
    })).then(results => {
      if (cancelled) return;
      const slugMap = new Map(results.map(r => [r.slug, r.map]));
      const next = {};
      for (const item of cart) {
        const m = slugMap.get(item?.slug);
        if (!m) { next[item.id] = Infinity; continue; }
        const key = `${item.size}__${item.color_name}`;
        const v = m[key];
        next[item.id] = (typeof v === 'number') ? v : Infinity;
      }
      setStockByLineId(next);
    }).finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, tick]);

  // Derive statuses
  const statusByLineId = {};
  const issues = [];
  for (const item of (cart || [])) {
    const stock = stockByLineId[item.id];
    let status = STATUS_OK;
    if (stock === Infinity || stock === undefined) {
      status = STATUS_OK; // unknown — don't block
    } else if (stock === 0) {
      status = STATUS_OOS;
    } else if (item.quantity > stock) {
      status = STATUS_OVER;
    } else if (stock <= LOW_THRESHOLD) {
      status = STATUS_LOW;
    }
    statusByLineId[item.id] = status;
    if (status === STATUS_OOS || status === STATUS_OVER) {
      issues.push({ id: item.id, status, stock: stock === Infinity ? null : stock });
    }
  }

  return {
    stockByLineId,
    statusByLineId,
    loading,
    issues,
    hasIssues: issues.length > 0,
    refresh: () => { slugCache.current.clear(); setTick(t => t + 1); },
  };
}

export const STOCK_LOW_THRESHOLD = LOW_THRESHOLD;
