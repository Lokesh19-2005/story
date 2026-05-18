// src/pages/AboutPage.jsx
import Footer from '../components/Footer.jsx';

export default function AboutPage({ setPage }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: '#111', padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.3em', color: '#9c9488', marginBottom: 16 }}>OUR STORY</div>
        <h1 style={{ fontFamily: 'var(--fs)', fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 300, color: '#f5f3ee', letterSpacing: '-.01em' }}>
          Fashion That<br /><em>Means Something</em>
        </h1>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 16 }}>MISSION</div>
        <p style={{ fontFamily: 'var(--fs)', fontSize: '24px', fontWeight: 300, lineHeight: 1.6, color: '#333' }}>
          We believe clothing is a language. Every piece in the STORY™ collection is crafted to help you tell yours — with intention, restraint, and quality that endures.
        </p>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--off)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 40, textAlign: 'center' }}>OUR VALUES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { icon: '◉', title: 'QUALITY', desc: 'Every garment passes a strict quality review. We use only premium materials sourced responsibly.' },
              { icon: '◈', title: 'DESIGN', desc: 'Minimal, intentional design that transcends seasons. No trends — only classics that age well.' },
              { icon: '◎', title: 'ETHICS', desc: 'Fair wages, safe conditions, transparent supply chain. We know where every piece comes from.' },
              { icon: '◇', title: 'SERVICE', desc: 'Responsive support, easy returns, and a promise to make every order right.' },
            ].map(v => (
              <div key={v.title} style={{ border: 'var(--bd)', padding: '32px 28px', background: '#fff' }}>
                <div style={{ fontSize: '28px', opacity: .15, marginBottom: 16 }}>{v.icon}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', marginBottom: 12 }}>{v.title}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', letterSpacing: '.04em', color: 'var(--warm)', lineHeight: 1.8 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--fs)', fontSize: '36px', fontWeight: 300, marginBottom: 20 }}>Ready to find your story?</h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-k" onClick={() => setPage('shop')}>SHOP THE COLLECTION →</button>
          <button className="btn btn-w" onClick={() => setPage('home')}>BACK TO HOME</button>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}
