// ProductCard — clean black & white card
import { fp, pct } from '../utils.js';

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  const discount = pct(product.orig_price, product.price);
  return (
    <div className="pc" onClick={onClick}>
      <div className="pc-img">
        <span className="pc-icon">{product.icon || '◉'}</span>
        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); onToggleWish && onToggleWish(product.id); }}
          style={{ position:'absolute', top:12, right:12, background:'none', border:'none', cursor:'pointer', fontSize:'18px', opacity: isWish ? 1 : .4, lineHeight:1, color:'#111' }}>
          {isWish ? '♥' : '♡'}
        </button>
      </div>
      {product.tag && <div className="pc-tag">{product.tag}</div>}
      {discount > 0 && (
        <div style={{ position:'absolute', top:12, left:12, background:'#111', color:'#fff', fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.1em', padding:'4px 10px', fontWeight:700 }}>
          -{discount}%
        </div>
      )}
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
