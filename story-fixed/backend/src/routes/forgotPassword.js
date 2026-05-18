// src/routes/forgotPassword.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { getDB } from '../database.js';
import { sendPasswordResetEmail } from '../email.js';

const router = Router();

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const db = getDB();
  const user = db.prepare('SELECT id, email FROM users WHERE email=?').get(email.toLowerCase());
  // Always respond success to prevent email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const token = uuid().replace(/-/g, '');
  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour
  db.prepare('INSERT INTO password_resets (id,user_id,token,expires_at) VALUES (?,?,?,?)').run(uuid(), user.id, token, expiresAt);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}?reset_token=${token}`;

  await sendPasswordResetEmail({ to: user.email, resetUrl, token });
  res.json({ message: 'If that email exists, a reset link has been sent.', dev_token: process.env.NODE_ENV !== 'production' ? token : undefined });
});

router.post('/reset', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });

  const db = getDB();
  const rec = db.prepare('SELECT * FROM password_resets WHERE token=? AND used=0').get(token);
  if (!rec) return res.status(400).json({ message: 'Invalid or expired reset token' });
  if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ message: 'Reset token has expired' });

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, rec.user_id);
  db.prepare('UPDATE password_resets SET used=1 WHERE id=?').run(rec.id);
  res.json({ message: 'Password reset successfully' });
});

export default router;
