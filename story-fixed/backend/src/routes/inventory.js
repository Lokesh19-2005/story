// src/routes/inventory.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get stock for a product (public-ish, used in product detail)
router.get('/:productId', (req, res) => {
  const db = getDB();
  const inv = db.prepare('SELECT * FROM inventory WHERE product_id=?').all(req.params.productId);
  res.json({ inventory: inv });
});

// Admin: get all inventory
router.get('/', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  const inv = db.prepare(`
    SELECT i.*, p.name as product_name, p.slug
    FROM inventory i JOIN products p ON i.product_id=p.id
    ORDER BY p.name, i.size, i.color_name
  `).all();
  res.json({ inventory: inv });
});

// Admin: set stock for a variant
router.put('/:productId', authenticate, requireAdmin, (req, res) => {
  const { size, color_name, stock } = req.body;
  if (!size || !color_name || stock === undefined) return res.status(400).json({ message: 'size, color_name, stock required' });
  const db = getDB();
  const existing = db.prepare('SELECT * FROM inventory WHERE product_id=? AND size=? AND color_name=?').get(req.params.productId, size, color_name);
  if (existing) {
    db.prepare('UPDATE inventory SET stock=? WHERE product_id=? AND size=? AND color_name=?').run(Number(stock), req.params.productId, size, color_name);
  } else {
    db.prepare('INSERT INTO inventory (id,product_id,size,color_name,stock) VALUES (?,?,?,?,?)').run(uuid(), req.params.productId, size, color_name, Number(stock));
  }
  res.json({ message: 'Stock updated' });
});

export default router;
