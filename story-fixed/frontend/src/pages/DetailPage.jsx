// src/pages/DetailPage.jsx — Premium luxury Product Detail page.
//
// Sources product data from the centralized static catalog
// (src/data/products.js) via the schema adapter — no API calls.
// Cart, stock, routing, and ProductCard contracts are all preserved
// exactly; this revision is a pure presentation upgrade.
//
// Notable visual upgrades (vs. the previous PDP):
//   - Sticky desktop gallery, 3:4 main image (matches catalog source).
//   - Editorial eyebrow + larger Bebas display name.
//   - Refined pricing hierarchy with monochrome SAVE pill (no warm red).
//   - Three-state stock pill (IN / LOW / OUT) with tonal indicator dot.
//   - 48px size chips, real strike-through OOS state, hairline hover.
//   - Add-to-cart with inline price (luxury convention).
//   - Three-line trust manifest (no emoji).
//   - Sticky mobile CTA bar (Mr Porter / Net-a-Porter pattern).
//
// Styles are co-located in a <style> block at the end of the file —
// matches the existing inline-style pattern in ShopPage and keeps the
// upgrade fully scoped to this page. No global.css changes required.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fp, pct } from '../utils.js';
import LoadingScreen from '../components/LoadingScreen.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SmartImage from '../components/SmartImage.jsx';
import { getProductImages } from '../utils/productImages.js';
import { useAuth } from '../context/AuthContext.jsx';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';

// Adapt the catalog once at module load so renders reuse a stable array.
const ADAPTED_PRODUCTS = adaptProducts(PRODUCTS);

// Stock-state classification surfaced as a pill on the PDP.
function classifyStock(qty) {
  if (qty === 0)  return { tone: 'oos', label: 'OUT OF STOCK' };
  if (qty <= 5)   return { tone: 'low', label: `LOW STOCK \u00B7 ONLY ${qty} LEFT` };
  return            { tone: 'ok',  label: 'IN STOCK \u00B7 READY TO SHIP' };
}

export default function DetailPage({
  productId, addCart, openDrawer, setPage, openDetail,
  quickAdd, isWish, togWish, toast,
}) {
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
  const [activeImg, setActiveImg] = useState(0);

  // Resolved gallery images for the current product (always an array).
  const galleryImages = useMemo(
    () => (product ? getProductImages(product, 1000) : []),
    [product]
  );

  const loadProduct = useCallback(() => {
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
    setActiveImg(0);

    const match = ADAPTED_PRODUCTS.find(x => String(x?.id) === String(productId));
    if (!match) {
      setError('Product not found');
      setProduct(null);
      setRelated([]);
      setLoading(false);
      return;
    }

    setProduct(match);
    setSelSize(match.sizes[0] || '');
    setSelColor(match.colors[0] || null);

    // Related: same category, exclude self, capped at 4.
    const rel = ADAPTED_PRODUCTS
      .filter(p => p.category_slug === match.category_slug && p.slug !== match.slug)
      .slice(0, 4);
    setRelated(rel);

    setLoading(false);
  }, [productId]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  if (loading) return <LoadingScreen message="LOADING PRODUCT..." />;

  if (error || !product) {
    const isNotFound = error === 'Product not found' || !product;
    return (
      <div style={{ textAlign:'center', padding:'120px 20px', maxWidth:520, margin:'0 auto' }}>
        <div style={{ fontSize:48, opacity:.2, marginBottom:24 }}>{'\u25CE'}</div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'11px', letterSpacing:'.2em', marginBottom:12 }}>
          {isNotFound ? 'PRODUCT NOT FOUND' : 'COULDN\u2019T LOAD PRODUCT'}
        </div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.05em', color:'var(--warm)', marginBottom:32, lineHeight:1.8 }}>
          {isNotFound
            ? 'This product is no longer available or has been removed.'
            : (error || 'Something went wrong while loading this product. Please try again.')}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          {!isNotFound && (
            <button className="btn btn-w" onClick={loadProduct} style={{ fontSize:'8.5px' }}>RETRY</button>
          )}
          <button className="btn btn-k" onClick={() => setPage('shop')} style={{ fontSize:'8.5px' }}>{'\u2190 BACK TO SHOP'}</button>
        </div>
      </div>
    );
  }

  const discount = pct(product.orig_price, product.price);
  const savings  = (product.orig_price || 0) - (product.price || 0);

  // Stock check — safe lookups
  const stockKey = selSize && selColor?.color_name
    ? `${selSize}__${selColor.color_name}`
    : null;
  const stockQty = stockKey ? (product.stockMap[stockKey] ?? 99) : 99;
  const isOOS    = stockQty === 0;
  const stock    = classifyStock(stockQty);

  const wishedHere = !!(isWish && isWish(product.id));

  const handleAdd = async () => {
    if (!selSize)    { setMsg('Please select a size');  return; }
    if (!selColor)   { setMsg('Please select a color'); return; }
    if (!isLoggedIn) { setPage('auth'); return; }
    if (isOOS)       { setMsg('This variant is out of stock'); return; }

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

  const ctaLabel = adding
    ? 'ADDING\u2026'
    : isOOS
      ? 'OUT OF STOCK'
      : 'ADD TO BAG';

  return (
    <div className="pdp-page">
      {/* Breadcrumb */}
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <span onClick={() => setPage('shop')}>SHOP</span>
        <span className="pdp-breadcrumb-sep">/</span>
        <span onClick={() => setPage('shop')}>
          {(product.category_label || 'ALL').toUpperCase()}
        </span>
        <span className="pdp-breadcrumb-sep">/</span>
        <span className="pdp-breadcrumb-current">{product.name || ''}</span>
      </nav>

      <div className="pdp-grid">
        {/* ── Gallery ────────────────────────────────────────────── */}
        <div className="pdp-gallery">
          {/* Thumb rail */}
          {galleryImages.length > 1 && (
            <div className="pdp-gallery-thumbs" role="tablist" aria-label="Product images">
              {galleryImages.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  role="tab"
                  aria-selected={activeImg === i}
                  aria-label={`View image ${i + 1} of ${galleryImages.length}`}
                  onClick={() => setActiveImg(i)}
                  className={`pdp-thumb${activeImg === i ? ' is-active' : ''}`}
                >
                  <SmartImage
                    src={src}
                    alt=""
                    aspectRatio="3/4"
                    fallbackIcon={product.icon || '\u25C9'}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="pdp-gallery-main">
            <SmartImage
              key={galleryImages[activeImg] || 'fallback'}
              src={galleryImages[activeImg] || ''}
              alt={`${product.brand || ''} ${product.name || ''}`.trim()}
              aspectRatio="3/4"
              fallbackIcon={product.icon || '\u25C9'}
              priority
            />
            {product.tag && <div className="pdp-tag-chip">{product.tag}</div>}
            {discount > 0 && <div className="pdp-discount-chip">{`-${discount}%`}</div>}
            <button
              type="button"
              onClick={() => togWish && togWish(product.id)}
              aria-label={wishedHere ? 'Remove from wishlist' : 'Add to wishlist'}
              className="pdp-wish-float"
            >
              {wishedHere ? '\u2665' : '\u2661'}
            </button>
          </div>
        </div>

        {/* ── Info column ────────────────────────────────────────── */}
        <div className="pdp-info">
          {/* Eyebrow: CATEGORY \u00B7 BRAND */}
          <div className="pdp-eyebrow">
            <span>{(product.category_label || '').toUpperCase()}</span>
            {product.brand && (
              <>
                <span className="pdp-eyebrow-sep">{'\u00B7'}</span>
                <span>{product.brand}</span>
              </>
            )}
          </div>

          {/* Display name */}
          <h1 className="pdp-name">{product.name || 'Untitled product'}</h1>

          {/* Price hierarchy */}
          <div className="pdp-price-row">
            <span className="pdp-price-current">{fp(product.price)}</span>
            {discount > 0 && (
              <span className="pdp-price-strike">{fp(product.orig_price)}</span>
            )}
            {discount > 0 && (
              <span className="pdp-price-save">SAVE {fp(savings)}</span>
            )}
          </div>

          <div className="pdp-divider" />

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="pdp-section">
              <div className="pdp-section-head">
                <span className="pdp-section-label">COLOR</span>
                <span className="pdp-section-value">
                  {selColor?.color_name || ''}
                </span>
              </div>
              <div className="pdp-color-row">
                {product.colors.map(c => (
                  <button
                    key={c.color_name}
                    type="button"
                    onClick={() => setSelColor(c)}
                    title={c.color_name}
                    aria-label={`Color ${c.color_name}`}
                    aria-pressed={selColor?.color_name === c.color_name}
                    className={`pdp-color-dot${selColor?.color_name === c.color_name ? ' is-active' : ''}`}
                    style={{ background: c.color_hex || '#000' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="pdp-section">
              <div className="pdp-section-head">
                <span className="pdp-section-label">SIZE</span>
                <span className="pdp-section-value">
                  {selSize ? `\u00B7 ${selSize}` : 'SELECT A SIZE'}
                </span>
              </div>
              <div className="pdp-size-row" role="radiogroup" aria-label="Size">
                {product.sizes.map(s => {
                  const sKey = selColor?.color_name
                    ? `${s}__${selColor.color_name}`
                    : null;
                  const sStock = sKey
                    ? (product.stockMap[sKey] ?? 99)
                    : 99;
                  const sOOS = sStock === 0;
                  const isActive = selSize === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      aria-label={sOOS ? `${s} (out of stock)` : s}
                      disabled={sOOS}
                      onClick={() => !sOOS && setSelSize(s)}
                      className={`pdp-size-chip${isActive ? ' is-active' : ''}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {/* Stock pill — only after a variant is fully selected */}
              {selSize && selColor && (
                <div className={`pdp-stock pdp-stock-${stock.tone}`}>
                  <span className="pdp-stock-dot" aria-hidden="true" />
                  <span>{stock.label}</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="pdp-section">
            <div className="pdp-section-head">
              <span className="pdp-section-label">QUANTITY</span>
            </div>
            <div className="pdp-qty">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="pdp-qty-btn"
              >{'\u2212'}</button>
              <span className="pdp-qty-val" aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(Math.min(stockQty || 99, qty + 1))}
                disabled={qty >= (stockQty || 99)}
                aria-label="Increase quantity"
                className="pdp-qty-btn"
              >+</button>
            </div>
          </div>

          {/* Add to bag */}
          <div className="pdp-cta">
            <button
              type="button"
              className="btn btn-k pdp-add-cta"
              onClick={handleAdd}
              disabled={adding || isOOS}
            >
              <span>{ctaLabel}</span>
              {!isOOS && !adding && (
                <span className="pdp-cta-price">{fp(product.price * qty)}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => togWish && togWish(product.id)}
              aria-label={wishedHere ? 'Remove from wishlist' : 'Add to wishlist'}
              className="pdp-wish-btn"
            >
              {wishedHere ? '\u2665' : '\u2661'}
            </button>
          </div>

          {msg && (
            <div className={`pdp-msg ${msg.includes('!') ? 'pdp-msg-ok' : 'pdp-msg-err'}`}>
              {msg}
            </div>
          )}

          {!isLoggedIn && (
            <div className="pdp-signin-hint">
              <span
                onClick={() => setPage('auth')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPage('auth'); }}
              >Sign in</span>
              {' to add to bag and save items to your wishlist.'}
            </div>
          )}

          {/* Trust manifest */}
          <ul className="pdp-trust" aria-label="Service highlights">
            <li className="pdp-trust-line">{'Complimentary shipping over \u20B91,500'}</li>
            <li className="pdp-trust-line">Free returns within 7 days of delivery</li>
            <li className="pdp-trust-line">Authenticated and shipped by STORY</li>
          </ul>

          {/* Tabs */}
          <div className="pdp-tabs" role="tablist" aria-label="Product information">
            {['details', 'material', 'shipping'].map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`pdp-tab${tab === t ? ' is-active' : ''}`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="pdp-tab-content" role="tabpanel">
            {tab === 'details' && (
              <p>{product.description || 'Premium quality product.'}</p>
            )}
            {tab === 'material' && (
              <p>{product.material || 'Composition details available on the inner garment label.'}</p>
            )}
            {tab === 'shipping' && (
              <div>
                <div className="pdp-shipping-row">
                  <span>STANDARD</span>
                  <span>{'3-7 days \u00B7 Free over \u20B91,500'}</span>
                </div>
                <div className="pdp-shipping-row">
                  <span>EXPRESS</span>
                  <span>{'1-3 days \u00B7 \u20B9199'}</span>
                </div>
                <div className="pdp-shipping-row">
                  <span>SAME DAY</span>
                  <span>{'Select metros \u00B7 \u20B9299'}</span>
                </div>
                <div className="pdp-shipping-row">
                  <span>RETURNS</span>
                  <span>Within 7 days of delivery</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA — fixed bottom, mobile only */}
      <div className="pdp-sticky-cta" aria-hidden={false}>
        <div className="pdp-sticky-info">
          <div className="pdp-sticky-name">{product.name || ''}</div>
          <div className="pdp-sticky-price">{fp(product.price * qty)}</div>
        </div>
        <button
          type="button"
          className="btn btn-k"
          onClick={handleAdd}
          disabled={adding || isOOS}
        >{ctaLabel}</button>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="pdp-related" aria-label="You may also like">
          <h2 className="pdp-related-head">YOU MAY ALSO LIKE</h2>
          <div className="pdp-related-grid">
            {related.slice(0, 4).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => openDetail && openDetail(p.id)}
                onQuickAdd={quickAdd}
                isWish={isWish && isWish(p.id)}
                onToggleWish={togWish}
              />
            ))}
          </div>
        </section>
      )}

      {/* Page-scoped luxury PDP styles. Class names are pdp-* so they
          don't collide with anything else in global.css. */}
      <style>{`
        .pdp-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 40px 0;
        }

        /* ─── Breadcrumb ─── */
        .pdp-breadcrumb {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .22em;
          color: var(--warm);
          margin-bottom: 36px;
          text-transform: uppercase;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .pdp-breadcrumb > span:not(.pdp-breadcrumb-sep):not(.pdp-breadcrumb-current) {
          cursor: pointer;
          transition: color .15s ease;
        }
        .pdp-breadcrumb > span:not(.pdp-breadcrumb-sep):not(.pdp-breadcrumb-current):hover {
          color: #111;
        }
        .pdp-breadcrumb-sep { color: #d0cdc8; }
        .pdp-breadcrumb-current {
          color: #111;
          cursor: default;
          letter-spacing: .14em;
        }

        /* ─── Two-column layout ─── */
        .pdp-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 64px;
          align-items: start;
        }

        /* ─── Gallery ─── */
        .pdp-gallery {
          display: grid;
          grid-template-columns: 88px 1fr;
          gap: 16px;
          align-items: start;
          position: sticky;
          top: 32px;
        }
        .pdp-gallery-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pdp-thumb {
          display: block;
          width: 100%;
          padding: 0;
          border: 1.5px solid transparent;
          background: none;
          cursor: pointer;
          opacity: .55;
          transition: opacity .2s ease, border-color .2s ease;
        }
        .pdp-thumb:hover { opacity: 1; }
        .pdp-thumb.is-active {
          opacity: 1;
          border-color: #111;
        }
        .pdp-gallery-main {
          position: relative;
          border: var(--bd);
          background: var(--off);
          overflow: hidden;
        }
        .pdp-gallery-main .smart-img-fallback-icon {
          font-size: 140px;
          opacity: .14;
        }

        /* On-image chips (replaces the previous orange badge) */
        .pdp-tag-chip {
          position: absolute;
          top: 18px; left: 18px;
          z-index: 2;
          background: #111; color: #fff;
          font-family: var(--fm);
          font-size: 7px;
          letter-spacing: .28em;
          padding: 6px 12px;
          font-weight: 500;
        }
        .pdp-discount-chip {
          position: absolute;
          top: 18px; right: 18px;
          z-index: 2;
          background: #111; color: #fff;
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .14em;
          padding: 6px 10px;
          font-weight: 500;
        }
        .pdp-wish-float {
          position: absolute;
          bottom: 18px; right: 18px;
          z-index: 2;
          background: #fff;
          border: var(--bd);
          width: 40px; height: 40px;
          cursor: pointer;
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s ease, color .15s ease;
        }
        .pdp-wish-float:hover { background: #111; color: #fff; }

        /* ─── Info column ─── */
        .pdp-eyebrow {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .3em;
          color: var(--warm);
          text-transform: uppercase;
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 14px;
        }
        .pdp-eyebrow-sep { color: #d0cdc8; }
        .pdp-name {
          font-family: var(--fs);
          font-size: 40px;
          font-weight: 400;
          letter-spacing: .015em;
          line-height: 1.05;
          margin: 0 0 22px;
        }

        /* Pricing */
        .pdp-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .pdp-price-current {
          font-family: var(--fm);
          font-size: 26px;
          letter-spacing: .025em;
          color: #111;
          font-weight: 500;
        }
        .pdp-price-strike {
          font-family: var(--fm);
          font-size: 14px;
          color: var(--warm);
          text-decoration: line-through;
        }
        .pdp-price-save {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .22em;
          color: #111;
          font-weight: 500;
          padding: 4px 8px;
          border: 1px solid #111;
        }

        .pdp-divider {
          height: 1px;
          background: #e8e8e6;
          margin: 0 0 28px;
        }

        /* Section pattern */
        .pdp-section {
          margin-bottom: 28px;
        }
        .pdp-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .pdp-section-label {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .28em;
          color: var(--warm);
          font-weight: 500;
        }
        .pdp-section-value {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .18em;
          color: #111;
        }

        /* Color swatches */
        .pdp-color-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pdp-color-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          outline: 1px solid var(--bd);
          outline-offset: 2px;
          cursor: pointer;
          padding: 0;
          transition: outline-color .15s ease, transform .15s ease;
        }
        .pdp-color-dot:hover { outline-color: #111; }
        .pdp-color-dot.is-active {
          border-color: #fff;
          outline: 2px solid #111;
          outline-offset: 2px;
        }

        /* Size chips */
        .pdp-size-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pdp-size-chip {
          min-width: 48px;
          height: 48px;
          padding: 0 14px;
          border: var(--bd);
          background: #fff;
          color: #111;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .12em;
          font-weight: 500;
          cursor: pointer;
          transition: border-color .15s ease, background .15s ease, color .15s ease;
          position: relative;
        }
        .pdp-size-chip:hover:not(:disabled) { border-color: #111; }
        .pdp-size-chip.is-active {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .pdp-size-chip:disabled {
          background: var(--off);
          color: var(--warm);
          cursor: not-allowed;
          text-decoration: line-through;
          text-decoration-color: var(--warm);
          text-decoration-thickness: 1px;
        }

        /* Stock pill */
        .pdp-stock {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .2em;
          font-weight: 500;
          text-transform: uppercase;
        }
        .pdp-stock-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }
        .pdp-stock-ok  { color: #2c5d3a; }
        .pdp-stock-ok  .pdp-stock-dot { background: #2c5d3a; }
        .pdp-stock-low { color: #7a5a1f; }
        .pdp-stock-low .pdp-stock-dot { background: #c89329; }
        .pdp-stock-oos { color: #6e1f1f; }
        .pdp-stock-oos .pdp-stock-dot { background: #6e1f1f; }

        /* Quantity */
        .pdp-qty {
          display: flex;
          align-items: center;
          border: var(--bd);
          background: #fff;
          width: fit-content;
        }
        .pdp-qty-btn {
          width: 44px; height: 44px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-family: var(--fm);
          color: #111;
        }
        .pdp-qty-btn:disabled { color: var(--warm); cursor: not-allowed; }
        .pdp-qty-val {
          width: 44px;
          text-align: center;
          font-family: var(--fm);
          font-size: 11px;
          letter-spacing: .04em;
        }

        /* CTA */
        .pdp-cta {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
          align-items: stretch;
        }
        .pdp-add-cta {
          flex: 1;
          height: 56px;
          font-size: 9.5px;
          letter-spacing: .25em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 0 24px;
        }
        .pdp-add-cta .pdp-cta-price {
          font-weight: 500;
          letter-spacing: .08em;
          font-size: 10px;
          position: relative;
          padding-left: 16px;
        }
        .pdp-add-cta .pdp-cta-price::before {
          content: '';
          position: absolute;
          left: 0; top: 22%; bottom: 22%;
          width: 1px;
          background: rgba(255,255,255,.32);
        }
        .pdp-wish-btn {
          width: 56px; height: 56px;
          border: 1.5px solid #111;
          background: #fff;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .15s ease, color .15s ease;
        }
        .pdp-wish-btn:hover { background: #111; color: #fff; }

        /* Inline messages */
        .pdp-msg {
          padding: 12px 16px;
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .12em;
          margin-bottom: 16px;
          border: var(--bd);
          text-transform: uppercase;
        }
        .pdp-msg-ok  { background: #fbfbf9; border-color: #2c5d3a; color: #2c5d3a; }
        .pdp-msg-err { background: #fbfbf9; border-color: #6e1f1f; color: #6e1f1f; }

        .pdp-signin-hint {
          padding: 12px 16px;
          background: var(--off);
          border: var(--bd);
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .08em;
          color: var(--warm);
          margin-bottom: 22px;
        }
        .pdp-signin-hint span[role="button"] {
          color: #111;
          text-decoration: underline;
          cursor: pointer;
          text-underline-offset: 2px;
        }

        /* Trust manifest — three editorial rule-prefix lines */
        .pdp-trust {
          list-style: none;
          padding: 18px 0;
          margin: 0 0 28px;
          border-top: var(--bd);
          border-bottom: var(--bd);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pdp-trust-line {
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .14em;
          color: var(--warm);
          text-transform: uppercase;
          position: relative;
          padding-left: 18px;
        }
        .pdp-trust-line::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          width: 8px; height: 1px;
          background: #111;
          transform: translateY(-50%);
        }

        /* Tabs */
        .pdp-tabs {
          display: flex;
          border-bottom: var(--bd);
          margin-bottom: 22px;
        }
        .pdp-tab {
          flex: 1;
          padding: 14px 8px;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .22em;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          cursor: pointer;
          color: var(--warm);
          transition: color .15s ease, border-color .15s ease;
          font-weight: 500;
        }
        .pdp-tab:hover { color: #111; }
        .pdp-tab.is-active { color: #111; border-color: #111; }

        .pdp-tab-content {
          font-family: var(--fm);
          font-size: 10px;
          letter-spacing: .035em;
          color: #4a4a48;
          line-height: 1.95;
          min-height: 96px;
        }
        .pdp-tab-content p { margin: 0; }

        .pdp-shipping-row {
          display: flex;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px dashed #e8e8e6;
          font-size: 9px;
          letter-spacing: .12em;
          color: var(--warm);
          text-transform: uppercase;
        }
        .pdp-shipping-row:last-child { border-bottom: none; }
        .pdp-shipping-row > span:last-child { color: #111; text-transform: none; letter-spacing: .04em; }

        /* Sticky mobile CTA — hidden by default, surfaced on small screens */
        .pdp-sticky-cta { display: none; }

        /* Related rail */
        .pdp-related {
          margin: 88px 0 0;
          padding-top: 56px;
          border-top: var(--bd);
        }
        .pdp-related-head {
          font-family: var(--fs);
          font-size: 28px;
          letter-spacing: .04em;
          margin: 0 0 28px;
          font-weight: 400;
        }
        .pdp-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--bd);
        }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .pdp-page { padding: 28px 20px 96px; }
          .pdp-grid { grid-template-columns: 1fr; gap: 32px; }
          .pdp-gallery {
            grid-template-columns: 1fr;
            position: static;
          }
          .pdp-gallery-thumbs {
            flex-direction: row;
            overflow-x: auto;
            order: 2;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .pdp-gallery-thumbs::-webkit-scrollbar { display: none; }
          .pdp-thumb { width: 64px; flex-shrink: 0; }

          .pdp-name { font-size: 30px; margin-bottom: 18px; }
          .pdp-price-current { font-size: 22px; }
          .pdp-related-grid { grid-template-columns: repeat(2, 1fr); }
          .pdp-related { margin-top: 56px; padding-top: 36px; }
          .pdp-related-head { font-size: 22px; }

          /* Sticky CTA on mobile */
          .pdp-sticky-cta {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 50;
            background: #fff;
            border-top: var(--bd);
            padding: 12px 16px;
            gap: 12px;
            align-items: center;
            box-shadow: 0 -4px 14px rgba(0,0,0,.04);
          }
          .pdp-sticky-info { flex: 1; min-width: 0; }
          .pdp-sticky-name {
            font-family: var(--fm);
            font-size: 8px;
            letter-spacing: .14em;
            color: var(--warm);
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .pdp-sticky-price {
            font-family: var(--fm);
            font-size: 13px;
            color: #111;
            margin-top: 2px;
            font-weight: 500;
            letter-spacing: .02em;
          }
          .pdp-sticky-cta .btn {
            height: 44px;
            flex-shrink: 0;
            padding: 0 22px;
            font-size: 9px;
            letter-spacing: .22em;
          }
        }

        @media (max-width: 640px) {
          .pdp-name { font-size: 26px; }
          .pdp-trust { padding: 14px 0; gap: 6px; }
          .pdp-trust-line { font-size: 8px; }
          .pdp-tab { padding: 12px 4px; font-size: 8.5px; letter-spacing: .18em; }
        }
      `}</style>
    </div>
  );
}
