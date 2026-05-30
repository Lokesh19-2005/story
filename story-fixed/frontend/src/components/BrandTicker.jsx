const BRANDS = ['VERSACE', 'PRADA', 'CALVIN KLEIN', 'ZARA', 'LACOSTE', 'ARMANI'];

export default function BrandTicker() {
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <div className="w-full overflow-hidden border-t border-b border-[#EAEAEA] bg-white py-3">
      <div className="brand-ticker-track flex items-center whitespace-nowrap">
        {doubled.map((brand, i) => (
          <span key={i} className="text-[10px] uppercase tracking-[0.3em] font-medium text-black font-[Inter]">
            {brand}
            <span className="mx-4 text-[#666]">&middot;</span>
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
