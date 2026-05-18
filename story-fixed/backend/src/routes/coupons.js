// src/routes/coupons.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: apply coupon
router.post('/apply', authenticate, (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code required', message: 'Coupon code required' });
  const db = getDB();
  const coupon = db.prepare('SELECT * FROM coupons WHERE code=? AND is_active=1').get(code.toUpperCase());
  if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon', message: 'Invalid or expired coupon' });

  // Check expiry
  if (coupon.expires_at) {
    const expiry = new Date(coupon.expires_at);
    if (expiry < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired', message: 'Coupon has expired' });
    }
  }

  if (coupon.uses_limit && coupon.uses_total >= coupon.uses_limit)
    return res.status(400).json({ error: 'Coupon usage limit reached', message: 'Coupon usage limit reached' });
  if (subtotal < coupon.min_order)
    return res.status(400).json({ error: `Minimum order ₹${coupon.min_order} required`, message: `Minimum order ₹${coupon.min_order} required` });

  let discount = coupon.type === 'flat'
    ? coupon.value
    : Math.min(subtotal * coupon.value / 100, coupon.max_discount || Infinity);
  discount = Math.round(discount * 100) / 100;

  res.json({ coupon: { ...coupon, discount_amount: discount } });
});

// Admin: list coupons
router.get('/', authenticate, requireAdmin, (req, res) => {
  const coupons = getDB().prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  res.json({ coupons });
});

// Admin: create coupon
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { code, type = 'flat', value, min_order = 0, max_discount, uses_limit, expires_at } = req.body;
  if (!code || !value) return res.status(400).json({ error: 'Code and value required', message: 'Code and value required' });
  const db = getDB();
  try {
    const id = uuid();
    db.prepare('INSERT INTO coupons (id,code,type,value,min_order,max_discount,uses_limit,expires_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(id, code.toUpperCase(), type, Number(value), Number(min_order)||0, max_discount||null, uses_limit||null, expires_at||null);
    res.json({ coupon: db.prepare('SELECT * FROM coupons WHERE id=?').get(id) });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Coupon code already exists', message: 'Coupon code already exists' });
    res.status(500).json({ error: e.message, message: e.message });
  }
});

// Admin: update coupon
router.patch('/:id', authenticate, requireAdmin, (req, res) => {
  const { is_active, value, min_order, max_discount, uses_limit, expires_at } = req.body;
  const db = getDB();
  const coupon = db.prepare('SELECT * FROM coupons WHERE id=?').get(req.params.id);
  if (!coupon) return res.status(404).json({ error: 'Not found', message: 'Not found' });
  db.prepare('UPDATE coupons SET is_active=?, value=?, min_order=?, max_discount=?, uses_limit=?, expires_at=? WHERE id=?')
    .run(is_active ?? coupon.is_active, value ?? coupon.value, min_order ?? coupon.min_order,
         max_discount ?? coupon.max_discount, uses_limit ?? coupon.uses_limit,
         expires_at !== undefined ? expires_at : coupon.expires_at, req.params.id);
  res.json({ coupon: db.prepare('SELECT * FROM coupons WHERE id=?').get(req.params.id) });
});

// Admin: delete coupon
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  getDB().prepare('DELETE FROM coupons WHERE id=?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
