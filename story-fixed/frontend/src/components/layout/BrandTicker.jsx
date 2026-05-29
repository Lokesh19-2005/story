// BrandTicker — scrolling top bar with real brands
const BRANDS = [
  'VERSACE','KARL LAGERFELD','LACOSTE','SUPERDRY','TOMMY HILFIGER',
  'BURBERRY','TRUE RELIGION','RARE RABBIT','BLACKBERRYS','ZARA',
  'CALVIN KLEIN','MICHAEL KORS','HUGO BOSS','RALPH LAUREN',
];

export default function BrandTicker() {
  const doubled = [...BRANDS, ...BRANDS];
  return (
    <div className="brand-ticker-wrap">
      <div className="brand-ticker-inner">
        {doubled.map((b, i) => (
          <span key={i}>{b}<span style={{ color: '#555', margin: '0 8px' }}>·</span></span>
        ))}
      </div>
    </div>
  );
}
