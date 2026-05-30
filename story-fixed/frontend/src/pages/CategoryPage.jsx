// src/pages/CategoryPage.jsx
import { useState, useEffect, useMemo } from 'react';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

const ADAPTED = adaptProducts(PRODUCTS);

const CATEGORY_MAP = {
  'uppers': ['outwear', 'headwear', 'knit'],
  'bottoms': ['jeans', 'pants'],
  'accessories': ['shoes', 'accessories'],
  'co-ords': ['outwear', 'knit'],
};

// Gender mapping based on category_id
const GENDER_MAP = {
  outwear: 'unisex',
  headwear: 'unisex',
  knit: 'unisex',
  jeans: 'men',
  pants: 'men',
  shoes: 'women',
  accessories: 'women',
};

export default function CategoryPage({ selectedCategory, setPage, openDetail, quickAdd, isWish, togWish }) {
  const [activeTab, setActiveTab] = useState('all');

  const categoryLabel = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All';

  const filteredProducts = useMemo(() => {
    const categoryIds = CATEGORY_MAP[selectedCategory] || [];
    let products = ADAPTED.filter(p => categoryIds.includes(p.category_id));
    if (activeTab === 'men') {
      products = products.filter(p => {
        const gender = GENDER_MAP[p.category_id] || 'unisex';
        return gender === 'men' || gender === 'unisex';
      });
    } else if (activeTab === 'women') {
      products = products.filter(p => {
        const gender = GENDER_MAP[p.category_id] || 'unisex';
        return gender === 'women' || gender === 'unisex';
      });
    }
    return products;
  }, [selectedCategory, activeTab]);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div data-animate className="opacity-0 text-center pt-16 pb-8 px-8">
        <h1 className="text-5xl lg:text-6xl font-bold uppercase tracking-tight text-black mb-4">
          {categoryLabel}
        </h1>
        <p className="text-sm text-[#666]">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} available
        </p>
      </div>

      {/* Tabs */}
      <div data-animate className="opacity-0 flex justify-center mb-12 px-8">
        <div className="inline-flex border border-[#EAEAEA] rounded-full p-1">
          {['all', 'men', 'women'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-xs tracking-[0.2em] font-medium rounded-full transition-colors uppercase border-none cursor-pointer ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'text-[#666] hover:text-black bg-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div data-animate className="opacity-0 max-w-7xl mx-auto px-8 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
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
          <div className="text-center py-20">
            <p className="text-sm text-[#666]">No products found in this category.</p>
            <button
              onClick={() => setPage('shop')}
              className="mt-6 text-xs tracking-[0.2em] text-black border-b border-black pb-1 cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0"
            >
              BROWSE ALL PRODUCTS
            </button>
          </div>
        )}
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
