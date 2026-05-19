// ProductCard — clean black & white card with real-image rendering + hover swap
import { fp, pct } from '../utils.js';
import SmartImage from './SmartImage.jsx';
import { getPrimaryImage, getHoverImage } from '../utils/productImages.js';

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  const discount  = pct(product.orig_price, product.price);
  const primary   = getPrimaryImage(product, 600);
  const secondary = getHoverImage(product, 600);
  const altText   = `${product.brand || ''} ${product.name || ''}`.trim() || 'Product image';

  return (
    <div className="pc" onClick={onClick}>
      <div className="pc-img">
        <SmartImage
          src={primary}
          hoverSrc={secondary}
          alt={altText}
          aspectRatio="3/4"
          fallbackIcon={product.icon || '\u25C9'}
        />

        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWish && onToggleWish(product.id); }}
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,.92)', border: 'none',
            width: 30, height: 30, borderRadius: '50%',
            cursor: 'pointer', fontSize: '14px',
            opacity: isWish ? 1 : .85, lineHeight: 1, color: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,.08)',
            zIndex: 2,
          }}>
          {isWish ? '\u2665' : '\u2661'}
        </button>

        {product.tag && (
          <div className="pc-tag" style={{ zIndex: 2 }}>{product.tag}</div>
        )}
        {discount > 0 && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 2,
            background: '#111', color: '#fff', fontFamily: 'var(--fm)',
            fontSize: '7px', letterSpacing: '.1em',
            padding: '4px 10px', fontWeight: 700,
          }}>
            -{discount}%
          </div>
        )}
      </div>

      <div className="pc-body">
        <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.15em', color:'#888', marginBottom:4, fontWeight:600 }}>{product.brand}</div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'10px', letterSpacing:'.03em', marginBottom:10, fontWeight:500 }}>{product.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <span style={{ fontFamily:'var(--fm)', fontSize:'12px', letterSpacing:'.02em', fontWeight:600 }}>{fp(product.price)}</span>
          {discount > 0 && <span style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'#999', textDecoration:'line-through' }}>{fp(product.orig_price)}</span>}
        </div>
        <button
          className="btn btn-k"
          style={{ width:'100%', fontSize:'7.5px', padding:'11px', letterSpacing:'.2em' }}
          onClick={e => { e.stopPropagation(); onQuickAdd && onQuickAdd(product.id); }}>
          QUICK ADD
        </button>
      </div>
    </div>
  );
}
