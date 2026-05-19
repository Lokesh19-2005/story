// src/utils/sizeList.js
// Size catalog surfaced in the Shop sidebar SIZE section.
// Filtering is client-side: a product matches a selected size if its
// `sizes` array (returned by the products API) contains that size.

export const SIZE_LIST = [
  // Apparel
  { id: 'XS',  label: 'XS' },
  { id: 'S',   label: 'S'  },
  { id: 'M',   label: 'M'  },
  { id: 'L',   label: 'L'  },
  { id: 'XL',  label: 'XL' },
  { id: 'XXL', label: 'XXL'},
  // Waist (jeans / pants)
  { id: '28',  label: '28' },
  { id: '30',  label: '30' },
  { id: '32',  label: '32' },
  { id: '34',  label: '34' },
  { id: '36',  label: '36' },
  { id: '38',  label: '38' },
  // Footwear
  { id: '7',   label: '7'  },
  { id: '8',   label: '8'  },
  { id: '9',   label: '9'  },
  { id: '10',  label: '10' },
  { id: '11',  label: '11' },
  { id: '12',  label: '12' },
  // Universal — span the full row for visual cleanliness
  { id: 'ONE SIZE', label: 'ONE SIZE', span: 3 },
];

const norm = s => String(s == null ? '' : s).trim().toUpperCase();

/** True if a product offers the given size id. */
export function matchesSize(product, sizeId) {
  if (!product || !sizeId) return false;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const target = norm(sizeId);
  return sizes.some(s => norm(s) === target);
}

/**
 * Filter products by selected size ids (multi-select; OR within the set).
 * When no sizes are selected, returns the input unchanged.
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
    // A product is counted once per size it offers (not per occurrence),
    // but since product.sizes is already a set of distinct sizes from the
    // server enrichment, a simple loop is enough.
    for (const sz of p.sizes) {
      const id = norm(sz);
      if (id in out) out[id]++;
    }
  }
  return out;
}
