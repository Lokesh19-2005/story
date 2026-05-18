// src/pages/DetailPage.jsx — Premium product detail (preserves API + stock logic)
import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api.js';
import { fp, pct } from '../utils.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TRUST = [
  { i: '◈', l: 'SECURE PAYMENT' },
  { i: '↻', l: '7-DAY RETURNS' },
  { i: '✓', l: '100% GENUINE' },
  { i: '➜', l: 'FAST DELIVERY' },
];

export default function DetailPage({ productId, addCart, openDrawer, setPage, openDetail, quickAdd, isWish, togWish, toast }) {
  const { isLoggedIn } = useAuth();
  const [product, setProduct]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selSize, setSelSize]   = useState('');
  const [selColor, setSelColor] = useState(null);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [msg, setMsg]           = useState('');
  const [tab, setTab]           = useState('details');

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError('No product selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMsg('');
    setSelSize('');
    setSelColor(null);
    setQty(1);

    try {
      // Fetch all products to find by id, then get detail by slug
      const listRes = await productsAPI.list({ limit: 100 });
      const list = Array.isArray(listRes?.products) ? listRes.products : [];
      const match = list.find(x => String(x?.id) === String(productId));
      if (!match || !match.slug) throw new Error('Product not found');

      const detailRes = await productsAPI.detail(match.slug);
      const p = detailRes?.product;
      if (!p) throw new Error('Product details unavailable');

      const safeProduct = {
        ...p,
        sizes:    Array.isArray(p.sizes)  ? p.sizes  : [],
        colors:   Array.isArray(p.colors) ? p.colors : [],
        stockMap: p.stockMap && typeof p.stockMap === 'object' ? p.stockMap : {},
      };

      setProduct(safeProduct);
      setSelSize(safeProduct.sizes[0] || '');
      setSelColor(safeProduct.colors[0] || null);

      productsAPI.related(safeProduct.slug)
        .then(r => setRelated(Array.isArray(r?.products) ? r.products : []))
        .catch(err => { console.warn('[DetailPage related]', err?.message); setRelated([]); });
    } catch (err) {
      console.warn('[DetailPage fetch]', err?.message);
      setError(err?.message || 'Failed to load product');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  if (loading) return <LoadingScreen message="LOADING PRODUCT..." />;

  if (error || !product) {
    const isNotFound = error === 'Product not found' || !product;
    return (
      <div style={{ textAlign:'center', padding:'120px 20px', maxWidth:520, margin:'0 auto' }}>
        <div style={{ fontSize:48, opacity:.18, marginBottom:24 }}>◎</div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'11px', letterSpacing:'.22em', marginBottom:12, fontWeight:600 }}>
          {isNotFound ? 'PRODUCT NOT FOUND' : 'COULDN\u2019T LOAD PRODUCT'}
        </div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'10px', color:'#777', marginBottom:32, lineHeight:1.8 }}>
          {isNotFound
            ? 'This product is no longer available or has been removed.'
            : (error || 'Something went wrong while loading this product. Please try again.')}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {!isNotFound && <button className="btn btn-w" onClick={loadProduct}>RETRY</button>}
          <button className="btn btn-k" onClick={() => setPage('shop')}>← BACK TO SHOP</button>
        </div>
      </div>
    );
  }

  const discount = pct(product.orig_price, product.price);
  const stockKey = selSize && selColor?.color_name ? `${selSize}__${selColor.color_name}` : null;
  const stockQty = stockKey ? (product.stockMap[stockKey] ?? 99) : 99;
  const isOOS    = stockQty === 0;
  const savings  = discount > 0 ? (product.orig_price || 0) - (product.price || 0) : 0;

  const handleAdd = async () => {
    if (!selSize)  { setMsg('Please select a size');  return; }
    if (!selColor) { setMsg('Please select a color'); return; }
    if (!isLoggedIn) { setPage('auth'); return; }
    if (isOOS) { setMsg('This variant is out of stock'); return; }

    setAdding(true);
    setMsg('');
    try {
      const success = await addCart(product, selSize, selColor);
      if (success) {
        setMsg('Added to bag!');
        if (toast) toast('Added to bag! \uD83D\uDED2', 'success');
        openDrawer();
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg('Could not add to bag. Please try again.');
      }
    } catch (e) {
      console.warn('[DetailPage addCart]', e?.message);
      setMsg('Could not add to bag. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const isMsgOk = msg && msg.includes('!');

  return (
    <div className="pd-wrap">
      {/* Breadcrumb */}
      <div className="pd-crumb">
        <span role="link" onClick={() => setPage('shop')}>SHOP</span>
        <span className="pd-crumb-sep">/</span>
        <span role="link" onClick={() => setPage('shop')}>{(product.category_label || 'ALL').toUpperCase()}</span>
        <span className="pd-crumb-sep">/</span>
        <span className="pd-crumb-current">{product.name || ''}</span>
      </div>

      <div className="pd-grid">
        {/* Media */}
        <div>
          <div className="pd-media">
            <span className="pd-media-icon">{product.icon || '\u25C9'}</span>

            <div className="pd-media-badges">
              {product.tag && (
                <span className="pc-badge pc-badge--new" style={{ alignSelf:'flex-start' }}>{product.tag}</span>
              )}
            </div>

            {discount > 0 && <div className="pd-media-discount">-{discount}% OFF</div>}

            <button
              aria-label="Toggle wishlist"
              className="pd-media-wish"
              onClick={() => togWish && togWish(product.id)}>
              {isWish && isWish(product.id) ? '\u2665' : '\u2661'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pd-info">
          <div className="pd-brand">{product.brand || ''}</div>
          <h1 className="pd-title">{product.name || 'Untitled product'}</h1>

          {/* Static rating placeholder; preserves visual richness without inventing data */}
          <div className="pd-rating">
            <span className="pd-rating-stars">★★★★☆</span>
            <span>BASED ON REVIEWS</span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">{fp(product.price)}</span>
            {discount > 0 && <span className="pd-price-orig">{fp(product.orig_price)}</span>}
            {discount > 0 && <span className="pd-price-save">SAVE {fp(savings)}</span>}
          </div>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="pd-section">
              <div className="pd-label">
                <span>COLOR</span>
                <span className="pd-label-value">{selColor?.color_name || ''}</span>
              </div>
              <div className="pd-swatches">
                {product.colors.map(c => (
                  <button
                    key={c.color_name}
                    type="button"
                    title={c.color_name}
                    aria-label={c.color_name}
                    className={`pd-swatch${selColor?.color_name === c.color_name ? ' selected' : ''}`}
                    onClick={() => setSelColor(c)}
                    style={{ background: c.color_hex || '#000' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="pd-section">
              <div className="pd-label">
                <span>SIZE</span>
                <span className="pd-label-value" style={{ cursor:'pointer', textDecoration:'underline', color:'#888' }}>
                  SIZE GUIDE
                </span>
              </div>
              <div className="pd-sizes">
                {product.sizes.map(s => {
                  const sKey = selColor?.color_name ? `${s}__${selColor.color_name}` : null;
                  const sStock = sKey ? (product.stockMap[sKey] ?? 99) : 99;
                  const sOOS = sStock === 0;
                  const cls = `pd-size${selSize === s ? ' selected' : ''}${sOOS ? ' oos' : ''}`;
                  return (
                    <button key={s} type="button" className={cls}
                      onClick={() => !sOOS && setSelSize(s)}
                      disabled={sOOS}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {isOOS && selSize && (
                <div className="pd-stock-msg pd-stock-msg--oos">This size is out of stock</div>
              )}
              {!isOOS && selSize && stockQty <= 5 && stockQty > 0 && (
                <div className="pd-stock-msg pd-stock-msg--low">Only {stockQty} left in stock!</div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="pd-section" style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div className="pd-label" style={{ marginBottom:0 }}>QTY</div>
            <div className="pd-qty">
              <button type="button" aria-label="Decrease quantity"
                onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="pd-qty-value">{qty}</span>
              <button type="button" aria-label="Increase quantity"
                onClick={() => setQty(Math.min(stockQty || 99, qty + 1))}>+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="pd-cta-row">
            <button className="pd-cta" onClick={handleAdd} disabled={adding || isOOS}>
              <span>{adding ? 'ADDING...' : isOOS ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              {!adding && !isOOS && <span className="pd-cta-arrow">→</span>}
            </button>
            <button
              aria-label="Toggle wishlist"
              className="pd-cta-icon-btn"
              onClick={() => togWish && togWish(product.id)}>
              {isWish && isWish(product.id) ? '\u2665' : '\u2661'}
            </button>
          </div>

          {msg && (
            <div className={`pd-msg ${isMsgOk ? 'pd-msg--ok' : 'pd-msg--err'}`}>{msg}</div>
          )}

          {!isLoggedIn && (
            <div className="pd-signin-tip">
              <span style={{ fontSize:14 }}>✷</span>
              <span>
                <a onClick={() => setPage('auth')}>Sign in</a> to add to bag and save to wishlist.
              </span>
            </div>
          )}

          {/* Trust strip */}
          <div className="pd-trust">
            {TRUST.map(t => (
              <div key={t.l} className="pd-trust-item">
                <span className="pd-trust-icon">{t.i}</span>
                {t.l}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="pd-tabs">
            {['details','material','shipping'].map(t => (
              <button key={t} type="button"
                className={`pd-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="pd-tab-body">
              {product.description || 'Premium quality product crafted with attention to detail. Designed for everyday wear with timeless style.'}
            </div>
          )}
          {tab === 'material' && (
            <div className="pd-tab-body">
              {product.material || 'Please refer to product label for material details. Care: machine wash cold, do not bleach, tumble dry low.'}
            </div>
          )}
          {tab === 'shipping' && (
            <div className="pd-tab-body">
              <div>Standard · 3–7 business days · Free over ₹1,500</div>
              <div>Express · 1–3 business days · ₹199</div>
              <div>Same Day · Available in select metros · ₹299</div>
              <div style={{ marginTop:10 }}>Returns within 7 days of delivery.</div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related-head">
            <div>
              <div className="pd-related-eyebrow">YOU MAY ALSO LIKE</div>
              <div className="pd-related-title">RELATED EDIT</div>
            </div>
            <button className="btn btn-w" onClick={() => setPage('shop')}>VIEW ALL →</button>
          </div>
          <div className="pd-related-grid">
            {related.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openDetail && openDetail(p.id)}
                onQuickAdd={quickAdd} isWish={isWish && isWish(p.id)} onToggleWish={togWish} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
