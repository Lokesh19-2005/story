// src/data/adapter.js
// =============================================================================
//  STATIC PRODUCT  ->  LEGACY PRODUCT SHAPE
// =============================================================================
//
//  Why this file exists
//  --------------------
//  src/data/products.js uses a clean, modern luxury product schema
//  (image / hoverImage / galleryImages / originalPrice / category / badge /
//  colors:string[]). The rest of the storefront (ProductCard, DetailPage,
//  productImages, categoryTabs, categoryGroups, brandList, sizeList,
//  priceRanges, useStore.addCart) was built against the legacy backend
//  product shape: orig_price, category_slug, category_label, image_url,
//  images[], colors:[{color_name,color_hex}], stockMap, tag.
//
//  Rather than rewrite every consumer, we adapt the static catalog into
//  that legacy shape at the data boundary. This keeps the temporary
//  frontend product rendering swap minimal, leaves ProductCard untouched,
//  and lets us flip back to the backend API later without code archaeology.
//
//  This module is purely additive - it does not modify any backend code.
// =============================================================================

import { CATEGORIES, BADGES } from './products.js';

// ---------------------------------------------------------------------------
//  Category mapping - new schema id -> legacy backend slug.
//  The legacy slugs are what categoryTabs.js / categoryGroups.js expect,
//  and productImages.js uses them to resolve fallback imagery. The luxury
//  4-room model maps onto the original 5 backend slugs as follows:
//    uppers      -> tops      (shirts, knits, jackets read as 'tops')
//    bottoms     -> bottoms
//    accessories -> accessories
//    co-ords     -> tops      (matched-set imagery is closest to 'tops')
// ---------------------------------------------------------------------------
const CATEGORY_TO_LEGACY_SLUG = {
  uppers:      'tops',
  bottoms:     'bottoms',
  accessories: 'accessories',
  'co-ords':   'tops',
};

const CATEGORY_TO_LABEL = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c.label])
);

// ---------------------------------------------------------------------------
//  Colour name -> CSS hex. Luxury monochrome palette only.
//  Used by DetailPage to render the round colour swatches; ProductCard does
//  not consume colour hex.
// ---------------------------------------------------------------------------
const COLOR_HEX = {
  Black:    '#000000',
  Onyx:     '#0a0a0a',
  Charcoal: '#2a2a2a',
  Slate:    '#3a3a3a',
  Ash:      '#5a5a5a',
  Stone:    '#8a8a8a',
  Bone:     '#d8d2c5',
  Ivory:    '#efe9dc',
  Pearl:    '#ece8e1',
  White:    '#ffffff',
};

const colorToObject = (name) => ({
  color_name: name,
  color_hex:  COLOR_HEX[name] || '#888888',
});

// ---------------------------------------------------------------------------
//  Build a {`size__color`: qty} stock map by distributing the aggregate
//  `stock` count evenly across all variant combinations. This gives the
//  PDP enough granularity to render the existing low-stock and OOS UX
//  naturally without inventing extra data.
// ---------------------------------------------------------------------------
function buildStockMap(sizes, colorNames, totalStock) {
  const map = {};
  const sList = Array.isArray(sizes)      && sizes.length      ? sizes      : [''];
  const cList = Array.isArray(colorNames) && colorNames.length ? colorNames : [''];
  const variants = sList.length * cList.length;
  if (variants === 0) return map;
  const per = Math.max(1, Math.floor(Number(totalStock || 0) / variants));
  for (const s of sList) {
    for (const c of cList) {
      map[`${s}__${c}`] = per;
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
//  Map editorial badge -> ProductCard `tag`.
//  ProductCard renders SALE automatically from price < orig_price, so we
//  drop a SALE badge here to avoid double-rendering. NEW + any other
//  editorial badge (EXCLUSIVE / BESTSELLER / LIMITED) pass through.
// ---------------------------------------------------------------------------
function badgeToTag(badge) {
  if (!badge) return null;
  const up = String(badge).toUpperCase();
  if (up === BADGES.SALE) return null;
  return up;
}

/**
 * Convert a single static-schema Product to the legacy product object the
 * existing UI was built against. Returns `null` for invalid input so callers
 * can `.filter(Boolean)` defensively.
 */
export function adaptProduct(p) {
  if (!p || typeof p !== 'object') return null;

  const colorNames  = Array.isArray(p.colors) ? p.colors : [];
  const colorObjs   = colorNames.map(colorToObject);

  // galleryImages is the canonical multi-image array. If it's empty for
  // some reason, synthesise one from the hero + hover so productImages
  // still resolves something.
  const galleryImgs = Array.isArray(p.galleryImages) && p.galleryImages.length
    ? p.galleryImages
    : [p.image, p.hoverImage].filter(Boolean);

  return {
    id:    p.id,
    slug:  p.slug,
    name:  p.name,
    brand: p.brand,
    description: p.description,

    // Pricing — legacy field names
    price:      Number(p.price)         || 0,
    orig_price: Number(p.originalPrice) || Number(p.price) || 0,

    // Category fields.
    //   category_id    : NEW 7-cat id (outwear/headwear/knit/jeans/pants/
    //                    shoes/accessories) - the canonical key for filter
    //                    utilities (categoryTabs, categoryGroups).
    //   category_slug  : legacy backend slug (shoes/tops/bottoms/outerwear/
    //                    accessories) - kept for productImages fallbacks
    //                    and any consumer that still expects the 5-cat shape.
    //   category_label : human-readable label for breadcrumbs + sidebar.
    category_id:    p.category,
    category_slug:  CATEGORY_TO_LEGACY_SLUG[p.category] || 'accessories',
    category_label: CATEGORY_TO_LABEL[p.category]       || 'CATEGORY',

    // Imagery. `images` is preferred by productImages.getProductImages,
    // so the hero (index 0) and hover (index 1) light up automatically
    // on ProductCard, and the full gallery drives the PDP thumbnails.
    images:    galleryImgs,
    image_url: p.image || galleryImgs[0] || '',

    // Sizes / colors / variant stock map
    sizes:    Array.isArray(p.sizes) ? p.sizes : [],
    colors:   colorObjs,
    stockMap: buildStockMap(p.sizes, colorNames, p.stock),

    // Editorial badge -> ProductCard tag
    tag: badgeToTag(p.badge),
  };
}

/** Adapt an array of static products. Skips bad entries safely. */
export function adaptProducts(list) {
  return (Array.isArray(list) ? list : []).map(adaptProduct).filter(Boolean);
}
