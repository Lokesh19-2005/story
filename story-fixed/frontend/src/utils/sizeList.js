// src/utils/sizeList.js
// SIZE section of the Shop sidebar. Sizes are derived dynamically from
// src/data/products.js so the rail only renders sizes that actually
// appear in the catalog - no permanently-empty chips.
//
// A canonical ordering is enforced (apparel -> waist -> footwear -> ONE
// SIZE) so the chip grid reads predictably regardless of catalog order.
// Sizes outside the canonical kit fall to the end alphabetically.
//
// Filtering remains client-side: a product matches a selected size if
// its `sizes` array contains that size (case-insensitive).

import PRODUCTS from '../data/products.js';

const SIZE_ORDER = [
  // Apparel
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  // Waist (jeans / pants / belts)
  '28', '30', '32', '34', '36', '38',
  // Footwear
  '7', '8', '9', '10', '11', '12',
  // Universal
  'ONE SIZE',
];

const ORDER_INDEX = Object.fromEntries(SIZE_ORDER.map((s, i) => [s, i]));

const norm = s => String(s == null ? '' : s).trim().toUpperCase();

/**
 * Build the size list once, at module load, from the union of every
 * product's `sizes` array. Sorted by SIZE_ORDER, with unknown sizes
 * appended alphabetically.
 */
function buildSizeList() {
  const seen = new Set();
  for (const p of PRODUCTS) {
    if (!Array.isArray(p?.sizes)) continue;
    for (const sz of p.sizes) seen.add(norm(sz));
  }
  return Array.from(seen)
    .sort((a, b) => {
      const ia = ORDER_INDEX[a] ?? 999;
      const ib = ORDER_INDEX[b] ?? 999;
      if (ia !== ib) return ia - ib;
      return a.localeCompare(b);
    })
    .map(s => ({
      id:    s,
      label: s,
      // ONE SIZE spans the full chip row for visual cleanliness.
      ...(s === 'ONE SIZE' ? { span: 3 } : null),
    }));
}

export const SIZE_LIST = Object.freeze(buildSizeList());

const SIZE_IDS = new Set(SIZE_LIST.map(s => s.id));

/** True if a product offers the given size id. */
export function matchesSize(product, sizeId) {
  if (!product || !sizeId) return false;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const target = norm(sizeId);
  return sizes.some(s => norm(s) === target);
}

/**
 * Filter products by selected size ids (multi-select; OR within the set).
 * Returns the input unchanged when no sizes are selected.
 */
export function filterBySizes(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  return list.filter(p => {
    if (!Array.isArray(p?.sizes)) return false;
    for (const sz of p.sizes) {
      if (set.has(norm(sz))) return true;
    }
    return false;
  });
}

/** Per-size counts (only sizes that appear in SIZE_LIST). */
export function countBySizes(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const s of SIZE_LIST) out[s.id] = 0;
  for (const p of list) {
    if (!Array.isArray(p?.sizes)) continue;
    for (const sz of p.sizes) {
      const id = norm(sz);
      if (SIZE_IDS.has(id)) out[id]++;
    }
  }
  return out;
}
