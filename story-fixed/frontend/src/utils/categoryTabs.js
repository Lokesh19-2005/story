// src/utils/categoryTabs.js
// Single source of truth for the STORY top-category tab rail.
//
// Tabs are derived directly from src/data/products.js CATEGORIES so the
// rail always matches the catalog. Each tab maps to a single category_id
// (the new 7-cat key on adapted products) - no regex narrowing, no
// legacy slug compression. ALL is the synthetic "no filter" tab.
//
// The tab id is identical to the category_id it represents, so the
// downstream filter (useStaticProducts) can compare directly against
// `product.category_id`.

import { CATEGORIES } from '../data/products.js';

const ALL_TAB = Object.freeze({ id: 'all', label: 'ALL', categoryId: '' });

export const CATEGORY_TABS = Object.freeze([
  ALL_TAB,
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label, categoryId: c.id })),
]);

/** Return the tab definition for a given id, defaulting to ALL. */
export function getTab(id) {
  return CATEGORY_TABS.find(t => t.id === id) || ALL_TAB;
}

/**
 * Canonical name: the category_id this tab represents. Returns '' for ALL
 * so callers can use a falsy check to skip the category filter.
 */
export function tabToCategoryId(id) {
  return getTab(id).categoryId;
}

/**
 * Back-compat alias. The function used to return a legacy backend slug
 * (shoes/tops/bottoms/...); it now returns the new category_id which is
 * what the filter pipeline keys off of. Same call sites, new semantics.
 */
export function tabToCategorySlug(id) {
  return tabToCategoryId(id);
}

/**
 * Tab -> category mapping is now exact (1:1), so no client-side regex
 * refinement is needed. Kept as an identity pass-through so existing
 * callers (ShopPage) don't have to change.
 */
export function refineByTab(products /*, _id */) {
  return Array.isArray(products) ? products : [];
}
