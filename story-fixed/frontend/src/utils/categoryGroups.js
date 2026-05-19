// src/utils/categoryGroups.js
// Coarse "meta-group" definitions for the left sidebar checkbox filter.
//
// These map customer-facing labels (Shoes / Clothing / Accessories / Bags) to
// the seeded backend categories. The backend has 5 fine categories
// (shoes, tops, bottoms, outerwear, accessories) — the sidebar surfaces 4
// premium meta-groups by composing them. "Bags" is carved out of accessories
// via a name-pattern, since the backend does not have a dedicated category.
//
// Filtering is applied entirely on the client so multi-select works without
// touching the products API.

export const CATEGORY_GROUPS = [
  {
    id: 'shoes',
    label: 'SHOES',
    categories: ['shoes'],
  },
  {
    id: 'clothing',
    label: 'CLOTHING',
    categories: ['tops', 'bottoms', 'outerwear'],
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    categories: ['accessories'],
    // Exclude bags so they don't appear in both Accessories and Bags.
    exclude: /\b(bag|tote|backpack|wallet|purse|clutch)\b/i,
  },
  {
    id: 'bags',
    label: 'BAGS',
    categories: ['accessories'],
    match: /\b(bag|tote|backpack|wallet|purse|clutch)\b/i,
  },
];

const GROUP_BY_ID = Object.fromEntries(CATEGORY_GROUPS.map(g => [g.id, g]));

/** True when a single product belongs to the given group id. */
export function matchesGroup(product, groupId) {
  const g = GROUP_BY_ID[groupId];
  if (!g || !product) return false;

  const cat = (product.category_slug || '').toLowerCase();
  if (!g.categories.includes(cat)) return false;

  const hay = `${product.name || ''} ${product.description || ''}`;
  if (g.match   && !g.match.test(hay))   return false;
  if (g.exclude &&  g.exclude.test(hay)) return false;
  return true;
}

/**
 * Filter products by selected meta-group ids (multi-select; OR within the
 * group set). When no groups are selected, returns the input unchanged.
 */
export function filterByGroups(products, selectedIds) {
  const list = Array.isArray(products) ? products : [];
  if (!selectedIds || selectedIds.size === 0) return list;
  return list.filter(p =>
    Array.from(selectedIds).some(id => matchesGroup(p, id))
  );
}

/** Compute per-group counts for the badge in the sidebar UI. */
export function countByGroup(products) {
  const list = Array.isArray(products) ? products : [];
  const out = {};
  for (const g of CATEGORY_GROUPS) {
    let n = 0;
    for (const p of list) if (matchesGroup(p, g.id)) n++;
    out[g.id] = n;
  }
  return out;
}
