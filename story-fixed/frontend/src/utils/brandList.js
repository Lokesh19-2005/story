// src/utils/brandList.js
// Curated brand list surfaced in the Shop sidebar. Each entry has a stable
// `id` (slug-style) used as the selection key, plus the customer-facing
// `label`. Filtering is client-side because the backend ?brand= query is
// single-value but the sidebar checkboxes are multi-select.

export const BRAND_LIST = [
  { id: 'nike',           label: 'NIKE' },
  { id: 'levis',          label: "LEVI'S" },
  { id: 'puma',           label: 'PUMA' },
  { id: 'adidas',         label: 'ADIDAS' },
  { id: 'tommy-hilfiger', label: 'TOMMY HILFIGER' },
  { id: 'reebok',         label: 'REEBOK' },
  { id: 'wrangler',       label: 'WRANGLER' },
  { id: 'lacoste',        label: 'LACOSTE' },
  { id: 'superdry',       label: 'SUPERDRY' },
  { id: 'burberry',       label: 'BURBERRY' },
  { id: 'rare-rabbit',    label: 'RARE RABBIT' },
  { id: 'blackberrys',    label: 'BLACKBERRYS' },
  { id: 'true-religion',  label: 'TRUE RELIGION' },
];

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

/** True if the product's brand matches the given brand id (slug). */
export function matchesBrand(product, brandId) {
  if (!product || !brandId) return false;
  return slugifyBrand(product.brand) === brandId;
}

/**
 * Filter products by selected brand ids (multi-select; OR within the set).
 * When no brands are selected, returns the input unchanged.
 */
export function filterByBrands(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds);
  return list.filter(p => set.has(slugifyBrand(p?.brand)));
}

/** Per-brand counts (only counts brands that appear in BRAND_LIST). */
export function countByBrands(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const b of BRAND_LIST) out[b.id] = 0;
  for (const p of list) {
    const id = slugifyBrand(p?.brand);
    if (id in out) out[id]++;
  }
  return out;
}
