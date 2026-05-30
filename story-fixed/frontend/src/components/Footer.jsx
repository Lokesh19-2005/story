// Footer — dark 4-column footer with newsletter
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
    <footer className="bg-[#111111] text-white">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto py-16 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Brand + Newsletter */}
        <div>
          <div className="font-[Cormorant_Garamond] text-3xl tracking-wider mb-3">STORY</div>
          <p className="text-sm text-[#777] mb-6 leading-relaxed">Crafted for contemporary elegance</p>
          <div className="flex flex-col gap-3">
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full rounded-full border border-[#333] bg-transparent text-white placeholder-[#555] px-4 py-3 text-sm outline-none focus:border-[#d9c7b8] transition-colors"
              onKeyDown={e => e.key === 'Enter' && subscribe()}
            />
            <button
              className="bg-[#d9c7b8] text-[#111] rounded-full px-6 py-3 font-medium text-xs tracking-wider hover:bg-[#c9b7a8] transition-colors cursor-pointer border-none font-[Montserrat]"
              onClick={subscribe}
            >
              SUBSCRIBE
            </button>
          </div>
          {subMsg && <p className="text-xs text-[#777] mt-3 font-[Montserrat]">{subMsg}</p>}
        </div>

        {/* Column 2: Shop */}
        <div>
          <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-4 font-[Montserrat]">SHOP</h4>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>All Products</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>New Arrivals</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>Sale Items</span>
          </div>
        </div>

        {/* Column 3: Categories */}
        <div>
          <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-4 font-[Montserrat]">CATEGORIES</h4>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>Uppers</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>Bottoms</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>Accessories</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('shop')}>Co-Ords</span>
          </div>
        </div>

        {/* Column 4: Connect */}
        <div>
          <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-4 font-[Montserrat]">CONNECT</h4>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]">Instagram</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]">Twitter</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]">Pinterest</span>
            <span className="text-sm text-[#777] hover:text-white cursor-pointer transition-colors font-[Montserrat]" onClick={() => setPage('about')}>Contact Us</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#222] mx-8 mt-12 pt-6 pb-6">
        <p className="text-xs text-[#555] font-[Montserrat] text-center">&copy; 2025 STORY. All rights reserved.</p>
      </div>
    </footer>
  );
}
