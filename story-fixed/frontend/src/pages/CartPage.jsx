// src/pages/CartPage.jsx
import { fp } from '../utils.js';
import EmptyState from '../components/EmptyState.jsx';
import { useCartStock } from '../hooks/useCartStock.js';
import ProductImage from '../components/ProductImage.jsx';

export default function CartPage({ cart, chQty, remCart, setPage, cTotal }) {
  const { stockByLineId, statusByLineId, hasIssues, issues, loading } = useCartStock(cart);

  if (cart.length === 0) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <EmptyState icon="◫" title="YOUR BAG IS EMPTY" subtitle="Add some products to get started." action="SHOP NOW →" onAction={()=>setPage('shop')} />
    </div>
  );

  const blocking = issues.length;

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 40px' }}>
      <div style={{ fontFamily:'var(--fm)', fontSize:'18px', letterSpacing:'.2em', marginBottom:40 }}>YOUR BAG</div>

      {hasIssues && (
        <div className="checkout-stock-warn checkout-stock-warn--err" style={{ marginBottom: 24 }}>
          <span className="checkout-stock-warn-icon">!</span>
          <span>
            {blocking === 1 ? '1 item' : `${blocking} items`} in your bag {blocking === 1 ? 'has' : 'have'} a stock issue.
            Please update or remove {blocking === 1 ? 'it' : 'them'} to continue.
          </span>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:40 }} className="cart-grid">
        {/* Items */}
        <div>
          {cart.map(item => {
            const stock  = stockByLineId[item.id];
            const status = statusByLineId[item.id];
            const isOOS  = status === 'oos';
            const isOver = status === 'over';
            const isLow  = status === 'low';
            const blocked = isOOS || isOver;
            const cap = (typeof stock === 'number' && stock !== Infinity) ? stock : null;
            const canIncrease = !blocked && (cap === null || item.quantity < cap);
            const canDecrease = item.quantity > 1;

            return (
              <div key={item.id} className={blocked ? 'cart-line-blocked' : ''}
                style={{ display:'flex', gap:24, padding:'24px 0', borderBottom:'var(--bd)' }}>
                <div className="cart-line-thumb"
                  style={{ width:100, height:120, background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative', overflow:'hidden' }}>
                  <ProductImage product={item} alt={item.product_name} fallbackIcon={item.icon||'◉'} />
                  {isOOS && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.66)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.25em', fontWeight:700, color:'#111', background:'#fff', border:'1px solid #111', padding:'5px 8px' }}>SOLD OUT</span>
                    </div>
                  )}
                </div>
                <div style={{ flex:1, minWidth: 0 }}>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.1em', color:'var(--warm)', marginBottom:4 }}>{item.brand || ''}</div>
                  <div className="cart-line-name" style={{ fontFamily:'var(--fm)', fontSize:'10px', letterSpacing:'.05em', marginBottom:8 }}>{item.product_name}</div>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', marginBottom:8 }}>
                    Size: {item.size} · Color: {item.color_name}
                  </div>

                  {isOOS && (
                    <div className="cart-stock-badge cart-stock-badge--oos">
                      <span className="cart-stock-dot" aria-hidden="true" /> OUT OF STOCK
                    </div>
                  )}
                  {isOver && (
                    <div className="cart-stock-badge cart-stock-badge--over">
                      <span className="cart-stock-dot" aria-hidden="true" /> ONLY {cap} AVAILABLE
                    </div>
                  )}
                  {isLow && (
                    <div className="cart-stock-badge cart-stock-badge--low">
                      <span className="cart-stock-dot" aria-hidden="true" /> ONLY {cap} LEFT
                    </div>
                  )}

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button
                        onClick={() => canDecrease && chQty(item.id, item.quantity-1)}
                        disabled={!canDecrease}
                        className={!canDecrease ? 'qty-btn-disabled' : ''}
                        aria-label="Decrease quantity"
                        style={{ width:32,height:32,border:'var(--bd)',background:'none',cursor: canDecrease ? 'pointer' : 'not-allowed' }}>−</button>
                      <span style={{ fontFamily:'var(--fm)', fontSize:'10px', minWidth:24, textAlign:'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => canIncrease && chQty(item.id, item.quantity+1)}
                        disabled={!canIncrease}
                        className={!canIncrease ? 'qty-btn-disabled' : ''}
                        aria-label="Increase quantity"
                        style={{ width:32,height:32,border:'var(--bd)',background:'none',cursor: canIncrease ? 'pointer' : 'not-allowed' }}>+</button>
                      {cap !== null && !isOOS && (
                        <span style={{ fontFamily:'var(--fm)', fontSize:'7.5px', letterSpacing:'.1em', color:'var(--warm)', marginLeft: 4 }}>
                          MAX {cap}
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                      <span className="cart-line-price" style={{ fontFamily:'var(--fm)', fontSize:'12px' }}>{fp((item.price||0)*item.quantity)}</span>
                      <button onClick={()=>remCart(item.id)} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:'var(--fm)',fontSize:'8px',color:'var(--warm)',letterSpacing:'.1em' }}>REMOVE</button>
                    </div>
                  </div>

                  {isOver && (
                    <button
                      onClick={() => chQty(item.id, cap)}
                      style={{ marginTop:10, background:'none', border:'none', padding:0, fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.14em', color:'#111', textDecoration:'underline', cursor:'pointer' }}>
                      UPDATE QUANTITY TO {cap}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ background:'var(--off)', border:'var(--bd)', padding:28, alignSelf:'start', position:'sticky', top:80 }} className="checkout-sidebar">
          <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.2em', marginBottom:20 }}>ORDER SUMMARY</div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.05em', marginBottom:8 }}>
            <span>Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
            <span>{fp(cTotal())}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.05em', color:'var(--warm)', marginBottom:8 }}>
            <span>Shipping</span><span>Calculated at checkout</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.05em', color:'var(--warm)', marginBottom:16 }}>
            <span>GST (18%)</span><span>Included at checkout</span>
          </div>
          <div style={{ borderTop:'var(--bd)', paddingTop:16, marginBottom:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'13px', letterSpacing:'.05em' }}>
              <span>Estimated Total</span>
              <span>{fp(cTotal())}</span>
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginTop:4 }}>
              Free shipping on orders above ₹1,500
            </div>
          </div>
          <button
            className="btn btn-k"
            style={{ width:'100%' }}
            disabled={hasIssues || loading}
            onClick={()=>setPage('checkout')}
          >
            {hasIssues ? 'RESOLVE STOCK ISSUES' : 'PROCEED TO CHECKOUT →'}
          </button>
          <button className="btn btn-w" style={{ width:'100%', marginTop:10 }} onClick={()=>setPage('shop')}>CONTINUE SHOPPING</button>
        </div>
      </div>
    </div>
  );
}
