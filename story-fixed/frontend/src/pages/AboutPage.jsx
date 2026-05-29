// src/pages/AboutPage.jsx
//
// Editorial monochrome about page. Layout/typography are driven by the
// .about-* utility classes in global.css, which apply fluid clamp()
// scaling so every section breathes correctly from desktop down to
// small phones without a single page-scoped media query.
import Footer from '../components/Footer.jsx';

export default function AboutPage({ setPage }) {
  return (
    <div>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-eyebrow">OUR STORY</div>
        <h1 className="about-hero-title">
          Fashion That<br /><em>Means Something</em>
        </h1>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 16 }}>MISSION</div>
        <p>
          We believe clothing is a language. Every piece in the STORY{'\u2122'}
          {' '}collection is crafted to help you tell yours {'\u2014'} with intention,
          restraint, and quality that endures.
        </p>
      </section>

      {/* Values */}
      <section className="about-values">
        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)', marginBottom: 'clamp(28px, 5vw, 40px)', textAlign: 'center' }}>OUR VALUES</div>
        <div className="about-values-grid">
          {[
            { icon: '\u25C9', title: 'QUALITY', desc: 'Every garment passes a strict quality review. We use only premium materials sourced responsibly.' },
            { icon: '\u25C8', title: 'DESIGN',  desc: 'Minimal, intentional design that transcends seasons. No trends \u2014 only classics that age well.' },
            { icon: '\u25CE', title: 'ETHICS',  desc: 'Fair wages, safe conditions, transparent supply chain. We know where every piece comes from.' },
            { icon: '\u25C7', title: 'SERVICE', desc: 'Responsive support, easy returns, and a promise to make every order right.' },
          ].map(v => (
            <div key={v.title} style={{ border: 'var(--bd)', padding: 'clamp(24px, 3vw, 32px) clamp(20px, 2.5vw, 28px)', background: '#fff' }}>
              <div style={{ fontSize: '28px', opacity: .15, marginBottom: 16 }}>{v.icon}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', marginBottom: 12, fontWeight: 600 }}>{v.title}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.04em', color: 'var(--warm)', lineHeight: 1.85 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Ready to find your story?</h2>
        <div className="about-cta-row">
          <button className="btn btn-k" onClick={() => setPage('shop')}>{'SHOP THE COLLECTION \u2192'}</button>
          <button className="btn btn-w" onClick={() => setPage('home')}>BACK TO HOME</button>
        </div>
      </section>

      <Footer setPage={setPage} />
    </div>
  );
}
