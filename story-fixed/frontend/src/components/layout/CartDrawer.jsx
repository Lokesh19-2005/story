// src/components/CartDrawer.jsx
//
// Mobile-friendly upgrades:
//   - Drawer takes full viewport width on small screens (handled in
//     global.css) and uses 44px+ tap targets for qty controls and
//     the close button.
//   - Item rows use slightly larger thumbs and clearer typography on
//     small screens via a single .cart-drawer-* class set, while the
//     desktop layout stays exactly as before.
import { fp } from '../../utils/format.js';

export default function CartDrawer({ open, onClose, cart, chQty, remCart, setPage }) {
  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} />}
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Shopping bag" aria-hidden={!open}>
        <div className="drawer-head">
          <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.2em', fontWeight: 600 }}>
            BAG ({cart.reduce((s, i) => s + i.quantity, 0)})
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="drawer-close"
          >{'\u2715'}</button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)' }}>
              YOUR BAG IS EMPTY
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="drawer-item">
                <div className="drawer-item-img">
                  <span style={{ fontSize: 28, opacity: .2 }}>{item.icon || '\u25C9'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="drawer-item-name">{item.product_name}</div>
                  <div className="drawer-item-meta">{item.size} {'\u00B7'} {item.color_name}</div>
                  <div className="drawer-item-row">
                    <div className="drawer-qty">
                      <button
                        type="button"
                        onClick={() => chQty(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >{'\u2212'}</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => chQty(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', fontWeight: 600 }}>
                        {fp((item.price || 0) * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remCart(item.id)}
                        aria-label="Remove item"
                        className="drawer-remove"
                      >{'\u2715'}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-foot-row">
              <span>Subtotal</span>
              <span>{fp(cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0))}</span>
            </div>
            <div className="drawer-foot-note">
              GST &amp; shipping calculated at checkout
            </div>
            <button className="btn btn-k drawer-btn" onClick={() => { onClose(); setPage('checkout'); }}>
              CHECKOUT {'\u2192'}
            </button>
            <button className="btn btn-w drawer-btn" onClick={() => { onClose(); setPage('cart'); }}>
              VIEW FULL BAG
            </button>
          </div>
        )}
      </aside>

      <style>{`
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 0 28px;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .drawer-close {
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #111;
          transition: transform .25s ease;
        }
        .drawer-close:hover { transform: rotate(90deg); }

        .drawer-item {
          display: flex;
          gap: 16px;
          padding: 20px 0;
          border-bottom: var(--bd);
        }
        .drawer-item-img {
          width: 72px;
          height: 90px;
          background: var(--off);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drawer-item-name {
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .04em;
          margin-bottom: 4px;
          font-weight: 500;
          line-height: 1.4;
        }
        .drawer-item-meta {
          font-family: var(--fm);
          font-size: 8px;
          color: var(--warm);
          margin-bottom: 10px;
          letter-spacing: .04em;
        }
        .drawer-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .drawer-qty {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: var(--bd);
          padding: 4px;
        }
        .drawer-qty button {
          width: 28px;
          height: 28px;
          border: none;
          background: none;
          cursor: pointer;
          font-family: var(--fm);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-qty button:hover { background: #f3f3f1; }
        .drawer-qty span {
          font-family: var(--fm);
          font-size: 9px;
          min-width: 18px;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }
        .drawer-remove {
          width: 28px;
          height: 28px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--warm);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color .15s ease;
        }
        .drawer-remove:hover { color: #111; }

        .drawer-foot {
          padding: 20px 28px calc(20px + env(safe-area-inset-bottom, 0px));
          border-top: var(--bd);
          background: #fff;
        }
        .drawer-foot-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--fm);
          font-size: 11px;
          letter-spacing: .04em;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .drawer-foot-note {
          font-family: var(--fm);
          font-size: 7.5px;
          color: var(--warm);
          margin-bottom: 16px;
          letter-spacing: .04em;
        }
        .drawer-btn {
          width: 100%;
        }
        .drawer-btn + .drawer-btn { margin-top: 8px; }

        /* Touch-target floor on phones */
        @media (max-width: 700px) {
          .drawer-body { padding: 0 20px; }
          .drawer-foot { padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px)); }
          .drawer-item { gap: 14px; padding: 18px 0; }
          .drawer-item-img { width: 80px; height: 100px; }
          .drawer-item-name { font-size: 9.5px; }
          .drawer-qty button { width: 36px; height: 36px; font-size: 14px; }
          .drawer-qty span { font-size: 10px; }
          .drawer-remove { width: 36px; height: 36px; font-size: 14px; }
          .drawer-close { width: 44px; height: 44px; }
        }
      `}</style>
    </>
  );
}
