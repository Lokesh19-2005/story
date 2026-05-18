// ProductCard — premium black & white, hover overlay quick add, badges
import { fp, pct } from '../utils.js';

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  if (!product) return null;

  const discount = pct(product.orig_price, product.price);
  const isNew    = !!product.tag && /new/i.test(String(product.tag));
  const isSale   = discount > 0;
  const isSoldOut = product.in_stock === 0 || product.sold_out === 1;

  // Tiny color preview row (max 4 dots)
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const dots   = colors.slice(0, 4);
  const more   = Math.max(0, colors.length - dots.length);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut) return;
    onQuickAdd && onQuickAdd(product.id);
  };

  return (
    <div className="pc" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}>
      <div className="pc-img">
        <span className="pc-icon">{product.icon || '\u25C9'}</span>

        {/* Badges */}
        <div className="pc-badges">
          {isNew && <span className="pc-badge pc-badge--new">NEW</span>}
          {isSale && <span className="pc-badge pc-badge--sale">-{discount}%</span>}
          {isSoldOut && <span className="pc-badge pc-badge--soldout">SOLD OUT</span>}
        </div>

        {/* Wishlist */}
        <button
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`pc-wish${isWish ? ' active' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleWish && onToggleWish(product.id); }}>
          {isWish ? '\u2665' : '\u2661'}
        </button>

        {/* Hover quick add overlay */}
        <div className="pc-overlay">
          <button
            type="button"
            className="pc-quickadd"
            disabled={isSoldOut}
            onClick={handleQuickAdd}>
            <span>{isSoldOut ? 'SOLD OUT' : 'QUICK ADD'}</span>
            {!isSoldOut && <span className="pc-quickadd-arrow">→</span>}
          </button>
        </div>
      </div>

      <div className="pc-body">
        <div className="pc-brand">{product.brand || ''}</div>
        <div className="pc-name" title={product.name}>{product.name || ''}</div>

        <div className="pc-price-row">
          <span className="pc-price">{fp(product.price)}</span>
          {isSale && <span className="pc-price-orig">{fp(product.orig_price)}</span>}
          {isSale && <span className="pc-price-save">SAVE {discount}%</span>}
        </div>

        {dots.length > 0 && (
          <div className="pc-colors" aria-label="available colors">
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
    </div>
  );
}
