// src/routes/returns.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// User: list their own returns
router.get('/my', authenticate, (req, res) => {
  const db = getDB();
  const returns = db.prepare(`
    SELECT r.*, o.order_number FROM returns r
    JOIN orders o ON r.order_id = o.id
    WHERE r.user_id=? ORDER BY r.created_at DESC
  `).all(req.user.id);
  res.json({ returns });
});

// User: request a return
router.post('/', authenticate, (req, res) => {
  const { order_id, reason, details } = req.body;
  if (!order_id || !reason) return res.status(400).json({ message: 'Order ID and reason required' });
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(order_id, req.user.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const existing = db.prepare('SELECT id FROM returns WHERE order_id=? AND user_id=?').get(order_id, req.user.id);
  if (existing) return res.status(409).json({ message: 'Return already requested for this order' });

  const id = uuid();
  db.prepare('INSERT INTO returns (id,order_id,user_id,reason,details) VALUES (?,?,?,?,?)').run(id, order_id, req.user.id, reason, details||'');
  const ret = db.prepare('SELECT r.*, o.order_number FROM returns r JOIN orders o ON r.order_id=o.id WHERE r.id=?').get(id);
  res.status(201).json({ return: ret });
});

// Admin: list all returns
router.get('/admin', authenticate, requireAdmin, (req, res) => {
  const db = getDB();
  const returns = db.prepare(`
    SELECT r.*, o.order_number, u.name as user_name, u.email as user_email
    FROM returns r
    JOIN orders o ON r.order_id = o.id
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.json({ returns });
});

// Admin: update return status
router.patch('/admin/:id', authenticate, requireAdmin, (req, res) => {
  const { status, admin_notes } = req.body;
  const db = getDB();
  db.prepare('UPDATE returns SET status=?, admin_notes=?, updated_at=datetime(\'now\') WHERE id=?')
    .run(status, admin_notes||'', req.params.id);
  const ret = db.prepare('SELECT * FROM returns WHERE id=?').get(req.params.id);
  res.json({ return: ret });
});

export default router;
