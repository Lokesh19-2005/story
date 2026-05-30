// src/components/EmptyState.jsx
//
// Editorial luxury empty state. Replaces the previous big-icon centred
// block (which created huge blank zones on the shop grid when no products
// matched) with a compact, monochrome, vertically balanced composition:
//
//   ── eyebrow rule ──
//      LUXURY DISPLAY HEADLINE
//      one-line italic editorial subtitle
//        → MINIMAL TEXT ACTION
//   ── eyebrow rule ──
//
// The component prop contract is kept identical (icon / title / subtitle /
// action / onAction) so every existing callsite (ShopPage error + empty
// branches) keeps working unchanged. The `icon` prop is now ignored —
// editorial empty states do not use icons.

export default function EmptyState({
  /* icon prop is intentionally ignored — kept in signature for back-compat */
  // eslint-disable-next-line no-unused-vars
  icon,
  title,
  subtitle,
  action,
  onAction,
  hint = 'NO RESULTS',
}) {
  return (
    <div className="es-block" role="status" aria-live="polite">
      <span className="es-rule" aria-hidden="true" />
      <p className="es-eyebrow">{hint}</p>
      <h3 className="es-title">{title}</h3>
      {subtitle && <p className="es-sub">{subtitle}</p>}
      {action && (
        <button type="button" className="es-action" onClick={onAction}>
          <span>{action}</span>
          <span aria-hidden="true" className="es-action-arrow">{'\u2192'}</span>
        </button>
      )}
      <span className="es-rule" aria-hidden="true" />
    </div>
  );
}
