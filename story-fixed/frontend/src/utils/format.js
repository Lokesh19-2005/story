// src/utils/format.js
//
// Tiny formatting helpers shared across product cards, PDP, cart,
// checkout, and orders. Kept dependency-free so they can be imported
// from any layer.

/**
 * Format an INR value as a localised string with the rupee sign,
 * thousands separators, and no decimal places.
 *   fp(1500)    -> "INR 1,500"
 *   fp(99999.5) -> "INR 99,999"
 */
export const fp = (n) =>
  `\u20B9${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

/**
 * Compute a SALE percentage from an original price + a current price.
 * Returns 0 when the item is not on sale (curr >= orig).
 *   pct(1000, 750) -> 25
 *   pct(750, 750)  -> 0
 */
export const pct = (orig, curr) =>
  orig > curr ? Math.round((1 - curr / orig) * 100) : 0;
