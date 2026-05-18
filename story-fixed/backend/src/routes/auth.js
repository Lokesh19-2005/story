// src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });
  const db = getDB();
  try {
    const hash = bcrypt.hashSync(password, 10);
    const id = uuid();
    db.prepare('INSERT INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)').run(id, name, email.toLowerCase(), hash, phone || '');
    const user = db.prepare('SELECT id,name,email,phone,role,created_at FROM users WHERE id=?').get(id);
    res.json({ token: makeToken(id), user });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ message: 'Email already registered' });
    res.status(500).json({ message: e.message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  res.json({ token: makeToken(user.id), user: safe });
});

router.get('/me', authenticate, (req, res) => {
  const { password: _, ...safe } = req.user;
  res.json({ user: safe });
});

router.patch('/me', authenticate, (req, res) => {
  const { name, phone } = req.body;
  const db = getDB();
  db.prepare('UPDATE users SET name=?, phone=? WHERE id=?').run(name || req.user.name, phone ?? req.user.phone, req.user.id);
  const user = db.prepare('SELECT id,name,email,phone,role FROM users WHERE id=?').get(req.user.id);
  res.json({ user });
});

router.patch('/change-password', authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!bcrypt.compareSync(currentPassword, req.user.password)) return res.status(400).json({ message: 'Current password incorrect' });
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password min 6 characters' });
  const hash = bcrypt.hashSync(newPassword, 10);
  getDB().prepare('UPDATE users SET password=? WHERE id=?').run(hash, req.user.id);
  res.json({ message: 'Password changed' });
});

export default router;
