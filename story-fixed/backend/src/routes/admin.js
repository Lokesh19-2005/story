// src/routes/admin.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDB } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  const db = getDB();
  const stats = {
    orders: db.prepare(`SELECT
      COUNT(*) as total_orders,
      COALESCE(SUM(total),0) as total_revenue,
      SUM(CASE WHEN order_status='placed' OR order_status='confirmed' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN order_status='delivered' THEN 1 ELSE 0 END) as delivered_orders,
      SUM(CASE WHEN placed_at >= datetime('now','-7 days') THEN 1 ELSE 0 END) as orders_this_week
    FROM orders`).get(),
    users: db.prepare(`SELECT
      COUNT(*) as total_users,
      SUM(CASE WHEN created_at >= datetime('now','-7 days') THEN 1 ELSE 0 END) as new_this_week
    FROM users`).get(),
    products: db.prepare(`SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN is_active=0 THEN 1 ELSE 0 END) as inactive_products
    FROM products`).get(),
  };
  const topProducts = db.prepare(`
    SELECT oi.product_name, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
    FROM order_items oi JOIN orders o ON oi.order_id=o.id
    WHERE o.order_status != 'cancelled'
    GROUP BY oi.product_name ORDER BY revenue DESC LIMIT 5
  `).all();
  res.json({ stats: { ...stats, topProducts } });
});

// Orders management
router.get('/orders', (req, res) => {
  const db = getDB();
  const { status, page = 1, limit = 50 } = req.query;
  let q = `SELECT o.*, u.name as user_name, u.email as user_email
           FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE 1=1`;
  const args = [];
  if (status) { q += ' AND o.order_status=?'; args.push(status); }
  q += ' ORDER BY o.placed_at DESC LIMIT ? OFFSET ?';
  args.push(Number(limit), (Number(page) - 1) * Number(limit));
  res.json({ orders: db.prepare(q).all(...args) });
});

router.patch('/orders/:id/status', (req, res) => {
  const db = getDB();
  const VALID_ORDER_STATUS   = ['placed','confirmed','shipped','delivered','cancelled'];
  const VALID_PAYMENT_STATUS = ['pending','awaiting','paid','failed','refunded'];

  const { order_status, payment_status } = req.body;

  if (order_status !== undefined && !VALID_ORDER_STATUS.includes(order_status))
    return res.status(400).json({ success: false, message: `Invalid order_status. Allowed: ${VALID_ORDER_STATUS.join(', ')}` });

  if (payment_status !== undefined && !VALID_PAYMENT_STATUS.includes(payment_status))
    return res.status(400).json({ success: false, message: `Invalid payment_status. Allowed: ${VALID_PAYMENT_STATUS.join(', ')}` });

  const order = db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  db.prepare(`UPDATE orders SET order_status=?, payment_status=?, updated_at=datetime('now') WHERE id=?`)
    .run(order_status ?? order.order_status, payment_status ?? order.payment_status, req.params.id);

  res.json({ success: true, order: db.prepare('SELECT * FROM orders WHERE id=?').get(req.params.id) });
});

// Products management
router.get('/products', (req, res) => {
  const db = getDB();
  const products = db.prepare(`
    SELECT p.*, b.name as brand, c.label as category_label, c.slug as category_slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id=b.id
    LEFT JOIN categories c ON p.category_id=c.id
    ORDER BY p.created_at DESC
  `).all();
  res.json({ products });
});

router.post('/products', (req, res) => {
  const db = getDB();
  const { name, slug, price, orig_price, icon = '◉', image_url = '', tag = '', brand_name, category_slug, description = '', sizes = [], colors = [] } = req.body;
  if (!name || !slug || !price) return res.status(400).json({ message: 'name, slug, price required' });

  try {
    let brand = db.prepare('SELECT id FROM brands WHERE name=?').get(brand_name);
    if (!brand && brand_name) {
      const bid = uuid();
      db.prepare('INSERT INTO brands (id,slug,name) VALUES (?,?,?)').run(bid, brand_name.toLowerCase().replace(/\s+/g,'-'), brand_name);
      brand = { id: bid };
    }
    let cat = db.prepare('SELECT id FROM categories WHERE slug=?').get(category_slug);

    const id = uuid();
    db.prepare('INSERT INTO products (id,slug,name,description,price,orig_price,icon,image_url,tag,brand_id,category_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, slug, name, description, Number(price), Number(orig_price||price), icon, image_url, tag, brand?.id||null, cat?.id||null);

    const defaultSizes  = ['S','M','L','XL'];
    const defaultColors = [{ name: 'Black', hex: '#0a0a0a' }];
    const sz = sizes.length ? sizes : defaultSizes;
    const cl = colors.length ? colors : defaultColors;

    sz.forEach(s => db.prepare('INSERT INTO product_sizes (id,product_id,size) VALUES (?,?,?)').run(uuid(), id, s));
    cl.forEach(c => {
      db.prepare('INSERT INTO product_colors (id,product_id,color_name,color_hex) VALUES (?,?,?,?)').run(uuid(), id, c.name||c, c.hex||'#000');
      sz.forEach(s => db.prepare('INSERT OR IGNORE INTO inventory (id,product_id,size,color_name,stock) VALUES (?,?,?,?,?)').run(uuid(), id, s, c.name||c, 10));
    });

    res.json({ product: db.prepare('SELECT * FROM products WHERE id=?').get(id) });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: e.message });
  }
});

router.patch('/products/:id', (req, res) => {
  const db = getDB();
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  const { name, price, orig_price, tag, description, is_active, icon, image_url } = req.body;
  db.prepare('UPDATE products SET name=?,price=?,orig_price=?,tag=?,description=?,is_active=?,icon=?,image_url=? WHERE id=?')
    .run(name??p.name, price??p.price, orig_price??p.orig_price, tag??p.tag, description??p.description, is_active??p.is_active, icon??p.icon, image_url??p.image_url, req.params.id);
  res.json({ product: db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id) });
});

router.delete('/products/:id', (req, res) => {
  getDB().prepare('UPDATE products SET is_active=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Product hidden' });
});

// Users management
router.get('/users', (req, res) => {
  const db = getDB();
  const users = db.prepare('SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['user','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  getDB().prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

export default router;
