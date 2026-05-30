import { useState } from 'react';

export default function Navbar({ page, setPage, cartCount, openDrawer, user, isLoggedIn, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (p) => { setPage(p); setMenuOpen(false); };

  const navLinks = [
    { label: 'HOME', target: 'home' },
    { label: 'SHOP', target: 'shop' },
    { label: 'COLLECTIONS', target: 'shop' },
    { label: 'ABOUT', target: 'about' },
    { label: 'JOURNAL', target: 'about' },
  ];

  const isActive = (target) => {
    if (target === 'home' && page === 'home') return true;
    if (target === 'shop' && page === 'shop') return true;
    if (target === 'about' && page === 'about') return true;
    return false;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#EAEAEA]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 h-16">
          {/* Left - Logo */}
          <div
            className="font-bold text-xl tracking-[0.15em] uppercase cursor-pointer select-none"
            onClick={() => go('home')}
          >
            STORY<sup className="text-[9px] ml-0.5">TM</sup>
          </div>

          {/* Center - Navigation (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <span
                key={link.label}
                onClick={() => go(link.target)}
                className={`text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer transition-colors ${
                  isActive(link.target) && link.label === (page === 'home' ? 'HOME' : page === 'shop' ? 'SHOP' : page === 'about' ? 'ABOUT' : '')
                    ? 'text-black border-b-[1.5px] border-black pb-0.5'
                    : 'text-[#666] hover:text-black'
                }`}
              >
                {link.label}
              </span>
            ))}
          </div>

          {/* Right - Icons */}
          <div className="flex items-center gap-5">
            {/* Search icon */}
            <button className="hidden md:block" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {/* Cart icon */}
            <button className="relative" onClick={openDrawer} aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger icon (mobile only) */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-6 h-6 gap-[5px]"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              <span
                className={`block w-5 h-[1.5px] bg-black transition-transform duration-300 ${
                  menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''
                }`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-black transition-opacity duration-300 ${
                  menuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-black transition-transform duration-300 ${
                  menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu (md:hidden) */}
      <div
        className={`md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-[#EAEAEA] transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-8 py-6 gap-4">
          {navLinks.map((link) => (
            <span
              key={link.label}
              onClick={() => go(link.target)}
              className={`text-[12px] uppercase tracking-[0.2em] font-medium cursor-pointer transition-colors ${
                isActive(link.target) && link.label === (page === 'home' ? 'HOME' : page === 'shop' ? 'SHOP' : page === 'about' ? 'ABOUT' : '')
                  ? 'text-black'
                  : 'text-[#666]'
              }`}
            >
              {link.label}
            </span>
          ))}

          <div className="border-t border-[#EAEAEA] my-2" />

          {isLoggedIn ? (
            <>
              <span
                onClick={() => go('profile')}
                className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#666] cursor-pointer hover:text-black transition-colors"
              >
                PROFILE
              </span>
              <span
                onClick={() => go('orders')}
                className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#666] cursor-pointer hover:text-black transition-colors"
              >
                ORDERS
              </span>
              {user?.role === 'admin' && (
                <span
                  onClick={() => go('admin')}
                  className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#666] cursor-pointer hover:text-black transition-colors"
                >
                  ADMIN
                </span>
              )}
              <span
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#666] cursor-pointer hover:text-black transition-colors"
              >
                LOGOUT
              </span>
            </>
          ) : (
            <span
              onClick={() => go('auth')}
              className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#666] cursor-pointer hover:text-black transition-colors"
            >
              SIGN IN
            </span>
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/20"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
