// src/components/SortDropdown.jsx
// Premium monochrome sort dropdown — replaces the native <select> with a
// custom popover that matches the rest of STORY's luxury design language.
//
// Behaviour:
//   - Click button to toggle menu
//   - Click an option to apply + auto-close
//   - Outside click closes the menu
//   - Escape closes the menu
//   - Chevron rotates 180deg when open
//   - Menu fades in on mount
//   - aria-haspopup / aria-expanded / role=listbox + option for a11y

import { useEffect, useRef, useState } from 'react';

export default function SortDropdown({
  value,
  options = [],
  onChange,
  label = 'SORT BY',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const current = options.find(o => o.v === value) || options[0];

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`sort-dd${className ? ' ' + className : ''}`}>
      <button
        type="button"
        className={`sort-dd-btn${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span className="sort-dd-label">{label}</span>
        <span className="sort-dd-value">{current?.l || ''}</span>
        <span className={`sort-dd-chev${open ? ' is-open' : ''}`} aria-hidden="true">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </span>
      </button>

      {open && (
        <ul className="sort-dd-menu" role="listbox" aria-label={label}>
          {options.map(opt => {
            const isActive = opt.v === value;
            return (
              <li key={opt.v}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`sort-dd-opt${isActive ? ' is-active' : ''}`}
                  onClick={() => { if (onChange) onChange(opt.v); setOpen(false); }}
                >
                  <span>{opt.l}</span>
                  {isActive && (
                    <span className="sort-dd-tick" aria-hidden="true">
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5l2.5 2.5L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
