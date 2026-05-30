import { useState, useMemo } from 'react';
import PRODUCTS from '../data/products.js';
import { adaptProducts } from '../data/adapter.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

const ADAPTED = adaptProducts(PRODUCTS);

// Category to original category_ids mapping
const CATEGORY_MAP = {
  'uppers': ['outwear', 'headwear', 'knit'],
  'bottoms': ['jeans', 'pants'],
  'accessories': ['shoes', 'accessories'],
  'co-ords': ['outwear', 'knit'],
};

export default function CategoryPage({ selectedCategory, setPage, openDetail, quickAdd, isWish, togWish }) {
  const [activeTab, setActiveTab] = useState('all');

  const categoryLabel = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All';

  const filteredProducts = useMemo(() => {
    const categoryIds = CATEGORY_MAP[selectedCategory] || [];
    let products = ADAPTED.filter(p => categoryIds.includes(p.category_id));

    if (activeTab === 'men') {
      products = products.filter(p => p.gender === 'men' || p.gender === 'unisex');
    } else if (activeTab === 'women') {
      products = products.filter(p => p.gender === 'women' || p.gender === 'unisex');
    }

    return products;
  }, [selectedCategory, activeTab]);

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* Category Header */}
      <div className="text-center pt-16 pb-8 px-8">
        <h1 className="font-[Cormorant_Garamond] text-5xl lg:text-6xl font-light text-[#111] mb-4">
          {categoryLabel}
        </h1>
        <p className="font-[Montserrat] text-sm text-[#777]">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} available
        </p>
      </div>

      {/* Men / Women / All Tabs */}
      <div className="flex justify-center mb-12 px-8">
        <div className="relative inline-flex bg-white rounded-full border border-[#e5dfd7] p-1">
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-[#111] transition-all duration-300 ease-out"
            style={{
              width: 'calc(33.333% - 4px)',
              left: activeTab === 'all' ? '4px' : activeTab === 'men' ? 'calc(33.333% + 2px)' : 'calc(66.666%)',
            }}
          />
          {['all', 'men', 'women'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 px-8 py-3 text-xs tracking-[0.2em] font-medium rounded-full transition-colors duration-300 font-[Montserrat] uppercase border-none cursor-pointer ${
                activeTab === tab ? 'text-white' : 'text-[#777] hover:text-[#111]'
              }`}
              style={{ background: 'transparent' }}
            >
              {tab === 'all' ? 'ALL' : tab === 'men' ? 'MEN' : 'WOMEN'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid with fade transition */}
      <div className="max-w-7xl mx-auto px-8 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-300">
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
            <p className="font-[Montserrat] text-sm text-[#777]">No products found in this category.</p>
            <button
              onClick={() => setPage('shop')}
              className="mt-6 font-[Montserrat] text-xs tracking-[0.2em] text-[#111] border-b border-[#111] pb-1 cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0"
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
