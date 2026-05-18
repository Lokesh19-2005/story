// src/pages/AdminPage.jsx — PHASE 6: Full Admin Dashboard
import { useState, useEffect, useCallback } from 'react';
import { adminAPI, uploadProductImage } from '../services/api.js';
import { fp } from '../utils.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductImage from '../components/ProductImage.jsx';

const STATUS_OPTS = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY_OPTS    = ['pending', 'awaiting', 'paid', 'failed', 'refunded'];

function StatCard({ label, value, sub }) {
  return (
    <div style={{ border: 'var(--bd)', padding: '20px 24px', background: '#fff' }}>
      <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.15em', color: 'var(--warm)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: '24px', letterSpacing: '.03em', marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.08em', color: 'var(--warm)' }}>{sub}</div>}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [updating, setUpdating]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.orders(filter ? { status: filter } : {})
      .then(d => setOrders(d.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, field, value) => {
    setUpdating(id);
    try {
      await adminAPI.updateOrderStatus(id, { [field]: value });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
    } catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <select className="fs2" value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <button className="btn btn-w" style={{ fontSize: '7.5px', padding: '8px 16px' }} onClick={load}>REFRESH</button>
      </div>

      {loading ? <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', padding: 40, color: 'var(--warm)' }}>Loading...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fm)', fontSize: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                {['ORDER', 'CUSTOMER', 'TOTAL', 'PAYMENT', 'STATUS', 'DATE'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', letterSpacing: '.1em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: 'var(--bd)' }}>
                  <td style={{ padding: '12px', letterSpacing: '.06em' }}>{o.order_number}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '8.5px' }}>{o.user_name}</div>
                    <div style={{ fontSize: '7.5px', color: 'var(--warm)' }}>{o.user_email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{fp(Number(o.total))}</td>
                  <td style={{ padding: '12px' }}>
                    <select value={o.payment_status} onChange={e => updateStatus(o.id, 'payment_status', e.target.value)} disabled={updating === o.id}
                      style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', border: 'var(--bd)', padding: '4px 8px', background: 'transparent', cursor: 'pointer' }}>
                      {PAY_OPTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select value={o.order_status} onChange={e => updateStatus(o.id, 'order_status', e.target.value)} disabled={updating === o.id}
                      style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', border: 'var(--bd)', padding: '4px 8px', background: 'transparent', cursor: 'pointer' }}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--warm)', fontSize: '7.5px' }}>
                    {new Date(o.placed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    {updating === o.id && <span style={{ color: 'var(--warm)', marginLeft: 6 }}>Saving...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--warm)' }}>NO ORDERS FOUND</div>}
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ name: '', slug: '', price: '', orig_price: '', icon: '◉', image_url: '', tag: '', brand_name: '', category_slug: 'shoes', description: '' });
  const [saving, setSaving]     = useState(false);

  const load = () => adminAPI.products().then(d => setProducts(d.products || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleActive = async (id, is_active) => {
    await adminAPI.updateProduct(id, { is_active: !is_active });
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !is_active } : p));
  };

  const create = async () => {
    if (!form.name || !form.slug || !form.price) { alert('Name, slug and price are required'); return; }
    setSaving(true);
    try {
      const d = await adminAPI.createProduct({ ...form, price: Number(form.price), orig_price: Number(form.orig_price || form.price) });
      setProducts(prev => [d.product, ...prev]);
      setShowAdd(false);
      setForm({ name: '', slug: '', price: '', orig_price: '', icon: '◉', image_url: '', tag: '', brand_name: '', category_slug: 'shoes', description: '' });
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)' }}>{products.length} PRODUCTS</div>
        <button className="btn btn-k" style={{ fontSize: '7.5px', padding: '8px 16px' }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'CANCEL' : '+ ADD PRODUCT'}
        </button>
      </div>

      {showAdd && (
        <div style={{ border: 'var(--bd)', padding: 24, marginBottom: 20, background: 'var(--off)' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 16 }}>NEW PRODUCT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {[['name','Product Name'],['slug','Slug (url-friendly)'],['price','Price (₹)'],['orig_price','Original Price (₹)'],
              ['icon','Icon/Emoji'],['image_url','Image URL (optional)'],['tag','Tag (NEW/SALE/BESTSELLER)'],['brand_name','Brand Name'],['category_slug','Category Slug']
            ].map(([k, label]) => (
              <div key={k}>
                <label className="fl2">{label}</label>
                <input className="fi2" value={form[k]} onChange={set(k)} placeholder={label} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label className="fl2">Description</label>
              <textarea className="fi2" value={form.description} onChange={set('description')} rows={3}
                style={{ resize: 'vertical', fontFamily: 'var(--fm)', fontSize: '9px' }} />
            </div>
          </div>
          <button className="btn btn-k" onClick={create} disabled={saving} style={{ fontSize: '8px' }}>
            {saving ? 'CREATING...' : 'CREATE PRODUCT →'}
          </button>
        </div>
      )}

      {loading ? <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', padding: 40, color: 'var(--warm)' }}>Loading...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fm)', fontSize: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                {['PRODUCT', 'BRAND', 'CATEGORY', 'PRICE', 'TAG', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', letterSpacing: '.1em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: 'var(--bd)', opacity: p.is_active ? 1 : .5 }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '9px', display:'flex', alignItems:'center', gap:8 }}>
                      <span className="admin-thumb">
                        <ProductImage product={p} alt={p.name} fallbackIcon={p.icon || '\u25C9'} />
                      </span>
                      <span>{p.name}</span>
                    </div>
                    <div style={{ fontSize: '7.5px', color: 'var(--warm)' }}>{p.slug}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{p.brand || '—'}</td>
                  <td style={{ padding: '12px' }}>{p.category_label || '—'}</td>
                  <td style={{ padding: '12px' }}>{fp(Number(p.price))}</td>
                  <td style={{ padding: '12px' }}>{p.tag || '—'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '3px 10px', fontSize: '7px', background: p.is_active ? '#dcfce7' : '#fee2e2', color: p.is_active ? '#166534' : '#991b1b' }}>
                      {p.is_active ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => toggleActive(p.id, p.is_active)}
                      style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.08em', padding: '4px 10px', cursor: 'pointer' }}>
                      {p.is_active ? 'HIDE' : 'SHOW'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Inventory Tab ────────────────────────────────────────
function InventoryTab() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [newStock, setNewStock]   = useState('');
  const [saving, setSaving]       = useState(null);

  useEffect(() => {
    adminAPI.inventory().then(d => setInventory(d.inventory || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const save = async (item) => {
    setSaving(item.id);
    try {
      await adminAPI.setStock(item.product_id, { size: item.size, color_name: item.color_name, stock: Number(newStock) });
      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock: Number(newStock) } : i));
      setEditing(null);
    } catch (e) { alert(e.message); } finally { setSaving(null); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)', marginBottom: 16 }}>{inventory.length} STOCK VARIANTS</div>
      {loading ? <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', padding: 40, color: 'var(--warm)' }}>Loading...</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fm)', fontSize: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111' }}>
                {['PRODUCT', 'SIZE', 'COLOR', 'STOCK', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', letterSpacing: '.1em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => (
                <tr key={i.id} style={{ borderBottom: 'var(--bd)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '8.5px' }}>{i.product_name}</div>
                    <div style={{ fontSize: '7.5px', color: 'var(--warm)' }}>{i.slug}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{i.size}</td>
                  <td style={{ padding: '12px' }}>{i.color_name}</td>
                  <td style={{ padding: '12px', fontWeight: i.stock <= 5 ? 700 : 400,
                    color: i.stock === 0 ? '#dc2626' : i.stock <= 5 ? '#d97706' : '#111' }}>
                    {i.stock}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '3px 10px', fontSize: '7px',
                      background: i.stock === 0 ? '#fee2e2' : i.stock <= 5 ? '#fef9c3' : '#dcfce7',
                      color: i.stock === 0 ? '#991b1b' : i.stock <= 5 ? '#92400e' : '#166534' }}>
                      {i.stock === 0 ? 'OUT OF STOCK' : i.stock <= 5 ? 'LOW' : 'IN STOCK'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editing === i.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} min="0"
                          style={{ width: 60, fontFamily: 'var(--fm)', fontSize: '8px', border: 'var(--bd)', padding: '4px 8px' }} />
                        <button onClick={() => save(i)} disabled={saving === i.id}
                          style={{ background: '#111', color: '#fff', border: 'none', fontFamily: 'var(--fm)', fontSize: '7.5px', padding: '4px 10px', cursor: 'pointer' }}>
                          {saving === i.id ? '...' : 'SAVE'}
                        </button>
                        <button onClick={() => setEditing(null)}
                          style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', padding: '4px 10px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(i.id); setNewStock(String(i.stock)); }}
                        style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.08em', padding: '4px 10px', cursor: 'pointer' }}>
                        EDIT
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventory.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--warm)' }}>
              No inventory records yet. Add products and stock will appear here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Coupons Tab ──────────────────────────────────────────
function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ code: '', type: 'flat', value: '', min_order: '', max_discount: '', uses_limit: '' });
  const [saving, setSaving]   = useState(false);

  const load = () => adminAPI.coupons().then(d => setCoupons(d.coupons || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const create = async () => {
    if (!form.code || !form.value) { alert('Code and value required'); return; }
    setSaving(true);
    try {
      const d = await adminAPI.createCoupon({
        ...form, value: Number(form.value),
        min_order: form.min_order ? Number(form.min_order) : 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        uses_limit: form.uses_limit ? Number(form.uses_limit) : null,
      });
      setCoupons(prev => [d.coupon, ...prev]);
      setShowAdd(false);
      setForm({ code: '', type: 'flat', value: '', min_order: '', max_discount: '', uses_limit: '' });
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const toggle = async (id, is_active) => {
    await adminAPI.updateCoupon(id, { is_active: !is_active });
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !is_active } : c));
  };

  const remove = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await adminAPI.deleteCoupon(id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)' }}>{coupons.length} COUPONS</div>
        <button className="btn btn-k" style={{ fontSize: '7.5px', padding: '8px 16px' }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'CANCEL' : '+ ADD COUPON'}
        </button>
      </div>

      {showAdd && (
        <div style={{ border: 'var(--bd)', padding: 24, marginBottom: 20, background: 'var(--off)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label className="fl2">COUPON CODE</label><input className="fi2" value={form.code} onChange={set('code')} placeholder="SAVE20" style={{ textTransform: 'uppercase' }} /></div>
            <div>
              <label className="fl2">TYPE</label>
              <select className="fs2" value={form.type} onChange={set('type')}>
                <option value="flat">Flat ₹ off</option>
                <option value="percent">Percent % off</option>
              </select>
            </div>
            <div><label className="fl2">{form.type === 'flat' ? 'Amount (₹)' : 'Percent (%)'}</label><input className="fi2" type="number" value={form.value} onChange={set('value')} /></div>
            <div><label className="fl2">Min Order (₹)</label><input className="fi2" type="number" value={form.min_order} onChange={set('min_order')} placeholder="0" /></div>
            {form.type === 'percent' && (
              <div><label className="fl2">Max Discount (₹)</label><input className="fi2" type="number" value={form.max_discount} onChange={set('max_discount')} placeholder="No limit" /></div>
            )}
            <div><label className="fl2">Usage Limit</label><input className="fi2" type="number" value={form.uses_limit} onChange={set('uses_limit')} placeholder="Unlimited" /></div>
          </div>
          <button className="btn btn-k" onClick={create} disabled={saving} style={{ fontSize: '8px' }}>
            {saving ? 'CREATING...' : 'CREATE COUPON →'}
          </button>
        </div>
      )}

      {loading ? <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', padding: 40, color: 'var(--warm)' }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map(c => (
            <div key={c.id} style={{ border: 'var(--bd)', padding: '16px 20px', background: '#fff', display: 'flex', alignItems: 'center', gap: 16, opacity: c.is_active ? 1 : .5 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '11px', letterSpacing: '.2em', minWidth: 120 }}>{c.code}</div>
              <div style={{ flex: 1, fontFamily: 'var(--fm)', fontSize: '8px', color: 'var(--warm)' }}>
                {c.type === 'flat' ? `₹${c.value} off` : `${c.value}% off`}
                {c.min_order > 0 ? ` · Min ₹${c.min_order}` : ''}
                {c.max_discount ? ` · Max ₹${c.max_discount}` : ''}
                {' · '}Used {c.uses_total}{c.uses_limit ? `/${c.uses_limit}` : ''} times
              </div>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '7px', padding: '3px 10px', background: c.is_active ? '#dcfce7' : '#fee2e2', color: c.is_active ? '#166534' : '#991b1b' }}>
                {c.is_active ? 'ACTIVE' : 'DISABLED'}
              </span>
              <button onClick={() => toggle(c.id, c.is_active)}
                style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', padding: '4px 10px', cursor: 'pointer' }}>
                {c.is_active ? 'DISABLE' : 'ENABLE'}
              </button>
              <button onClick={() => remove(c.id)}
                style={{ background: 'none', border: 'none', fontFamily: 'var(--fm)', fontSize: '12px', color: '#b85c38', cursor: 'pointer' }}>✕</button>
            </div>
          ))}
          {coupons.length === 0 && <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--warm)' }}>NO COUPONS YET</div>}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.users().then(d => setUsers(d.users || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const changeRole = async (id, role) => {
    await adminAPI.updateUserRole(id, role);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <div>
      <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.1em', color: 'var(--warm)', marginBottom: 16 }}>{users.length} USERS</div>
      {loading ? <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', padding: 40, color: 'var(--warm)' }}>Loading...</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--fm)', fontSize: '8px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #111' }}>
              {['NAME', 'EMAIL', 'PHONE', 'ROLE', 'JOINED', 'ACTION'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', letterSpacing: '.1em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: 'var(--bd)' }}>
                <td style={{ padding: '12px', fontSize: '8.5px' }}>{u.name}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px', color: 'var(--warm)' }}>{u.phone || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '3px 10px', fontSize: '7px', background: u.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: u.role === 'admin' ? '#1e40af' : '#374151' }}>
                    {u.role?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px', color: 'var(--warm)', fontSize: '7.5px' }}>
                  {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px' }}>
                  {u.role === 'user' ? (
                    <button onClick={() => changeRole(u.id, 'admin')}
                      style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', padding: '4px 10px', cursor: 'pointer' }}>
                      MAKE ADMIN
                    </button>
                  ) : (
                    <button onClick={() => changeRole(u.id, 'user')}
                      style={{ background: 'none', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '7.5px', padding: '4px 10px', cursor: 'pointer', color: '#b85c38' }}>
                      REVOKE ADMIN
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────

// ─── Returns Tab ──────────────────────────────────────────
function ReturnsTab() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminAPI.returns()
      .then(d => setReturns(d.returns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateReturn = async (id, status, notes) => {
    setUpdating(id);
    try {
      await adminAPI.updateReturn(id, { status, admin_notes: notes });
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status, admin_notes: notes } : r));
    } catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const STATUS_OPTS_RET = ['requested','approved','processing','completed','rejected'];
  const STATUS_COLORS   = { requested:'#d97706', approved:'#2563eb', processing:'#7c3aed', completed:'#16a34a', rejected:'#dc2626' };

  if (loading) return <div style={{ fontFamily:'var(--fm)', fontSize:'9px', padding:40, color:'var(--warm)' }}>Loading...</div>;

  return (
    <div>
      <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', color:'var(--warm)', marginBottom:20 }}>{returns.length} RETURN REQUEST{returns.length!==1?'S':''}</div>
      {returns.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', fontFamily:'var(--fm)', fontSize:'9px', color:'var(--warm)' }}>No return requests yet.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {returns.map(r => {
            const [notes, setNotes] = [r.admin_notes||'', () => {}];
            return (
              <div key={r.id} style={{ border:'var(--bd)', padding:'16px 20px', background:'#fff' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', marginBottom:4 }}>{r.order_number}</div>
                    <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)' }}>{r.user_name} · {r.user_email}</div>
                  </div>
                  <span style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.1em', padding:'3px 12px', background:(STATUS_COLORS[r.status]||'#111')+'22', color:STATUS_COLORS[r.status]||'#111' }}>{(r.status||'requested').toUpperCase()}</span>
                </div>
                <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', marginBottom:8 }}>Reason: <strong>{r.reason}</strong></div>
                {r.details && <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', marginBottom:12 }}>{r.details}</div>}
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <select value={r.status} onChange={e => updateReturn(r.id, e.target.value, r.admin_notes||'')} disabled={updating===r.id}
                    style={{ fontFamily:'var(--fm)', fontSize:'7.5px', border:'var(--bd)', padding:'6px 10px', background:'transparent', cursor:'pointer' }}>
                    {STATUS_OPTS_RET.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                  <input defaultValue={r.admin_notes||''} placeholder="Admin note..." onBlur={e => updateReturn(r.id, r.status, e.target.value)}
                    style={{ flex:1, fontFamily:'var(--fm)', fontSize:'8px', border:'var(--bd)', padding:'6px 10px', minWidth:200 }} />
                </div>
                <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginTop:8 }}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TABS = ['dashboard', 'orders', 'products', 'inventory', 'coupons', 'users', 'returns'];

export default function AdminPage({ setPage }) {
  const [tab, setTab]     = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats()
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '16px', letterSpacing: '.2em' }}>ADMIN DASHBOARD</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.1em', color: 'var(--warm)', marginTop: 4 }}>STORY™ Management Console</div>
        </div>
        <button className="btn btn-w" style={{ fontSize: '7.5px', padding: '8px 16px' }} onClick={() => setPage('home')}>← BACK TO STORE</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: 'var(--bd)', marginBottom: 32, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.15em', padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: tab === t ? '2px solid #111' : '2px solid transparent', color: tab === t ? '#111' : 'var(--warm)' }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        loading ? <LoadingScreen message="LOADING STATS..." /> : stats ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
              <StatCard label="TOTAL REVENUE"  value={fp(Number(stats.orders?.total_revenue || 0))} sub={`${stats.orders?.total_orders || 0} total orders`} />
              <StatCard label="PENDING"         value={stats.orders?.pending_orders || 0} sub="need attention" />
              <StatCard label="THIS WEEK"       value={stats.orders?.orders_this_week || 0} sub="orders placed" />
              <StatCard label="DELIVERED"       value={stats.orders?.delivered_orders || 0} sub="completed" />
              <StatCard label="TOTAL USERS"     value={stats.users?.total_users || 0} sub={`+${stats.users?.new_this_week || 0} this week`} />
              <StatCard label="PRODUCTS"        value={stats.products?.total_products || 0} sub={`${stats.products?.inactive_products || 0} hidden`} />
            </div>

            {stats.topProducts?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.15em', marginBottom: 16 }}>TOP PRODUCTS BY REVENUE</div>
                <div style={{ border: 'var(--bd)', background: '#fff' }}>
                  {stats.topProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px',
                      borderBottom: i < stats.topProducts.length - 1 ? 'var(--bd)' : 'none' }}>
                      <div style={{ fontFamily: 'var(--fm)', fontSize: '9px' }}>
                        <span style={{ color: 'var(--warm)', marginRight: 12 }}>#{i + 1}</span>{p.product_name}
                      </div>
                      <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--fm)', fontSize: '8.5px' }}>
                        <span style={{ color: 'var(--warm)' }}>{p.units_sold} units</span>
                        <span style={{ fontWeight: 500 }}>{fp(Number(p.revenue))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--warm)', padding: 40 }}>Could not load stats. Check API connection.</div>
      )}

      {tab === 'orders'    && <OrdersTab />}
      {tab === 'products'  && <ProductsTab />}
      {tab === 'inventory' && <InventoryTab />}
      {tab === 'coupons'   && <CouponsTab />}
      {tab === 'users'     && <UsersTab />}
      {tab === 'returns'   && <ReturnsTab />}
    </div>
  );
}
