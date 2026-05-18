// src/routes/cart.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function getCart(userId, db) {
  return db.prepare(`
    SELECT c.*, p.name as product_name, p.price, p.slug, p.icon, p.tag
    FROM cart c JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ? ORDER BY c.added_at DESC
  `).all(userId);
}

router.get('/', authenticate, (req, res) => {
  res.json({ success: true, cart: getCart(req.user.id, getDB()) });
});

router.post('/', authenticate, (req, res) => {
  const db = getDB();
  const { product_id, size, color_name, color_hex = '#000', quantity = 1 } = req.body;
  if (!product_id || !size || !color_name)
    return res.status(400).json({ success: false, message: 'product_id, size, color_name required' });

  // Check stock
  const inv = db.prepare('SELECT stock FROM inventory WHERE product_id=? AND size=? AND color_name=?').get(product_id, size, color_name);
  if (inv && inv.stock < quantity)
    return res.status(400).json({ success: false, message: `Only ${inv.stock} units in stock` });

  const existing = db.prepare('SELECT * FROM cart WHERE user_id=? AND product_id=? AND size=? AND color_name=?').get(req.user.id, product_id, size, color_name);
  if (existing) {
    const newQty = existing.quantity + quantity;
    // Re-check stock for combined qty
    if (inv && inv.stock < newQty)
      return res.status(400).json({ success: false, message: `Only ${inv.stock} units in stock (you already have ${existing.quantity} in your bag)` });
    db.prepare('UPDATE cart SET quantity=? WHERE id=?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart (id,user_id,product_id,size,color_name,color_hex,quantity) VALUES (?,?,?,?,?,?,?)')
      .run(uuid(), req.user.id, product_id, size, color_name, color_hex, quantity);
  }
  res.json({ success: true, cart: getCart(req.user.id, db) });
});

router.patch('/:id', authenticate, (req, res) => {
  const db = getDB();
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== 'number')
    return res.status(400).json({ success: false, message: 'quantity is required and must be a number' });

  const item = db.prepare('SELECT * FROM cart WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

  if (quantity < 1) {
    db.prepare('DELETE FROM cart WHERE id=?').run(req.params.id);
  } else {
    // ── Stock check when INCREASING quantity ──────────────────────
    if (quantity > item.quantity) {
      const inv = db.prepare('SELECT stock FROM inventory WHERE product_id=? AND size=? AND color_name=?')
        .get(item.product_id, item.size, item.color_name);
      if (inv && inv.stock < quantity)
        return res.status(400).json({ success: false, message: `Only ${inv.stock} units in stock` });
    }
    db.prepare('UPDATE cart SET quantity=? WHERE id=?').run(quantity, req.params.id);
  }
  res.json({ success: true, cart: getCart(req.user.id, db) });
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true, cart: getCart(req.user.id, db) });
});

router.delete('/', authenticate, (req, res) => {
  getDB().prepare('DELETE FROM cart WHERE user_id=?').run(req.user.id);
  res.json({ success: true, cart: [] });
});

export default router;
