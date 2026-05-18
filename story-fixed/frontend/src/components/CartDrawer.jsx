// src/components/CartDrawer.jsx
import { fp } from '../utils.js';

export default function CartDrawer({ open, onClose, cart, chQty, remCart, setPage, cTotal, toast }) {
  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="drawer-head">
          <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em' }}>BAG ({cart.reduce((s,i)=>s+i.quantity,0)})</span>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'16px' }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0 28px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', color:'var(--warm)' }}>
              YOUR BAG IS EMPTY
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display:'flex', gap:16, padding:'20px 0', borderBottom:'var(--bd)' }}>
                <div style={{ width:64, height:80, background:'var(--off)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:28, opacity:.2 }}>{item.icon || '◉'}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.05em', marginBottom:4 }}>{item.product_name}</div>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginBottom:10 }}>
                    {item.size} · {item.color_name}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <button onClick={() => chQty(item.id, item.quantity-1)} style={{ width:24,height:24,border:'var(--bd)',background:'none',cursor:'pointer',fontFamily:'var(--fm)' }}>−</button>
                      <span style={{ fontFamily:'var(--fm)', fontSize:'9px', minWidth:16, textAlign:'center' }}>{item.quantity}</span>
                      <button onClick={() => chQty(item.id, item.quantity+1)} style={{ width:24,height:24,border:'var(--bd)',background:'none',cursor:'pointer',fontFamily:'var(--fm)' }}>+</button>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontFamily:'var(--fm)', fontSize:'9px' }}>{fp((item.price||0)*item.quantity)}</span>
                      <button onClick={() => remCart(item.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--warm)',fontSize:'12px' }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
            <button className="btn btn-k" style={{ width:'100%' }} onClick={() => { onClose(); setPage('checkout'); }}>
              CHECKOUT →
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
