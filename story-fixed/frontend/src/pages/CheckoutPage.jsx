// src/pages/CheckoutPage.jsx — FIXED: typing bug + robust Razorpay
import { useState } from 'react';
import { ordersAPI, couponAPI, paymentAPI } from '../services/api.js';
import { fp } from '../utils.js';
import { useAuth } from '../context/AuthContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

const GST_RATE = 0.18;
const SHIPPING = { standard: 99, express: 199, sameday: 299 };

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

// ── Must be outside the parent — if inside, inputs lose focus on every keystroke
function InputField({ label, value, onChange, placeholder, type = 'text', required = false, fullWidth = false, readOnly = false }) {
  return (
    <div
      className={fullWidth ? 'checkout-form-half' : undefined}
      style={fullWidth ? { gridColumn: '1 / -1' } : {}}
    >
      <label className="fl2">{label}{required && ' *'}</label>
      <input
        className="fi2"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={readOnly ? { opacity: 0.6 } : {}}
      />
    </div>
  );
}

// Dynamically loads the Razorpay checkout script if not already present
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage({ cart, cTotal, setPage, clearCart, onPlaceOrder, toast }) {
  const { isLoggedIn } = useAuth();
  const t = toast || (() => {});

  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState({
    name: '', phone: '', email: '',
    line1: '', line2: '', city: '', state: 'Telangana', pincode: '',
  });
  const [shipping, setShipping]     = useState('standard');
  const [payMethod, setPayMethod]   = useState('online');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon]         = useState(null);
  const [couponErr, setCouponErr]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [placing, setPlacing]       = useState(false);
  const [err, setErr]               = useState('');

  const handleField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  if (!isLoggedIn) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState icon="◎" title="SIGN IN TO CHECKOUT"
        subtitle="Please sign in to complete your purchase."
        action="SIGN IN →" onAction={() => setPage('auth')} />
    </div>
  );

  if (!cart.length) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState icon="◫" title="YOUR BAG IS EMPTY"
        action="SHOP NOW →" onAction={() => setPage('shop')} />
    </div>
  );

  // ── Pricing
  const subtotal = cTotal();
  const discount = coupon?.discount_amount || 0;
  const taxable  = subtotal - discount;
  const gst      = Math.round(taxable * GST_RATE * 100) / 100;
  const shipCost = subtotal >= 1500 && shipping === 'standard' ? 0 : SHIPPING[shipping];
  const codFee   = payMethod === 'cod' ? 50 : 0;
  const total    = Math.round((taxable + gst + shipCost + codFee) * 100) / 100;

  // ── Coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponErr('');
    setCouponLoading(true);
    try {
      const d = await couponAPI.apply(couponCode.trim(), subtotal);
      setCoupon(d.coupon);
      t(`Coupon applied! You save ${fp(d.coupon.discount_amount)}`, 'success');
    } catch (e) {
      setCouponErr(e.message);
      setCoupon(null);
      t(e.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Validation
  const validateAddress = () => {
    if (!form.name.trim())  return 'Full name is required';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) return 'Enter a valid 10-digit phone number';
    if (!form.line1.trim()) return 'Address Line 1 is required';
    if (!form.city.trim())  return 'City is required';
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit pincode';
    return null;
  };

  // ── Razorpay (handles both real keys and mock/dev mode)
  const placeOnline = async (orderId) => {
    // 1. Ask backend to create a Razorpay order
    const { key, mock, order: rzpOrder } = await paymentAPI.createOrder({
      amount: total,
      receipt: orderId,
    });

    // 2. Mock mode — no real Razorpay keys configured on backend
    if (mock) {
      await paymentAPI.verify({
        razorpay_order_id:   rzpOrder.id,
        razorpay_payment_id: `mock_pay_${Date.now()}`,
        razorpay_signature:  'mock_signature',
        order_id: orderId,
      });
      return; // Done — treat as success
    }

    // 3. Real mode — load SDK and open checkout popup
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error('Could not load Razorpay. Please check your internet connection.');

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key,
        amount:   rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        order_id: rzpOrder.id,
        name: 'STORY™',
        description: 'Premium Fashion',
        handler: async (response) => {
          try {
            await paymentAPI.verify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              order_id: orderId,
            });
            resolve();
          } catch (e) {
            reject(new Error('Payment was received but verification failed. Please contact support.'));
          }
        },
        modal: {
          ondismiss: () => {
            paymentAPI.failed({ order_id: orderId, razorpay_order_id: rzpOrder.id }).catch(() => {});
            reject(new Error('Payment cancelled. Your order is saved — you can retry from My Orders.'));
          },
        },
        prefill: {
          name:    form.name,
          contact: form.phone,
          email:   form.email,
        },
        theme: { color: '#111111' },
      });
      rzp.on('payment.failed', (response) => {
        paymentAPI.failed({ order_id: orderId, razorpay_order_id: rzpOrder.id }).catch(() => {});
        reject(new Error(`Payment failed: ${response.error.description}`));
      });
      rzp.open();
    });
  };

  // ── Place order
  const handlePlace = async () => {
    const valErr = validateAddress();
    if (valErr) { setErr(valErr); return; }
    setPlacing(true);
    setErr('');
    try {
      const { order } = await ordersAPI.place({
        ...form,
        shipping_method: shipping,
        payment_method:  payMethod,
        coupon_code:     coupon?.code || '',
      });

      if (payMethod === 'online') {
        await placeOnline(order.id); // throws on cancel/fail
      }

      onPlaceOrder({
        num:       order.order_number,
        total:     order.total,
        items:     cart.length,
        id:        order.id,
        payMethod,
      });
    } catch (e) {
      setErr(e.message || 'Could not place order. Please try again.');
      t(e.message || 'Order failed. Please try again.', 'error');
      setPlacing(false);
    }
  };

  const goToPayment = () => {
    const e = validateAddress();
    if (e) { setErr(e); return; }
    setErr('');
    setStep(2);
    window.scrollTo(0, 0);
  };

  return (
    <div className="checkout-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
      <div className="checkout-title" style={{ fontFamily: 'var(--fm)', fontSize: '18px', letterSpacing: '.2em', marginBottom: 40 }}>CHECKOUT</div>

      {/* Steps */}
      <div style={{ display: 'flex', borderBottom: 'var(--bd)', marginBottom: 40 }}>
        {['DELIVERY', 'PAYMENT'].map((s, i) => (
          <div key={s} onClick={() => step > i + 1 && setStep(i + 1)} style={{
            fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', padding: '14px 20px',
            borderBottom: step === i + 1 ? '2px solid #111' : '2px solid transparent',
            color: step === i + 1 ? '#111' : 'var(--warm)',
            cursor: step > i + 1 ? 'pointer' : 'default',
            fontWeight: step === i + 1 ? 600 : 400,
          }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        <div>

          {/* STEP 1 — Delivery */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 20 }}>DELIVERY ADDRESS</div>
              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <InputField label="Full Name"      required value={form.name}    onChange={handleField('name')}    placeholder="John Doe" />
                <InputField label="Phone"          required value={form.phone}   onChange={handleField('phone')}   placeholder="9876543210" type="tel" />
                <InputField label="Email"                   value={form.email}   onChange={handleField('email')}   placeholder="you@email.com" type="email" />
                <InputField label="Address Line 1" required value={form.line1}   onChange={handleField('line1')}   placeholder="Flat/House No., Street" fullWidth />
                <InputField label="Address Line 2"          value={form.line2}   onChange={handleField('line2')}   placeholder="Area, Landmark (optional)" fullWidth />
                <InputField label="City"           required value={form.city}    onChange={handleField('city')}    placeholder="Mumbai" />
                <InputField label="Pincode"        required value={form.pincode} onChange={handleField('pincode')} placeholder="400001" />
                <div>
                  <label className="fl2">State</label>
                  <select className="fs2" value={form.state} onChange={handleField('state')}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <InputField label="Country" value="India" onChange={() => {}} placeholder="" readOnly />
              </div>

              <div style={{ marginTop: 28 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 14 }}>SHIPPING METHOD</div>
                {[
                  { v: 'standard', l: 'Standard Delivery', sub: '3–7 business days', price: subtotal >= 1500 ? 'Free' : fp(99) },
                  { v: 'express',  l: 'Express Delivery',  sub: '1–3 business days', price: fp(199) },
                  { v: 'sameday',  l: 'Same Day Delivery', sub: 'Order before 12 PM', price: fp(299) },
                ].map(opt => (
                  <label key={opt.v} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: 'var(--bd)', cursor: 'pointer' }}>
                    <input type="radio" name="shipping" value={opt.v} checked={shipping === opt.v} onChange={() => setShipping(opt.v)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', letterSpacing: '.05em' }}>{opt.l}</div>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: 'var(--warm)', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '9px' }}>{opt.price}</span>
                  </label>
                ))}
              </div>

              {err && <div style={{ padding: '12px 16px', background: '#fee2e2', fontFamily: 'var(--fm)', fontSize: '8px', color: '#991b1b', marginTop: 16, borderRadius: 2 }}>{err}</div>}
              <button className="btn btn-k" style={{ width: '100%', marginTop: 24 }} onClick={goToPayment}>
                CONTINUE TO PAYMENT →
              </button>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 20 }}>PAYMENT METHOD</div>

              {[
                { v: 'online', l: 'Online Payment (Razorpay)', sub: 'Cards, UPI, Netbanking, Wallets — secured by Razorpay' },
                { v: 'cod',    l: 'Cash on Delivery',          sub: '₹50 COD convenience fee applies' },
              ].map(opt => (
                <label key={opt.v} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16,
                  border: payMethod === opt.v ? '1.5px solid #111' : 'var(--bd)',
                  marginBottom: 10, cursor: 'pointer', background: '#fff',
                }}>
                  <input type="radio" name="payment" value={opt.v} checked={payMethod === opt.v} onChange={() => setPayMethod(opt.v)} style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.05em', marginBottom: 4 }}>{opt.l}</div>
                    <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: 'var(--warm)' }}>{opt.sub}</div>
                  </div>
                </label>
              ))}

              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 12 }}>COUPON CODE</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="fi2" value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCoupon(null); setCouponErr(''); }}
                    placeholder="e.g. WELCOME10" style={{ flex: 1 }} />
                  <button className="btn btn-w" style={{ fontSize: '8px', padding: '12px 16px', whiteSpace: 'nowrap' }}
                    onClick={applyCoupon} disabled={couponLoading}>
                    {couponLoading ? '...' : 'APPLY'}
                  </button>
                  {coupon && (
                    <button className="btn btn-w" style={{ fontSize: '8px', padding: '12px 16px' }}
                      onClick={() => { setCoupon(null); setCouponCode(''); }}>✕</button>
                  )}
                </div>
                {coupon    && <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: '#16a34a', marginTop: 8 }}>✓ <strong>{coupon.code}</strong> applied — you save {fp(coupon.discount_amount)}</div>}
                {couponErr && <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: '#dc2626', marginTop: 8 }}>{couponErr}</div>}
                <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: 'var(--warm)', marginTop: 8 }}>Try: WELCOME10 · FLAT500 · STORY20</div>
              </div>

              {err && <div style={{ padding: '12px 16px', background: '#fee2e2', fontFamily: 'var(--fm)', fontSize: '8px', color: '#991b1b', marginTop: 16, borderRadius: 2 }}>{err}</div>}

              <button className="btn btn-k" style={{ width: '100%', marginTop: 24 }} onClick={handlePlace} disabled={placing}>
                {placing ? 'PROCESSING...' : payMethod === 'online' ? `PAY ${fp(total)} →` : `PLACE ORDER ${fp(total)} →`}
              </button>
              <button className="btn btn-w" style={{ width: '100%', marginTop: 10 }} onClick={() => { setErr(''); setStep(1); }}>← BACK</button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-sidebar" style={{ background: 'var(--off)', border: 'var(--bd)', padding: 24, alignSelf: 'start', position: 'sticky', top: 80 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', marginBottom: 16 }}>
            ORDER SUMMARY ({cart.length} item{cart.length !== 1 ? 's' : ''})
          </div>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product_name || item.name}
                </div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: 'var(--warm)', marginTop: 2 }}>
                  {item.size} · {item.color_name} × {item.quantity}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', whiteSpace: 'nowrap' }}>
                {fp((item.price || 0) * item.quantity)}
              </div>
            </div>
          ))}
          <div style={{ borderTop: 'var(--bd)', paddingTop: 14, marginTop: 6 }}>
            {[
              { k: 'Subtotal',  v: fp(subtotal), lc: 'var(--warm)', vc: 'inherit' },
              ...(discount > 0 ? [{ k: `Coupon (${coupon?.code})`, v: `−${fp(discount)}`, lc: '#16a34a', vc: '#16a34a' }] : []),
              { k: 'GST (18%)', v: fp(gst),      lc: 'var(--warm)', vc: 'inherit' },
              { k: 'Shipping',  v: shipCost === 0 ? 'Free' : fp(shipCost), lc: 'var(--warm)', vc: 'inherit' },
              ...(codFee > 0 ? [{ k: 'COD Fee', v: fp(codFee), lc: 'var(--warm)', vc: 'inherit' }] : []),
            ].map(row => (
              <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: '8px', marginBottom: 8 }}>
                <span style={{ color: row.lc }}>{row.k}</span>
                <span style={{ color: row.vc }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fm)', fontSize: '14px', borderTop: 'var(--bd)', paddingTop: 12, marginTop: 8 }}>
              <span>Total</span><span>{fp(total)}</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.08em', color: 'var(--warm)', marginTop: 16, lineHeight: 1.9 }}>
            🔒 256-bit SSL · 100% Genuine Products<br />Free returns within 7 days
          </div>
        </div>
      </div>
    </div>
  );
}