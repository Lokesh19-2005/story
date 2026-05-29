// Navbar — Black & White editorial style with mobile menu.
//
// Mobile/tablet upgrades:
//   - Hamburger is a 44x44px touch target that animates into a close icon.
//   - Mobile menu slides down from the navbar with editorial spacing
//     (44px+ tap targets, hairline dividers) instead of cramming links.
//   - Body scroll is locked while the mobile menu is open so the page
//     behind doesn't scroll under the user's finger.
//   - Cart icon, account, and other right-side controls are sized for
//     touch with adequate padding.
//
// Desktop layout is preserved verbatim. All breakpoint rules live in
// the small style block at the bottom of this file plus the responsive
// pass in global.css.

import { useState, useEffect } from 'react';

export default function Navbar({ page, setPage, cartCount, openDrawer, user, isLoggedIn, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (p) => { setPage(p); setMenuOpen(false); };

  // Lock body scroll while the mobile menu is open. We toggle a custom
  // attribute and let the page CSS handle the visual; a tiny effect
  // restores overflow when the component unmounts or the menu closes.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);

  // Cart icon — a single SVG component so the markup stays readable.
  const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
    </svg>
  );

  return (
    <>
      <nav className="nav">
        {/* Left links (desktop) */}
        <div className="nav-left nav-links-desktop">
          <span className={`nav-link${page === 'about' ? ' active' : ''}`} onClick={() => go('about')}>ABOUT</span>
          <span className="nav-link" style={{ color: '#ccc', cursor: 'default' }}>PRESS</span>
          <span className={`nav-link${page === 'about' ? ' active' : ''}`} onClick={() => go('about')}>OUR STORY</span>
        </div>

        {/* Hamburger (mobile/tablet) — animates into a close icon */}
        <button
          type="button"
          className={`nav-hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo (centered) */}
        <div className="nav-brand" onClick={() => go('home')} role="button" tabIndex={0}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && go('home')}>
          <div className="nav-logo">STORY{'\u2122'}</div>
          <div className="nav-sub">WRITE YOUR OWN STYLE</div>
        </div>

        {/* Right (desktop links + always-visible cart) */}
        <div className="nav-right">
          <span className={`nav-link nav-links-desktop${page === 'shop' ? ' active' : ''}`} onClick={() => go('shop')}>SHOP</span>
          <span className="nav-link nav-links-desktop" style={{ color: '#ccc', cursor: 'default' }}>LOOKBOOK</span>
          <span className="nav-link nav-links-desktop" style={{ color: '#ccc', cursor: 'default' }}>CONTACT</span>
          {isLoggedIn ? (
            <>
              <button className="nav-icon nav-links-desktop" onClick={() => go('orders')}>ORDERS</button>
              <button className="nav-icon nav-links-desktop" onClick={() => go('profile')}>
                {user?.name?.split(' ')[0]?.toUpperCase() || 'ACCOUNT'}
              </button>
              {user?.role === 'admin' && (
                <button className="nav-icon" onClick={() => go('admin')} style={{ color: '#111', fontWeight: 700 }}>ADMIN</button>
              )}
            </>
          ) : (
            <button className="nav-icon nav-links-desktop" onClick={() => go('auth')}>SIGN IN</button>
          )}
          <button className="nav-icon nav-icon-cart" onClick={openDrawer} aria-label={`Open bag${cartCount ? ` (${cartCount} item${cartCount !== 1 ? 's' : ''})` : ''}`}>
            <CartIcon />
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile drop-down menu — premium spacing, 44px+ tap targets,
          slides down from the navbar with a soft editorial transition. */}
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <span className="mobile-menu-link" onClick={() => go('home')}>HOME</span>
        <span className="mobile-menu-link" onClick={() => go('shop')}>SHOP</span>
        <span className="mobile-menu-link" onClick={() => go('about')}>OUR STORY</span>
        {isLoggedIn ? (
          <>
            <span className="mobile-menu-link" onClick={() => go('orders')}>ORDERS</span>
            <span className="mobile-menu-link" onClick={() => go('profile')}>ACCOUNT</span>
            {user?.role === 'admin' && (
              <span className="mobile-menu-link" onClick={() => go('admin')}>ADMIN</span>
            )}
            <span className="mobile-menu-link" onClick={() => { onLogout && onLogout(); setMenuOpen(false); }} style={{ color: 'var(--warm)' }}>SIGN OUT</span>
          </>
        ) : (
          <span className="mobile-menu-link" onClick={() => go('auth')}>SIGN IN</span>
        )}
      </div>

      {/* Overlay below the menu — closes on tap. Sits above the page
          but below the nav so the bar itself stays interactive. */}
      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        /* Center brand block */
        .nav-brand {
          text-align: center;
          cursor: pointer;
          line-height: 1;
        }
        .nav-brand:focus-visible {
          outline: 2px solid #111;
          outline-offset: 4px;
        }

        /* Hamburger — animated three-line / close icon */
        .nav-hamburger {
          position: relative;
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-hamburger span {
          position: absolute;
          left: 11px;
          right: 11px;
          height: 1.5px;
          background: #111;
          transition: transform .25s ease, opacity .2s ease, top .25s ease;
        }
        .nav-hamburger span:nth-child(1) { top: 16px; }
        .nav-hamburger span:nth-child(2) { top: 21px; }
        .nav-hamburger span:nth-child(3) { top: 26px; }
        .nav-hamburger.is-open span:nth-child(1) {
          top: 21px;
          transform: rotate(45deg);
        }
        .nav-hamburger.is-open span:nth-child(2) { opacity: 0; }
        .nav-hamburger.is-open span:nth-child(3) {
          top: 21px;
          transform: rotate(-45deg);
        }

        /* Cart button keeps its badge perfectly aligned */
        .nav-icon-cart {
          position: relative;
        }

        /* Mobile menu overlay — sits below the nav so the hamburger
           stays interactive but tapping anywhere else closes the menu. */
        .mobile-menu-overlay {
          position: fixed;
          inset: 64px 0 0 0;
          z-index: 198;
          background: rgba(0, 0, 0, .25);
          animation: nav-overlay-in .2s ease;
        }
        @keyframes nav-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 900px) {
          .nav-hamburger { display: flex; }
          .nav-links-desktop { display: none !important; }
          .mobile-menu-overlay { inset: 60px 0 0 0; }
        }
        @media (max-width: 520px) {
          .mobile-menu-overlay { inset: 56px 0 0 0; }
        }
      `}</style>
    </>
  );
}
