export default function RecommendationScreen() {
  const products = [
    { name: 'Ivory Wrap', price: '$560', img: 'photo-1469334031218-e382a71b716b' },
    { name: 'Noir Blazer', price: '$780', img: 'photo-1488161628813-04466f872be2' },
    { name: 'Stone Midi', price: '$420', img: 'photo-1515886657613-9f3515b0c78f' },
    { name: 'Silk Cami', price: '$290', img: 'photo-1534528741775-53994a69daeb' },
  ];

  return (
    <div className="text-black">
      {/* Heading */}
      <h2 className="font-bold text-sm uppercase tracking-wider mb-3">RECOMMENDATION</h2>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {products.map((p) => (
          <div key={p.name}>
            <img
              src={`https://images.unsplash.com/${p.img}?w=150&h=200&fit=crop`}
              alt={p.name}
              className="w-full h-[80px] object-cover grayscale rounded"
            />
            <p className="text-[8px] font-medium mt-1">{p.name}</p>
            <p className="text-[7px] text-gray-500">{p.price}</p>
          </div>
        ))}
      </div>

      {/* Bottom text */}
      <p className="text-[8px] uppercase tracking-widest text-center mt-4 text-gray-500">
        SOCIAL RESPONSIBILITY
      </p>
    </div>
  );
}
