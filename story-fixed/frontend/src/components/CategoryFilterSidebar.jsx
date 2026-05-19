// src/components/CategoryFilterSidebar.jsx
// Luxury monochrome left-sidebar with a collapsible CATEGORY section and
// multi-select checkbox filters. Reuses the .shop-filters container class
// already defined in global.css so we don't introduce a parallel layout.

import { useState } from 'react';
import { CATEGORY_GROUPS } from '../utils/categoryGroups.js';

export default function CategoryFilterSidebar({
  groups   = CATEGORY_GROUPS,
  selected = new Set(),
  onToggle,
  onClear,
  counts   = {},
}) {
  const [open, setOpen] = useState(true);
  const sectionId = 'cat-filter-body';

  return (
    <div className="cat-filter">
      <div className="cat-filter-section">
        <button
          type="button"
          className="cat-filter-head"
          aria-expanded={open}
          aria-controls={sectionId}
          onClick={() => setOpen(v => !v)}
        >
          <span>CATEGORY</span>
          <span className={`cat-chev${open ? ' is-open' : ''}`} aria-hidden="true">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </span>
        </button>

        <div id={sectionId} className={`cat-filter-body${open ? ' is-open' : ''}`} role="group" aria-label="Category filters">
          <ul className="cat-list">
            {groups.map(g => {
              const isOn  = selected.has(g.id);
              const count = counts[g.id];
              return (
                <li key={g.id}>
                  <label className={`cat-row${isOn ? ' is-on' : ''}`}>
                    <input
                      type="checkbox"
                      className="cat-input"
                      checked={isOn}
                      onChange={() => onToggle && onToggle(g.id)}
                    />
                    <span className={`cat-box${isOn ? ' is-on' : ''}`} aria-hidden="true">
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5l2.5 2.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </span>
                    <span className="cat-label">{g.label}</span>
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
    </div>
  );
}
