// src/routes/products.js
import { Router } from 'express';
import { getDB } from '../database.js';

const router = Router();

// ── Helpers ──────────────────────────────────────────────
function safeJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string')      return value;
  try { return JSON.parse(value); }
  catch { return fallback; }
}

function enrichProduct(p, db) {
  const sizes  = db
    .prepare('SELECT size FROM product_sizes WHERE product_id=? ORDER BY rowid')
    .all(p.id)
    .map(r => r.size);
  const colors = db.prepare('SELECT color_name, color_hex FROM product_colors WHERE product_id=?').all(p.id);
  const brand  = db.prepare('SELECT name FROM brands WHERE id=?').get(p.brand_id);
  const cat    = db.prepare('SELECT slug, label FROM categories WHERE id=?').get(p.category_id);

  // Normalise image gallery — `images` is the source of truth, with
  // `image_url` as a back-compat fallback for older rows.
  let images = safeJson(p.images, []);
  if (!Array.isArray(images)) images = [];
  if (images.length === 0 && p.image_url) images = [p.image_url];

  const badges = safeJson(p.badges, []);

  return {
    ...p,
    images,
    badges: Array.isArray(badges) ? badges : [],
    sizes,
    colors,
    brand:          brand?.name  || '',
    category_slug:  cat?.slug,
    category_label: cat?.label,
  };
}

// ── List ─────────────────────────────────────────────────
router.get('/', (req, res) => {
  const db = getDB();
  const { category, brand, search, sort = 'newest', page = 1, limit = 20 } = req.query;
  let q = `
    SELECT p.* FROM products p
    LEFT JOIN brands b     ON p.brand_id=b.id
    LEFT JOIN categories c ON p.category_id=c.id
    WHERE p.is_active=1
  `;
  const args = [];
  if (category) { q += ' AND c.slug=?'; args.push(category); }
  if (brand)    { q += ' AND b.slug=?'; args.push(brand); }
  if (search)   { q += ' AND (p.name LIKE ? OR p.description LIKE ?)'; args.push(`%${search}%`, `%${search}%`); }
  if (sort === 'price_asc')        q += ' ORDER BY p.price ASC';
  else if (sort === 'price_desc')  q += ' ORDER BY p.price DESC';
  else                             q += ' ORDER BY p.created_at DESC';
  const offset = (Number(page) - 1) * Number(limit);
  q += ` LIMIT ${Number(limit)} OFFSET ${offset}`;
  const rows = db.prepare(q).all(...args);
  const products = rows.map(p => enrichProduct(p, db));
  res.json({ products });
});

// ── Detail ───────────────────────────────────────────────
router.get('/:slug', (req, res) => {
  const db = getDB();
  const p = db.prepare('SELECT * FROM products WHERE slug=? AND is_active=1').get(req.params.slug);
  if (!p) return res.status(404).json({ message: 'Product not found' });

  // Inventory map keyed by `${size}__${color_name}` — same as before
  const inv = db.prepare('SELECT size, color_name, stock FROM inventory WHERE product_id=?').all(p.id);
  const stockMap = {};
  inv.forEach(i => { stockMap[`${i.size}__${i.color_name}`] = i.stock; });

  res.json({ product: { ...enrichProduct(p, db), stockMap } });
});

// ── Related ──────────────────────────────────────────────
router.get('/:slug/related', (req, res) => {
  const db = getDB();
  const p = db.prepare('SELECT * FROM products WHERE slug=?').get(req.params.slug);
  if (!p) return res.json({ products: [] });
  const rows = db
    .prepare('SELECT * FROM products WHERE category_id=? AND id!=? AND is_active=1 LIMIT 4')
    .all(p.category_id, p.id);
  res.json({ products: rows.map(r => enrichProduct(r, db)) });
});

export default router;
