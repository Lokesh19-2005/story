// src/components/CategoryTabs.jsx
// Premium top-category tab rail for the STORY product section.
// Monochrome luxury styling, animated active underline, horizontal scroll
// on narrow viewports, fully keyboard accessible.

import { CATEGORY_TABS } from '../../utils/categoryTabs.js';

export default function CategoryTabs({
  value = 'all',
  onChange,
  tabs = CATEGORY_TABS,
  className = '',
}) {
  return (
    <div className={`cat-tabs${className ? ' ' + className : ''}`} role="tablist" aria-label="Product categories">
      {tabs.map(t => {
        const isActive = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={`cat-tab${isActive ? ' is-active' : ''}`}
            onClick={() => { if (!isActive && onChange) onChange(t.id); }}
          >
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
