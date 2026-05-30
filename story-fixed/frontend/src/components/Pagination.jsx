// src/components/Pagination.jsx
//
// Minimal monochrome editorial pagination. Renders nothing when there is
// only one page, so the shop grid never reflows for empty controls.
//
// Visual structure:
//
//   <-  PREV          01 / 04          NEXT  ->
//
// Below that, on roomier viewports, a numeric strip with windowing:
//
//   01 . 02 . 03 . 04 . . . 12
//
// Behaviour notes:
//   - Page indices are 1-based externally so the URL / display is human.
//   - `windowSize` controls how many numeric chips render around the
//     current page. The first and last are always pinned.
//   - When the active page is changed, the component scrolls the grid
//     back to the top of the shop layout so the user does not land mid-
//     page on the new product set. (Done by the parent via onChange.)
//   - Disabled state is reflected via aria-disabled + visually muted
//     styling; clicks become no-ops.

function buildPageList(total, current, windowSize = 1) {
  if (total <= 1) return [];
  const pages = new Set([1, total, current]);
  for (let i = 1; i <= windowSize; i++) {
    pages.add(current - i);
    pages.add(current + i);
  }
  const sorted = [...pages]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  // Insert ellipsis markers where page numbers are non-contiguous.
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('...');
    out.push(sorted[i]);
  }
  return out;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Pagination({
  page = 1,
  totalPages = 1,
  onChange,
  className = '',
}) {
  if (!Number.isFinite(totalPages) || totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, page), totalPages);
  const isFirst  = safePage <= 1;
  const isLast   = safePage >= totalPages;

  const go = (next) => {
    if (!onChange) return;
    const clamped = Math.min(Math.max(1, next), totalPages);
    if (clamped === safePage) return;
    onChange(clamped);
  };

  const items = buildPageList(totalPages, safePage, 1);

  return (
    <nav
      className={`pg${className ? ' ' + className : ''}`}
      role="navigation"
      aria-label="Product pages"
    >
      <button
        type="button"
        className="pg-step"
        aria-disabled={isFirst}
        disabled={isFirst}
        onClick={() => go(safePage - 1)}
      >
        <span className="pg-step-arrow" aria-hidden="true">{'\u2190'}</span>
        <span>PREV</span>
      </button>

      <div className="pg-mid">
        <span className="pg-counter">
          <span className="pg-counter-now">{pad(safePage)}</span>
          <span className="pg-counter-sep" aria-hidden="true">/</span>
          <span className="pg-counter-tot">{pad(totalPages)}</span>
        </span>

        <ul className="pg-list" role="list">
          {items.map((it, i) =>
            it === '...' ? (
              <li key={`gap-${i}`} className="pg-gap" aria-hidden="true">
                {'\u2022 \u2022 \u2022'}
              </li>
            ) : (
              <li key={it}>
                <button
                  type="button"
                  className={`pg-num${it === safePage ? ' is-active' : ''}`}
                  aria-current={it === safePage ? 'page' : undefined}
                  onClick={() => go(it)}
                >
                  {pad(it)}
                </button>
              </li>
            )
          )}
        </ul>
      </div>

      <button
        type="button"
        className="pg-step"
        aria-disabled={isLast}
        disabled={isLast}
        onClick={() => go(safePage + 1)}
      >
        <span>NEXT</span>
        <span className="pg-step-arrow" aria-hidden="true">{'\u2192'}</span>
      </button>
    </nav>
  );
}
