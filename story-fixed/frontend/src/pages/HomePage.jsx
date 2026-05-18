// HomePage — editorial black & white hero matching screenshots
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

export default function HomePage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const { products, loading } = useProducts({ limit: 4, sort: 'newest' });

  return (
    <div>
      {/* Hero — full split layout */}
      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'88vh', overflow:'hidden' }}>
        {/* Left text */}
        <div style={{ padding:'80px 60px', display:'flex', flexDirection:'column', justifyContent:'center', background:'#fff' }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.4em', color:'#888', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ width:40, height:1, background:'#888', display:'inline-block' }} />
            THE EQUALITY BRAND — SS 2025
          </div>
          <h1 style={{ fontFamily:'var(--fs)', fontSize:'clamp(64px,8vw,112px)', lineHeight:.92, letterSpacing:'.02em', marginBottom:0 }}>
            OUR<br />
            <span style={{ fontFamily:'var(--fs)', WebkitTextStroke:'2px #111', color:'transparent', letterSpacing:'.04em' }}>LATEST</span><br />
            OFFERINGS
          </h1>
          <div style={{ width:'100%', height:2, background:'#111', marginTop:24, marginBottom:32 }} />
          <p style={{ fontFamily:'var(--fm)', fontSize:'11px', color:'#666', lineHeight:1.8, maxWidth:420, marginBottom:40 }}>
            Discover our latest offerings featuring genuine branded clothing
            for everyone. Cutting-edge designs and premium quality at prices
            that actually make sense.
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button className="btn btn-k" style={{ padding:'16px 36px', fontSize:'9px' }} onClick={() => setPage('shop')}>
              SHOP NOW →
            </button>
            <button className="btn btn-w" style={{ padding:'16px 36px', fontSize:'9px' }} onClick={() => setPage('about')}>
              OUR STORY
            </button>
          </div>
        </div>

        {/* Right side dark panel with product peek */}
        <div style={{ background:'#111', position:'relative', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:40 }}>
          {/* Decorative geometric shapes */}
          <div style={{ position:'absolute', top:'10%', left:'10%', width:200, height:250, background:'#1e1e1e', transform:'rotate(-4deg)' }} />
          <div style={{ position:'absolute', top:'15%', left:'25%', width:200, height:250, background:'#2a2a2a', transform:'rotate(2deg)' }} />
          <div style={{ position:'absolute', top:'20%', left:'40%', width:200, height:250, background:'#333', transform:'rotate(-1deg)' }} />

          {/* Decorative star elements */}
          <div style={{ position:'absolute', top:'12%', right:'8%', color:'#444', fontSize:24, letterSpacing:4 }}>✦</div>
          <div style={{ position:'absolute', top:'40%', left:'5%', color:'#333', fontSize:20 }}>◇</div>
          <div style={{ position:'absolute', bottom:'35%', right:'15%', color:'#333', fontSize:18 }}>◈</div>

          {/* Featured product card */}
          <div style={{ position:'relative', zIndex:2, background:'#1a1a1a', border:'1px solid #333', padding:'20px 24px', maxWidth:220, marginLeft:'auto' }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.3em', color:'#666', marginBottom:8 }}>NEW ARRIVAL</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'13px', color:'#fff', letterSpacing:'.05em', marginBottom:6 }}>VERSACE SS25</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'11px', color:'#888', textDecoration:'line-through', marginBottom:4 }}>₹12,499</div>
            <div style={{ width:'100%', height:'1px', background:'#333', margin:'12px 0' }} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:8 }}>
              <div>
                <div style={{ fontFamily:'var(--fs)', fontSize:'28px', color:'#fff' }}>100%</div>
                <div style={{ fontFamily:'var(--fm)', fontSize:'6px', letterSpacing:'.2em', color:'#666' }}>GENUINE PRODUCTS</div>
              </div>
              <div>
                <div style={{ fontFamily:'var(--fs)', fontSize:'28px', color:'#fff' }}>14+</div>
                <div style={{ fontFamily:'var(--fm)', fontSize:'6px', letterSpacing:'.2em', color:'#666' }}>PREMIUM BRANDS</div>
              </div>
            </div>
          </div>

          {/* Bottom stat bar */}
          <div style={{ position:'relative', zIndex:2, marginTop:16, background:'#1a1a1a', border:'1px solid #333', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--fs)', fontSize:'24px', color:'#fff' }}>₹ 999</div>
              <div style={{ fontFamily:'var(--fm)', fontSize:'6px', letterSpacing:'.2em', color:'#666' }}>AFFORDABLE PRICING</div>
            </div>
            <div style={{ width:'1px', height:30, background:'#333' }} />
            <div style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.2em', color:'#666' }}>FREE SHIPPING OVER ₹1500</div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background:'#111', display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid #222' }}>
        {[
          { n:'100%', l:'GENUINE PRODUCTS' },
          { n:'14+', l:'PREMIUM BRANDS' },
          { n:'₹999', l:'STARTING PRICE' },
          { n:'7-DAY', l:'EASY RETURNS' },
        ].map(s => (
          <div key={s.n} style={{ padding:'28px 24px', textAlign:'center', borderRight:'1px solid #222' }}>
            <div style={{ fontFamily:'var(--fs)', fontSize:'32px', color:'#fff', marginBottom:4 }}>{s.n}</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.3em', color:'#666' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* New Arrivals */}
      <section style={{ maxWidth:1400, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:40 }}>
          <div>
            <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.3em', color:'#888', marginBottom:10 }}>JUST DROPPED</div>
            <h2 style={{ fontFamily:'var(--fs)', fontSize:'52px', letterSpacing:'.02em', lineHeight:1 }}>NEW ARRIVALS</h2>
          </div>
          <button className="btn btn-w" onClick={() => setPage('shop')}>VIEW ALL →</button>
        </div>
        {loading ? (
          <div style={{ textAlign:'center', padding:60, fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.2em', color:'#888' }}>LOADING...</div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:'#e0e0e0' }}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => openDetail(p.id)}
                onQuickAdd={() => quickAdd(p.id)} isWish={isWish(p.id)} onToggleWish={togWish} />
            ))}
          </div>
        )}
      </section>

      {/* Brands we carry */}
      <section style={{ background:'#111', padding:'80px 40px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.4em', color:'#666', marginBottom:12 }}>OFFICIAL STOCKIST</div>
            <h2 style={{ fontFamily:'var(--fs)', fontSize:'48px', color:'#fff' }}>BRANDS WE CARRY</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:1, background:'#222' }}>
            {['VERSACE','KARL LAGERFELD','LACOSTE','SUPERDRY','TOMMY HILFIGER','BURBERRY',
              'TRUE RELIGION','RARE RABBIT','BLACKBERRYS','ZARA','CALVIN KLEIN','MICHAEL KORS',
              'HUGO BOSS','RALPH LAUREN'].map(b => (
              <div key={b} onClick={() => setPage('shop')}
                style={{ background:'#111', padding:'24px 16px', textAlign:'center', cursor:'pointer', transition:'background .2s', border:'none' }}
                onMouseEnter={e => e.currentTarget.style.background='#1a1a1a'}
                onMouseLeave={e => e.currentTarget.style.background='#111'}>
                <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.25em', color:'#888', fontWeight:600 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth:1400, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.3em', color:'#888', marginBottom:12 }}>BROWSE</div>
          <h2 style={{ fontFamily:'var(--fs)', fontSize:'48px' }}>SHOP BY CATEGORY</h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:1, background:'#e0e0e0' }}>
          {[
            { label:'SHOES', icon:'◎' }, { label:'CLOTHING', icon:'◉' },
            { label:'ACCESSORIES', icon:'◈' }, { label:'BAGS', icon:'▣' }, { label:'OUTERWEAR', icon:'◇' },
          ].map(cat => (
            <div key={cat.label} onClick={() => setPage('shop')} style={{ background:'#fff', padding:'48px 20px', textAlign:'center', cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#111'; e.currentTarget.querySelector('.cat-label').style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.querySelector('.cat-label').style.color='#111'; }}>
              <div style={{ fontSize:36, opacity:.12, marginBottom:12 }}>{cat.icon}</div>
              <div className="cat-label" style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.25em', color:'#111', transition:'color .2s', fontWeight:600 }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}
