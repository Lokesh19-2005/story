export default function Footer({ setPage }) {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto py-16 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Column 1 - Brand */}
          <div>
            <div className="text-2xl font-bold tracking-[0.15em] uppercase mb-4">
              STORY<sup className="text-[9px] ml-0.5">TM</sup>
            </div>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              Premium fashion for the modern individual. Crafted for contemporary elegance.
            </p>
            <div className="flex gap-4">
              <span className="text-xs text-[#888] hover:text-white cursor-pointer transition-colors">Instagram</span>
              <span className="text-xs text-[#888] hover:text-white cursor-pointer transition-colors">Twitter</span>
              <span className="text-xs text-[#888] hover:text-white cursor-pointer transition-colors">Pinterest</span>
            </div>
          </div>

          {/* Column 2 - SHOP */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-5 uppercase">SHOP</h4>
            <div className="flex flex-col gap-3">
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">New In</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Best Sellers</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Men</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Women</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Sale</span>
            </div>
          </div>

          {/* Column 3 - CATEGORIES */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-5 uppercase">CATEGORIES</h4>
            <div className="flex flex-col gap-3">
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Uppers</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Bottoms</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Accessories</span>
              <span onClick={() => setPage('shop')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Co-Ords</span>
            </div>
          </div>

          {/* Column 4 - INFORMATION */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-5 uppercase">INFORMATION</h4>
            <div className="flex flex-col gap-3">
              <span onClick={() => setPage('about')} className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">About Us</span>
              <span className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Shipping</span>
              <span className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Returns</span>
              <span className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">FAQ</span>
              <span className="text-sm text-[#888] hover:text-white cursor-pointer transition-colors">Contact</span>
            </div>
          </div>

          {/* Column 5 - CONTACT */}
          <div>
            <h4 className="text-xs tracking-[0.2em] font-semibold text-white mb-5 uppercase">CONTACT</h4>
            <div className="flex flex-col gap-3 text-sm text-[#888] leading-relaxed">
              <span>hello@story.com</span>
              <span>+91 98765 43210</span>
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#333] mt-12 pt-6 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="text-xs text-[#555]">
            &copy; 2026 STORY<sup className="text-[7px]">TM</sup>. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <span className="text-xs text-[#555] hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-[#555] hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
