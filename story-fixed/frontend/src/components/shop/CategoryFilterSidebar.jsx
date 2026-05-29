// src/components/CategoryFilterSidebar.jsx
// Luxury monochrome left-sidebar with multi-section checkbox filters.
// Hosts CATEGORY, BRAND, and SIZE sections — all built from the same
// FilterSection primitive (one collapse/checkbox implementation, two
// presentation variants: 'list' for text rows, 'grid' for compact chips).

import { useState } from 'react';
import { CATEGORY_GROUPS } from '../../utils/categoryGroups.js';
import { BRAND_LIST } from '../../utils/brandList.js';
import { SIZE_LIST } from '../../utils/sizeList.js';
import { PRICE_RANGES } from '../../utils/priceRanges.js';

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
 * Reusable collapsible filter section.
 *   variant='list' : checkbox + label rows (CATEGORY, BRAND).
 *   variant='grid' : compact 3-col toggle chips (SIZE).
 * Items with count===0 in grid mode are visually disabled (greyed +
 * line-through) — standard luxury size-picker UX.
 */
function FilterSection({
  title,
  items,
  selected,
  counts = {},
  onToggle,
  onClear,
  defaultOpen = true,
  variant = 'list',
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
        {variant === 'grid' ? (
          <div className="cat-grid">
            {items.map(item => {
              const isOn       = selected.has(item.id);
              const count      = counts[item.id];
              const isDisabled = Number.isFinite(count) && count === 0 && !isOn;
              return (
                <label
                  key={item.id}
                  className={`cat-chip${isOn ? ' is-on' : ''}${isDisabled ? ' is-disabled' : ''}`}
                  style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
                >
                  <input
                    type="checkbox"
                    className="cat-chip-input"
                    checked={isOn}
                    disabled={isDisabled}
                    onChange={() => { if (!isDisabled && onToggle) onToggle(item.id); }}
                  />
                  <span className="cat-chip-label">{item.label}</span>
                </label>
              );
            })}
          </div>
        ) : (
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
        )}

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
  // SIZE section
  sizes         = SIZE_LIST,
  selectedSizes = new Set(),
  sizeCounts    = {},
  onToggleSize,
  onClearSizes,
  // PRICE section
  prices         = PRICE_RANGES,
  selectedPrices = new Set(),
  priceCounts    = {},
  onTogglePrice,
  onClearPrices,
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
      {sizes.length > 0 && (
        <FilterSection
          title="SIZE"
          items={sizes}
          variant="grid"
          selected={selectedSizes}
          counts={sizeCounts}
          onToggle={onToggleSize}
          onClear={onClearSizes}
        />
      )}
      {prices.length > 0 && (
        <FilterSection
          title="PRICE"
          items={prices}
          selected={selectedPrices}
          counts={priceCounts}
          onToggle={onTogglePrice}
          onClear={onClearPrices}
        />
      )}
    </div>
  );
}
