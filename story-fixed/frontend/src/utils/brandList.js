// src/utils/brandList.js
// BRAND section of the Shop sidebar. Brands are derived dynamically from
// src/data/products.js so the sidebar only lists brands that actually
// appear in the catalog - no zero-count rows, no stale curated list.
//
// Filtering remains client-side because the legacy backend ?brand= query
// is single-value but the sidebar checkboxes are multi-select.

import PRODUCTS from '../data/products.js';

/**
 * Normalize an arbitrary brand string to a slug for stable comparison.
 * Strips apostrophes first so "Levi's" -> "levis" instead of "levi-s".
 */
export function slugifyBrand(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build the brand list once, at module load. Each catalog brand becomes
 * a single sidebar entry; brands are surfaced in alphabetical order so
 * the rail stays predictable as the catalog grows.
 */
function buildBrandList() {
  const seen = new Map();
  for (const p of PRODUCTS) {
    const raw = p?.brand;
    if (!raw) continue;
    const id = slugifyBrand(raw);
    if (!id || seen.has(id)) continue;
    seen.set(id, { id, label: String(raw).trim().toUpperCase() });
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export const BRAND_LIST = Object.freeze(buildBrandList());

const BRAND_IDS = new Set(BRAND_LIST.map(b => b.id));

/** True if the product's brand matches the given brand id (slug). */
export function matchesBrand(product, brandId) {
  if (!product || !brandId) return false;
  return slugifyBrand(product.brand) === brandId;
}

/**
 * Filter products by selected brand ids (multi-select; OR within the set).
 * Returns the input unchanged when no brands are selected.
 */
export function filterByBrands(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  return list.filter(p => set.has(slugifyBrand(p?.brand)));
}

/**
 * Per-brand counts. Only brands that are present in the catalog at module
 * load are tracked; unknown brands on adapted products are ignored
 * (consistent with the previous curated-list behaviour).
 */
export function countByBrands(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const b of BRAND_LIST) out[b.id] = 0;
  for (const p of list) {
    const id = slugifyBrand(p?.brand);
    if (id && BRAND_IDS.has(id)) out[id]++;
  }
  return out;
}
