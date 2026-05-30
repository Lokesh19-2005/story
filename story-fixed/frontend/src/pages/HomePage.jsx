// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import { newsletterAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

const ADAPTED = adaptProducts(PRODUCTS);

const CATEGORY_IMAGE_MAP = {
  uppers: 'outwear',
  bottoms: 'jeans',
  accessories: 'accessories',
  'co-ords': 'knit',
};

const findByCategoryId = (catId) => ADAPTED.find(p => p.category_id === catId) || null;

const HOMEPAGE_CATEGORIES = [
  { id: 'uppers', label: 'UPPERS' },
  { id: 'bottoms', label: 'BOTTOMS' },
  { id: 'accessories', label: 'ACCESSORIES' },
  { id: 'co-ords', label: 'CO-ORDS' },
];

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish, setCategory }) {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubMsg('Please enter a valid email address.');
      return;
    }
    try {
      await newsletterAPI.subscribe(trimmed);
      setSubMsg('Thank you for subscribing.');
      setEmail('');
    } catch (err) {
      setSubMsg('Something went wrong. Please try again.');
    }
  };

  // Scroll-triggered fade-up animations
  useEffect(() => {
    const els = document.querySelectorAll('[data-animate]');
    if (typeof IntersectionObserver === 'undefined' || !els.length) {
      els.forEach(el => el.classList.add('animate-fadeUp'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('animate-fadeUp');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-white">
      {/* SECTION 1: HERO */}
      <section className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-white">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#666] mb-6">
            STORY(TM) PREMIUM FASHION
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold uppercase tracking-tight leading-[0.9] text-black mb-8">
            THE CORE OF FASHION
          </h1>
          <p className="text-base text-[#666] leading-relaxed max-w-md mb-10">
            Where contemporary design meets timeless craftsmanship. STORY(TM) curates the finest in modern luxury fashion, delivering pieces that transcend seasons and define personal style.
          </p>
          <button
            onClick={() => setPage('shop')}
            className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#333] transition-colors w-fit cursor-pointer border-none"
          >
            EXPLORE NOW
            <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#666] mt-6">
            LAUNCHING IN 2026
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative overflow-hidden rounded-2xl m-4 lg:m-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&h=1200&q=80"
            alt="Editorial fashion"
            className="w-full h-full object-cover min-h-[500px] lg:min-h-[85vh]"
            style={{ filter: 'grayscale(100%)' }}
          />
        </div>
      </section>

      {/* SECTION 2: CATEGORY GRID */}
      <section data-animate className="opacity-0 max-w-[1440px] mx-auto py-20 lg:py-28 px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {HOMEPAGE_CATEGORIES.map(cat => {
            const catProduct = findByCategoryId(CATEGORY_IMAGE_MAP[cat.id]);
            return (
              <div
                key={cat.id}
                className="relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer group"
                onClick={() => setCategory(cat.id)}
              >
                {catProduct && (
                  <img
                    src={catProduct.image_url}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: 'grayscale(100%)' }}
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute top-6 left-6">
                  <span className="text-white text-sm font-bold uppercase tracking-[0.2em]">{cat.label}</span>
                </div>
                <div className="absolute bottom-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: EDITORIAL CONTENT GRID */}
      <section data-animate className="opacity-0 max-w-[1440px] mx-auto py-16 lg:py-24 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Panel 1 - Text card */}
          <div className="lg:col-span-3 bg-white border border-[#EAEAEA] rounded-xl p-8 flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-[0.1em]">NEW IN CONCEPT</h3>
              <p className="text-sm text-[#666] leading-relaxed mt-4">
                Exploring the boundaries of modern fashion through minimalist design and premium materials.
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] mt-auto pt-8">LOOKBOOK / SS24</span>
          </div>

          {/* Panel 2 - Large editorial image */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-xl min-h-[400px] lg:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&h=900&q=80"
              alt="New Season Editorial"
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%)' }}
              loading="lazy"
            />
            <span className="absolute bottom-6 left-6 text-white text-xs font-bold uppercase tracking-[0.2em]">NEW SEASON</span>
          </div>

          {/* Panel 3 - Text card */}
          <div className="lg:col-span-3 bg-white border border-[#EAEAEA] rounded-xl p-8 flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-[0.1em]">STORY(TM) ESSENTIALS</h3>
              <p className="text-sm text-[#666] leading-relaxed mt-4">
                Timeless pieces designed for everyday elegance. Our core collection of wardrobe essentials.
              </p>
            </div>
            <span
              className="text-[10px] uppercase tracking-[0.2em] text-[#666] mt-auto pt-8 cursor-pointer hover:text-black transition-colors"
              onClick={() => setPage('shop')}
            >
              EXPLORE MORE
              <svg className="inline-block ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* Panel 4 - Tall narrow image */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-xl hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&h=800&q=80"
              alt="Fashion detail"
              className="w-full h-full object-cover min-h-[500px]"
              style={{ filter: 'grayscale(100%)' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: MEN & WOMEN BANNERS */}
      <section data-animate className="opacity-0 max-w-[1440px] mx-auto py-16 lg:py-24 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* MEN Banner */}
          <div
            className="relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer group"
            onClick={() => setPage('shop')}
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=600&q=80"
              alt="Men's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              style={{ filter: 'grayscale(100%)' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-4xl lg:text-5xl font-bold uppercase tracking-[0.1em]">MEN</span>
              <span className="text-white text-[11px] uppercase tracking-[0.2em] mt-4 border border-white/50 px-6 py-2 hover:bg-white hover:text-black transition-colors">
                EXPLORE NOW &rarr;
              </span>
            </div>
          </div>

          {/* WOMEN Banner */}
          <div
            className="relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer group"
            onClick={() => setPage('shop')}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=600&q=80"
              alt="Women's Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              style={{ filter: 'grayscale(100%)' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white text-4xl lg:text-5xl font-bold uppercase tracking-[0.1em]">WOMEN</span>
              <span className="text-white text-[11px] uppercase tracking-[0.2em] mt-4 border border-white/50 px-6 py-2 hover:bg-white hover:text-black transition-colors">
                EXPLORE NOW &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: STATEMENT SECTION */}
      <section data-animate className="opacity-0 py-24 lg:py-32 px-8">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold uppercase tracking-tight leading-[1.1] text-black">
              CRAFTED FOR CONTEMPORARY ELEGANCE.
            </h2>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#666] mt-8 block">
              LAUNCHING IN 2026
            </span>
          </div>
          {/* Right */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=500&h=700&q=80"
                alt="Contemporary elegance"
                className="w-full aspect-[5/7] object-cover"
                style={{ filter: 'grayscale(100%)' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: NEWSLETTER */}
      <section data-animate className="opacity-0 max-w-[1440px] mx-auto py-20 lg:py-28 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-[#EAEAEA] pt-20">
          {/* Left side */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold uppercase tracking-tight text-black mb-4">
              STAY IN THE STORY
            </h2>
            <p className="text-base text-[#666] leading-relaxed max-w-md">
              Join our community for exclusive access to new collections, style guides, and member-only offers.
            </p>
          </div>
          {/* Right side - form */}
          <div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 border border-[#EAEAEA] px-6 py-4 text-sm outline-none focus:border-black transition-colors bg-white"
              />
              <button
                type="submit"
                className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#333] transition-colors cursor-pointer shrink-0 border-none"
              >
                SUBSCRIBE
              </button>
            </form>
            {subMsg && <p className="text-sm text-[#666] mt-3">{subMsg}</p>}
          </div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <Footer setPage={setPage} />
    </div>
  );
}
