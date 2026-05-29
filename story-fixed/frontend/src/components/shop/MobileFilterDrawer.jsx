// src/components/MobileFilterDrawer.jsx
// Slide-in mobile filter panel. Wraps the existing CategoryFilterSidebar
// (CATEGORY / BRAND / SIZE / PRICE) so the desktop sidebar and mobile
// drawer share one filter implementation — no duplicated section markup,
// no duplicated state.
//
// Drawer behaviour:
//   - Slides in from the left on a CSS transform (.3s ease)
//   - Backdrop fades in (.25s ease) and closes the drawer on click
//   - Body scroll locks while open; restored on close
//   - Escape key closes
//   - Sticky header (FILTERS title + close X)
//   - Scrollable body (filter sections)
//   - Sticky footer (CLEAR ALL + VIEW [N] PRODUCTS)
//   - Honours iOS safe-area insets at the bottom

import { useEffect } from 'react';
import CategoryFilterSidebar from './CategoryFilterSidebar.jsx';

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" strokeLinecap="square" />
    </svg>
  );
}

export default function MobileFilterDrawer({
  open,
  onClose,
  productCount = 0,
  onClearAll,
  // Pass-through props forwarded to the embedded CategoryFilterSidebar
  ...sidebarProps
}) {
  // Lock <body> scroll while the drawer is open so the page underneath
  // doesn't scroll along with the drawer's internal list.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape closes — common ergonomic for modal-style panels.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`filter-drawer-overlay${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`filter-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        aria-hidden={!open}
      >
        <header className="filter-drawer-head">
          <span className="filter-drawer-title">FILTERS</span>
          <button
            type="button"
            className="filter-drawer-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="filter-drawer-body">
          <CategoryFilterSidebar {...sidebarProps} />
        </div>

        <footer className="filter-drawer-foot">
          <button
            type="button"
            className="btn btn-w filter-drawer-clear"
            onClick={() => { if (onClearAll) onClearAll(); }}
          >
            CLEAR ALL
          </button>
          <button
            type="button"
            className="btn btn-k filter-drawer-apply"
            onClick={onClose}
          >
            {`VIEW ${productCount} PRODUCT${productCount !== 1 ? 'S' : ''}`}
          </button>
        </footer>
      </aside>
    </>
  );
}
