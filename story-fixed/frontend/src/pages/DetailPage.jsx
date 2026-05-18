// src/pages/DetailPage.jsx — Luxury product detail (preserves API + stock logic)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { productsAPI } from '../services/api.js';
import { fp, pct } from '../utils.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TRUST = [
  { i: '\u25C8', l: 'SECURE PAYMENT',  s: 'Encrypted checkout' },
  { i: '\u21BB',  l: 'EASY RETURNS',    s: '7 days, no questions' },
  { i: '\u2713',  l: '100% AUTHENTIC',  s: 'Sourced from brands' },
  { i: '\u279C',  l: 'FAST DELIVERY',   s: 'Free over \u20B91,500' },
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
  const [activeFrame, setActiveFrame] = useState(0);

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
    setActiveFrame(0);

    try {
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

  // Clamp qty when the selected variant's stock shrinks below current qty.
  useEffect(() => {
    if (!product) return;
    const k = selSize && selColor?.color_name ? `${selSize}__${selColor.color_name}` : null;
    if (!k) return;
    const has = Object.prototype.hasOwnProperty.call(product.stockMap, k);
    if (!has) return;
    const max = product.stockMap[k];
    if (typeof max === 'number' && qty > Math.max(1, max)) {
      setQty(Math.max(1, max || 1));
    }
  }, [selSize, selColor, product, qty]);

  // Build a 4-frame gallery (placeholder shades) so the layout reads like a real PDP
  // without inventing image assets. Each frame uses the same product icon.
  const frames = useMemo(() => ([
    { id: 'front', label: 'Front',   tone: 'tone-a' },
    { id: 'side',  label: 'Side',    tone: 'tone-b' },
    { id: 'back',  label: 'Back',    tone: 'tone-c' },
    { id: 'detail',label: 'Detail',  tone: 'tone-d' },
  ]), []);

  if (loading) return <LoadingScreen message="LOADING PRODUCT..." />;

  if (error || !product) {
    const isNotFound = error === 'Product not found' || !product;
    return (
      <div className="pd-empty">
        <div className="pd-empty-icon">\u25CE</div>
        <div className="pd-empty-title">
          {isNotFound ? 'PRODUCT NOT FOUND' : 'COULDN\u2019T LOAD PRODUCT'}
        </div>
        <div className="pd-empty-sub">
          {isNotFound
            ? 'This product is no longer available or has been removed.'
            : (error || 'Something went wrong while loading this product. Please try again.')}
        </div>
        <div className="pd-empty-actions">
          {!isNotFound && <button className="btn btn-w" onClick={loadProduct}>RETRY</button>}
          <button className="btn btn-k" onClick={() => setPage('shop')}>\u2190 BACK TO SHOP</button>
        </div>
      </div>
    );
  }

  const discount = pct(product.orig_price, product.price);
  const stockKey = selSize && selColor?.color_name ? `${selSize}__${selColor.color_name}` : null;
  const hasStock = stockKey && Object.prototype.hasOwnProperty.call(product.stockMap, stockKey);
  const stockQty = hasStock ? product.stockMap[stockKey] : 99;
  const isOOS    = hasStock && stockQty === 0;
  const isLow    = hasStock && stockQty > 0 && stockQty <= 5;
  const savings  = discount > 0 ? (product.orig_price || 0) - (product.price || 0) : 0;
  const maxQty   = hasStock ? Math.max(1, stockQty) : 99;

  const handleAdd = async () => {
    if (!selSize)   { setMsg('Please select a size');  return; }
    if (!selColor)  { setMsg('Please select a colour'); return; }
    if (!isLoggedIn){ setPage('auth'); return; }
    if (isOOS)      { setMsg('This variant is out of stock'); return; }
    if (hasStock && qty > stockQty) {
      setMsg(`Only ${stockQty} unit${stockQty !== 1 ? 's' : ''} available in this size & colour`);
      return;
    }

    setAdding(true);
    setMsg('');
    try {
      const success = await addCart(product, selSize, selColor);
      if (success) {
        setMsg('Added to bag!');
        if (toast) toast('Added to bag', 'success');
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
  const wishOn  = !!(isWish && isWish(product.id));

  return (
    <div className="pd2-wrap">
      {/* Breadcrumb */}
      <nav className="pd2-crumb" aria-label="Breadcrumb">
        <span role="link" onClick={() => setPage('shop')}>Shop</span>
        <span className="sep">/</span>
        <span role="link" onClick={() => setPage('shop')}>{(product.category_label || 'All').toUpperCase()}</span>
        <span className="sep">/</span>
        <span className="cur">{product.name || ''}</span>
      </nav>

      <div className="pd2-grid">
        {/* ────────── LEFT — Gallery ────────── */}
        <div className="pd2-gallery">
          {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
          <div className="pd2-thumbs" role="tablist" aria-label="Product views">
            {frames.map((f, i) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={activeFrame === i}
                className={`pd2-thumb ${f.tone}${activeFrame === i ? ' active' : ''}`}
                onClick={() => setActiveFrame(i)}
                title={f.label}
              >
                <span className="pd2-thumb-icon">{product.icon || '\u25C9'}</span>
              </button>
            ))}
          </div>

          {/* Main media stack */}
          <div className="pd2-media-col">
            <div className={`pd2-media ${frames[activeFrame].tone}`}>
              <span className="pd2-media-icon">{product.icon || '\u25C9'}</span>

              {/* Top-left: hairline category */}
              <div className="pd2-media-top">
                <span className="pd2-media-cat">
                  {(product.category_label || 'EDIT').toUpperCase()}
                </span>
                {product.tag && (
                  <span className="pd2-media-tag">{product.tag}</span>
                )}
              </div>

              {/* Top-right: discount chip */}
              {discount > 0 && (
                <div className="pd2-media-discount">\u2212{discount}%</div>
              )}

              {/* Bottom-right: wishlist */}
              <button
                type="button"
                aria-label={wishOn ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`pd2-wish${wishOn ? ' active' : ''}`}
                onClick={() => togWish && togWish(product.id)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishOn ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Bottom-left: frame label */}
              <div className="pd2-media-frame">{frames[activeFrame].label.toUpperCase()}</div>
            </div>

            {/* Secondary image row (cinematic detail strip) */}
            <div className="pd2-strip">
              {frames.slice(1, 3).map(f => (
                <div key={f.id} className={`pd2-strip-cell ${f.tone}`}>
                  <span className="pd2-strip-icon">{product.icon || '\u25C9'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ────────── RIGHT — Info ────────── */}
        <aside className="pd2-info">
          <div className="pd2-eyebrow">{product.brand || ''}</div>
          <h1 className="pd2-title">{product.name || 'Untitled product'}</h1>

          <div className="pd2-meta">
            <span className="pd2-stars" aria-label="4 out of 5 stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span style={{ opacity:.3 }}>★</span>
            </span>
            <span className="pd2-meta-dot">·</span>
            <span>BASED ON REVIEWS</span>
            {product.sku && <>
              <span className="pd2-meta-dot">·</span>
              <span>SKU {String(product.sku).toUpperCase()}</span>
            </>}
          </div>

          <div className="pd2-price-row">
            <span className="pd2-price">{fp(product.price)}</span>
            {discount > 0 && <span className="pd2-price-orig">{fp(product.orig_price)}</span>}
            {discount > 0 && <span className="pd2-price-save">SAVE {fp(savings)}</span>}
          </div>

          <p className="pd2-summary">
            {product.short_description || product.description ||
              'A considered piece designed for everyday wear. Crafted with attention to fit, drape and finish.'}
          </p>

          <div className="pd2-divider" />

          {/* Colour */}
          {product.colors.length > 0 && (
            <div className="pd2-section">
              <div className="pd2-section-head">
                <span>COLOUR</span>
                <span className="pd2-section-value">{selColor?.color_name || ''}</span>
              </div>
              <div className="pd2-swatches">
                {product.colors.map(c => (
                  <button
                    key={c.color_name}
                    type="button"
                    title={c.color_name}
                    aria-label={c.color_name}
                    className={`pd2-swatch${selColor?.color_name === c.color_name ? ' selected' : ''}`}
                    onClick={() => setSelColor(c)}
                  >
                    <span className="pd2-swatch-fill" style={{ background: c.color_hex || '#000' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="pd2-section">
              <div className="pd2-section-head">
                <span>SIZE</span>
                <button type="button" className="pd2-link">SIZE GUIDE</button>
              </div>
              <div className="pd2-sizes">
                {product.sizes.map(s => {
                  const sKey = selColor?.color_name ? `${s}__${selColor.color_name}` : null;
                  const sStock = sKey ? (product.stockMap[sKey] ?? 99) : 99;
                  const sOOS = sStock === 0;
                  const cls = `pd2-size${selSize === s ? ' selected' : ''}${sOOS ? ' oos' : ''}`;
                  return (
                    <button key={s} type="button" className={cls}
                      onClick={() => !sOOS && setSelSize(s)}
                      disabled={sOOS}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {hasStock && isOOS && selSize && (
                <div className="pd2-stock-counter pd2-stock-counter--oos" role="status" aria-live="polite">
                  <span className="pd2-stock-counter-dot" aria-hidden="true" />
                  Out of stock — try another size
                </div>
              )}
              {hasStock && isLow && selSize && (
                <>
                  <div className="pd2-stock-counter pd2-stock-counter--low" role="status" aria-live="polite">
                    <span className="pd2-stock-counter-dot" aria-hidden="true" />
                    Only {stockQty} left
                  </div>
                  <div className="pd2-urgency" role="status">
                    <span className="pd2-urgency-icon" aria-hidden="true">!</span>
                    <span>Selling fast in this size — only {stockQty} unit{stockQty !== 1 ? 's' : ''} remaining.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quantity + CTAs */}
          <div className="pd2-buy">
            <div className={`pd2-qty${isOOS ? ' is-disabled' : ''}`} aria-label="Quantity" aria-disabled={isOOS ? 'true' : undefined}>
              <button type="button" aria-label="Decrease quantity"
                disabled={isOOS || qty <= 1}
                className={qty <= 1 ? 'qty-btn-disabled' : ''}
                onClick={() => setQty(Math.max(1, qty - 1))}>\u2212</button>
              <span className="pd2-qty-value">{qty}</span>
              <button type="button" aria-label="Increase quantity"
                disabled={isOOS || qty >= maxQty}
                className={qty >= maxQty ? 'qty-btn-disabled' : ''}
                onClick={() => setQty(Math.min(maxQty, qty + 1))}>+</button>
            </div>

            <button className="pd2-cta" onClick={handleAdd} disabled={adding || isOOS}>
              <span>{adding ? 'ADDING\u2026' : isOOS ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
              {!adding && !isOOS && <span className="pd2-cta-arrow">\u2192</span>}
            </button>

            <button
              type="button"
              aria-label={wishOn ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`pd2-icon-btn${wishOn ? ' active' : ''}`}
              onClick={() => togWish && togWish(product.id)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={wishOn ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {msg && (
            <div className={`pd2-msg ${isMsgOk ? 'pd2-msg--ok' : 'pd2-msg--err'}`}>{msg}</div>
          )}

          {!isLoggedIn && (
            <div className="pd2-tip">
              <span className="pd2-tip-icon">\u2737</span>
              <span>
                <a onClick={() => setPage('auth')}>Sign in</a> to add to bag and save to wishlist.
              </span>
            </div>
          )}

          {/* Trust strip */}
          <div className="pd2-trust">
            {TRUST.map(t => (
              <div key={t.l} className="pd2-trust-cell">
                <div className="pd2-trust-icon">{t.i}</div>
                <div>
                  <div className="pd2-trust-label">{t.l}</div>
                  <div className="pd2-trust-sub">{t.s}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="pd2-tabs" role="tablist">
            {['details','material','shipping'].map(t => (
              <button key={t} type="button" role="tab"
                aria-selected={tab === t}
                className={`pd2-tab${tab === t ? ' active' : ''}`}
                onClick={() => setTab(t)}>
                {t === 'details' ? 'DESCRIPTION' : t === 'material' ? 'COMPOSITION & CARE' : 'SHIPPING & RETURNS'}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div className="pd2-tab-body">
              {product.description || 'A considered piece designed with attention to fit, drape and finish. Cut for everyday wear with timeless proportions.'}
            </div>
          )}
          {tab === 'material' && (
            <div className="pd2-tab-body">
              {product.material || 'Composition disclosed on product label. Care: machine wash cold, do not bleach, tumble dry low, iron on reverse.'}
            </div>
          )}
          {tab === 'shipping' && (
            <div className="pd2-tab-body">
              <div className="pd2-row"><span>Standard</span><span>3–7 business days · Free over ₹1,500</span></div>
              <div className="pd2-row"><span>Express</span><span>1–3 business days · ₹199</span></div>
              <div className="pd2-row"><span>Same Day</span><span>Select metros · ₹299</span></div>
              <div className="pd2-row"><span>Returns</span><span>Within 7 days of delivery</span></div>
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pd2-related">
          <div className="pd2-related-head">
            <div>
              <div className="pd2-related-eyebrow">YOU MAY ALSO LIKE</div>
              <h2 className="pd2-related-title">The Edit</h2>
            </div>
            <button className="btn btn-w" onClick={() => setPage('shop')}>VIEW ALL \u2192</button>
          </div>
          <div className="pd2-related-grid">
            {related.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openDetail && openDetail(p.id)}
                onQuickAdd={quickAdd} isWish={isWish && isWish(p.id)} onToggleWish={togWish} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
