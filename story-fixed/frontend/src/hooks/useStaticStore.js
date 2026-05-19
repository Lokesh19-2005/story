// src/hooks/useStaticStore.js
// =============================================================================
//  STATIC-STORAGE REPLACEMENT FOR useStore()
// =============================================================================
//
//  Drop-in replacement for the API-backed useStore() hook. Persists cart
//  and wishlist to localStorage instead of the cart/wishlist endpoints, so
//  the storefront is fully transactable in a frontend-only sandbox demo
//  with no backend running.
//
//  Exposes the EXACT same shape as useStore():
//    { cart, wish, cTotal, cCount, addCart, remCart, chQty,
//      togWish, isWish, clearCart, reloadAfterLogin }
//
//  Notes on differences vs. the API-backed store:
//    - addCart no longer gates on `isLoggedIn`; this is the guest cart.
//      Pair this hook with StaticAuthProvider so the PDP / nav UI behave
//      consistently (always-on guest user).
//    - Cart line ids are locally generated (`line-{ts}-{seq}`) since
//      there's no server to issue stable ids.
//    - Toast notifications match the original where appropriate
//      (remCart, togWish) so behaviour feels identical end-to-end.
//
//  The original useStore.js remains in place for backend-mode operation;
//  flip back by changing the import alias in App.jsx.
// =============================================================================

import { useState, useEffect } from 'react';

const CART_KEY = 'story_static_cart';
const WISH_KEY = 'story_static_wish';

// Safe localStorage helpers — never throw on SSR / private mode / quota.
function safeRead(key) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function safeWrite(key, value) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / private mode */ }
}

// Monotonic id generator — combined with Date.now() so ids stay unique
// across reloads (timestamp differs) and within a single session
// (sequence differs).
let _seq = 1;
const newLineId = () => `line-${Date.now()}-${_seq++}`;

// Pull a primary image url out of an adapted product, with safe fallbacks.
function pickImage(product) {
  if (!product) return '';
  if (typeof product.image_url === 'string' && product.image_url) return product.image_url;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  return '';
}

export function useStaticStore(toast) {
  const t = toast || (() => {});

  const [cart, setCart] = useState(() => safeRead(CART_KEY));
  const [wish, setWish] = useState(() => safeRead(WISH_KEY));

  // Persist on every change.
  useEffect(() => { safeWrite(CART_KEY, cart); }, [cart]);
  useEffect(() => { safeWrite(WISH_KEY, wish); }, [wish]);

  // No-op in static mode — local state IS the source of truth. Kept on the
  // returned object so the AuthPage's `reloadAfterLogin` prop continues to
  // wire through without any conditional logic.
  const reloadAfterLogin = async () => {};

  // ── Cart ──────────────────────────────────────────────────────────────
  const addCart = async (product, size, color) => {
    if (!product || !size || !color) return false;
    const colorName = color.color_name || color.name || String(color);
    const colorHex  = color.color_hex  || color.hex  || '#000000';
    const productId = product.id;

    setCart(prev => {
      // Merge with an existing line for the same (product, size, colour).
      const idx = prev.findIndex(it =>
        String(it.product_id) === String(productId) &&
        it.size === size &&
        it.color_name === colorName
      );
      if (idx >= 0) {
        const next = prev.slice();
        const cur  = next[idx];
        next[idx] = { ...cur, quantity: Math.min(99, (Number(cur.quantity) || 1) + 1) };
        return next;
      }
      return [
        ...prev,
        {
          id:         newLineId(),
          product_id: productId,
          name:       product.name  || '',
          brand:      product.brand || '',
          price:      Number(product.price) || 0,
          image_url:  pickImage(product),
          size,
          color_name: colorName,
          color_hex:  colorHex,
          quantity:   1,
        },
      ];
    });
    return true;
  };

  const remCart = async (lineId) => {
    let removed = false;
    setCart(prev => {
      const next = prev.filter(it => it.id !== lineId);
      removed = next.length !== prev.length;
      return next;
    });
    if (removed) t('Removed from bag', 'info');
  };

  const chQty = async (lineId, qty) => {
    const n = Math.max(1, Math.min(99, Number(qty) || 1));
    setCart(prev => prev.map(it => it.id === lineId ? { ...it, quantity: n } : it));
  };

  const clearCart = async () => {
    setCart([]);
  };

  // ── Wishlist ─────────────────────────────────────────────────────────
  const togWish = async (productId) => {
    setWish(prev => {
      const isIn = prev.some(w => String(w.product_id) === String(productId));
      if (isIn) {
        t('Removed from wishlist', 'info');
        return prev.filter(w => String(w.product_id) !== String(productId));
      }
      t('Added to wishlist \u2665', 'success');
      return [...prev, { id: newLineId(), product_id: productId }];
    });
  };

  const isWish = (productId) =>
    wish.some(w => String(w.product_id) === String(productId));

  // ── Totals ───────────────────────────────────────────────────────────
  const cTotal = () =>
    cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

  const cCount = () =>
    cart.reduce((s, i) => s + (Number(i.quantity) || 1), 0);

  return {
    cart, wish,
    cTotal, cCount,
    addCart, remCart, chQty,
    togWish, isWish,
    clearCart, reloadAfterLogin,
  };
}

export default useStaticStore;
