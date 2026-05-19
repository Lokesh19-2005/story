// src/utils/categoryTabs.js
// Single source of truth for the STORY top-category tab rail.
//
// Each tab maps to a backend category slug (sent as ?category=... to the
// existing products API) plus an optional client-side name refinement.
// This lets us expose more granular labels (JEANS, PANTS, KNIT, HEADWEAR)
// without modifying any backend routes or data.

export const CATEGORY_TABS = [
  { id: 'all',         label: 'ALL',         category: '' },
  { id: 'outerwear',   label: 'OUTWEAR',     category: 'outerwear' },
  { id: 'headwear',    label: 'HEADWEAR',    category: 'accessories', match: /\b(cap|hat|beanie|headwear|bucket)\b/i },
  { id: 'knit',        label: 'KNIT',        category: 'tops',        match: /\b(knit|sweater|hoodie|jumper|cardigan|tee)\b/i },
  { id: 'jeans',       label: 'JEANS',       category: 'bottoms',     match: /\b(jean|denim)\b/i },
  { id: 'pants',       label: 'PANTS',       category: 'bottoms',     match: /\b(pant|trouser|chino|cargo|short)\b/i },
  { id: 'shoes',       label: 'SHOES',       category: 'shoes' },
  { id: 'accessories', label: 'ACCESSORIES', category: 'accessories' },
];

/** Return the tab definition for a given id, defaulting to ALL. */
export function getTab(id) {
  return CATEGORY_TABS.find(t => t.id === id) || CATEGORY_TABS[0];
}

/** Backend category slug to send on the products API for a tab id. */
export function tabToCategorySlug(id) {
  return getTab(id).category;
}

/**
 * Apply the optional client-side name refinement for a tab.
 * Server has already narrowed by category; this further refines the slice.
 */
export function refineByTab(products, id) {
  const tab = getTab(id);
  if (!tab.match || !Array.isArray(products)) return products || [];
  return products.filter(p => {
    const haystack = `${p?.name || ''} ${p?.description || ''}`;
    return tab.match.test(haystack);
  });
}
