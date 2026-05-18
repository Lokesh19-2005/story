// Footer — black & white
import { useState } from 'react';
import { newsletterAPI } from '../services/api.js';

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
      {/* Top footer */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
        <div>
          <div style={{ fontFamily: 'var(--fs)', fontSize: '36px', letterSpacing: '.08em', marginBottom: 12 }}>STORY™</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.15em', color: '#555', lineHeight: 2.2, marginBottom: 28 }}>
            WRITE YOUR OWN STYLE<br />
            Genuine premium fashion for everyone.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email"
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', padding: '11px 12px', fontFamily: 'var(--fm)', fontSize: '8px', color: '#fff', outline: 'none', letterSpacing: '.05em' }}
              onKeyDown={e => e.key === 'Enter' && subscribe()} />
            <button className="btn" style={{ background: '#fff', color: '#111', fontSize: '7.5px', padding: '11px 18px', letterSpacing: '.2em', fontWeight: 700 }} onClick={subscribe}>JOIN</button>
          </div>
          {subMsg && <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', color: '#666', marginTop: 8 }}>{subMsg}</div>}
        </div>

        {[
          { title: 'SHOP', links: [['All Products', 'shop'], ['New Arrivals', 'shop'], ['Sale Items', 'shop']] },
          { title: 'ACCOUNT', links: [['Sign In', 'auth'], ['Orders', 'orders'], ['Profile', 'profile']] },
          { title: 'INFO', links: [['About Us', 'about'], ['Our Story', 'about'], ['Contact', 'about']] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.3em', marginBottom: 20, fontWeight: 600, color: '#fff' }}>{col.title}</div>
            {col.links.map(([label, pg]) => (
              <div key={label} onClick={() => setPage(pg)}
                style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.08em', color: '#555', marginBottom: 12, cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                {label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #1a1a1a', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.1em', color: '#444' }}>© 2025 STORY™. ALL RIGHTS RESERVED.</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['GST INCLUSIVE PRICING', 'FREE SHIPPING OVER ₹1500', 'EASY RETURNS'].map(t => (
            <div key={t} style={{ fontFamily: 'var(--fm)', fontSize: '7px', letterSpacing: '.15em', color: '#444' }}>{t}</div>
          ))}
        </div>
      </div>
    </footer>
  );
}
