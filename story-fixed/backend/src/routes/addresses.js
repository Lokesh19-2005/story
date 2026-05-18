// src/routes/addresses.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id=? ORDER BY is_default DESC, created_at DESC').all(req.user.id);
  res.json({ addresses });
});

router.post('/', authenticate, (req, res) => {
  const { label, name, phone, line1, line2, city, state, pincode, is_default } = req.body;
  if (!name || !phone || !line1 || !city || !state || !pincode) return res.status(400).json({ message: 'Required fields missing' });
  const db = getDB();
  if (is_default) db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(req.user.id);
  const id = uuid();
  db.prepare('INSERT INTO addresses (id,user_id,label,name,phone,line1,line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, label||'Home', name, phone, line1, line2||'', city, state, pincode, is_default ? 1 : 0);
  const address = db.prepare('SELECT * FROM addresses WHERE id=?').get(id);
  res.status(201).json({ address });
});

router.patch('/:id', authenticate, (req, res) => {
  const db = getDB();
  const addr = db.prepare('SELECT * FROM addresses WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!addr) return res.status(404).json({ message: 'Address not found' });
  const { label, name, phone, line1, line2, city, state, pincode, is_default } = req.body;
  if (is_default) db.prepare('UPDATE addresses SET is_default=0 WHERE user_id=?').run(req.user.id);
  db.prepare('UPDATE addresses SET label=?,name=?,phone=?,line1=?,line2=?,city=?,state=?,pincode=?,is_default=? WHERE id=?')
    .run(label||addr.label, name||addr.name, phone||addr.phone, line1||addr.line1, line2??addr.line2, city||addr.city, state||addr.state, pincode||addr.pincode, is_default ? 1 : 0, req.params.id);
  const updated = db.prepare('SELECT * FROM addresses WHERE id=?').get(req.params.id);
  res.json({ address: updated });
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDB();
  const addr = db.prepare('SELECT * FROM addresses WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!addr) return res.status(404).json({ message: 'Address not found' });
  db.prepare('DELETE FROM addresses WHERE id=?').run(req.params.id);
  res.json({ message: 'Address deleted' });
});

export default router;
