// src/utils.js
export const fp = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
export const pct = (orig, curr) => orig > curr ? Math.round((1 - curr / orig) * 100) : 0;
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
