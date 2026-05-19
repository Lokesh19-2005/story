// src/utils/priceRanges.js
// Price-range buckets surfaced in the Shop sidebar PRICE section.
// Filtering is client-side because the backend ?minPrice/?maxPrice query
// is single-range but the sidebar checkboxes are multi-select.
//
// Ranges are half-open intervals [min, max) so every product lands in
// exactly one bucket — counts always sum to the visible product total.

export const PRICE_RANGES = [
  { id: 'under-2k',  label: 'UNDER \u20B92,000',           min: 0,     max: 2000 },
  { id: '2k-5k',     label: '\u20B92,000 \u2013 \u20B95,000',  min: 2000,  max: 5000 },
  { id: '5k-10k',    label: '\u20B95,000 \u2013 \u20B910,000', min: 5000,  max: 10000 },
  { id: 'above-10k', label: 'ABOVE \u20B910,000',           min: 10000, max: Infinity },
];

const RANGE_BY_ID = Object.fromEntries(PRICE_RANGES.map(r => [r.id, r]));

/** True if a product's price falls in the given bucket. */
export function matchesPriceRange(product, rangeId) {
  const r = RANGE_BY_ID[rangeId];
  if (!r || !product) return false;
  const price = Number(product.price);
  if (!Number.isFinite(price)) return false;
  return price >= r.min && price < r.max;
}

/**
 * Filter products by selected range ids (multi-select; OR within the set).
 * Returns the input unchanged when no ranges are selected.
 */
export function filterByPrices(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  return list.filter(p => {
    const price = Number(p?.price);
    if (!Number.isFinite(price)) return false;
    for (const id of set) {
      const r = RANGE_BY_ID[id];
      if (r && price >= r.min && price < r.max) return true;
    }
    return false;
  });
}

/** Per-bucket counts. Each product is counted in exactly one bucket. */
export function countByPrices(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const r of PRICE_RANGES) out[r.id] = 0;
  for (const p of list) {
    const price = Number(p?.price);
    if (!Number.isFinite(price)) continue;
    for (const r of PRICE_RANGES) {
      if (price >= r.min && price < r.max) {
        out[r.id]++;
        break;
      }
    }
  }
  return out;
}
