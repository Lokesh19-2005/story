// backend/src/routes/payment.js
import { Router } from 'express';
import crypto from 'crypto';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function getRazorpayInstance() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_HERE') return null;
  return { keyId, keySecret };
}

// POST /api/payment/create-order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount) return res.status(400).json({ message: 'Amount required' });

    const rzp = getRazorpayInstance();

    // ── Mock mode (no real keys configured) ──
    if (!rzp) {
      return res.json({
        key: 'mock',
        mock: true,
        order: {
          id: `mock_order_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: 'INR',
        },
      });
    }

    // ── Real Razorpay ──
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({ key_id: rzp.keyId, key_secret: rzp.keySecret });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.json({ key: rzp.keyId, mock: false, order });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    res.status(500).json({ message: err.message || 'Payment gateway error' });
  }
});

// POST /api/payment/verify
router.post('/verify', authenticate, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    const db = getDB();

    // Mock order — skip signature check
    if (!razorpay_order_id || razorpay_order_id.startsWith('mock_')) {
      db.prepare(`
        UPDATE orders SET
          payment_status = 'paid',
          order_status   = 'confirmed',
          updated_at     = datetime('now')
        WHERE id = ?
      `).run(order_id);
      return res.json({ success: true });
    }

    // Real Razorpay — verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret === 'YOUR_SECRET_HERE') {
      return res.status(400).json({ message: 'Razorpay secret not configured' });
    }

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    db.prepare(`
      UPDATE orders SET
        payment_status       = 'paid',
        order_status         = 'confirmed',
        razorpay_order_id    = ?,
        razorpay_payment_id  = ?,
        updated_at           = datetime('now')
      WHERE id = ?
    `).run(razorpay_order_id, razorpay_payment_id, order_id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/failed
router.post('/failed', authenticate, (req, res) => {
  try {
    const { order_id, razorpay_order_id, reason } = req.body;
    getDB().prepare(`
      UPDATE orders SET
        payment_status    = 'failed',
        razorpay_order_id = ?,
        updated_at        = datetime('now')
      WHERE id = ?
    `).run(razorpay_order_id || '', order_id);
    res.json({ message: 'Recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;