export default function AccessoriesScreen() {
  const items = ['Necklaces', 'Earrings', 'Anklets', 'Rings', 'Bracelets'];

  return (
    <div className="text-black">
      {/* Heading */}
      <h2 className="font-bold text-sm uppercase tracking-wider mb-3">
        STORY&trade; Accessories
      </h2>

      {/* Large portrait */}
      <img
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=280&h=350&fit=crop"
        alt="Accessories portrait"
        className="grayscale w-full h-[160px] object-cover rounded mb-3"
      />

      {/* Editorial paragraph */}
      <p className="text-[8px] text-gray-600 mb-3 leading-relaxed">
        Elegant accessories designed to complement every ensemble in your wardrobe.
      </p>

      {/* Bullet list */}
      <ul className="text-[8px] space-y-1 mb-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1">
            <span className="w-1 h-1 bg-black rounded-full" />
            {item}
          </li>
        ))}
      </ul>

      {/* Pre-order button */}
      <button className="bg-black text-white text-[8px] w-full py-2 uppercase tracking-widest rounded">
        PRE ORDER
      </button>

      {/* Coming soon */}
      <p className="text-[7px] text-center text-gray-400 mt-2">COMING SOON &#10033;</p>
    </div>
  );
}
