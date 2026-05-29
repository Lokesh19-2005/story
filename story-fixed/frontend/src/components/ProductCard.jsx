// ProductCard — premium luxury monochrome card with real-image rendering,
// hover image swap, NEW / SALE / GENUINE badges, circular wishlist button,
// and smooth hover micro-interactions. The exported component signature is
// unchanged so all existing callsites (ShopPage, HomePage, DetailPage related)
// keep working.
import { fp, pct } from '../utils.js';
import SmartImage from './SmartImage.jsx';
import { getPrimaryImage, getHoverImage } from '../utils/productImages.js';
import { motion, useReducedMotion, LUX_EASE } from './motion/Motion.jsx';

// Heart glyph — outlined by default, filled when wished. Feather-style path
// that reads cleanly at small sizes.
function HeartIcon({ filled }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1.5 4.7 l2.1 2.1 4-4" />
    </svg>
  );
}

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  const reduce = useReducedMotion();

  const discount  = pct(product?.orig_price, product?.price);
  const primary   = getPrimaryImage(product, 600);
  const secondary = getHoverImage(product, 600);
  const altText   = `${product?.brand || ''} ${product?.name || ''}`.trim() || 'Product image';

  // Derived flags
  const tagUpper  = (product?.tag || '').toString().toUpperCase().trim();
  const isNew     = tagUpper === 'NEW';
  const isSale    = discount > 0;
  // Any non-NEW custom tag (e.g. EXCLUSIVE, BESTSELLER) — preserves the
  // pre-existing single-tag behaviour without doubling up with the NEW badge.
  const otherTag  = !isNew && tagUpper ? tagUpper : null;

  return (
    <motion.div
      className="pc"
      onClick={onClick}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.4, ease: LUX_EASE }}
    >
      <div className="pc-img">
        <SmartImage
          src={primary}
          hoverSrc={secondary}
          alt={altText}
          aspectRatio="3/4"
          fallbackIcon={product?.icon || '\u25C9'}
        />

        {/* Top-left badge stack — NEW + SALE may both apply */}
        {(isNew || isSale || otherTag) && (
          <div className="pc-badges" aria-hidden="true">
            {isNew && <span className="pc-badge pc-badge-new">NEW</span>}
            {isSale && (
              <span className="pc-badge pc-badge-sale">
                <span>SALE</span>
                <span className="pc-badge-pct">{`\u2212${discount}%`}</span>
              </span>
            )}
            {otherTag && <span className="pc-badge pc-badge-tag">{otherTag}</span>}
          </div>
        )}

        {/* Wishlist (top-right, circular, hover-scaled) */}
        <button
          type="button"
          className={`pc-wish${isWish ? ' is-on' : ''}`}
          onClick={e => { e.stopPropagation(); if (onToggleWish) onToggleWish(product?.id); }}
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={!!isWish}
        >
          <HeartIcon filled={!!isWish} />
        </button>

        {/* GENUINE wordmark — bottom-left, revealed on hover. STORY's
            authenticity promise applies to every product. */}
        <div className="pc-genuine" aria-label="Authenticity guaranteed">
          <CheckIcon />
          <span>GENUINE</span>
        </div>
      </div>

      <div className="pc-body">
        <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.15em', color:'#888', marginBottom:4, fontWeight:600 }}>
          {product?.brand || ''}
        </div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'10px', letterSpacing:'.03em', marginBottom:10, fontWeight:500 }}>
          {product?.name || ''}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <span style={{ fontFamily:'var(--fm)', fontSize:'12px', letterSpacing:'.02em', fontWeight:600 }}>
            {fp(product?.price)}
          </span>
          {isSale && (
            <span style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'#999', textDecoration:'line-through' }}>
              {fp(product?.orig_price)}
            </span>
          )}
        </div>
        <button
          className="btn btn-k pc-quick"
          onClick={e => { e.stopPropagation(); if (onQuickAdd) onQuickAdd(product?.id); }}
        >
          QUICK ADD
        </button>
      </div>
    </motion.div>
  );
}
