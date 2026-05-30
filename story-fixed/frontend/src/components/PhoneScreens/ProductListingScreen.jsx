export default function ProductListingScreen() {
  const products = [
    { name: 'Phantom Overcoat', price: '$890', img: 'photo-1488161628813-04466f872be2' },
    { name: 'Silk Evening Dress', price: '$1,200', img: 'photo-1509631179647-0177331693ae' },
    { name: 'Merino Knit', price: '$420', img: 'photo-1507003211169-0a1dd7228f2d' },
    { name: 'Linen Trousers', price: '$380', img: 'photo-1515886657613-9f3515b0c78f' },
  ];

  return (
    <div className="text-black">
      {/* Product list */}
      <div className="space-y-2 mb-4">
        {products.map((p) => (
          <div key={p.name} className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <img
              src={`https://images.unsplash.com/${p.img}?w=100&h=100&fit=crop`}
              alt={p.name}
              className="w-16 h-16 object-cover grayscale rounded"
            />
            <div>
              <p className="text-[9px] font-medium">{p.name}</p>
              <p className="text-[8px] text-gray-500">{p.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 text-[8px]">
        <span className="cursor-pointer">&larr;</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`w-4 h-4 flex items-center justify-center rounded-full ${n === 1 ? 'bg-black text-white' : 'text-gray-600'}`}
          >
            {n}
          </span>
        ))}
        <span className="cursor-pointer">&rarr;</span>
      </div>
    </div>
  );
}
