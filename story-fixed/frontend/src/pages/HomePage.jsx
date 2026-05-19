// src/pages/HomePage.jsx
// =============================================================================
//  STORY (TM)  -  PREMIUM MONOCHROME LUXURY HOMEPAGE
// =============================================================================
//
//  A clean, restrained redesign in the spirit of COS / Fear of God Essentials
//  / The Row. Built around a split hero (white left / dark right showcase) and
//  outlined display typography as the signature element. All sections share
//  the same monochrome palette, generous spacing, and subtle hover motion.
//
//  Sections (in order):
//    1. Split Hero            - white-left editorial copy + dark-right showcase
//    2. Manifesto strip       - one editorial line on warm-cream
//    3. New In rail           - 4 newest products, outlined accent heading
//    4. Two-up editorial      - OUTWEAR / KNIT cinematic split
//    5. Category atlas        - all 7 categories with hero imagery
//    6. Pull quote            - dark editorial brand statement
//    7. Markdowns             - 4 on-sale products
//    8. Service strip         - three rule-prefix manifesto lines
//
//  Preserved verbatim:
//    - Routing  (every CTA flows through `setPage`)
//    - Navbar / BrandTicker / Footer  (rendered by App.jsx; Footer below)
//    - ProductCard contract  (used as-is in product rails)
//    - Static catalog data path  (useStaticProducts + the adapter)
//    - Backend, APIs, auth, cart, inventory  (untouched)
//
//  All new styles are co-located in a single <style> block at the end of
//  the file (matches the existing pattern in ShopPage / DetailPage). No
//  edits to global.css.
// =============================================================================

import { useEffect } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

// ----------------------------------------------------------------------------
//  Module-scope adapted catalog. Adapted once at load so the editorial
//  selectors below (hero feature, banner cards, atlas, markdowns) are O(1).
// ----------------------------------------------------------------------------
const ADAPTED = adaptProducts(PRODUCTS);
const findBySlug = (slug) => ADAPTED.find(p => p.slug === slug) || null;

// Featured product shown in the hero showcase card. Falls back to the
// first product if the slug is missing from the catalog.
const HERO_FEATURE_SLUG = 'phantom-wool-overcoat';

// Two-up editorial banner — one product per category, hand-picked.
const BANNER_CARDS = [
  { label: 'OUTWEAR', sub: 'A STUDY IN STRUCTURE', slug: 'phantom-wool-overcoat' },
  { label: 'KNIT',    sub: 'COMFORT, IMPLIED',     slug: 'atelier-cashmere-crew' },
];

// Category atlas — all seven storefront verticals, one editorial image each.
const CATEGORY_ATLAS = [
  { id: 'outwear',     label: 'OUTWEAR',     slug: 'obsidian-tailored-trench' },
  { id: 'headwear',    label: 'HEADWEAR',    slug: 'eclipse-wool-beanie'      },
  { id: 'knit',        label: 'KNIT',        slug: 'specter-mohair-sweater'   },
  { id: 'jeans',       label: 'JEANS',       slug: 'vault-selvedge-slim-jean' },
  { id: 'pants',       label: 'PANTS',       slug: 'pillar-pleated-trouser'   },
  { id: 'shoes',       label: 'SHOES',       slug: 'phantom-runner-v2'        },
  { id: 'accessories', label: 'ACCESSORIES', slug: 'halo-leather-belt'        },
];

// On-sale products (price < orig_price). Capped at 4 for the rail.
const ON_SALE = ADAPTED
  .filter(p => Number(p.price) < Number(p.orig_price))
  .slice(0, 4);

// Format a number as INR with thousands separators (en-IN locale).
const fmtInr = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  try { return v.toLocaleString('en-IN'); } catch { return String(v); }
};

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const { products: newArrivals } = useProducts({ limit: 4, sort: 'newest' });
  const safeNew = Array.isArray(newArrivals) ? newArrivals : [];

  const heroFeature = findBySlug(HERO_FEATURE_SLUG) || ADAPTED[0] || null;
  const heroOnSale = heroFeature
    && Number(heroFeature.price) < Number(heroFeature.orig_price);

  // ── Scroll-triggered reveal for editorial sections.
  // Tasteful 0.8s opacity + translate. Honours prefers-reduced-motion via CSS,
  // and hard-falls-back to "always visible" if IntersectionObserver is missing.
  useEffect(() => {
    const els = document.querySelectorAll('.hp-reveal');
    if (typeof IntersectionObserver === 'undefined' || !els.length) {
      els.forEach(el => el.classList.add('hp-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('hp-revealed');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="hp">
      {/* ── 1. SPLIT HERO ──────────────────────────────────────────────
           White-left editorial copy with outlined display headline.
           Dark-right showcase panel with overlapping frames + product
           feature card + stats. Stacks vertically below 900px. */}
      <section className="hp-hero" aria-label="STORY SS25 — latest offerings">
        {/* LEFT — editorial copy on white */}
        <div className="hp-hero-left">
          <div className="hp-hero-eyebrow">
            <span className="hp-hero-eyebrow-rule" aria-hidden="true" />
            THE EQUALITY BRAND <span aria-hidden="true">{'\u2014'}</span> SS 2025
          </div>

          <h1 className="hp-hero-title">
            <span className="hp-h-fill">OUR</span>
            <span className="hp-h-outline">LATEST</span>
            <span className="hp-h-fill">OFFERINGS</span>
          </h1>

          <div className="hp-hero-divider" aria-hidden="true" />

          <p className="hp-hero-lede">
            Discover our latest offerings featuring genuine branded clothing for
            everyone. Cutting-edge designs and premium quality at prices that
            actually make sense.
          </p>

          <div className="hp-hero-cta">
            <button
              type="button"
              className="hp-cta-primary"
              onClick={() => setPage('shop')}
            >
              SHOP THE COLLECTION <span aria-hidden="true">{'\u2192'}</span>
            </button>
            <button
              type="button"
              className="hp-cta-link"
              onClick={() => setPage('about')}
            >
              OUR STORY
            </button>
          </div>
        </div>

        {/* RIGHT — dark showcase panel */}
        <div className="hp-hero-right" aria-hidden="true">
          {/* Decorative overlapping square frames. The middle frame
              optionally houses the featured product image. */}
          <div className="hp-frames">
            <div className="hp-frame hp-frame-1" />
            <div className="hp-frame hp-frame-2">
              {heroFeature && (
                <img
                  className="hp-frame-img"
                  src={heroFeature.image_url}
                  alt=""
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
            <div className="hp-frame hp-frame-3" />
          </div>

          {/* Sparkle dingbats — sized + positioned to mirror the screenshot */}
          <span className="hp-spark hp-spark-1">{'\u2726'}</span>
          <span className="hp-spark hp-spark-2">{'\u25C7'}</span>

          {/* Featured-product overlay card */}
          {heroFeature && (
            <button
              type="button"
              className="hp-feature-card"
              onClick={() => openDetail(heroFeature.id)}
              aria-hidden="false"
              aria-label={`View ${heroFeature.name}`}
            >
              <div className="hp-feature-eyebrow">NEW ARRIVAL</div>
              <div className="hp-feature-name">
                {String(heroFeature.name || '').toUpperCase()}
              </div>
              <div className="hp-feature-prices">
                <span className="hp-feature-price">
                  {'\u20B9'}{fmtInr(heroFeature.price)}
                </span>
                {heroOnSale && (
                  <span className="hp-feature-strike">
                    {'\u20B9'}{fmtInr(heroFeature.orig_price)}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Stat blocks (mirrors screenshot: 100% / 14+) */}
          <div className="hp-stats">
            <div className="hp-stat">
              <span className="hp-stat-num">100%</span>
              <span className="hp-stat-lbl">GENUINE</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat-num">14+</span>
              <span className="hp-stat-lbl">BRANDS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MANIFESTO ─────────────────────────────────────────────── */}
      <section className="hp-manifesto hp-reveal" aria-label="Manifesto">
        <p>
          Atelier-finished pieces. Considered design. Worn deliberately.
        </p>
      </section>

      {/* ── 3. NEW IN ────────────────────────────────────────────────── */}
      <section className="hp-section hp-reveal" aria-label="New In">
        <header className="hp-section-head">
          <div>
            <div className="hp-eyebrow">JUST DROPPED {'\u00B7'} SS 2025</div>
            <h2 className="hp-section-title">
              <span className="hp-h-outline-sm">NEW</span>{' '}
              <span className="hp-h-fill">IN</span>
            </h2>
          </div>
          <button
            type="button"
            className="hp-link-cta"
            onClick={() => setPage('shop')}
          >
            VIEW ALL <span aria-hidden="true">{'\u2192'}</span>
          </button>
        </header>
        {safeNew.length > 0 ? (
          <div className="hp-grid-4">
            {safeNew.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => openDetail(p.id)}
                onQuickAdd={() => quickAdd(p.id)}
                isWish={isWish(p.id)}
                onToggleWish={togWish}
              />
            ))}
          </div>
        ) : (
          <div className="hp-empty">No new arrivals yet.</div>
        )}
      </section>

      {/* ── 4. TWO-UP EDITORIAL BANNER ──────────────────────────────── */}
      <section className="hp-twoup hp-reveal" aria-label="Editorial banner">
        {BANNER_CARDS.map(card => {
          const product = findBySlug(card.slug);
          if (!product) return null;
          return (
            <button
              key={card.label}
              type="button"
              className="hp-banner-card"
              onClick={() => openDetail(product.id)}
              aria-label={`Explore ${card.label}`}
            >
              <img
                className="hp-banner-img"
                src={product.image_url}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <div className="hp-banner-scrim" aria-hidden="true" />
              <div className="hp-banner-overlay">
                <div className="hp-banner-eyebrow">
                  EDIT {'\u00B7'} {card.sub}
                </div>
                <h3 className="hp-banner-title">{card.label}</h3>
                <span className="hp-banner-cta">
                  EXPLORE <span aria-hidden="true">{'\u2192'}</span>
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ── 5. CATEGORY ATLAS ────────────────────────────────────────── */}
      <section className="hp-section hp-reveal" aria-label="Shop by category">
        <header className="hp-section-head hp-section-head-center">
          <div className="hp-eyebrow">THE EDITION</div>
          <h2 className="hp-section-title">
            <span className="hp-h-fill">SHOP BY</span>{' '}
            <span className="hp-h-outline-sm">CATEGORY</span>
          </h2>
        </header>
        <div className="hp-atlas">
          {CATEGORY_ATLAS.map(cat => {
            const product = findBySlug(cat.slug);
            return (
              <button
                key={cat.id}
                type="button"
                className="hp-atlas-tile"
                onClick={() => setPage('shop')}
                aria-label={`Shop ${cat.label}`}
              >
                {product ? (
                  <img
                    className="hp-atlas-img"
                    src={product.image_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div className="hp-atlas-placeholder" aria-hidden="true">
                    {'\u25C9'}
                  </div>
                )}
                <div className="hp-atlas-overlay">
                  <span className="hp-atlas-label">{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 6. PULL QUOTE ────────────────────────────────────────────── */}
      <section className="hp-quote hp-reveal" aria-label="Brand statement">
        <h2 className="hp-quote-text">
          <span className="hp-h-fill">DESIGNED IN STUDIO.</span>
          <br />
          <span className="hp-h-fill">CONSTRUCTED BY HAND.</span>
          <br />
          <span className="hp-h-outline-on-dark">MADE TO OUTLAST TREND.</span>
        </h2>
        <button
          type="button"
          className="hp-cta-primary hp-cta-on-dark"
          onClick={() => setPage('about')}
        >
          READ THE STORY <span aria-hidden="true">{'\u2192'}</span>
        </button>
      </section>

      {/* ── 7. MARKDOWNS ────────────────────────────────────────────── */}
      {ON_SALE.length > 0 && (
        <section className="hp-section hp-reveal" aria-label="End of season markdowns">
          <header className="hp-section-head">
            <div>
              <div className="hp-eyebrow">END OF SEASON</div>
              <h2 className="hp-section-title">
                <span className="hp-h-fill">MARK</span>
                <span className="hp-h-outline-sm">DOWNS</span>
              </h2>
            </div>
            <button
              type="button"
              className="hp-link-cta"
              onClick={() => setPage('shop')}
            >
              VIEW ALL <span aria-hidden="true">{'\u2192'}</span>
            </button>
          </header>
          <div className="hp-grid-4">
            {ON_SALE.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onClick={() => openDetail(p.id)}
                onQuickAdd={() => quickAdd(p.id)}
                isWish={isWish(p.id)}
                onToggleWish={togWish}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 8. SERVICE STRIP ────────────────────────────────────────── */}
      <section className="hp-service" aria-label="Service highlights">
        <ul>
          <li>{'COMPLIMENTARY SHIPPING OVER \u20B91,500'}</li>
          <li>FREE RETURNS WITHIN 7 DAYS</li>
          <li>AUTHENTICATED BY STORY</li>
        </ul>
      </section>

      <Footer setPage={setPage} />

      {/* All luxury homepage styles. Class names are hp-* so they don't
          collide with anything in global.css. Co-located in a single
          <style> block to match the existing inline-style pattern. */}
      <style>{`
        /* ─── Layout primitives ─── */
        .hp { background: #fff; color: #111; }

        .hp-section {
          max-width: 1440px;
          margin: 0 auto;
          padding: 120px 48px;
        }

        .hp-section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 56px;
          gap: 24px;
          flex-wrap: wrap;
          padding-bottom: 28px;
          border-bottom: 1px solid #ececec;
        }
        .hp-section-head-center {
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 64px;
          padding-bottom: 0;
          border-bottom: none;
        }

        .hp-eyebrow {
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .38em;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .hp-section-title {
          font-family: var(--fm);
          font-size: clamp(36px, 5.2vw, 68px);
          letter-spacing: -.02em;
          line-height: .95;
          font-weight: 900;
          margin: 0;
          color: #111;
          text-transform: uppercase;
        }

        /* Outlined display variants — the signature element of the page.
           Used at heavy (900) weight, so strokes are scaled accordingly. */
        .hp-h-fill {
          color: #111;
        }
        .hp-h-outline {
          -webkit-text-stroke: 2.5px #111;
          color: transparent;
          letter-spacing: -.005em;
        }
        .hp-h-outline-sm {
          -webkit-text-stroke: 1.4px #111;
          color: transparent;
        }
        .hp-h-outline-on-dark {
          -webkit-text-stroke: 1.6px #fff;
          color: transparent;
        }

        /* ─── Shared CTAs ─── */
        .hp-cta-primary {
          font-family: var(--fm);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .25em;
          text-transform: uppercase;
          padding: 17px 32px;
          background: #111;
          color: #fff;
          border: 1.5px solid #111;
          cursor: pointer;
          transition: background .25s ease,
                      color .25s ease,
                      transform .25s ease,
                      letter-spacing .35s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .hp-cta-primary:hover {
          background: transparent;
          color: #111;
          transform: translateY(-1px);
          letter-spacing: .3em;
        }
        .hp-cta-primary.hp-cta-on-dark {
          background: transparent;
          color: #fff;
          border-color: #fff;
        }
        .hp-cta-primary.hp-cta-on-dark:hover {
          background: #fff;
          color: #111;
        }

        .hp-cta-link {
          font-family: var(--fm);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .25em;
          text-transform: uppercase;
          padding: 17px 4px;
          background: transparent;
          color: #111;
          border: none;
          border-bottom: 1px solid rgba(17,17,17,.4);
          cursor: pointer;
          transition: border-color .25s ease;
        }
        .hp-cta-link:hover {
          border-bottom-color: #111;
        }

        .hp-link-cta {
          font-family: var(--fm);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .25em;
          text-transform: uppercase;
          background: none;
          border: none;
          padding: 0 0 4px;
          color: #111;
          cursor: pointer;
          position: relative;
        }
        .hp-link-cta::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1px;
          background: #111;
          transform-origin: left;
          transition: transform .3s ease;
        }
        .hp-link-cta:hover::after {
          transform: scaleX(.55);
        }

        .hp-empty {
          padding: 60px 0;
          text-align: center;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .2em;
          color: var(--warm);
          text-transform: uppercase;
        }

        /* ─── 1. SPLIT HERO ─── */
        .hp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: clamp(680px, 88vh, 920px);
          background: #fff;
          border-bottom: 1px solid #ececec;
        }

        /* LEFT — editorial copy on white */
        .hp-hero-left {
          padding: clamp(80px, 9vw, 132px) clamp(40px, 6.5vw, 104px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fff;
        }
        .hp-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          font-family: var(--fm);
          font-size: 9.5px;
          letter-spacing: .42em;
          color: #666;
          margin-bottom: 44px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .hp-hero-eyebrow-rule {
          width: 52px; height: 1px;
          background: #111;
          opacity: .55;
        }

        .hp-hero-title {
          font-family: var(--fm);
          font-size: clamp(64px, 9.5vw, 152px);
          line-height: .92;
          letter-spacing: -.025em;
          font-weight: 900;
          color: #111;
          margin: 0 0 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
          text-transform: uppercase;
        }

        .hp-hero-divider {
          height: 1px;
          background: #111;
          width: min(100%, 620px);
          margin: 4px 0 36px;
          transform-origin: left;
          animation: hpRuleIn 1.1s cubic-bezier(.2,.7,.2,1) .1s both;
        }
        @keyframes hpRuleIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .hp-hero-lede {
          font-family: var(--fm);
          font-size: 12.5px;
          line-height: 1.85;
          letter-spacing: .015em;
          color: #555;
          max-width: 460px;
          margin: 0 0 44px;
          font-weight: 400;
        }

        .hp-hero-cta {
          display: flex;
          gap: 22px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* RIGHT — dark showcase panel */
        .hp-hero-right {
          position: relative;
          background: #0a0a0a;
          overflow: hidden;
          isolation: isolate;
        }
        /* Subtle radial light to add atmosphere */
        .hp-hero-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(70% 55% at 60% 40%,
              rgba(255,255,255,.06) 0%,
              rgba(255,255,255,0) 70%);
          pointer-events: none;
        }
        /* Fine grain — adds tactile "luxury paper" feel */
        .hp-hero-right::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: .5;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Overlapping decorative frames (3 squares, layered + offset) */
        .hp-frames {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hp-frame {
          position: absolute;
          width: clamp(190px, 32%, 300px);
          aspect-ratio: 1/1;
          border: 1px solid rgba(255,255,255,.05);
          background: #1a1a1a;
          transition: transform 1.4s cubic-bezier(.2,.7,.2,1);
          will-change: transform;
        }
        .hp-frame-1 {
          transform: translate(-94px, -64px) rotate(-7deg);
          background: #161616;
          opacity: .82;
        }
        .hp-frame-2 {
          transform: translate(0, 0) rotate(0deg);
          background: #1f1f1f;
          overflow: hidden;
          z-index: 2;
          box-shadow: 0 40px 100px rgba(0,0,0,.7);
        }
        .hp-frame-3 {
          transform: translate(94px, 64px) rotate(6deg);
          background: #131313;
          opacity: .9;
        }
        .hp-hero-right:hover .hp-frame-1 {
          transform: translate(-108px, -74px) rotate(-9deg);
        }
        .hp-hero-right:hover .hp-frame-3 {
          transform: translate(108px, 74px) rotate(8deg);
        }
        .hp-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: .8;
          filter: grayscale(.22) contrast(1.04);
          transition: opacity .9s ease, transform 1.6s ease, filter .9s ease;
        }
        .hp-hero-right:hover .hp-frame-img {
          opacity: .94;
          transform: scale(1.05);
          filter: grayscale(.05) contrast(1.04);
        }

        /* Sparkle dingbats */
        .hp-spark {
          position: absolute;
          color: rgba(255,255,255,.55);
          pointer-events: none;
          animation: hpTwinkle 4.6s ease-in-out infinite;
        }
        .hp-spark-1 { top: 16%; right: 13%; font-size: 13px; }
        .hp-spark-2 { top: 58%; left: 11%; font-size: 11px; animation-delay: 1.6s; }
        @keyframes hpTwinkle {
          0%, 100% { opacity: .3; transform: scale(1); }
          50%      { opacity: .9; transform: scale(1.2); }
        }

        /* Featured-product overlay card */
        .hp-feature-card {
          position: absolute;
          right: clamp(28px, 4.5vw, 56px);
          bottom: clamp(120px, 17vh, 172px);
          padding: 20px 24px;
          background: rgba(18,18,18,.78);
          border: 1px solid rgba(255,255,255,.08);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          text-align: left;
          cursor: pointer;
          min-width: 232px;
          z-index: 3;
          transition: transform .4s cubic-bezier(.2,.7,.2,1),
                      background .3s ease,
                      border-color .3s ease,
                      box-shadow .4s ease;
        }
        .hp-feature-card:hover {
          transform: translateY(-4px);
          background: rgba(26,26,26,.88);
          border-color: rgba(255,255,255,.22);
          box-shadow: 0 20px 50px rgba(0,0,0,.5);
        }
        .hp-feature-eyebrow {
          font-family: var(--fm);
          font-size: 7.5px;
          letter-spacing: .38em;
          color: rgba(255,255,255,.55);
          font-weight: 500;
          margin-bottom: 10px;
        }
        .hp-feature-name {
          font-family: var(--fm);
          font-size: 13px;
          letter-spacing: .12em;
          font-weight: 700;
          margin-bottom: 8px;
          color: #fff;
          text-transform: uppercase;
        }
        .hp-feature-prices {
          display: flex;
          gap: 10px;
          align-items: baseline;
        }
        .hp-feature-price {
          font-family: var(--fm);
          font-size: 11.5px;
          font-weight: 600;
          color: #fff;
          letter-spacing: .04em;
        }
        .hp-feature-strike {
          font-family: var(--fm);
          font-size: 10.5px;
          color: rgba(255,255,255,.42);
          text-decoration: line-through;
          letter-spacing: .04em;
        }

        /* Stat blocks — proper card treatment with rule above */
        .hp-stats {
          position: absolute;
          left: clamp(28px, 4.5vw, 56px);
          right: clamp(28px, 4.5vw, 56px);
          bottom: clamp(32px, 4.5vh, 48px);
          display: flex;
          gap: clamp(36px, 5vw, 72px);
          z-index: 3;
        }
        .hp-stat {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.18);
          min-width: 104px;
        }
        .hp-stat-num {
          font-family: var(--fm);
          font-size: clamp(30px, 3.6vw, 46px);
          letter-spacing: -.02em;
          color: #fff;
          line-height: 1;
          font-weight: 900;
        }
        .hp-stat-lbl {
          font-family: var(--fm);
          font-size: 7.5px;
          letter-spacing: .32em;
          color: rgba(255,255,255,.55);
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ─── 2. MANIFESTO ─── */
        .hp-manifesto {
          background: var(--off);
          padding: 88px 40px;
          text-align: center;
          border-top: 1px solid #ececec;
          border-bottom: 1px solid #ececec;
        }
        .hp-manifesto p {
          font-family: var(--fm);
          font-size: clamp(20px, 2.4vw, 30px);
          letter-spacing: .04em;
          line-height: 1.5;
          color: #111;
          margin: 0 auto;
          max-width: 920px;
          font-weight: 300;
          position: relative;
        }
        .hp-manifesto p::before,
        .hp-manifesto p::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: #111;
          opacity: .35;
          margin: 0 auto;
        }
        .hp-manifesto p::before { margin-bottom: 28px; }
        .hp-manifesto p::after  { margin-top: 28px; }

        /* ─── 3 & 7. PRODUCT GRID (4-up) ─── */
        .hp-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px 28px;
        }

        /* ─── 4. TWO-UP EDITORIAL BANNER ─── */
        .hp-twoup {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e6e6e6;
        }
        .hp-banner-card {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3/4;
          border: none;
          padding: 0;
          background: var(--off);
          cursor: pointer;
          overflow: hidden;
          color: #fff;
          text-align: left;
        }
        .hp-banner-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s ease;
        }
        .hp-banner-card:hover .hp-banner-img {
          transform: scale(1.05);
        }
        .hp-banner-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.62) 0%,
            rgba(0,0,0,.04) 55%,
            rgba(0,0,0,.18) 100%
          );
          transition: background .35s ease;
        }
        .hp-banner-card:hover .hp-banner-scrim {
          background: linear-gradient(
            to top,
            rgba(0,0,0,.74) 0%,
            rgba(0,0,0,.18) 65%,
            rgba(0,0,0,.3) 100%
          );
        }
        .hp-banner-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 48px;
        }
        .hp-banner-eyebrow {
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .35em;
          margin-bottom: 16px;
          opacity: .9;
          font-weight: 500;
        }
        .hp-banner-title {
          font-family: var(--fm);
          font-size: clamp(44px, 6vw, 84px);
          letter-spacing: -.02em;
          line-height: .95;
          margin: 0 0 22px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .hp-banner-cta {
          font-family: var(--fm);
          font-size: 9.5px;
          letter-spacing: .25em;
          font-weight: 500;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(255,255,255,.5);
          align-self: flex-start;
          transition: border-color .2s ease;
        }
        .hp-banner-card:hover .hp-banner-cta {
          border-bottom-color: #fff;
        }

        /* ─── 5. CATEGORY ATLAS ─── */
        .hp-atlas {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: #e6e6e6;
        }
        .hp-atlas-tile {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3/4;
          border: none;
          padding: 0;
          background: var(--off);
          cursor: pointer;
          overflow: hidden;
        }
        .hp-atlas-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(.1);
          transition: transform .9s ease, filter .4s ease;
        }
        .hp-atlas-tile:hover .hp-atlas-img {
          transform: scale(1.06);
          filter: grayscale(0);
        }
        .hp-atlas-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 56px;
          color: rgba(0,0,0,.14);
        }
        .hp-atlas-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 18px 12px;
          background: linear-gradient(to top,
            rgba(0,0,0,.55) 0%,
            rgba(0,0,0,0) 50%);
          transition: background .3s ease;
        }
        .hp-atlas-tile:hover .hp-atlas-overlay {
          background: linear-gradient(to top,
            rgba(0,0,0,.7) 0%,
            rgba(0,0,0,.18) 100%);
        }
        .hp-atlas-label {
          font-family: var(--fm);
          font-size: clamp(12px, 1.3vw, 15px);
          letter-spacing: .28em;
          color: #fff;
          text-shadow: 0 1px 4px rgba(0,0,0,.45);
          font-weight: 700;
          text-transform: uppercase;
        }

        /* ─── 6. PULL QUOTE ─── */
        .hp-quote {
          background: #0a0a0a;
          color: #fff;
          padding: clamp(96px, 13vw, 160px) 40px;
          text-align: center;
        }
        .hp-quote-text {
          font-family: var(--fm);
          font-size: clamp(32px, 5vw, 68px);
          letter-spacing: -.02em;
          line-height: 1.05;
          margin: 0 auto 56px;
          max-width: 1040px;
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
        }
        .hp-quote-text .hp-h-fill { color: #fff; }

        /* ─── 8. SERVICE STRIP ─── */
        .hp-service {
          background: #fff;
          padding: 36px 40px;
          border-top: 1px solid #e6e6e6;
          border-bottom: 1px solid #e6e6e6;
        }
        .hp-service ul {
          display: flex;
          justify-content: center;
          gap: 60px;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
        }
        .hp-service li {
          font-family: var(--fm);
          font-size: 8.5px;
          letter-spacing: .22em;
          color: var(--warm);
          text-transform: uppercase;
          position: relative;
          padding-left: 18px;
          font-weight: 500;
        }
        .hp-service li::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 8px; height: 1px;
          background: #111;
        }

        /* ─── Reveal-on-scroll ─── */
        .hp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .8s ease, transform .8s ease;
        }
        .hp-reveal.hp-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          .hp-spark { animation: none; }
          .hp-hero-divider { animation: none; transform: none; }
          .hp-reveal { opacity: 1; transform: none; transition: none; }
          .hp-banner-card:hover .hp-banner-img,
          .hp-atlas-tile:hover .hp-atlas-img,
          .hp-hero-right:hover .hp-frame-1,
          .hp-hero-right:hover .hp-frame-3,
          .hp-hero-right:hover .hp-frame-img { transform: none; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1280px) {
          .hp-section { padding: 104px 40px; }
          .hp-hero-left { padding: clamp(72px, 8vw, 112px) clamp(40px, 6vw, 88px); }
        }

        @media (max-width: 1100px) {
          .hp-atlas { grid-template-columns: repeat(4, 1fr); }
          .hp-grid-4 { gap: 32px 20px; }
        }

        /* Tablet — keep the split hero but rebalance type and hierarchy */
        @media (max-width: 1024px) and (min-width: 901px) {
          .hp-hero { min-height: clamp(620px, 80vh, 760px); }
          .hp-hero-left { padding: 72px 56px; }
          .hp-hero-title { font-size: clamp(56px, 9vw, 96px); margin-bottom: 28px; }
          .hp-hero-divider { margin: 4px 0 28px; }
          .hp-hero-lede { margin-bottom: 32px; }
          .hp-feature-card {
            right: 28px;
            bottom: 132px;
            min-width: 200px;
            padding: 16px 20px;
          }
          .hp-frame { width: clamp(170px, 30%, 240px); }
          .hp-frame-1 { transform: translate(-72px, -52px) rotate(-7deg); }
          .hp-frame-3 { transform: translate(72px, 52px) rotate(6deg); }
          .hp-stats { gap: 36px; }
        }

        @media (max-width: 900px) {
          .hp-section { padding: 72px 22px; }
          .hp-section-head { margin-bottom: 36px; padding-bottom: 22px; }

          .hp-hero {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hp-hero-left {
            padding: 88px 26px 64px;
          }
          .hp-hero-right {
            min-height: 460px;
          }
          .hp-hero-eyebrow { margin-bottom: 30px; font-size: 9px; }
          .hp-hero-title { margin-bottom: 26px; }
          .hp-hero-divider { margin: 4px 0 26px; }
          .hp-hero-lede { font-size: 12px; margin-bottom: 32px; }
          .hp-hero-cta { gap: 16px; }
          .hp-cta-primary { padding: 14px 26px; font-size: 9px; }
          .hp-cta-link { padding: 14px 4px; font-size: 8.5px; }

          .hp-frame { width: clamp(150px, 38vw, 220px); }
          .hp-frame-1 { transform: translate(-60px, -42px) rotate(-7deg); }
          .hp-frame-3 { transform: translate(60px, 42px) rotate(6deg); }
          .hp-feature-card {
            right: 22px;
            bottom: 96px;
            padding: 16px 20px;
            min-width: 196px;
          }
          .hp-feature-name { font-size: 12px; }
          .hp-stats {
            left: 22px; right: 22px; bottom: 22px;
            gap: 32px;
          }
          .hp-stat { padding-top: 12px; min-width: 92px; }

          .hp-manifesto { padding: 64px 24px; }
          .hp-grid-4 {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px 16px;
          }
          .hp-twoup { grid-template-columns: 1fr; }
          .hp-banner-overlay { padding: 32px 28px; }

          .hp-service { padding: 26px 22px; }
          .hp-service ul { gap: 18px 36px; }
          .hp-service li { font-size: 8px; letter-spacing: .18em; }
        }

        @media (max-width: 640px) {
          .hp-section { padding: 56px 18px; }
          .hp-section-head {
            margin-bottom: 28px;
            padding-bottom: 18px;
          }
          .hp-section-head-center { margin-bottom: 32px; padding-bottom: 0; }
          .hp-atlas { grid-template-columns: repeat(2, 1fr); }
          .hp-section-title { font-size: clamp(32px, 9vw, 42px); }
          .hp-banner-eyebrow { font-size: 7.5px; }
          .hp-banner-overlay { padding: 28px 22px; }
          .hp-banner-title { font-size: clamp(38px, 9vw, 52px); margin-bottom: 16px; }
          .hp-quote { padding: 72px 20px; }
          .hp-quote-text { margin-bottom: 36px; line-height: 1.1; }
          .hp-feature-card { display: none; }
          .hp-frame { width: clamp(120px, 38vw, 170px); }
          .hp-frame-1 { transform: translate(-44px, -28px) rotate(-6deg); }
          .hp-frame-3 { transform: translate(44px, 28px) rotate(5deg); }
          .hp-hero-right { min-height: 360px; }
          .hp-hero-left { padding: 60px 20px 48px; }
          .hp-hero-eyebrow { font-size: 8.5px; letter-spacing: .35em; gap: 12px; }
          .hp-hero-eyebrow-rule { width: 32px; }
          .hp-hero-title { font-size: clamp(48px, 14vw, 76px); }
          .hp-hero-lede { font-size: 11.5px; }
          .hp-stats { gap: 24px; }
          .hp-stat { min-width: 0; padding-top: 10px; }
          .hp-stat-num { font-size: clamp(24px, 7vw, 32px); }
          .hp-manifesto { padding: 52px 20px; }
          .hp-manifesto p::before, .hp-manifesto p::after { width: 28px; margin-block: 18px; }
          .hp-service ul { gap: 12px 24px; flex-direction: column; align-items: flex-start; padding: 0 8px; }
        }
      `}</style>
    </div>
  );
}
