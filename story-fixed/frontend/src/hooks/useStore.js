// src/hooks/useStore.js — Cart + Wishlist with toast notifications
import { useState, useEffect } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function useStore(toast) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);
  const [wish, setWish] = useState([]);

  const t = toast || (() => {});

  useEffect(() => {
    if (isLoggedIn) {
      cartAPI.get().then(d => setCart(d.cart || [])).catch(() => {});
      wishlistAPI.get().then(d => setWish(d.wishlist || [])).catch(() => {});
    } else {
      setCart([]);
      setWish([]);
    }
  }, [isLoggedIn]);

  const reloadAfterLogin = async () => {
    try {
      const [c, w] = await Promise.all([cartAPI.get(), wishlistAPI.get()]);
      setCart(c.cart || []);
      setWish(w.wishlist || []);
    } catch {}
  };

  const addCart = async (product, size, color) => {
    if (!isLoggedIn) return false;
    try {
      const d = await cartAPI.add({
        product_id: product.id,
        size,
        color_name: color.color_name || color.name || color,
        color_hex:  color.color_hex  || color.hex  || '#000',
        quantity: 1,
      });
      setCart(d.cart);
      return true;
    } catch (e) {
      t(e?.message || 'Could not add to bag', 'error');
      return false;
    }
  };

  const remCart = async (id) => {
    try {
      const d = await cartAPI.remove(id);
      setCart(d.cart);
      t('Removed from bag', 'info');
    } catch {
      t('Could not remove item', 'error');
    }
  };

  const chQty = async (id, qty) => {
    try { const d = await cartAPI.update(id, qty); setCart(d.cart); } catch {}
  };

  const clearCart = async () => {
    try { await cartAPI.clear(); setCart([]); } catch { setCart([]); }
  };

  const togWish = async (productId) => {
    if (!isLoggedIn) { t('Sign in to save to wishlist', 'info'); return; }
    const isIn = wish.some(w => w.product_id === productId);
    try {
      if (isIn) {
        const d = await wishlistAPI.remove(productId);
        setWish(d.wishlist);
        t('Removed from wishlist', 'info');
      } else {
        const d = await wishlistAPI.add(productId);
        setWish(d.wishlist);
        t('Added to wishlist ♥', 'success');
      }
    } catch {
      t('Could not update wishlist', 'error');
    }
  };

  const isWish = (productId) => wish.some(w => w.product_id === productId);

  const cTotal = () => cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
  const cCount = () => cart.reduce((s, i) => s + i.quantity, 0);

  return { cart, wish, cTotal, cCount, addCart, remCart, chQty, togWish, isWish, clearCart, reloadAfterLogin };
}
