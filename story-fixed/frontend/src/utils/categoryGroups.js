// src/utils/categoryGroups.js
// CATEGORY section of the Shop sidebar.
//
// Groups are now exactly the 7 storefront verticals defined in
// src/data/products.js (OUTWEAR, HEADWEAR, KNIT, JEANS, PANTS, SHOES,
// ACCESSORIES) - one group per category, matched by `category_id`.
//
// The previous 4-meta-group model (Shoes / Clothing / Accessories / Bags
// with regex carve-outs) collapsed several of the new categories into
// one row and produced inflated counts. The 7-group model gives every
// category its own row and a count that matches the visible grid.
//
// All multi-select / count semantics are preserved: callers continue to
// use `filterByGroups` and `countByGroup` exactly as before.

import { CATEGORIES } from '../data/products.js';

/** One sidebar entry per storefront vertical, in catalog order. */
export const CATEGORY_GROUPS = Object.freeze(
  CATEGORIES.map(c => ({ id: c.id, label: c.label }))
);

const GROUP_IDS = new Set(CATEGORY_GROUPS.map(g => g.id));

/** True when a single product belongs to the given group id. */
export function matchesGroup(product, groupId) {
  if (!product || !groupId || !GROUP_IDS.has(groupId)) return false;
  return product.category_id === groupId;
}

/**
 * Filter products by selected group ids (multi-select; OR within the
 * selection). Returns the input unchanged when no groups are selected.
 */
export function filterByGroups(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  return list.filter(p => p && set.has(p.category_id));
}

/** Per-group counts for the badge in the sidebar UI. */
export function countByGroup(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const g of CATEGORY_GROUPS) out[g.id] = 0;
  for (const p of list) {
    const id = p?.category_id;
    if (id && id in out) out[id]++;
  }
  return out;
}
