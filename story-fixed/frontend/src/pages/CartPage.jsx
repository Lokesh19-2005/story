// src/pages/CartPage.jsx
import { fp } from '../utils/format.js';
import EmptyState from '../components/feedback/EmptyState.jsx';

export default function CartPage({ cart, chQty, remCart, setPage, cTotal }) {
  if (cart.length === 0) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <EmptyState icon="◫" title="YOUR BAG IS EMPTY" subtitle="Add some products to get started." action="SHOP NOW →" onAction={()=>setPage('shop')} />
    </div>
  );

  return (
    <div className="cart-page" style={{ maxWidth:1100, margin:'0 auto', padding:'60px 40px' }}>
      <div className="cart-page-title" style={{ fontFamily:'var(--fm)', fontSize:'18px', letterSpacing:'.2em', marginBottom:40 }}>YOUR BAG</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:40 }}>
        {/* Items */}
        <div>
          {cart.map(item => (
            <div key={item.id} className="cart-item-row" style={{ display:'flex', gap:24, padding:'24px 0', borderBottom:'var(--bd)' }}>
              <div className="cart-item-img" style={{ width:100, height:120, background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:40, opacity:.18 }}>{item.icon||'\u25C9'}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.1em', color:'var(--warm)', marginBottom:4 }}>{item.brand || ''}</div>
                <div className="cart-item-name" style={{ fontFamily:'var(--fm)', fontSize:'10px', letterSpacing:'.05em', marginBottom:8 }}>{item.product_name}</div>
                <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', marginBottom:16 }}>
                  Size: {item.size} {'\u00B7'} Color: {item.color_name}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                  <div className="cart-item-qty" style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={()=>chQty(item.id, item.quantity-1)} aria-label="Decrease quantity" style={{ width:32,height:32,border:'var(--bd)',background:'none',cursor:'pointer' }}>{'\u2212'}</button>
                    <span style={{ fontFamily:'var(--fm)', fontSize:'10px', minWidth:24, textAlign:'center' }}>{item.quantity}</span>
                    <button onClick={()=>chQty(item.id, item.quantity+1)} aria-label="Increase quantity" style={{ width:32,height:32,border:'var(--bd)',background:'none',cursor:'pointer' }}>+</button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                    <span className="cart-item-price" style={{ fontFamily:'var(--fm)', fontSize:'12px', fontWeight:600 }}>{fp((item.price||0)*item.quantity)}</span>
                    <button onClick={()=>remCart(item.id)} aria-label={`Remove ${item.product_name}`} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:'var(--fm)',fontSize:'8px',color:'var(--warm)',letterSpacing:'.1em' }}>REMOVE</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-page-summary" style={{ background:'var(--off)', border:'var(--bd)', padding:28, alignSelf:'start', position:'sticky', top:80 }}>
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
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fm)', fontSize:'13px', letterSpacing:'.05em', fontWeight:600 }}>
              <span>Estimated Total</span>
              <span>{fp(cTotal())}</span>
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginTop:4 }}>
              {'Free shipping on orders above \u20B91,500'}
            </div>
          </div>
          <button className="btn btn-k" style={{ width:'100%' }} onClick={()=>setPage('checkout')}>{'PROCEED TO CHECKOUT \u2192'}</button>
          <button className="btn btn-w" style={{ width:'100%', marginTop:10 }} onClick={()=>setPage('shop')}>CONTINUE SHOPPING</button>
        </div>
      </div>
    </div>
  );
}
