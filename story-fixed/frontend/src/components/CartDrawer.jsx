// src/components/CartDrawer.jsx
import { fp } from '../utils.js';
import { useCartStock } from '../hooks/useCartStock.js';
import ProductImage from './ProductImage.jsx';

export default function CartDrawer({ open, onClose, cart, chQty, remCart, setPage, cTotal, toast }) {
  const { stockByLineId, statusByLineId, hasIssues, issues } = useCartStock(cart);
  const blocking = issues.length;

  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em' }}>BAG ({cart.reduce((s,i)=>s+i.quantity,0)})</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'16px' }} aria-label="Close cart">✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0 28px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', color:'var(--warm)' }}>
              YOUR BAG IS EMPTY
            </div>
          ) : (
            <>
              {hasIssues && (
                <div className="checkout-stock-warn checkout-stock-warn--err" style={{ margin: '14px 0 4px' }}>
                  <span className="checkout-stock-warn-icon">!</span>
                  <span>
                    {blocking === 1 ? '1 item' : `${blocking} items`} in your bag {blocking === 1 ? 'has' : 'have'} a stock issue.
                    Please review before checking out.
                  </span>
                </div>
              )}

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
                    style={{ display:'flex', gap:16, padding:'20px 0', borderBottom:'var(--bd)' }}>
                    <div className="cart-line-thumb"
                      style={{ width:64, height:80, background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative', overflow:'hidden' }}>
                      <ProductImage product={item} alt={item.product_name} fallbackIcon={item.icon || '◉'} />
                      {isOOS && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.66)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.2em', fontWeight:700, color:'#111', background:'#fff', border:'1px solid #111', padding:'3px 6px' }}>SOLD OUT</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth: 0 }}>
                      <div className="cart-line-name" style={{ fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.05em', marginBottom:4 }}>{item.product_name}</div>
                      <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginBottom:6 }}>
                        {item.size} · {item.color_name}
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

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <button
                            onClick={() => canDecrease && chQty(item.id, item.quantity-1)}
                            disabled={!canDecrease}
                            className={!canDecrease ? 'qty-btn-disabled' : ''}
                            aria-label="Decrease quantity"
                            style={{ width:24,height:24,border:'var(--bd)',background:'none',cursor: canDecrease ? 'pointer' : 'not-allowed',fontFamily:'var(--fm)' }}>−</button>
                          <span style={{ fontFamily:'var(--fm)', fontSize:'9px', minWidth:16, textAlign:'center' }}>{item.quantity}</span>
                          <button
                            onClick={() => canIncrease && chQty(item.id, item.quantity+1)}
                            disabled={!canIncrease}
                            className={!canIncrease ? 'qty-btn-disabled' : ''}
                            aria-label="Increase quantity"
                            style={{ width:24,height:24,border:'var(--bd)',background:'none',cursor: canIncrease ? 'pointer' : 'not-allowed',fontFamily:'var(--fm)' }}>+</button>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <span className="cart-line-price" style={{ fontFamily:'var(--fm)', fontSize:'9px' }}>{fp((item.price||0)*item.quantity)}</span>
                          <button onClick={() => remCart(item.id)} aria-label="Remove" style={{ background:'none',border:'none',cursor:'pointer',color:'var(--warm)',fontSize:'12px' }}>✕</button>
                        </div>
                      </div>

                      {isOver && (
                        <button
                          onClick={() => chQty(item.id, cap)}
                          style={{ marginTop:8, background:'none', border:'none', padding:0, fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.12em', color:'#111', textDecoration:'underline', cursor:'pointer' }}>
                          UPDATE TO {cap}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding:'20px 28px', borderTop:'var(--bd)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'10px', letterSpacing:'.05em', marginBottom:6 }}>
              <span>Subtotal</span><span>{fp(cTotal())}</span>
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginBottom:16 }}>
              GST & shipping calculated at checkout
            </div>
            <button
              className="btn btn-k"
              style={{ width:'100%' }}
              disabled={hasIssues}
              onClick={() => { onClose(); setPage('checkout'); }}
            >
              {hasIssues ? 'RESOLVE ISSUES TO CHECKOUT' : 'CHECKOUT →'}
            </button>
            <button className="btn btn-w" style={{ width:'100%', marginTop:8 }} onClick={() => { onClose(); setPage('cart'); }}>
              VIEW FULL BAG
            </button>
          </div>
        )}
      </div>
    </>
  );
}
