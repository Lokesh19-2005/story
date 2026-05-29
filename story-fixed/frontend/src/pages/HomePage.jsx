// src/pages/HomePage.jsx
// =============================================================================
//  STORY (TM)  -  EDITORIAL LUXURY HOMEPAGE  (Black & White)
// =============================================================================
//
//  A restrained, magazine-style redesign:
//
//    1. Hero Section            — fullscreen layered fashion imagery,
//                                  oversized editorial type, minimal CTA,
//                                  smooth reveal animation
//    2. Categories Section      — UPPERS / BOTTOMS / ACCESSORIES / CO-ORDS
//                                  centered, minimal bordered buttons
//    3. Featured Products       — editorial 4-up grid, spacious cards,
//                                  filtered by selected category
//    4. Promotional Editorial   — oversized display type, side fashion
//                                  image, campaign aesthetic
//    5. Recommendations         — clean luxury product showcase, asymmetric
//    6. Footer                  — existing minimal STORY (TM) footer
//
//  Design rules (strictly enforced):
//    - Monochrome only. No colorful gradients, no glassmorphism, no neon.
//    - Editorial magazine layout, large bold display type, generous spacing.
//    - Smooth scroll-triggered reveals, subtle hover micro-interactions.
//    - Fully responsive (desktop / tablet / mobile breakpoints).
//
//  Preserved verbatim:
//    - Routing (every CTA flows through `setPage` / `openDetail`)
//    - ProductCard contract (used as-is for grids)
//    - Static catalog adapter (adaptProducts(PRODUCTS))
//    - Footer component import
//    - Backend, APIs, auth, cart, inventory, navbar  (untouched)
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

// ----------------------------------------------------------------------------
//  Module-scope adapted catalog. Adapted once at load so all editorial
//  selectors below are O(1).
// ----------------------------------------------------------------------------
const ADAPTED = adaptProducts(PRODUCTS);
const findBySlug = (slug) => ADAPTED.find(p => p.slug === slug) || null;
const pick = (slugs) => slugs.map(findBySlug).filter(Boolean);

// ----------------------------------------------------------------------------
//  Categories shown in the homepage filter rail.
//  STORY's static catalog uses a 7-category schema (outwear / headwear /
//  knit / jeans / pants / shoes / accessories). We collapse those into the
//  four editorial groupings the user asked for. CO-ORDS is hand-curated
//  since the catalog has no native "co-ord" category.
// ----------------------------------------------------------------------------
const CATEGORIES = [
  {
    id: 'uppers',
    label: 'UPPERS',
    sub: 'TOPS \u00B7 KNITS \u00B7 OUTWEAR',
    // Curated 4-up — newest / hero pieces from outwear + knit.
    slugs: [
      'phantom-wool-overcoat',
      'atelier-cashmere-crew',
      'specter-mohair-sweater',
      'voidshell-bomber-jacket',
    ],
  },
  {
    id: 'bottoms',
    label: 'BOTTOMS',
    sub: 'TROUSERS \u00B7 DENIM',
    slugs: [
      'pillar-pleated-trouser',
      'vault-selvedge-slim-jean',
      'void-cargo-pant',
      'carbon-tapered-denim',
    ],
  },
  {
    id: 'accessories',
    label: 'ACCESSORIES',
    sub: 'LEATHER \u00B7 EYEWEAR \u00B7 HEADWEAR',
    slugs: [
      'halo-leather-belt',
      'eclipse-sunglasses',
      'specter-card-holder',
      'eclipse-wool-beanie',
    ],
  },
  {
    id: 'coords',
    label: 'CO-ORDS',
    sub: 'CURATED SET PIECES',
    // Hand-picked pairings — pieces that read as a set when worn together.
    slugs: [
      'obsidian-tailored-trench',
      'pillar-pleated-trouser',
      'atelier-cashmere-crew',
      'strata-tailored-chino',
    ],
  },
];

// ----------------------------------------------------------------------------
//  Hero — three layered fashion images. The center image is the dominant
//  fashion shot; left + right are smaller offset frames.
// ----------------------------------------------------------------------------
const HERO_IMAGES = [
  // left frame
  findBySlug('atelier-cashmere-crew')?.image_url || ADAPTED[0]?.image_url,
  // center (dominant)
  findBySlug('phantom-wool-overcoat')?.image_url || ADAPTED[1]?.image_url,
  // right frame
  findBySlug('obsidian-tailored-trench')?.image_url || ADAPTED[2]?.image_url,
];

// ----------------------------------------------------------------------------
//  Promotional editorial — campaign-style banner. Oversized headline left,
//  fullbleed editorial image right.
// ----------------------------------------------------------------------------
const EDITORIAL_IMAGE =
  findBySlug('monolith-leather-biker')?.image_url
  || findBySlug('phantom-wool-overcoat')?.image_url
  || ADAPTED[0]?.image_url;

// ----------------------------------------------------------------------------
//  Recommendations — clean asymmetric showcase. One hero piece + three
//  smaller pieces for breathing room.
// ----------------------------------------------------------------------------
const RECOMMEND_HERO_SLUG = 'nightfall-combat-boot';
const RECOMMEND_SLUGS = [
  'phantom-runner-v2',
  'shadow-cable-cardigan',
  'halo-ribbed-polo',
];

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].id);

  // Featured grid driven by the selected category. Memo'd so we only
  // recompute when the user switches tabs.
  const featured = useMemo(() => {
    const cat = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
    return pick(cat.slugs);
  }, [activeCat]);

  const recommendHero  = findBySlug(RECOMMEND_HERO_SLUG) || ADAPTED[0];
  const recommendItems = pick(RECOMMEND_SLUGS);

  // Scroll-triggered reveal. Tasteful 0.8s opacity + translate.
  // Honours prefers-reduced-motion via CSS, falls back to "always visible"
  // if IntersectionObserver is missing.
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
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="hp">
      {/* ── 1. HERO ─────────────────────────────────────────────────────
           Fullscreen editorial: oversized SERIF/DISPLAY headline centered,
           with three layered fashion images peeking through. Minimal CTA.
           Smooth reveal animation on mount. */}
      <section className="hp-hero" aria-label="STORY — SS 2025">
        {/* Layered fashion imagery — three offset frames behind the type */}
        <div className="hp-hero-stage" aria-hidden="true">
          <div className="hp-hero-img hp-hero-img-l">
            {HERO_IMAGES[0] && <img src={HERO_IMAGES[0]} alt="" draggable={false} />}
          </div>
          <div className="hp-hero-img hp-hero-img-c">
            {HERO_IMAGES[1] && <img src={HERO_IMAGES[1]} alt="" draggable={false} />}
          </div>
          <div className="hp-hero-img hp-hero-img-r">
            {HERO_IMAGES[2] && <img src={HERO_IMAGES[2]} alt="" draggable={false} />}
          </div>
        </div>

        {/* Editorial copy — centered, oversized, layered above imagery */}
        <div className="hp-hero-content">
          <div className="hp-hero-meta">
            <span>SPRING / SUMMER 2025</span>
            <span className="hp-hero-meta-rule" aria-hidden="true" />
            <span>{'VOLUME N\u00B0 04'}</span>
          </div>

          <h1 className="hp-hero-title">
            <span className="hp-hero-line hp-hero-line-1">A QUIET</span>
            <span className="hp-hero-line hp-hero-line-2">REVOLUTION</span>
            <span className="hp-hero-line hp-hero-line-3">IN DRESS.</span>
          </h1>

          <p className="hp-hero-lede">
            Considered silhouettes, atelier finishing, and a monochrome
            wardrobe built to outlast the season.
          </p>

          <div className="hp-hero-cta">
            <button
              type="button"
              className="hp-btn hp-btn-solid"
              onClick={() => setPage('shop')}
            >
              SHOP THE COLLECTION
            </button>
            <button
              type="button"
              className="hp-btn-link"
              onClick={() => setPage('about')}
            >
              READ THE STORY
            </button>
          </div>
        </div>

        {/* Bottom marquee — small editorial caption + scroll cue */}
        <div className="hp-hero-foot" aria-hidden="true">
          <span>{'STORY\u2122 \u2014 THE EQUALITY BRAND'}</span>
          <span className="hp-hero-foot-sep" />
          <span>SCROLL</span>
        </div>
      </section>

      {/* ── 2. CATEGORIES ───────────────────────────────────────────────
           Centered tabs styled as minimal bordered buttons. Hover/active
           inverts to solid black. Spacious editorial padding. */}
      <section className="hp-cats hp-reveal" aria-label="Shop by category">
        <header className="hp-cats-head">
          <div className="hp-eyebrow">THE COLLECTION</div>
          <h2 className="hp-section-title">SHOP BY CATEGORY</h2>
          <p className="hp-section-sub">
            Four edits, hand-selected for the season.
          </p>
        </header>

        <div className="hp-cats-rail" role="tablist" aria-label="Category filter">
          {CATEGORIES.map(cat => {
            const isActive = cat.id === activeCat;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`hp-cat-btn${isActive ? ' is-active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >
                <span className="hp-cat-label">{cat.label}</span>
                <span className="hp-cat-sub">{cat.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. FEATURED PRODUCTS ────────────────────────────────────────
           Editorial 4-up grid. Cards keep the existing ProductCard
           contract; we just give them generous breathing room. */}
      <section className="hp-featured hp-reveal" aria-label="Featured products">
        <header className="hp-featured-head">
          <div>
            <div className="hp-eyebrow">SELECTED PIECES</div>
            <h2 className="hp-section-title">FEATURED</h2>
          </div>
          <button
            type="button"
            className="hp-link-cta"
            onClick={() => setPage('shop')}
          >
            VIEW ALL <span aria-hidden="true">{'\u2192'}</span>
          </button>
        </header>

        {featured.length > 0 ? (
          <div className="hp-grid-4" key={activeCat}>
            {featured.map(p => (
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
          <div className="hp-empty">No pieces in this edit yet.</div>
        )}
      </section>

      {/* ── 4. PROMOTIONAL EDITORIAL ────────────────────────────────────
           Campaign-style split: oversized type left, fashion image right.
           Black background — high-contrast luxury banner. */}
      <section className="hp-editorial hp-reveal" aria-label="Editorial campaign">
        <div className="hp-editorial-copy">
          <div className="hp-editorial-meta">
            <span className="hp-editorial-rule" aria-hidden="true" />
            <span>{'CAMPAIGN \u2014 SS 25'}</span>
          </div>

          <h2 className="hp-editorial-title">
            <span className="hp-ed-line">DRESSED</span>
            <span className="hp-ed-line hp-ed-italic">in</span>
            <span className="hp-ed-line">SHADOW.</span>
          </h2>

          <p className="hp-editorial-lede">
            A study in restraint. Tailoring rendered in deep ink, knits
            built for stillness, leather worn close to the bone. STORY's
            seasonal campaign frames every piece against negative space {'\u2014'}
            the way it deserves to be seen.
          </p>

          <button
            type="button"
            className="hp-btn hp-btn-outline-light"
            onClick={() => setPage('shop')}
          >
            EXPLORE THE CAMPAIGN
          </button>
        </div>

        <div className="hp-editorial-img" aria-hidden="true">
          {EDITORIAL_IMAGE && (
            <img src={EDITORIAL_IMAGE} alt="" draggable={false} />
          )}
          {/* Frame overline + caption — magazine layout marker */}
          <div className="hp-editorial-caption">
            <span>FIG. 01</span>
            <span>{'\u2014'}</span>
            <span>STORY ATELIER</span>
          </div>
        </div>
      </section>

      {/* ── 5. RECOMMENDATIONS ──────────────────────────────────────────
           Asymmetric luxury showcase. One full-bleed hero product on the
           left, three stacked pieces on the right. Spacious arrangement. */}
      <section className="hp-recs hp-reveal" aria-label="Recommended for you">
        <header className="hp-recs-head">
          <div className="hp-eyebrow">CURATED FOR YOU</div>
          <h2 className="hp-section-title">RECOMMENDED</h2>
          <p className="hp-section-sub">
            Pieces our editors are returning to this season.
          </p>
        </header>

        <div className="hp-recs-grid">
          {/* Hero piece — large editorial card */}
          {recommendHero && (
            <button
              type="button"
              className="hp-rec-hero"
              onClick={() => openDetail(recommendHero.id)}
              aria-label={`View ${recommendHero.name}`}
            >
              <div className="hp-rec-hero-img">
                <img
                  src={recommendHero.image_url}
                  alt=""
                  draggable={false}
                />
              </div>
              <div className="hp-rec-hero-meta">
                <div className="hp-rec-hero-eyebrow">EDITOR'S PICK</div>
                <div className="hp-rec-hero-name">
                  {String(recommendHero.name || '').toUpperCase()}
                </div>
                <div className="hp-rec-hero-cta">
                  DISCOVER <span aria-hidden="true">{'\u2192'}</span>
                </div>
              </div>
            </button>
          )}

          {/* Stacked recommendation list */}
          <div className="hp-rec-list">
            {recommendItems.map(p => (
              <button
                key={p.id}
                type="button"
                className="hp-rec-item"
                onClick={() => openDetail(p.id)}
                aria-label={`View ${p.name}`}
              >
                <div className="hp-rec-item-img">
                  <img src={p.image_url} alt="" draggable={false} />
                </div>
                <div className="hp-rec-item-meta">
                  <div className="hp-rec-item-brand">{p.brand}</div>
                  <div className="hp-rec-item-name">{p.name}</div>
                  <div className="hp-rec-item-price">
                    {'\u20B9'}{Number(p.price).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="hp-rec-item-arrow" aria-hidden="true">{'\u2192'}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER ──────────────────────────────────────────────────── */}
      <Footer setPage={setPage} />

      {/* All luxury homepage styles — co-located in a single <style> block
          to match the existing inline-style pattern across pages. Prefix
          hp-* prevents collisions with global.css. */}
      <style>{`
        /* ─── Layout primitives ─── */
        .hp { background: #fff; color: #111; overflow-x: hidden; }

        .hp-eyebrow {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .42em;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .hp-section-title {
          font-family: var(--fs);
          font-size: clamp(44px, 6vw, 88px);
          letter-spacing: .035em;
          line-height: .95;
          font-weight: 400;
          margin: 0;
          color: #111;
        }

        .hp-section-sub {
          font-family: var(--fm);
          font-size: 11.5px;
          letter-spacing: .04em;
          color: #555;
          margin: 18px auto 0;
          max-width: 540px;
          line-height: 1.7;
        }

        /* ─── Shared CTAs ─── */
        .hp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--fm);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .28em;
          text-transform: uppercase;
          padding: 18px 36px;
          cursor: pointer;
          border: 1.5px solid #111;
          transition: background .25s ease, color .25s ease, transform .25s ease;
        }
        .hp-btn-solid { background: #111; color: #fff; }
        .hp-btn-solid:hover {
          background: transparent;
          color: #111;
          transform: translateY(-1px);
        }
        .hp-btn-outline {
          background: transparent;
          color: #111;
        }
        .hp-btn-outline:hover {
          background: #111;
          color: #fff;
          transform: translateY(-1px);
        }
        .hp-btn-outline-light {
          background: transparent;
          color: #fff;
          border-color: #fff;
        }
        .hp-btn-outline-light:hover {
          background: #fff;
          color: #111;
          transform: translateY(-1px);
        }
        .hp-btn-link {
          background: transparent;
          border: none;
          padding: 18px 4px;
          font-family: var(--fm);
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: .28em;
          text-transform: uppercase;
          color: #111;
          cursor: pointer;
          border-bottom: 1px solid rgba(17,17,17,.4);
          transition: border-color .25s ease;
        }
        .hp-btn-link:hover { border-bottom-color: #111; }

        .hp-link-cta {
          font-family: var(--fm);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: .28em;
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
          transition: transform .35s ease;
        }
        .hp-link-cta:hover::after { transform: scaleX(.5); }

        .hp-empty {
          padding: 80px 0;
          text-align: center;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .25em;
          color: #888;
          text-transform: uppercase;
        }

        /* ─── 1. HERO ─── */
        .hp-hero {
          position: relative;
          height: 100vh;
          min-height: 720px;
          max-height: 1080px;
          background: #fff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Layered imagery stage */
        .hp-hero-stage {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .hp-hero-img {
          position: absolute;
          overflow: hidden;
          background: #f3f3f1;
        }
        .hp-hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(.15) contrast(1.02);
          opacity: .85;
          animation: hp-hero-img-in 1.6s cubic-bezier(.2,.7,.2,1) both;
        }
        .hp-hero-img-l {
          left: 4%;
          top: 14%;
          width: 22%;
          height: 56%;
          animation: hp-hero-l 1.4s cubic-bezier(.2,.7,.2,1) .15s both;
        }
        .hp-hero-img-c {
          right: 6%;
          top: 8%;
          width: 30%;
          height: 78%;
          animation: hp-hero-c 1.4s cubic-bezier(.2,.7,.2,1) .25s both;
        }
        .hp-hero-img-r {
          left: 10%;
          bottom: 6%;
          width: 18%;
          height: 38%;
          animation: hp-hero-r 1.4s cubic-bezier(.2,.7,.2,1) .35s both;
        }
        @keyframes hp-hero-img-in {
          from { opacity: 0; }
          to   { opacity: .85; }
        }
        @keyframes hp-hero-l {
          from { transform: translateX(-32px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes hp-hero-c {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes hp-hero-r {
          from { transform: translateX(32px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        /* Hero copy block — sits above the imagery, centered */
        .hp-hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1100px;
          padding: 0 40px;
          text-align: center;
        }
        .hp-hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .42em;
          color: #555;
          margin-bottom: 36px;
          font-weight: 500;
          text-transform: uppercase;
          animation: hp-fade-up 1s cubic-bezier(.2,.7,.2,1) .1s both;
        }
        .hp-hero-meta-rule {
          display: inline-block;
          width: 32px;
          height: 1px;
          background: #111;
          opacity: .55;
        }
        .hp-hero-title {
          font-family: var(--fs);
          font-size: clamp(64px, 11vw, 184px);
          line-height: .9;
          letter-spacing: .015em;
          font-weight: 400;
          color: #111;
          margin: 0 0 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hp-hero-line {
          display: block;
          animation: hp-fade-up 1.1s cubic-bezier(.2,.7,.2,1) both;
        }
        .hp-hero-line-1 { animation-delay: .25s; }
        .hp-hero-line-2 {
          animation-delay: .4s;
          font-style: italic;
          font-family: var(--fg);
          font-size: 1.1em;
          font-weight: 300;
          letter-spacing: .005em;
        }
        .hp-hero-line-3 { animation-delay: .55s; }

        .hp-hero-lede {
          font-family: var(--fm);
          font-size: 12px;
          line-height: 1.85;
          letter-spacing: .04em;
          color: #444;
          max-width: 520px;
          margin: 0 auto 40px;
          animation: hp-fade-up 1s cubic-bezier(.2,.7,.2,1) .7s both;
        }

        .hp-hero-cta {
          display: inline-flex;
          gap: 22px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          animation: hp-fade-up 1s cubic-bezier(.2,.7,.2,1) .85s both;
        }

        @keyframes hp-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hp-hero-foot {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 32px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .42em;
          color: #888;
          text-transform: uppercase;
          font-weight: 500;
          animation: hp-fade-up 1s ease 1s both;
        }
        .hp-hero-foot-sep {
          width: 36px;
          height: 1px;
          background: #888;
        }

        /* ─── 2. CATEGORIES ─── */
        .hp-cats {
          max-width: 1440px;
          margin: 0 auto;
          padding: clamp(96px, 12vw, 160px) 40px clamp(48px, 6vw, 80px);
          text-align: center;
        }
        .hp-cats-head { margin-bottom: 64px; }

        .hp-cats-rail {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px;
        }
        .hp-cat-btn {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-width: 220px;
          padding: 22px 32px;
          background: #fff;
          border: 1.5px solid #111;
          color: #111;
          cursor: pointer;
          font-family: var(--fm);
          transition: background .3s ease, color .3s ease, transform .3s ease;
        }
        .hp-cat-btn:hover {
          background: #111;
          color: #fff;
          transform: translateY(-2px);
        }
        .hp-cat-btn.is-active {
          background: #111;
          color: #fff;
        }
        .hp-cat-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .32em;
          text-transform: uppercase;
        }
        .hp-cat-sub {
          font-size: 7.5px;
          letter-spacing: .28em;
          opacity: .65;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* ─── 3. FEATURED PRODUCTS ─── */
        .hp-featured {
          max-width: 1440px;
          margin: 0 auto;
          padding: clamp(48px, 6vw, 80px) 40px clamp(96px, 12vw, 140px);
        }
        .hp-featured-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 48px;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hp-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #ececec;
          animation: hp-fade-soft .5s ease both;
        }
        @keyframes hp-fade-soft {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ─── 4. PROMOTIONAL EDITORIAL ─── */
        .hp-editorial {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0a0a0a;
          color: #fff;
          min-height: clamp(560px, 75vh, 820px);
        }
        .hp-editorial-copy {
          padding: clamp(72px, 8vw, 120px) clamp(40px, 6vw, 96px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hp-editorial-meta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .42em;
          color: rgba(255,255,255,.55);
          margin-bottom: 36px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .hp-editorial-rule {
          display: inline-block;
          width: 44px;
          height: 1px;
          background: rgba(255,255,255,.45);
        }

        .hp-editorial-title {
          font-family: var(--fs);
          font-size: clamp(64px, 9vw, 152px);
          line-height: .92;
          letter-spacing: .01em;
          font-weight: 400;
          color: #fff;
          margin: 0 0 40px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .hp-ed-line { display: block; }
        .hp-ed-italic {
          font-family: var(--fg);
          font-style: italic;
          font-size: .95em;
          font-weight: 300;
          color: #fff;
          opacity: .92;
          letter-spacing: 0;
          margin-left: .04em;
        }

        .hp-editorial-lede {
          font-family: var(--fm);
          font-size: 12px;
          line-height: 1.95;
          letter-spacing: .03em;
          color: rgba(255,255,255,.72);
          max-width: 460px;
          margin: 0 0 40px;
        }

        .hp-editorial-img {
          position: relative;
          overflow: hidden;
          background: #111;
        }
        .hp-editorial-img img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(.2) contrast(1.04);
          transition: transform 1.6s cubic-bezier(.2,.7,.2,1);
        }
        .hp-editorial:hover .hp-editorial-img img {
          transform: scale(1.04);
        }
        .hp-editorial-caption {
          position: absolute;
          left: 32px;
          bottom: 32px;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .35em;
          color: #fff;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ─── 5. RECOMMENDATIONS ─── */
        .hp-recs {
          max-width: 1440px;
          margin: 0 auto;
          padding: clamp(96px, 12vw, 160px) 40px clamp(96px, 12vw, 140px);
        }
        .hp-recs-head {
          text-align: center;
          margin-bottom: 64px;
        }

        .hp-recs-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: clamp(24px, 4vw, 64px);
          align-items: stretch;
        }

        /* Hero recommendation card */
        .hp-rec-hero {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: #f3f3f1;
          border: none;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          aspect-ratio: 4/5;
          color: #fff;
          text-align: left;
        }
        .hp-rec-hero-img {
          position: absolute;
          inset: 0;
        }
        .hp-rec-hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(.1);
          transition: transform 1.6s cubic-bezier(.2,.7,.2,1);
        }
        .hp-rec-hero:hover .hp-rec-hero-img img {
          transform: scale(1.06);
        }
        .hp-rec-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,.6) 0%,
            rgba(0,0,0,0) 60%
          );
          pointer-events: none;
        }
        .hp-rec-hero-meta {
          position: relative;
          z-index: 2;
          padding: clamp(28px, 4vw, 48px);
        }
        .hp-rec-hero-eyebrow {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .42em;
          color: rgba(255,255,255,.85);
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 16px;
        }
        .hp-rec-hero-name {
          font-family: var(--fs);
          font-size: clamp(28px, 3.4vw, 48px);
          letter-spacing: .03em;
          line-height: 1.05;
          color: #fff;
          margin-bottom: 20px;
          max-width: 80%;
        }
        .hp-rec-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--fm);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .3em;
          color: #fff;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,.6);
          transition: gap .25s ease, border-color .25s ease;
        }
        .hp-rec-hero:hover .hp-rec-hero-cta {
          gap: 16px;
          border-bottom-color: #fff;
        }

        /* Stacked recommendation list */
        .hp-rec-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .hp-rec-item {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          align-items: center;
          gap: 24px;
          background: #fff;
          border: none;
          border-bottom: 1px solid #e6e6e6;
          padding: 14px 0;
          cursor: pointer;
          text-align: left;
          transition: padding .3s ease;
        }
        .hp-rec-item:hover {
          padding-left: 8px;
        }
        .hp-rec-item-img {
          width: 120px;
          aspect-ratio: 3/4;
          background: #f3f3f1;
          overflow: hidden;
        }
        .hp-rec-item-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s cubic-bezier(.2,.7,.2,1);
        }
        .hp-rec-item:hover .hp-rec-item-img img {
          transform: scale(1.05);
        }
        .hp-rec-item-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .hp-rec-item-brand {
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .32em;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
        }
        .hp-rec-item-name {
          font-family: var(--fs);
          font-size: 22px;
          letter-spacing: .025em;
          color: #111;
          line-height: 1.1;
        }
        .hp-rec-item-price {
          font-family: var(--fm);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .04em;
          color: #111;
        }
        .hp-rec-item-arrow {
          font-family: var(--fm);
          font-size: 16px;
          color: #111;
          opacity: .5;
          transition: opacity .25s ease, transform .3s ease;
        }
        .hp-rec-item:hover .hp-rec-item-arrow {
          opacity: 1;
          transform: translateX(6px);
        }

        /* ─── Reveal-on-scroll ─── */
        .hp-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .9s ease, transform .9s ease;
        }
        .hp-reveal.hp-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          .hp-hero-img img,
          .hp-hero-img-l,
          .hp-hero-img-c,
          .hp-hero-img-r,
          .hp-hero-meta,
          .hp-hero-line,
          .hp-hero-lede,
          .hp-hero-cta,
          .hp-hero-foot { animation: none !important; }
          .hp-reveal { opacity: 1; transform: none; transition: none; }
          .hp-editorial:hover .hp-editorial-img img,
          .hp-rec-hero:hover .hp-rec-hero-img img,
          .hp-rec-item:hover .hp-rec-item-img img { transform: none; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1100px) {
          .hp-grid-4 { grid-template-columns: repeat(3, 1fr); }
          .hp-recs-grid { grid-template-columns: 1fr; }
          .hp-rec-hero { aspect-ratio: 16/10; }
        }

        @media (max-width: 900px) {
          .hp-hero { min-height: 640px; height: 92vh; }
          .hp-hero-img-l { width: 28%; height: 44%; top: 20%; left: 3%; }
          .hp-hero-img-c { width: 38%; height: 64%; top: 12%; right: 4%; }
          .hp-hero-img-r { width: 22%; height: 30%; bottom: 8%; left: 10%; }
          .hp-hero-content { padding: 0 24px; }
          .hp-hero-title { margin-bottom: 24px; }
          .hp-hero-lede { font-size: 11.5px; margin-bottom: 28px; }
          .hp-hero-cta { gap: 14px; }
          .hp-btn { padding: 14px 24px; font-size: 9px; }
          .hp-btn-link { padding: 14px 4px; font-size: 9px; }

          .hp-cats { padding: 80px 20px 40px; }
          .hp-cats-head { margin-bottom: 44px; }
          .hp-cat-btn {
            min-width: 0;
            flex: 1 1 calc(50% - 12px);
            padding: 18px 16px;
          }
          .hp-cat-label { font-size: 11px; letter-spacing: .28em; }
          .hp-cat-sub { font-size: 7px; }

          .hp-featured { padding: 40px 20px 80px; }
          .hp-featured-head { margin-bottom: 32px; }
          .hp-grid-4 { grid-template-columns: repeat(2, 1fr); }

          .hp-editorial { grid-template-columns: 1fr; min-height: auto; }
          .hp-editorial-copy { padding: 64px 24px 40px; }
          .hp-editorial-img { aspect-ratio: 4/5; }
          .hp-editorial-lede { font-size: 11.5px; }

          .hp-recs { padding: 80px 20px; }
          .hp-recs-head { margin-bottom: 44px; }
          .hp-rec-item {
            grid-template-columns: 96px 1fr auto;
            gap: 16px;
          }
          .hp-rec-item-img { width: 96px; }
          .hp-rec-item-name { font-size: 18px; }
        }

        @media (max-width: 640px) {
          .hp-hero { min-height: 580px; }
          .hp-hero-img-l { display: none; }
          .hp-hero-img-c { width: 60%; height: 56%; top: 18%; right: 6%; opacity: .35; }
          .hp-hero-img-r { width: 40%; height: 28%; bottom: 6%; left: 5%; opacity: .35; }
          .hp-hero-img img { opacity: 1; }
          .hp-hero-meta { font-size: 8px; gap: 10px; margin-bottom: 24px; }
          .hp-hero-meta-rule { width: 18px; }
          .hp-hero-foot { font-size: 7.5px; gap: 12px; }
          .hp-hero-foot-sep { width: 22px; }

          .hp-cats-rail { gap: 12px; }
          .hp-cat-btn { flex: 1 1 100%; padding: 16px 14px; }

          .hp-grid-4 { grid-template-columns: 1fr; }

          .hp-rec-item {
            grid-template-columns: 80px 1fr;
          }
          .hp-rec-item-img { width: 80px; }
          .hp-rec-item-arrow { display: none; }
          .hp-rec-item-name { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
