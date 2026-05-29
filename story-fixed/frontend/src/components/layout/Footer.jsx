// Footer — minimal monochrome footer with newsletter signup.
//
// Mobile/tablet upgrades:
//   - Class names .footer-top / .footer-brand-col / .footer-bottom let the
//     responsive rules in global.css collapse the four-column grid to
//     2-up on tablet and a single column on small phones, while the brand
//     column always spans the full width so the newsletter input stays
//     usable.
//   - Newsletter input + JOIN button use 44px min-height on phones via
//     the global .btn / .fi2 mobile rules, so they remain tappable.
//   - Editorial spacing is preserved at every breakpoint via clamp().
import { useState } from 'react';
import { newsletterAPI } from '../../services/api.js';

export default function Footer({ setPage }) {
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const subscribe = async () => {
    if (!email) return;
    try {
      await newsletterAPI.subscribe(email);
      setSubMsg('Subscribed! Thank you.');
      setEmail('');
    } catch (e) {
      setSubMsg(e.message);
    }
    setTimeout(() => setSubMsg(''), 3000);
  };

  return (
    <footer style={{ background: '#0d0d0d', color: '#fff', marginTop: 0 }}>
      {/* Top — brand + nav columns */}
      <div
        className="footer-top"
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: 'clamp(48px, 7vw, 72px) clamp(20px, 4vw, 40px)',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'clamp(28px, 4vw, 48px)',
        }}
      >
        <div className="footer-brand-col">
          <div style={{ fontFamily: 'var(--fs)', fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '.08em', marginBottom: 14 }}>
            STORY{'\u2122'}
          </div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', letterSpacing: '.2em', color: '#777', lineHeight: 2.1, marginBottom: 28, fontWeight: 500 }}>
            WRITE YOUR OWN STYLE<br />
            Genuine premium fashion for everyone.
          </div>
          <div className="footer-newsletter" style={{ display: 'flex', gap: 8, maxWidth: 420 }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              aria-label="Email address for newsletter"
              style={{
                flex: 1,
                minWidth: 0,
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '13px 14px',
                fontFamily: 'var(--fm)',
                fontSize: '11px',
                color: '#fff',
                outline: 'none',
                letterSpacing: '.04em',
              }}
              onKeyDown={e => e.key === 'Enter' && subscribe()}
            />
            <button
              type="button"
              className="btn"
              style={{
                background: '#fff',
                color: '#111',
                fontSize: '8.5px',
                padding: '13px 22px',
                letterSpacing: '.25em',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
              onClick={subscribe}
            >JOIN</button>
          </div>
          {subMsg && (
            <div style={{ fontFamily: 'var(--fm)', fontSize: '8.5px', color: '#888', marginTop: 10, letterSpacing: '.04em' }}>
              {subMsg}
            </div>
          )}
        </div>

        {[
          { title: 'SHOP', links: [['All Products', 'shop'], ['New Arrivals', 'shop'], ['Sale Items', 'shop']] },
          { title: 'ACCOUNT', links: [['Sign In', 'auth'], ['Orders', 'orders'], ['Profile', 'profile']] },
          { title: 'INFO', links: [['About Us', 'about'], ['Our Story', 'about'], ['Contact', 'about']] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.3em', marginBottom: 18, fontWeight: 600, color: '#fff' }}>
              {col.title}
            </div>
            {col.links.map(([label, pg]) => (
              <button
                key={label}
                type="button"
                onClick={() => setPage(pg)}
                style={{
                  display: 'block',
                  background: 'none',
                  border: 'none',
                  padding: '8px 0',
                  fontFamily: 'var(--fm)',
                  fontSize: '9.5px',
                  letterSpacing: '.08em',
                  color: '#888',
                  cursor: 'pointer',
                  transition: 'color .15s',
                  textAlign: 'left',
                  textTransform: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}
              >{label}</button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="footer-bottom"
        style={{
          borderTop: '1px solid #1a1a1a',
          padding: '18px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.12em', color: '#555' }}>
          {'\u00A9 2025 STORY\u2122. ALL RIGHTS RESERVED.'}
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['GST INCLUSIVE PRICING', 'FREE SHIPPING OVER \u20B91500', 'EASY RETURNS'].map(t => (
            <div key={t} style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.18em', color: '#555' }}>{t}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}
