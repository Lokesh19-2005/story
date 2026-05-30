export default function HeroArchiveScreen({ setCategory, setPage }) {
  const filters = [
    { label: 'ALL', cat: null },
    { label: 'UPPERS', cat: 'uppers' },
    { label: 'BOTTOMS', cat: 'bottoms' },
    { label: 'ACCESSORIES', cat: 'accessories' },
    { label: 'CO-ORDS', cat: 'co-ords' },
  ];

  const handleFilter = (cat) => {
    if (!setCategory || !setPage) return;
    if (cat === null) {
      setPage('shop');
    } else {
      setCategory(cat);
      setPage('category');
    }
  };

  return (
    <div className="text-black">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold tracking-tight">STORY&trade;</span>
        <div className="flex flex-col gap-[3px]">
          <span className="block w-4 h-[1.5px] bg-black" />
          <span className="block w-4 h-[1.5px] bg-black" />
          <span className="block w-4 h-[1.5px] bg-black" />
        </div>
      </div>

      {/* Main heading */}
      <h2 className="text-lg font-bold uppercase tracking-tight leading-tight mb-3">
        OUR LATEST OFFERINGS
      </h2>

      {/* Overlapping images */}
      <div className="relative h-[140px] mb-3">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop"
          alt="Fashion editorial"
          className="grayscale absolute top-0 left-0 w-[55%] h-[130px] object-cover rounded"
        />
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop"
          alt="Fashion editorial"
          className="grayscale absolute top-4 right-0 w-[55%] h-[130px] object-cover rounded"
        />
      </div>

      {/* Editorial paragraph */}
      <p className="text-[8px] text-gray-600 mb-3 leading-relaxed">
        Crafted with precision and passion, each piece tells a story of timeless elegance.
      </p>

      {/* Section title */}
      <h3 className="font-bold text-xs uppercase tracking-widest mb-2">OUR PRODUCT</h3>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => handleFilter(f.cat)}
            className="border border-black rounded-full px-2 py-0.5 text-[7px] uppercase hover:bg-black hover:text-white transition-colors"
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
