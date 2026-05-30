import { useState } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

export default function CategoryPage({ setPage, selectedCategory, openDetail, quickAdd, isWish, togWish }) {
  const [activeTab, setActiveTab] = useState('all');
  const { products } = useProducts({ limit: 50 });

  // Map display categories to product data categories
  const categoryMap = {
    'uppers': ['outwear', 'knit'],
    'bottoms': ['pants', 'jeans'],
    'accessories': ['accessories', 'headwear'],
    'co-ords': ['outwear', 'pants'],
  };

  const matchingCategories = categoryMap[selectedCategory] || [selectedCategory];

  const filtered = products.filter((p) => {
    const catMatch = matchingCategories.includes(p.category);
    if (!catMatch) return false;
    if (activeTab === 'all') return true;
    // Simple gender-based filtering using naming conventions
    if (activeTab === 'men') return !p.name.toLowerCase().includes('dress') && !p.name.toLowerCase().includes('skirt');
    if (activeTab === 'women') return !p.name.toLowerCase().includes('bomber');
    return true;
  });

  const displayName = selectedCategory ? selectedCategory.toUpperCase() : 'ALL';

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="pt-28 pb-8 text-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
          {displayName}
        </h1>

        {/* Back to Archive */}
        <button
          onClick={() => setPage('archive')}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-6 inline-block"
        >
          &larr; Back to Archive
        </button>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mt-4">
          {['all', 'men', 'women'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs uppercase tracking-widest pb-1 transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-black text-black font-bold'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => openDetail(product.id)}
                onQuickAdd={() => quickAdd(product.id)}
                isWish={isWish(product.id)}
                onToggleWish={() => togWish(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm uppercase tracking-widest text-gray-400">No products found in this category</p>
          </div>
        )}
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
