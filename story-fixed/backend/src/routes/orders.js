// src/routes/orders.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { sendOrderConfirmation } from '../email.js';

const router = Router();

function generateOrderNumber() {
  return 'STR' + Date.now().toString().slice(-8);
}

router.post('/', authenticate, async (req, res) => {
  const { items, delivery, payment_method = 'online', razorpay_order_id, razorpay_payment_id, coupon_code, discount_amount = 0, subtotal, gst_amount = 0, shipping_cost = 0, cod_fee = 0, total } = req.body;
  if (!items?.length || !delivery) return res.status(400).json({ error: 'Items and delivery required', message: 'Items and delivery required' });

  const db = getDB();
  const orderId = uuid();
  const orderNumber = generateOrderNumber();

  const placeOrder = db.transaction(() => {
    for (const item of items) {
      const inv = db.prepare('SELECT stock FROM inventory WHERE product_id=? AND size=? AND color_name=?').get(item.product_id, item.size, item.color_name);
      if (!inv) throw new Error(`Product variant not found: ${item.product_name} (${item.size}/${item.color_name})`);
      if (inv.stock < item.quantity) throw new Error(`Insufficient stock for ${item.product_name} (${item.size}/${item.color_name}). Available: ${inv.stock}`);
    }

    db.prepare(`INSERT INTO orders (id,order_number,user_id,payment_method,payment_status,razorpay_order_id,razorpay_payment_id,subtotal,discount_amount,coupon_code,gst_amount,shipping_cost,cod_fee,total,delivery_name,delivery_phone,delivery_email,delivery_line1,delivery_line2,delivery_city,delivery_state,delivery_pincode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(orderId, orderNumber, req.user.id, payment_method,
        payment_method === 'cod' ? 'cod_pending' : 'paid',
        razorpay_order_id || null, razorpay_payment_id || null,
        subtotal, discount_amount, coupon_code || '',
        gst_amount, shipping_cost, cod_fee, total,
        delivery.name, delivery.phone, delivery.email || '',
        delivery.line1, delivery.line2 || '',
        delivery.city, delivery.state, delivery.pincode);

    for (const item of items) {
      db.prepare('INSERT INTO order_items (id,order_id,product_id,product_name,size,color_name,quantity,unit_price,total_price) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(uuid(), orderId, item.product_id, item.product_name, item.size, item.color_name, item.quantity, item.unit_price, item.unit_price * item.quantity);
      db.prepare('UPDATE inventory SET stock = MAX(0, stock - ?) WHERE product_id=? AND size=? AND color_name=?')
        .run(item.quantity, item.product_id, item.size, item.color_name);
    }

    if (coupon_code) {
      db.prepare('UPDATE coupons SET uses_total = uses_total + 1 WHERE code=?').run(coupon_code.toUpperCase());
    }

    db.prepare('DELETE FROM cart WHERE user_id=?').run(req.user.id);
  });

  try {
    placeOrder();
    const order = db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(orderId);
    const userEmail = req.user.email;
    sendOrderConfirmation({ to: delivery.email || userEmail, order, items: orderItems }).catch(e => console.error('[Email]', e.message));
    res.status(201).json({ order: { ...order, items: orderItems } });
  } catch (e) {
    res.status(400).json({ error: e.message, message: e.message });
  }
});

router.get('/', authenticate, (req, res) => {
  const db = getDB();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY placed_at DESC').all(req.user.id);
  const result = orders.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.id);
    return { ...o, items };
  });
  res.json({ orders: result });
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found', message: 'Order not found' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
  res.json({ order: { ...order, items } });
});

// Cancel order + restore stock
router.post('/:id/cancel', authenticate, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found', message: 'Order not found' });
  if (!['placed', 'confirmed'].includes(order.order_status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled', message: `Cannot cancel an order with status: ${order.order_status}` });
  }

  const cancelOrder = db.transaction(() => {
    db.prepare("UPDATE orders SET order_status='cancelled', updated_at=datetime('now') WHERE id=?").run(order.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
    for (const item of items) {
      db.prepare('UPDATE inventory SET stock = stock + ? WHERE product_id=? AND size=? AND color_name=?')
        .run(item.quantity, item.product_id, item.size, item.color_name);
    }
    if (order.coupon_code) {
      db.prepare('UPDATE coupons SET uses_total = MAX(0, uses_total - 1) WHERE code=?').run(order.coupon_code);
    }
  });

  try {
    cancelOrder();
    const updated = db.prepare('SELECT * FROM orders WHERE id=?').get(order.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(order.id);
    res.json({ order: { ...updated, items } });
  } catch (e) {
    res.status(500).json({ error: e.message, message: e.message });
  }
});

export default router;
