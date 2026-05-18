// src/routes/wishlist.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function getWishlist(userId, db) {
  return db.prepare(`
    SELECT w.*, p.name, p.price, p.orig_price, p.icon, p.slug, p.tag
    FROM wishlist w JOIN products p ON w.product_id=p.id
    WHERE w.user_id=? ORDER BY w.added_at DESC
  `).all(userId);
}

router.get('/', authenticate, (req, res) => {
  res.json({ wishlist: getWishlist(req.user.id, getDB()) });
});

router.post('/', authenticate, (req, res) => {
  const { product_id } = req.body;
  const db = getDB();
  try {
    db.prepare('INSERT OR IGNORE INTO wishlist (id,user_id,product_id) VALUES (?,?,?)').run(uuid(), req.user.id, product_id);
  } catch {}
  res.json({ wishlist: getWishlist(req.user.id, db) });
});

router.delete('/:productId', authenticate, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM wishlist WHERE user_id=? AND product_id=?').run(req.user.id, req.params.productId);
  res.json({ wishlist: getWishlist(req.user.id, db) });
});

export default router;
