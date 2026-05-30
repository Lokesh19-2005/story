import { useState, useMemo } from 'react';
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

export default function CategoryPage({ selectedCategory, setPage, openDetail, quickAdd, isWish, togWish }) {
  const [activeTab, setActiveTab] = useState('all');
  const categoryLabel = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All';
  const filteredProducts = useMemo(() => {
    const categoryIds = CATEGORY_MAP[selectedCategory] || [];
    let products = ADAPTED.filter(p => categoryIds.includes(p.category_id));
    if (activeTab === 'men') products = products.filter(p => p.gender === 'men' || p.gender === 'unisex');
    else if (activeTab === 'women') products = products.filter(p => p.gender === 'women' || p.gender === 'unisex');
    return products;
  }, [selectedCategory, activeTab]);

  return (
    <div className="min-h-screen bg-white">
      <div className="text-center pt-16 pb-8 px-8">
        <h1 className="font-[Inter] text-5xl lg:text-6xl font-bold uppercase tracking-tight text-black mb-4">{categoryLabel}</h1>
        <p className="font-[Inter] text-sm text-[#666]">{filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} available</p>
      </div>
      <div className="flex justify-center mb-12 px-8">
        <div className="inline-flex border border-[#EAEAEA] rounded-full p-1">
          {['all', 'men', 'women'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 text-xs tracking-[0.2em] font-medium rounded-full transition-colors font-[Inter] uppercase border-none cursor-pointer ${activeTab === tab ? 'bg-black text-white' : 'text-[#666] hover:text-black bg-transparent'}`}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openDetail(p.id)} onQuickAdd={() => quickAdd(p.id)} isWish={isWish(p.id)} onToggleWish={togWish} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-[Inter] text-sm text-[#666]">No products found in this category.</p>
            <button onClick={() => setPage('shop')} className="mt-6 font-[Inter] text-xs tracking-[0.2em] text-black border-b border-black pb-1 cursor-pointer bg-transparent border-t-0 border-l-0 border-r-0">BROWSE ALL PRODUCTS</button>
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
