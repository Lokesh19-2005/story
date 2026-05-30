// BrandTicker — infinite scrolling marquee with luxury brand names
const BRANDS = ['VERSACE', 'PRADA', 'CALVIN KLEIN', 'ZARA', 'LACOSTE', 'ARMANI'];

export default function BrandTicker() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="w-full bg-[#111111] overflow-hidden py-3">
      <div className="brand-ticker-track flex items-center whitespace-nowrap">
        {doubled.map((brand, i) => (
          <span key={i} className="font-[Montserrat] text-[10px] uppercase tracking-[0.3em] text-white font-medium mx-4 inline-flex items-center">
            {brand}
            <span className="text-[#555] mx-4">&middot;</span>
          </span>
        ))}
      </div>
      <style>{`
        .brand-ticker-track {
          animation: ticker-scroll 30s linear infinite;
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
