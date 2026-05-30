// src/pages/HomePage.jsx
// Almina-inspired luxury editorial homepage with Tailwind CSS
import { useState, useEffect } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import { newsletterAPI } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

// Adapted catalog for section imagery
const ADAPTED = adaptProducts(PRODUCTS);

// Category-to-original-category mapping for images
const CATEGORY_IMAGE_MAP = {
  uppers: 'outwear',
  bottoms: 'jeans',
  accessories: 'accessories',
  'co-ords': 'knit',
};

// Find first product matching a given original category_id
const findByCategoryId = (catId) => ADAPTED.find(p => p.category_id === catId) || null;

// Find first product by gender
const findByGender = (gender) => ADAPTED.find(p => p.gender === gender) || null;

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish, setCategory }) {
  const { products: featured } = useProducts({ limit: 4, sort: 'newest' });
  const safeFeatured = Array.isArray(featured) ? featured : [];

  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  // Hero image - use first product
  const heroProduct = ADAPTED[0] || null;

  // Category cards data
  const categoryCards = [
    { id: 'uppers', label: 'Uppers' },
    { id: 'bottoms', label: 'Bottoms' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'co-ords', label: 'Co-Ords' },
  ];

  // Gender banners
  const menProduct = findByGender('men');
  const womenProduct = findByGender('women');

  // Scroll animation with IntersectionObserver
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
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await newsletterAPI.subscribe(email);
      setSubMsg('Subscribed! Thank you.');
      setEmail('');
    } catch (err) {
      setSubMsg(err.message || 'Something went wrong. Please try again.');
    }
    setTimeout(() => setSubMsg(''), 3000);
  };

  return (
    <div className="bg-[#f8f5f0]">
      {/* 1. Hero Section */}
      <section className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#f8f5f0]">
        {/* Left side */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-16">
          <p className="font-[Montserrat] text-xs tracking-[0.3em] text-[#777] mb-4 uppercase">
            NEW COLLECTION 2025
          </p>
          <h1 className="font-[Cormorant_Garamond] text-5xl lg:text-7xl font-light text-[#111] leading-tight mb-6">
            Discover Timeless Elegance
          </h1>
          <p className="font-[Montserrat] text-base text-[#777] leading-relaxed mb-8 max-w-md">
            Curated pieces that define your personal style. Premium fashion for the modern individual.
          </p>
          <button
            type="button"
            className="bg-[#111] text-white px-8 py-4 text-xs tracking-[0.2em] font-medium hover:bg-[#333] transition-colors rounded-full font-[Montserrat] w-fit"
            onClick={() => setPage('shop')}
          >
            SHOP NOW
          </button>
        </div>
        {/* Right side */}
        <div className="relative overflow-hidden rounded-3xl m-4 lg:m-8">
          {heroProduct && (
            <img
              src={heroProduct.image_url}
              alt="Hero collection"
              className="w-full h-full object-cover min-h-[400px]"
              loading="eager"
              decoding="async"
            />
          )}
        </div>
      </section>

      {/* 2. Category Section */}
      <section data-animate className="opacity-0 max-w-7xl mx-auto py-20 px-8">
        <h2 className="text-center mb-12 font-[Cormorant_Garamond] text-4xl lg:text-5xl font-light text-[#111]">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryCards.map(cat => {
            const originalCatId = CATEGORY_IMAGE_MAP[cat.id];
            const catProduct = findByCategoryId(originalCatId);
            return (
              <div
                key={cat.id}
                className="relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer group"
                onClick={() => setCategory ? setCategory(cat.id) : setPage('shop')}
              >
                {catProduct && (
                  <img
                    src={catProduct.image_url}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-[Cormorant_Garamond] text-2xl text-white font-light tracking-wide">
                    {cat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Collections */}
      <section data-animate className="opacity-0 bg-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-[Cormorant_Garamond] text-4xl font-light text-[#111] text-center mb-4">
            Featured Collection
          </h2>
          <p className="font-[Montserrat] text-sm text-[#777] text-center mb-12">
            Handpicked pieces for the season
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {safeFeatured.map(p => (
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
        </div>
      </section>

      {/* 4. Men/Women Cinematic Banners */}
      <section data-animate className="opacity-0 max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Men's Banner */}
          <div
            className="relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer group"
            onClick={() => setPage('shop')}
          >
            {menProduct && (
              <img
                src={menProduct.image_url}
                alt="Men's Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Cormorant_Garamond] text-3xl lg:text-4xl text-white font-light">
                Men's Collection
              </span>
              <span className="text-xs tracking-[0.2em] text-white/80 mt-4 border-b border-white/40 pb-1">
                EXPLORE
              </span>
            </div>
          </div>

          {/* Women's Banner */}
          <div
            className="relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer group"
            onClick={() => setPage('shop')}
          >
            {womenProduct && (
              <img
                src={womenProduct.image_url}
                alt="Women's Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-[Cormorant_Garamond] text-3xl lg:text-4xl text-white font-light">
                Women's Collection
              </span>
              <span className="text-xs tracking-[0.2em] text-white/80 mt-4 border-b border-white/40 pb-1">
                EXPLORE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Promotional Banner */}
      <section className="bg-[#f8f5f0] py-20 px-8 text-center">
        <div className="w-16 h-px bg-[#d9c7b8] mx-auto mb-8" />
        <p className="font-[Cormorant_Garamond] italic text-3xl lg:text-4xl font-light text-[#111]">
          Crafted for contemporary elegance.
        </p>
        <div className="w-16 h-px bg-[#d9c7b8] mx-auto mt-8" />
      </section>

      {/* 6. Newsletter Section */}
      <section data-animate className="opacity-0 max-w-2xl mx-auto py-20 px-8 text-center">
        <h2 className="font-[Cormorant_Garamond] text-3xl font-light text-[#111] mb-3">
          Stay Connected
        </h2>
        <p className="font-[Montserrat] text-sm text-[#777] mb-8">
          Subscribe to receive updates on new collections and exclusive offers
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-[#e5dfd7] px-5 py-3 text-sm outline-none focus:border-[#d9c7b8] bg-white font-[Montserrat]"
          />
          <button
            type="submit"
            className="bg-[#d9c7b8] text-[#111] rounded-full px-8 py-3 text-xs tracking-[0.15em] font-medium hover:bg-[#c9b7a8] transition-colors font-[Montserrat] border-none cursor-pointer"
          >
            SUBSCRIBE
          </button>
        </form>
        {subMsg && <p className="text-sm text-[#777] mt-3 font-[Montserrat]">{subMsg}</p>}
      </section>

      {/* 7. Footer */}
      <Footer setPage={setPage} />

      {/* Fade-up animation keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
}
