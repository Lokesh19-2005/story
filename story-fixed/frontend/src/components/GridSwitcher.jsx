// src/components/GridSwitcher.jsx
// Unified 3-segment monochrome pill that toggles between 2 / 3 / 4 column
// product grid layouts. Replaces three separate "2x / 3x / 4x" buttons with
// a single luxury control where each segment is an icon of vertical bars —
// visually communicating "more columns" without relying on text labels.

const COLUMNS = [2, 3, 4];

function ColumnsIcon({ n }) {
  // Each bar is 3px wide with 3px gap. Bars centred in a 16x14 canvas.
  const barW = 3;
  const gap  = 3;
  const totalW = n * barW + (n - 1) * gap;
  const offsetX = (16 - totalW) / 2;
  const bars = [];
  for (let i = 0; i < n; i++) {
    bars.push(
      <rect
        key={i}
        x={offsetX + i * (barW + gap)}
        y={1}
        width={barW}
        height={12}
        fill="currentColor"
      />
    );
  }
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
      {bars}
    </svg>
  );
}

export default function GridSwitcher({ cols, onChange, className = '' }) {
  return (
    <div
      className={`grid-sw${className ? ' ' + className : ''}`}
      role="group"
      aria-label="Product grid columns"
    >
      {COLUMNS.map(n => {
        const isActive = cols === n;
        return (
          <button
            key={n}
            type="button"
            className={`grid-sw-btn${isActive ? ' is-active' : ''}`}
            aria-label={`Show ${n} columns`}
            aria-pressed={isActive}
            onClick={() => { if (onChange) onChange(n); }}
          >
            <ColumnsIcon n={n} />
          </button>
        );
      })}
    </div>
  );
}
