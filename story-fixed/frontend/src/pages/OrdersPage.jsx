// src/pages/OrdersPage.jsx — Order History with Cancel Flow
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api.js';
import { fp } from '../utils.js';
import EmptyState from '../components/EmptyState.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_COLORS = {
  placed:    { background: '#fef9c3', color: '#92400e' },
  confirmed: { background: '#dbeafe', color: '#1e40af' },
  shipped:   { background: '#ede9fe', color: '#5b21b6' },
  delivered: { background: '#dcfce7', color: '#166534' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};
const PAY_COLORS = {
  paid:        '#16a34a',
  pending:     '#92400e',
  awaiting:    '#1e40af',
  cod_pending: '#d97706',
  failed:      '#dc2626',
};

export default function OrdersPage({ setPage, initialOrderId, toast }) {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]   = useState(null);
  const [detLoading, setDetLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const t = toast || (() => {});

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    ordersAPI.list()
      .then(d => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (initialOrderId && orders.length) {
      const o = orders.find(x => x.id === initialOrderId);
      if (o) viewDetail(o.id);
    }
  }, [initialOrderId, orders]);

  const viewDetail = async (id) => {
    setSelected(id);
    setDetLoading(true);
    setConfirmCancel(false);
    try {
      const d = await ordersAPI.detail(id);
      setDetail(d.order);
    } catch {} finally { setDetLoading(false); }
  };

  const handleCancel = async () => {
    if (!detail) return;
    setCancelling(true);
    try {
      const d = await ordersAPI.cancel(detail.id);
      setDetail(d.order);
      setOrders(prev => prev.map(o => o.id === d.order.id ? { ...o, order_status: 'cancelled' } : o));
      t('Order cancelled successfully', 'info');
      setConfirmCancel(false);
    } catch (e) {
      t(e?.message || 'Could not cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoggedIn) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState icon="◫" title="SIGN IN TO VIEW ORDERS" subtitle="Your order history is linked to your account."
        action="SIGN IN →" onAction={() => setPage('auth')} />
    </div>
  );

  if (loading) return <LoadingScreen message="LOADING ORDERS..." />;

  const canCancel = detail && ['placed', 'confirmed'].includes(detail.order_status);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
      <div style={{ fontFamily: 'var(--fm)', fontSize: '18px', letterSpacing: '.2em', marginBottom: 40 }}>MY ORDERS</div>

      {orders.length === 0 ? (
        <EmptyState icon="◫" title="NO ORDERS YET" subtitle="Start shopping to see your orders here."
          action="SHOP NOW →" onAction={() => setPage('shop')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: 24 }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(o => {
              const sc = STATUS_COLORS[o.order_status] || STATUS_COLORS.placed;
              return (
                <div key={o.id} onClick={() => viewDetail(o.id)}
                  style={{ border: selected === o.id ? '1.5px solid #111' : 'var(--bd)', padding: 20, cursor: 'pointer', background: '#fff', transition: 'border .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '.12em' }}>{o.order_number}</div>
                    <span style={{ ...sc, fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.1em', padding: '3px 10px' }}>
                      {o.order_status?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: 'var(--warm)', marginBottom: 10 }}>
                    {new Date(o.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}{o.item_count || (o.items?.length) || 0} item(s)
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '12px' }}>{fp(Number(o.total))}</span>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.08em', color: PAY_COLORS[o.payment_status] || '#111' }}>
                      {o.payment_status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ border: 'var(--bd)', padding: 28, background: '#fff', position: 'sticky', top: 80, alignSelf: 'start', maxHeight: '85vh', overflowY: 'auto' }}>
              {detLoading ? (
                <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)' }}>LOADING...</div>
              ) : detail ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '11px', letterSpacing: '.12em' }}>{detail.order_number}</div>
                    <button onClick={() => { setSelected(null); setDetail(null); setConfirmCancel(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                  </div>

                  {/* Status timeline */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                    {['placed', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                      const cur = detail.order_status === 'cancelled' ? -1 : ['placed', 'confirmed', 'shipped', 'delivered'].indexOf(detail.order_status);
                      const done = i <= cur && detail.order_status !== 'cancelled';
                      return (
                        <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ height: 3, background: done ? '#111' : detail.order_status === 'cancelled' ? '#dc2626' : '#e5e2d9', marginBottom: 6, borderRadius: 2 }} />
                          <div style={{ fontFamily: 'var(--fm)', fontSize: '6px', letterSpacing: '.08em', color: done ? '#111' : 'var(--warm)' }}>{s.toUpperCase()}</div>
                        </div>
                      );
                    })}
                  </div>

                  {detail.order_status === 'cancelled' && (
                    <div style={{ padding: '10px 14px', background: '#fee2e2', fontFamily: 'var(--fm)', fontSize: '8px', color: '#991b1b', marginBottom: 16, letterSpacing: '.05em' }}>
                      ✕ This order has been cancelled. Stock has been restored.
                    </div>
                  )}

                  {/* Items */}
                  <div style={{ borderTop: 'var(--bd)', paddingTop: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.15em', color: 'var(--warm)', marginBottom: 12 }}>ITEMS</div>
                    {(detail.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px' }}>{item.product_name}</div>
                          <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: 'var(--warm)', marginTop: 2 }}>
                            {item.size} · {item.color_name} · Qty {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px' }}>{fp(Number(item.total_price))}</div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address */}
                  {detail.delivery_name && (
                    <div style={{ background: 'var(--off)', padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.1em', color: 'var(--warm)', marginBottom: 6 }}>DELIVER TO</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', lineHeight: 1.8 }}>
                        {detail.delivery_name}<br />
                        {detail.delivery_line1}{detail.delivery_line2 ? `, ${detail.delivery_line2}` : ''}<br />
                        {detail.delivery_city}{detail.delivery_state ? `, ${detail.delivery_state}` : ''} — {detail.delivery_pincode}
                      </div>
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div style={{ borderTop: 'var(--bd)', paddingTop: 12 }}>
                    {[
                      ['Subtotal', fp(Number(detail.subtotal))],
                      ...(Number(detail.discount_amount) > 0 ? [[`Coupon (${detail.coupon_code})`, `−${fp(Number(detail.discount_amount))}`]] : []),
                      ['GST (18%)', fp(Number(detail.gst_amount))],
                      ['Shipping', Number(detail.shipping_cost) === 0 ? 'Free' : fp(Number(detail.shipping_cost))],
                      ...(Number(detail.cod_fee) > 0 ? [['COD Fee', fp(Number(detail.cod_fee))]] : []),
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: '8px', marginBottom: 6,
                        color: k.startsWith('Coupon') ? '#16a34a' : 'inherit' }}>
                        <span style={{ color: k.startsWith('Coupon') ? '#16a34a' : 'var(--warm)' }}>{k}</span><span>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: '13px', borderTop: 'var(--bd)', paddingTop: 12, marginTop: 6 }}>
                      <span>Total</span><span>{fp(Number(detail.total))}</span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {canCancel && !confirmCancel && (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      style={{ width: '100%', marginTop: 20, padding: '12px', border: '1px solid #dc2626', background: 'transparent', color: '#dc2626', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.12em', cursor: 'pointer' }}>
                      CANCEL ORDER
                    </button>
                  )}

                  {/* Confirm cancel dialog */}
                  {confirmCancel && (
                    <div style={{ marginTop: 20, padding: 16, background: '#fff7f7', border: '1px solid #fecaca' }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', marginBottom: 12, color: '#991b1b', letterSpacing: '.05em' }}>
                        Are you sure you want to cancel this order? This action cannot be undone.
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          style={{ flex: 1, padding: '10px', background: '#dc2626', color: '#fff', border: 'none', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.1em', cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1 }}>
                          {cancelling ? 'CANCELLING...' : 'YES, CANCEL'}
                        </button>
                        <button
                          onClick={() => setConfirmCancel(false)}
                          disabled={cancelling}
                          style={{ flex: 1, padding: '10px', background: 'transparent', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.1em', cursor: 'pointer' }}>
                          KEEP ORDER
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
