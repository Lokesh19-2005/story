// src/pages/HomePage.jsx
// =============================================================================
//  STORY (TM)  -  PREMIUM LUXURY HOMEPAGE
// =============================================================================
//
//  A full editorial redesign of the storefront home page, modelled on the
//  pacing and silhouette of high-end monochrome fashion houses (Mr Porter,
//  Net-a-Porter, Ssense, Lemaire). Eight sections, all driven by the
//  centralized static catalog (src/data/products.js) via the schema adapter.
//
//  Sections (in order):
//    1. Hero                   - full-bleed cinematic image + Ken Burns zoom
//    2. Manifesto strip        - single editorial line on warm-cream
//    3. New In rail            - 4 newest products
//    4. Two-up editorial       - OUTWEAR / KNIT cinematic split
//    5. Category atlas         - all 7 categories with hero imagery
//    6. Pull quote             - black/white editorial brand statement
//    7. Markdowns              - 4 on-sale products
//    8. Service strip          - three rule-prefix manifesto lines
//
//  Preserved verbatim:
//    - Routing  (every CTA flows through `setPage`)
//    - Navbar / BrandTicker / Footer  (rendered by App.jsx; Footer below)
//    - ProductCard contract  (used as-is in the two product rails)
//    - Static catalog data path  (useStaticProducts + the adapter)
//    - Black/white luxury aesthetic  (no off-brand hues introduced)
//
//  No edits to global.css; all new styles are co-located in a single
//  <style> block at the end of the file (matches the PDP / ShopPage pattern).
// =============================================================================

import { useEffect } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

// ----------------------------------------------------------------------------
//  Module-scope adapted catalog. Adapted once at load so the editorial
//  selectors below (banner cards, category atlas, markdowns) are O(1).
// ----------------------------------------------------------------------------
const ADAPTED = adaptProducts(PRODUCTS);
const findBySlug = (slug) => ADAPTED.find(p => p.slug === slug) || null;

// Wide-crop hero image (re-uses an Unsplash photo from the curated
// luxury fashion set in productImages.js, but at a 16:10 cinematic crop
// instead of the catalog's 3:4 portrait crop).
const HERO_IMG =
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35' +
  '?auto=format&fit=crop&w=2400&h=1500&q=88';

// Two-up editorial banner — one product per category, hand-picked to
// represent the section visually.
const BANNER_CARDS = [
  { label: 'OUTWEAR', sub: 'A STUDY IN STRUCTURE',  slug: 'phantom-wool-overcoat' },
  { label: 'KNIT',    sub: 'COMFORT, IMPLIED',      slug: 'atelier-cashmere-crew' },
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

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const { products: newArrivals } = useProducts({ limit: 4, sort: 'newest' });
  const safeNew = Array.isArray(newArrivals) ? newArrivals : [];

  // ── Scroll-triggered reveal for editorial sections.
  // Tasteful 0.8s opacity + translate. Honours prefers-reduced-motion via CSS,
  // and hard-falls-back to "always visible" if IntersectionObserver is missing
  // (rare but possible in older WebViews).
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
      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <section className="hp-hero" aria-label="STORY SS26 atelier edition">
        <img
          className="hp-hero-img"
          src={HERO_IMG}
          alt="STORY SS26 — atelier edition"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
        />
        <div className="hp-hero-scrim" aria-hidden="true" />
        <div className="hp-hero-rule" aria-hidden="true" />
        <div className="hp-hero-content">
          <div className="hp-hero-eyebrow">
            <span className="hp-hero-eyebrow-rule" aria-hidden="true" />
            QUIET LUXURY <span aria-hidden="true">{'\u00B7'}</span> SS26
          </div>
          <h1 className="hp-hero-title">
            A STUDY IN<br />
            <em>RESTRAINT</em>
          </h1>
          <p className="hp-hero-lede">
            An edition of considered pieces. Atelier-finished, monochrome,
            built to live beyond the season.
          </p>
          <div className="hp-hero-cta">
            <button
              type="button"
              className="hp-cta-primary"
              onClick={() => setPage('shop')}
            >
              DISCOVER NEW IN <span aria-hidden="true">{'\u2192'}</span>
            </button>
            <button
              type="button"
              className="hp-cta-secondary"
              onClick={() => setPage('about')}
            >
              OUR ATELIER
            </button>
          </div>
        </div>
        <div className="hp-hero-foot" aria-hidden="true">
          <span>STORY {'\u00B7'} ATELIER EDITION</span>
          <span className="hp-hero-foot-scroll">
            SCROLL <span className="hp-hero-foot-arrow">{'\u2193'}</span>
          </span>
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
            <div className="hp-eyebrow">JUST DROPPED {'\u00B7'} SS26</div>
            <h2 className="hp-section-title">NEW IN</h2>
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
          <h2 className="hp-section-title">SHOP BY CATEGORY</h2>
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
                  <div className="hp-atlas-placeholder" aria-hidden="true">{'\u25C9'}</div>
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
          DESIGNED IN STUDIO.<br />
          CONSTRUCTED BY HAND.<br />
          <em>MADE TO OUTLAST TREND.</em>
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
              <h2 className="hp-section-title">MARKDOWNS</h2>
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
          <style> block to match the existing inline-style pattern in
          ShopPage and DetailPage. */}
      <style>{`
        /* ─── Layout primitives ─── */
        .hp { background: #fff; }

        .hp-section {
          max-width: 1440px;
          margin: 0 auto;
          padding: 96px 40px;
        }

        .hp-section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 44px;
          gap: 24px;
          flex-wrap: wrap;
        }
        .hp-section-head-center {
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 56px;
        }

        .hp-eyebrow {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .35em;
          color: var(--warm);
          text-transform: uppercase;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .hp-section-title {
          font-family: var(--fs);
          font-size: clamp(40px, 5.2vw, 64px);
          letter-spacing: .025em;
          line-height: .95;
          font-weight: 400;
          margin: 0;
        }

        .hp-link-cta {
          font-family: var(--fm);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .25em;
          text-transform: uppercase;
          background: none;
          border: none;
          padding: 0;
          color: #111;
          cursor: pointer;
          position: relative;
          padding-bottom: 4px;
        }
        .hp-link-cta::after {
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1px;
          background: #111;
          transform-origin: left;
          transition: transform .25s ease;
        }
        .hp-link-cta:hover::after {
          transform: scaleX(.5);
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

        /* Shared CTA buttons — large, luxury proportions */
        .hp-cta-primary {
          font-family: var(--fm);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .25em;
          text-transform: uppercase;
          padding: 17px 36px;
          background: #111;
          color: #fff;
          border: 1.5px solid #111;
          cursor: pointer;
          transition: background .2s ease, color .2s ease;
        }
        .hp-cta-primary:hover {
          background: transparent;
          color: #111;
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

        .hp-cta-secondary {
          font-family: var(--fm);
          font-size: 9px;
          font-weight: 500;
          letter-spacing: .25em;
          text-transform: uppercase;
          padding: 17px 4px;
          background: transparent;
          color: #fff;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,.5);
          cursor: pointer;
          transition: border-color .2s ease;
        }
        .hp-cta-secondary:hover {
          border-bottom-color: #fff;
        }

        /* ─── 1. HERO ─── */
        .hp-hero {
          position: relative;
          width: 100%;
          height: clamp(620px, 92vh, 920px);
          overflow: hidden;
          background: #111;
        }
        .hp-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0;
          transform: scale(1.02);
          transition: opacity 1s ease;
        }
        .hp-hero-img.is-loaded {
          opacity: 1;
          animation: hpKenBurns 16s ease-out forwards;
        }
        @keyframes hpKenBurns {
          from { transform: scale(1.02); }
          to   { transform: scale(1.08); }
        }
        .hp-hero-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom,
              rgba(0,0,0,.18) 0%,
              rgba(0,0,0,.25) 40%,
              rgba(0,0,0,.62) 100%),
            linear-gradient(to right,
              rgba(0,0,0,.35) 0%,
              rgba(0,0,0,0) 50%);
        }
        .hp-hero-rule {
          position: absolute;
          left: 60px; right: 60px; bottom: 80px;
          height: 1px;
          background: rgba(255,255,255,.18);
          z-index: 2;
        }
        .hp-hero-content {
          position: relative;
          z-index: 3;
          height: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: #fff;
        }
        .hp-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .42em;
          color: rgba(255,255,255,.78);
          margin-bottom: 28px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .hp-hero-eyebrow-rule {
          width: 44px; height: 1px;
          background: rgba(255,255,255,.6);
        }
        .hp-hero-title {
          font-family: var(--fs);
          font-size: clamp(56px, 9vw, 124px);
          line-height: .92;
          letter-spacing: .025em;
          margin: 0 0 24px;
          font-weight: 400;
          color: #fff;
          max-width: 12ch;
        }
        .hp-hero-title em {
          font-style: normal;
          -webkit-text-stroke: 1.5px #fff;
          color: transparent;
          letter-spacing: .045em;
        }
        .hp-hero-lede {
          font-family: var(--fm);
          font-size: 11px;
          line-height: 1.85;
          letter-spacing: .03em;
          color: rgba(255,255,255,.82);
          max-width: 420px;
          margin: 0 0 36px;
        }
        .hp-hero-cta {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .hp-hero-foot {
          position: absolute;
          left: 60px; right: 60px; bottom: 36px;
          z-index: 4;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .35em;
          color: rgba(255,255,255,.65);
          text-transform: uppercase;
        }
        .hp-hero-foot-arrow {
          display: inline-block;
          margin-left: 8px;
          animation: hpScrollNudge 2.4s ease-in-out infinite;
        }
        @keyframes hpScrollNudge {
          0%, 100% { transform: translateY(0); opacity: .6; }
          50%      { transform: translateY(4px); opacity: 1; }
        }

        /* ─── 2. MANIFESTO ─── */
        .hp-manifesto {
          background: var(--off);
          padding: 72px 40px;
          text-align: center;
        }
        .hp-manifesto p {
          font-family: var(--fs);
          font-size: clamp(22px, 2.8vw, 36px);
          letter-spacing: .055em;
          line-height: 1.4;
          color: #111;
          margin: 0 auto;
          max-width: 860px;
          font-weight: 400;
        }

        /* ─── 3 & 7. PRODUCT GRID (4-up) ─── */
        .hp-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--bd);
        }

        /* ─── 4. TWO-UP EDITORIAL BANNER ─── */
        .hp-twoup {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--bd);
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
            rgba(0,0,0,.72) 0%,
            rgba(0,0,0,.16) 65%,
            rgba(0,0,0,.28) 100%
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
          font-size: 8px;
          letter-spacing: .3em;
          margin-bottom: 14px;
          opacity: .9;
          font-weight: 500;
        }
        .hp-banner-title {
          font-family: var(--fs);
          font-size: clamp(48px, 6.5vw, 88px);
          letter-spacing: .025em;
          line-height: .95;
          margin: 0 0 18px;
          font-weight: 400;
        }
        .hp-banner-cta {
          font-family: var(--fm);
          font-size: 9.5px;
          letter-spacing: .25em;
          font-weight: 500;
          position: relative;
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
          background: var(--bd);
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
          filter: grayscale(.08);
          transition: transform .8s ease, filter .4s ease;
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
          font-family: var(--fs);
          font-size: clamp(16px, 1.6vw, 22px);
          letter-spacing: .14em;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0,0,0,.4);
          font-weight: 400;
        }

        /* ─── 6. PULL QUOTE ─── */
        .hp-quote {
          background: #111;
          color: #fff;
          padding: clamp(72px, 12vw, 140px) 40px;
          text-align: center;
        }
        .hp-quote-text {
          font-family: var(--fs);
          font-size: clamp(36px, 5.5vw, 76px);
          letter-spacing: .035em;
          line-height: 1.08;
          margin: 0 auto 44px;
          max-width: 980px;
          font-weight: 400;
          color: #fff;
        }
        .hp-quote-text em {
          font-style: normal;
          -webkit-text-stroke: 1.5px #fff;
          color: transparent;
          display: inline-block;
        }

        /* ─── 8. SERVICE STRIP ─── */
        .hp-service {
          background: #fff;
          padding: 36px 40px;
          border-top: var(--bd);
          border-bottom: var(--bd);
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
          .hp-hero-img.is-loaded { animation: none; transform: none; }
          .hp-hero-foot-arrow { animation: none; }
          .hp-reveal { opacity: 1; transform: none; transition: none; }
          .hp-banner-card:hover .hp-banner-img,
          .hp-atlas-tile:hover .hp-atlas-img { transform: none; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1100px) {
          .hp-atlas { grid-template-columns: repeat(4, 1fr); }
        }

        @media (max-width: 900px) {
          .hp-section { padding: 64px 20px; }
          .hp-section-head { margin-bottom: 32px; }

          .hp-hero { height: clamp(560px, 78vh, 720px); }
          .hp-hero-rule { left: 24px; right: 24px; bottom: 64px; }
          .hp-hero-content { padding: 0 24px; }
          .hp-hero-foot { left: 24px; right: 24px; bottom: 22px; font-size: 7px; letter-spacing: .25em; }
          .hp-hero-eyebrow { font-size: 8px; margin-bottom: 22px; }
          .hp-hero-eyebrow-rule { width: 28px; }
          .hp-hero-title { margin-bottom: 18px; }
          .hp-hero-lede { font-size: 10.5px; margin-bottom: 28px; }
          .hp-hero-cta { gap: 12px; }
          .hp-cta-primary { padding: 14px 26px; font-size: 9px; }
          .hp-cta-secondary { padding: 14px 4px; font-size: 8.5px; }

          .hp-manifesto { padding: 56px 24px; }
          .hp-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .hp-twoup { grid-template-columns: 1fr; }
          .hp-banner-overlay { padding: 32px 28px; }

          .hp-service { padding: 24px 20px; }
          .hp-service ul { gap: 18px 36px; }
          .hp-service li { font-size: 8px; letter-spacing: .18em; }
        }

        @media (max-width: 640px) {
          .hp-atlas { grid-template-columns: repeat(2, 1fr); }
          .hp-section-title { font-size: clamp(34px, 9vw, 44px); }
          .hp-banner-eyebrow { font-size: 7.5px; }
          .hp-quote { padding: 80px 24px; }
        }
      `}</style>
    </div>
  );
}
