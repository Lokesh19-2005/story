// src/routes/newsletter.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';

const router = Router();

router.post('/', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  try {
    getDB().prepare('INSERT OR IGNORE INTO newsletter (id,email) VALUES (?,?)').run(uuid(), email.toLowerCase());
    res.json({ message: 'Subscribed successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
