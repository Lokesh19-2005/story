import { useState } from 'react';

export default function ProductGridScreen({ setCategory, setPage }) {
  const [active, setActive] = useState('ALL');

  const tabs = ['ALL', 'UPPERS', 'BOTTOMS', 'ACCESSORIES', 'CO-ORDS'];

  const products = [
    { name: 'Wool Overcoat', price: '$890', img: 'photo-1488161628813-04466f872be2' },
    { name: 'Silk Blouse', price: '$450', img: 'photo-1507003211169-0a1dd7228f2d' },
    { name: 'Leather Belt', price: '$280', img: 'photo-1581044777550-4cfa60707998' },
    { name: 'Cashmere Scarf', price: '$320', img: 'photo-1534528741775-53994a69daeb' },
  ];

  const handleTab = (tab) => {
    setActive(tab);
    if (!setCategory || !setPage) return;
    if (tab === 'ALL') {
      setPage('shop');
    } else {
      setCategory(tab.toLowerCase());
      setPage('category');
    }
  };

  return (
    <div className="text-black">
      {/* Heading */}
      <h2 className="font-bold text-sm uppercase tracking-wider mb-2">OUR PRODUCT</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTab(tab)}
            className={`text-[7px] uppercase tracking-wide pb-0.5 ${active === tab ? 'border-b border-black font-bold' : 'text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {products.map((p) => (
          <div key={p.name}>
            <img
              src={`https://images.unsplash.com/${p.img}?w=200&h=200&fit=crop`}
              alt={p.name}
              className="w-full aspect-square object-cover grayscale rounded"
            />
            <p className="text-[8px] font-medium mt-1">{p.name}</p>
            <p className="text-[7px] text-gray-500">{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
