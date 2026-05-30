// src/components/ProductCard.jsx
// Premium luxury card with rounded corners, soft shadow, image-first design,
// hover zoom, and minimal text below. Uses SmartImage for image rendering.
import { fp, pct } from '../utils.js';
import SmartImage from './SmartImage.jsx';
import { getPrimaryImage, getHoverImage } from '../utils/productImages.js';

function HeartIcon({ filled }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product, onClick, onQuickAdd, isWish, onToggleWish }) {
  const isSale = Number(product?.price) < Number(product?.orig_price);
  const primary = getPrimaryImage(product, 600);
  const secondary = getHoverImage(product, 600);
  const altText = `${product?.brand || ''} ${product?.name || ''}`.trim() || 'Product image';

  return (
    <div
      className="rounded-2xl hover:shadow-lg transition-shadow duration-300 cursor-pointer group relative bg-white"
      onClick={onClick}
    >
      {/* Image container */}
      <div className="aspect-[3/4] overflow-hidden rounded-t-2xl bg-[#f3efe8] relative">
        <SmartImage
          src={primary}
          hoverSrc={secondary}
          alt={altText}
          aspectRatio="3/4"
          fallbackIcon={product?.icon || '\u25C9'}
          className="w-full h-full"
        />

        {/* Wishlist heart button */}
        <button
          type="button"
          className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center shadow-sm z-10 hover:scale-110 transition-transform"
          onClick={e => { e.stopPropagation(); if (onToggleWish) onToggleWish(product?.id); }}
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={!!isWish}
        >
          <HeartIcon filled={!!isWish} />
        </button>

        {/* Quick Add overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            className="font-[Montserrat] text-[10px] tracking-[0.2em] font-medium uppercase"
            onClick={e => { e.stopPropagation(); if (onQuickAdd) onQuickAdd(product?.id); }}
          >
            QUICK ADD
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 bg-white rounded-b-2xl">
        <div className="font-[Montserrat] text-[10px] uppercase tracking-[0.15em] text-[#777] mb-1">
          {product?.brand || ''}
        </div>
        <div className="font-[Montserrat] text-sm font-medium text-[#111] mb-2">
          {product?.name || ''}
        </div>
        <div className="flex items-center">
          <span className="font-[Montserrat] text-base font-semibold text-[#111]">
            {fp(product?.price)}
          </span>
          {isSale && (
            <span className="font-[Montserrat] text-[#999] text-xs ml-2 line-through">
              {fp(product?.orig_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
