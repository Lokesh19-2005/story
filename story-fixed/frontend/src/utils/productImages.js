// src/utils/productImages.js
// Single source of truth for product image resolution across STORY frontend.
//
// Resolution priority:
//   1. product.images[] — if backend ever returns multiple images
//   2. product.image_url — single image uploaded via admin (existing API)
//   3. Curated luxury fashion imagery, keyed by product.slug (demo data)
//   4. Category-based fallback imagery
//   5. Empty -> SmartImage will render the icon glyph fallback

const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Strip trailing /api so we can serve /uploads/* directly from backend origin.
const API_ORIGIN = RAW_API.replace(/\/api\/?$/, '');

/** Resolve any image path to a fully loadable URL. */
export function resolveImageUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const v = raw.trim();
  if (!v) return '';
  if (/^(https?:|data:|blob:)/i.test(v)) return v;
  if (v.startsWith('/')) return `${API_ORIGIN}${v}`;
  return v;
}

// Unsplash CDN — auto format, cropped, quality-tuned for retail PDP/grid use.
const u = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// Curated 2–3 image sets per seeded product slug. Each set is composed of a
// hero shot followed by an alternate angle / detail shot — enabling hover
// swap on the grid and a multi-image gallery on the PDP without any backend
// changes. When admin uploads a real product image, that takes priority.
const DEMO_IMAGES = {
  'phantom-runner-v2': [
    '1542291026-7eec264c27ff',
    '1600185365926-3a2ce3cdb9eb',
    '1595950653106-6c9ebd614d3a',
  ],
  'obsidian-blazer': [
    '1594938298603-c8148c4dae35',
    '1593030761757-71fae45fa0e7',
    '1617137968427-85924c800a22',
  ],
  'void-cargo-pant': [
    '1624378439575-d8705ad7ae80',
    '1473966968600-fa801b43a042',
  ],
  'monolith-tee': [
    '1521572163474-6864f9cf17ab',
    '1583743814966-8936f5b7be1a',
  ],
  'shadow-hoodie': [
    '1556821840-3a63f95609a7',
    '1620799140408-edc6dcb6d633',
  ],
  'arc-sneaker-lo': [
    '1606107557195-0e29a4b5b4aa',
    '1525966222134-fcfa99b8ae77',
  ],
  'terrain-jacket': [
    '1551028719-00167b16eac5',
    '1591047139829-d91aecb6caea',
  ],
  'signal-cap': [
    '1588850561407-ed78c282e89b',
    '1521369909029-2afed882baee',
  ],
};

const CATEGORY_FALLBACK = {
  shoes:       ['1542291026-7eec264c27ff', '1606107557195-0e29a4b5b4aa'],
  outerwear:   ['1551028719-00167b16eac5', '1594938298603-c8148c4dae35'],
  bottoms:     ['1624378439575-d8705ad7ae80', '1473966968600-fa801b43a042'],
  tops:        ['1521572163474-6864f9cf17ab', '1556821840-3a63f95609a7'],
  accessories: ['1588850561407-ed78c282e89b', '1521369909029-2afed882baee'],
};

/**
 * Returns an array of fully-resolved image URLs for the given product.
 * Always returns an array (possibly empty); never throws on bad input.
 */
export function getProductImages(product, width = 800) {
  if (!product || typeof product !== 'object') return [];

  // 1) Backend-provided images array (future support)
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images.map(resolveImageUrl).filter(Boolean);
  }

  // 2) Backend-provided single image_url (admin upload)
  if (product.image_url) {
    const url = resolveImageUrl(product.image_url);
    if (url) return [url];
  }

  // 3) Curated demo imagery by slug
  if (product.slug && DEMO_IMAGES[product.slug]) {
    return DEMO_IMAGES[product.slug].map((id) => u(id, width));
  }

  // 4) Category fallback
  const cat = (product.category_slug || '').toLowerCase();
  if (CATEGORY_FALLBACK[cat]) {
    return CATEGORY_FALLBACK[cat].map((id) => u(id, width));
  }

  return [];
}

export function getPrimaryImage(product, width = 800) {
  return getProductImages(product, width)[0] || '';
}

export function getHoverImage(product, width = 800) {
  const imgs = getProductImages(product, width);
  return imgs[1] || '';
}
