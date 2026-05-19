// src/components/CategoryFilterSidebar.jsx
// Luxury monochrome left-sidebar with multi-section checkbox filters.
// Hosts a CATEGORY section and a BRAND section, both built from the same
// FilterSection primitive (no duplicated checkbox markup).

import { useState } from 'react';
import { CATEGORY_GROUPS } from '../utils/categoryGroups.js';
import { BRAND_LIST } from '../utils/brandList.js';

function ChevronIcon() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
      <path d="M1 3.5l2.5 2.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

/**
 * Reusable collapsible filter section with multi-select checkbox rows.
 * Identical UX/markup is reused for CATEGORY and BRAND.
 */
function FilterSection({
  title,
  items,
  selected,
  counts = {},
  onToggle,
  onClear,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `flt-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="cat-filter-section">
      <button
        type="button"
        className="cat-filter-head"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen(v => !v)}
      >
        <span>{title}</span>
        <span className={`cat-chev${open ? ' is-open' : ''}`} aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>

      <div
        id={bodyId}
        className={`cat-filter-body${open ? ' is-open' : ''}`}
        role="group"
        aria-label={`${title} filters`}
      >
        <ul className="cat-list">
          {items.map(item => {
            const isOn  = selected.has(item.id);
            const count = counts[item.id];
            return (
              <li key={item.id}>
                <label className={`cat-row${isOn ? ' is-on' : ''}`}>
                  <input
                    type="checkbox"
                    className="cat-input"
                    checked={isOn}
                    onChange={() => onToggle && onToggle(item.id)}
                  />
                  <span className={`cat-box${isOn ? ' is-on' : ''}`} aria-hidden="true">
                    <TickIcon />
                  </span>
                  <span className="cat-label">{item.label}</span>
                  {Number.isFinite(count) && <span className="cat-count">{count}</span>}
                </label>
              </li>
            );
          })}
        </ul>

        {selected.size > 0 && (
          <button type="button" className="cat-clear" onClick={onClear}>
            CLEAR ({selected.size})
          </button>
        )}
      </div>
    </div>
  );
}

export default function CategoryFilterSidebar({
  // CATEGORY section
  groups   = CATEGORY_GROUPS,
  selected = new Set(),
  counts   = {},
  onToggle,
  onClear,
  // BRAND section
  brands         = BRAND_LIST,
  selectedBrands = new Set(),
  brandCounts    = {},
  onToggleBrand,
  onClearBrands,
}) {
  return (
    <div className="cat-filter">
      <FilterSection
        title="CATEGORY"
        items={groups}
        selected={selected}
        counts={counts}
        onToggle={onToggle}
        onClear={onClear}
      />
      {brands.length > 0 && (
        <FilterSection
          title="BRAND"
          items={brands}
          selected={selectedBrands}
          counts={brandCounts}
          onToggle={onToggleBrand}
          onClear={onClearBrands}
        />
      )}
    </div>
  );
}
