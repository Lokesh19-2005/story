// ProductCard — luxury fashion ecommerce styling (preserves all functionality)
import { fp, pct } from '../utils.js';

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  if (!product) return null;

  const discount  = pct(product.orig_price, product.price);
  const isNew     = !!product.tag && /new/i.test(String(product.tag));
  const isSale    = discount > 0;
  const isSoldOut = product.in_stock === 0 || product.sold_out === 1;

  // Single priority badge for a clean luxury look
  const badge = isSoldOut
    ? { kind: 'soldout', label: 'SOLD OUT' }
    : isSale
      ? { kind: 'sale', label: `\u2212${discount}%` }
      : isNew
        ? { kind: 'new',  label: 'NEW' }
        : null;

  // Tiny color preview row (max 4 dots)
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const dots   = colors.slice(0, 4);
  const more   = Math.max(0, colors.length - dots.length);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut) return;
    onQuickAdd && onQuickAdd(product.id);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    onToggleWish && onToggleWish(product.id);
  };

  return (
    <article
      className="pc"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}
    >
      {/* Image / media */}
      <div className="pc-img">
        <div className="pc-img-inner">
          <span className="pc-icon">{product.icon || '\u25C9'}</span>
        </div>

        {/* Single priority badge (top-left, hairline) */}
        {badge && (
          <span className={`pc-badge pc-badge--${badge.kind}`}>{badge.label}</span>
        )}

        {/* Wishlist — minimal, top-right */}
        <button
          type="button"
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`pc-wish${isWish ? ' active' : ''}`}
          onClick={handleWish}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Hover quick-add bar */}
        <div className="pc-quick">
          <button
            type="button"
            className="pc-quick-btn"
            disabled={isSoldOut}
            onClick={handleQuickAdd}
          >
            {isSoldOut ? 'SOLD OUT' : 'QUICK ADD'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="pc-body">
        <div className="pc-brand">{product.brand || ''}</div>
        <h3 className="pc-name" title={product.name}>{product.name || ''}</h3>

        <div className="pc-price-row">
          <span className="pc-price">{fp(product.price)}</span>
          {isSale && <span className="pc-price-orig">{fp(product.orig_price)}</span>}
        </div>

        {dots.length > 0 && (
          <div className="pc-colors" aria-label={`${colors.length} colour${colors.length !== 1 ? 's' : ''} available`}>
            {dots.map((c, i) => (
              <span
                key={(c?.color_name || 'c') + i}
                className="pc-color-dot"
                title={c?.color_name || ''}
                style={{ background: c?.color_hex || '#000' }}
              />
            ))}
            {more > 0 && <span className="pc-colors-more">+{more}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
