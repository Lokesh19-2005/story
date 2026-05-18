// src/pages/ConfirmPage.jsx — PHASE 5: Order Success
import { fp } from '../utils.js';

export default function ConfirmPage({ order, setPage }) {
  if (!order) return null;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Success icon */}
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '24px' }}>
          ✓
        </div>

        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.25em', color: '#16a34a', marginBottom: 12 }}>ORDER CONFIRMED</div>
        <h1 style={{ fontFamily: 'var(--fs)', fontSize: '36px', fontWeight: 300, marginBottom: 12 }}>Thank You!</h1>
        <p style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.05em', color: 'var(--warm)', marginBottom: 32, lineHeight: 1.8 }}>
          Your order has been placed successfully.<br />
          You'll receive updates as your order progresses.
        </p>

        {/* Order summary box */}
        <div style={{ border: 'var(--bd)', padding: '24px 28px', background: 'var(--off)', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 16 }}>ORDER DETAILS</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: 'var(--warm)' }}>Order Number</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', fontWeight: 500 }}>{order.num}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: 'var(--warm)' }}>Items</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '9px' }}>{order.items} item{order.items !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: 'var(--warm)' }}>Payment</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: order.payMethod === 'cod' ? '#d97706' : '#16a34a' }}>
              {order.payMethod === 'cod' ? 'Cash on Delivery' : '✓ Paid Online'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: 'var(--bd)', paddingTop: 12, marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.08em' }}>Total</span>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '14px', letterSpacing: '.03em' }}>{fp(order.total)}</span>
          </div>
        </div>

        {/* Order timeline */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {['ORDER PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 3, background: i === 0 ? '#111' : '#e5e2d9', marginBottom: 6, borderRadius: 2 }} />
              <div style={{ fontFamily: 'var(--fm)', fontSize: '6px', letterSpacing: '.08em', color: i === 0 ? '#111' : 'var(--warm)', textAlign: 'center' }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-k" onClick={() => setPage('orders')}>VIEW MY ORDERS →</button>
          <button className="btn btn-w" onClick={() => setPage('shop')}>CONTINUE SHOPPING</button>
        </div>
      </div>
    </div>
  );
}
