// Navbar — Black & White editorial style with mobile menu
import { useState } from 'react';

export default function Navbar({ page, setPage, cartCount, openDrawer, user, isLoggedIn, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <>
      <nav className="nav">
        {/* Left links */}
        <div className="nav-left nav-links-desktop" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <span className={`nav-link${page==='about'?' active':''}`} onClick={() => go('about')}>ABOUT</span>
          <span className="nav-link" style={{ color: '#ccc', cursor: 'default' }}>PRESS</span>
          <span className={`nav-link${page==='about'?' active':''}`} onClick={() => go('about')}>OUR STORY</span>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
          style={{ display: 'none' }}
        >
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

        {/* Logo center */}
        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => go('home')}>
          <div className="nav-logo">STORY™</div>
          <div className="nav-sub">WRITE YOUR OWN STYLE</div>
        </div>

        {/* Right */}
        <div className="nav-right">
          <span className={`nav-link nav-links-desktop${page==='shop'?' active':''}`} style={{ display:'inline' }} onClick={() => go('shop')}>SHOP</span>
          <span className="nav-link nav-links-desktop" style={{ display:'inline', color:'#ccc', cursor:'default' }}>LOOKBOOK</span>
          <span className="nav-link nav-links-desktop" style={{ display:'inline', color:'#ccc', cursor:'default' }}>CONTACT</span>
          {isLoggedIn ? (
            <>
              <button className="nav-icon nav-links-desktop" style={{ display:'inline' }} onClick={() => go('orders')}>ORDERS</button>
              <button className="nav-icon nav-links-desktop" style={{ display:'inline' }} onClick={() => go('profile')}>
                {user?.name?.split(' ')[0]?.toUpperCase() || 'ACCOUNT'}
              </button>
              {user?.role === 'admin' && (
                <button className="nav-icon" onClick={() => go('admin')} style={{ color: '#111', fontWeight: 700 }}>ADMIN</button>
              )}
            </>
          ) : (
            <button className="nav-icon nav-links-desktop" style={{ display:'inline' }} onClick={() => go('auth')}>SIGN IN</button>
          )}
          <button className="nav-icon" onClick={openDrawer} style={{ position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <span className="mobile-menu-link" onClick={() => go('home')}>HOME</span>
        <span className="mobile-menu-link" onClick={() => go('shop')}>SHOP</span>
        <span className="mobile-menu-link" onClick={() => go('about')}>OUR STORY</span>
        {isLoggedIn ? (
          <>
            <span className="mobile-menu-link" onClick={() => go('orders')}>ORDERS</span>
            <span className="mobile-menu-link" onClick={() => go('profile')}>ACCOUNT</span>
          </>
        ) : (
          <span className="mobile-menu-link" onClick={() => go('auth')}>SIGN IN</span>
        )}
      </div>

      {/* Overlay to close mobile menu */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:198, background:'rgba(0,0,0,.2)' }} />
      )}

      <style>{`
        @media (max-width: 900px) {
          .nav-hamburger { display: flex !important; }
          .nav-links-desktop { display: none !important; }
          .nav { grid-template-columns: auto 1fr auto !important; }
        }
      `}</style>
    </>
  );
}
