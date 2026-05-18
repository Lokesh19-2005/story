// src/pages/DetailPage.jsx — Product Detail with Stock Display
import { useState, useEffect } from 'react';
import { productsAPI } from '../services/api.js';
import { fp, pct } from '../utils.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DetailPage({ productId, addCart, openDrawer, setPage, openDetail, quickAdd, isWish, togWish, toast }) {
  const { isLoggedIn } = useAuth();
  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selSize, setSelSize]   = useState('');
  const [selColor, setSelColor] = useState(null);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [tab, setTab]           = useState('details');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setMsg('');
    setSelSize('');
    setSelColor(null);
    setQty(1);

    // Fetch all products to find by id, then get detail by slug
    productsAPI.list({ limit: 100 })
      .then(d => {
        const p = d.products.find(x => String(x.id) === String(productId));
        if (!p) throw new Error('Product not found');
        return productsAPI.detail(p.slug);
      })
      .then(d => {
        const p = d.product;
        setProduct(p);
        setSelSize(p.sizes?.[0] || '');
        setSelColor(p.colors?.[0] || null);
        // Load related
        productsAPI.related(p.slug)
          .then(r => setRelated(r.products || []))
          .catch(() => {});
      })
      .catch(err => { console.warn('[DetailPage fetch]', err?.message); })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <LoadingScreen message="LOADING PRODUCT..." />;
  if (!product) return (
    <div style={{ textAlign:'center', padding:'120px 20px' }}>
      <div style={{ fontFamily:'var(--fm)', fontSize:'11px', letterSpacing:'.2em', marginBottom:24 }}>PRODUCT NOT FOUND</div>
      <button className="btn btn-k" onClick={() => setPage('shop')}>← BACK TO SHOP</button>
    </div>
  );

  const discount = pct(product.orig_price, product.price);

  // Stock check
  const stockKey = selSize && selColor ? `${selSize}__${selColor.color_name}` : null;
  const stockQty = stockKey && product.stockMap ? (product.stockMap[stockKey] ?? 99) : 99;
  const isOOS    = stockQty === 0;

  const handleAdd = async () => {
    if (!selSize) { setMsg('Please select a size'); return; }
    if (!selColor) { setMsg('Please select a color'); return; }
    if (!isLoggedIn) { setPage('auth'); return; }
    if (isOOS) { setMsg('This variant is out of stock'); return; }

    setAdding(true);
    setMsg('');
    const success = await addCart(product, selSize, selColor);
    setAdding(false);
    if (success) {
      setMsg('Added to bag!');
      if (toast) toast('Added to bag! 🛍', 'success');
      openDrawer();
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg('Could not add to bag. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.1em', color: 'var(--warm)', marginBottom: 40 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => setPage('shop')}>SHOP</span>
        {' / '}
        <span style={{ cursor: 'pointer' }} onClick={() => setPage('shop')}>{product.category_label?.toUpperCase()}</span>
        {' / '}
        <span style={{ color: '#111' }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
        {/* Left — Product Image */}
        <div>
          <div style={{ background: 'var(--off)', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: 'var(--bd)' }}>
            <span style={{ fontSize: 140, opacity: .14 }}>{product.icon || '◉'}</span>
            {product.tag && (
              <div style={{ position: 'absolute', top: 20, left: 20, background: '#111', color: '#fff', fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.2em', padding: '4px 12px' }}>
                {product.tag}
              </div>
            )}
            {discount > 0 && (
              <div style={{ position: 'absolute', top: 20, right: 20, background: '#b85c38', color: '#fff', fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.1em', padding: '4px 10px' }}>
                -{discount}% OFF
              </div>
            )}
            <button
              onClick={() => togWish && togWish(product.id)}
              style={{ position: 'absolute', bottom: 20, right: 20, background: '#fff', border: 'var(--bd)', width: 40, height: 40, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isWish(product.id) ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Right — Product Info */}
        <div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 8 }}>{product.brand}</div>
          <h1 style={{ fontFamily: 'var(--fs)', fontSize: '32px', fontWeight: 300, letterSpacing: '-.01em', marginBottom: 20, lineHeight: 1.2 }}>{product.name}</h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--fm)', fontSize: '22px', letterSpacing: '.03em' }}>{fp(product.price)}</span>
            {discount > 0 && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: '13px', color: 'var(--warm)', textDecoration: 'line-through' }}>{fp(product.orig_price)}</span>
            )}
            {discount > 0 && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: '#b85c38', letterSpacing: '.08em' }}>Save {fp(product.orig_price - product.price)}</span>
            )}
          </div>

          {/* Color selection */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', color: 'var(--warm)', marginBottom: 12 }}>
                COLOR — <span style={{ color: '#111' }}>{selColor?.color_name || ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button key={c.color_name}
                    onClick={() => setSelColor(c)}
                    title={c.color_name}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: c.color_hex || '#000',
                      border: selColor?.color_name === c.color_name ? '3px solid #111' : '2px solid transparent',
                      outline: selColor?.color_name === c.color_name ? '1px solid #111' : '1px solid var(--bd)',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selection */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', color: 'var(--warm)', marginBottom: 12 }}>SIZE</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map(s => {
                  const sKey = selColor ? `${s}__${selColor.color_name}` : null;
                  const sStock = sKey && product.stockMap ? (product.stockMap[sKey] ?? 99) : 99;
                  const sOOS = sStock === 0;
                  return (
                    <button key={s}
                      onClick={() => !sOOS && setSelSize(s)}
                      style={{
                        minWidth: 44, height: 44, padding: '0 12px',
                        border: selSize === s ? '1.5px solid #111' : 'var(--bd)',
                        background: sOOS ? 'var(--off)' : selSize === s ? '#111' : '#fff',
                        color: sOOS ? 'var(--warm)' : selSize === s ? '#fff' : '#111',
                        fontFamily: 'var(--fm)', fontSize: '8.5px', letterSpacing: '.08em',
                        cursor: sOOS ? 'not-allowed' : 'pointer',
                        textDecoration: sOOS ? 'line-through' : 'none',
                        transition: 'all .15s',
                        position: 'relative',
                      }}>
                      {s}
                      {sOOS && <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, background: '#dc2626', borderRadius: '50%' }} />}
                    </button>
                  );
                })}
              </div>
              {isOOS && selSize && (
                <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: '#dc2626', marginTop: 8, letterSpacing: '.05em' }}>
                  This size is out of stock
                </div>
              )}
              {!isOOS && selSize && stockQty <= 5 && stockQty > 0 && (
                <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: '#d97706', marginTop: 8, letterSpacing: '.05em' }}>
                  Only {stockQty} left in stock!
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', color: 'var(--warm)' }}>QTY</div>
            <div style={{ display: 'flex', alignItems: 'center', border: 'var(--bd)', background: '#fff' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--fm)' }}>−</button>
              <span style={{ width: 36, textAlign: 'center', fontFamily: 'var(--fm)', fontSize: '9px' }}>{qty}</span>
              <button onClick={() => setQty(Math.min(stockQty, qty + 1))} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--fm)' }}>+</button>
            </div>
          </div>

          {/* Add to cart */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button className="btn btn-k" style={{ flex: 1, fontSize: '8.5px' }}
              onClick={handleAdd} disabled={adding || isOOS}>
              {adding ? 'ADDING...' : isOOS ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>
            <button
              onClick={() => togWish && togWish(product.id)}
              style={{ width: 48, height: 48, border: 'var(--bd)', background: '#fff', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isWish(product.id) ? '♥' : '♡'}
            </button>
          </div>

          {msg && (
            <div style={{ padding: '10px 14px', background: msg.includes('!') ? '#dcfce7' : '#fee2e2', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: msg.includes('!') ? '#166534' : '#991b1b', marginBottom: 16 }}>
              {msg}
            </div>
          )}

          {!isLoggedIn && (
            <div style={{ padding: '10px 14px', background: 'var(--off)', border: 'var(--bd)', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: 'var(--warm)', marginBottom: 16 }}>
              💡 <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setPage('auth')}>Sign in</span> to add to bag and save to wishlist
            </div>
          )}

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, padding: '16px 0', borderTop: 'var(--bd)', borderBottom: 'var(--bd)', marginBottom: 28 }}>
            {['🔒 Secure Payment', '🔄 Easy Returns', '✅ 100% Genuine', '🚚 Fast Delivery'].map(b => (
              <div key={b} style={{ fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.08em', color: 'var(--warm)', flex: 1, textAlign: 'center' }}>{b}</div>
            ))}
          </div>

          {/* Tabs — Details / Material / Shipping */}
          <div style={{ display: 'flex', borderBottom: 'var(--bd)', marginBottom: 20 }}>
            {['details', 'material', 'shipping'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '10px', fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.12em', border: 'none', borderBottom: tab === t ? '2px solid #111' : '2px solid transparent', background: 'none', cursor: 'pointer', color: tab === t ? '#111' : 'var(--warm)', transition: 'all .15s' }}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <p style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.04em', color: 'var(--warm)', lineHeight: 1.9 }}>{product.description || 'Premium quality product.'}</p>
          )}
          {tab === 'material' && (
            <p style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.04em', color: 'var(--warm)', lineHeight: 1.9 }}>{product.material || 'Please refer to product label for material details.'}</p>
          )}
          {tab === 'shipping' && (
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.04em', color: 'var(--warm)', lineHeight: 2 }}>
              <div>Standard: 3-7 business days · Free over ₹1,500</div>
              <div>Express: 1-3 business days · ₹199</div>
              <div>Same Day: Available in select metros · ₹299</div>
              <div style={{ marginTop: 8 }}>Returns within 7 days of delivery.</div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ marginTop: 80 }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', marginBottom: 32, color: 'var(--warm)' }}>YOU MAY ALSO LIKE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--bd)' }}>
            {related.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openDetail(p.id)}
                onQuickAdd={quickAdd} isWish={isWish(p.id)} onToggleWish={togWish} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
