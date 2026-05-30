// Navbar — Sticky elegant navbar with mobile hamburger menu
import { useState } from 'react';

export default function Navbar({ page, setPage, cartCount, openDrawer, user, isLoggedIn, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#f8f5f0] border-b border-[#e5dfd7] flex items-center justify-between px-8 py-4">
        {/* Left nav links (desktop only) */}
        <div className="hidden md:flex items-center gap-6">
          <span
            className={`font-[Montserrat] uppercase text-xs tracking-[0.2em] cursor-pointer transition-colors duration-200 ${page === 'shop' ? 'text-[#111]' : 'text-[#777] hover:text-[#111]'}`}
            onClick={() => go('shop')}
          >
            SHOP
          </span>
          <span
            className={`font-[Montserrat] uppercase text-xs tracking-[0.2em] cursor-pointer transition-colors duration-200 ${page === 'about' ? 'text-[#111]' : 'text-[#777] hover:text-[#111]'}`}
            onClick={() => go('about')}
          >
            ABOUT
          </span>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="flex md:hidden flex-col justify-center items-center w-8 h-8 gap-[5px] bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-[1.5px] bg-[#111] transition-transform duration-300 origin-center ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-[#111] transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`block w-5 h-[1.5px] bg-[#111] transition-transform duration-300 origin-center ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </button>

        {/* Center logo */}
        <div
          className="font-[Cormorant_Garamond] text-3xl font-light tracking-wider cursor-pointer text-[#111] select-none"
          onClick={() => go('home')}
        >
          STORY
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <span
              className="hidden md:inline font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors duration-200"
              onClick={() => go('profile')}
            >
              {user?.name?.split(' ')[0]?.toUpperCase() || 'ACCOUNT'}
            </span>
          ) : (
            <span
              className="hidden md:inline font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors duration-200"
              onClick={() => go('auth')}
            >
              SIGN IN
            </span>
          )}
          <button
            className="relative bg-transparent border-none cursor-pointer p-0 text-[#111]"
            onClick={openDrawer}
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#111] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden bg-[#f8f5f0] border-b border-[#e5dfd7] transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col px-8 py-4 gap-4">
          <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('home')}>HOME</span>
          <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('shop')}>SHOP</span>
          <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('about')}>ABOUT</span>
          {isLoggedIn ? (
            <>
              <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('orders')}>ORDERS</span>
              <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('profile')}>PROFILE</span>
            </>
          ) : (
            <span className="font-[Montserrat] uppercase text-xs tracking-[0.2em] text-[#777] hover:text-[#111] cursor-pointer transition-colors" onClick={() => go('auth')}>SIGN IN</span>
          )}
        </div>
      </div>

      {/* Overlay to close mobile menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}
    </>
  );
}
