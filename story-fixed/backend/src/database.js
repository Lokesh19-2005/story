// src/database.js — SQLite database with all tables
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let db;

export function getDB() {
  if (!db) {
    db = new Database(path.join(__dirname, '..', 'story.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDB() {
  const db = getDB();

  db.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      phone       TEXT DEFAULT '',
      role        TEXT DEFAULT 'user',
      created_at  TEXT DEFAULT (datetime('now'))
    );

    -- Categories
    CREATE TABLE IF NOT EXISTS categories (
      id    TEXT PRIMARY KEY,
      slug  TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL
    );

    -- Brands
    CREATE TABLE IF NOT EXISTS brands (
      id   TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );

    -- Products
    CREATE TABLE IF NOT EXISTS products (
      id             TEXT PRIMARY KEY,
      slug           TEXT UNIQUE NOT NULL,
      name           TEXT NOT NULL,
      description    TEXT DEFAULT '',
      price          REAL NOT NULL,
      orig_price     REAL NOT NULL,
      icon           TEXT DEFAULT '◉',
      image_url      TEXT DEFAULT '',
      tag            TEXT DEFAULT '',
      brand_id       TEXT REFERENCES brands(id),
      category_id    TEXT REFERENCES categories(id),
      is_active      INTEGER DEFAULT 1,
      created_at     TEXT DEFAULT (datetime('now'))
    );

    -- Product sizes
    CREATE TABLE IF NOT EXISTS product_sizes (
      id         TEXT PRIMARY KEY,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      size       TEXT NOT NULL
    );

    -- Product colors
    CREATE TABLE IF NOT EXISTS product_colors (
      id         TEXT PRIMARY KEY,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      color_name TEXT NOT NULL,
      color_hex  TEXT DEFAULT '#000000'
    );

    -- Inventory (stock per variant)
    CREATE TABLE IF NOT EXISTS inventory (
      id         TEXT PRIMARY KEY,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      size       TEXT NOT NULL,
      color_name TEXT NOT NULL,
      stock      INTEGER DEFAULT 0,
      UNIQUE(product_id, size, color_name)
    );

    -- Cart
    CREATE TABLE IF NOT EXISTS cart (
      id         TEXT PRIMARY KEY,
      user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      size       TEXT NOT NULL,
      color_name TEXT NOT NULL,
      color_hex  TEXT DEFAULT '#000000',
      quantity   INTEGER DEFAULT 1,
      added_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id, size, color_name)
    );

    -- Wishlist
    CREATE TABLE IF NOT EXISTS wishlist (
      id         TEXT PRIMARY KEY,
      user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
      added_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id)
    );

    -- Coupons
    CREATE TABLE IF NOT EXISTS coupons (
      id           TEXT PRIMARY KEY,
      code         TEXT UNIQUE NOT NULL,
      type         TEXT DEFAULT 'flat',
      value        REAL NOT NULL,
      min_order    REAL DEFAULT 0,
      max_discount REAL,
      uses_limit   INTEGER,
      uses_total   INTEGER DEFAULT 0,
      is_active    INTEGER DEFAULT 1,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id               TEXT PRIMARY KEY,
      order_number     TEXT UNIQUE NOT NULL,
      user_id          TEXT REFERENCES users(id),
      order_status     TEXT DEFAULT 'placed',
      payment_method   TEXT DEFAULT 'online',
      payment_status   TEXT DEFAULT 'awaiting',
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      subtotal         REAL NOT NULL,
      discount_amount  REAL DEFAULT 0,
      coupon_code      TEXT DEFAULT '',
      gst_amount       REAL DEFAULT 0,
      shipping_cost    REAL DEFAULT 0,
      cod_fee          REAL DEFAULT 0,
      total            REAL NOT NULL,
      shipping_method  TEXT DEFAULT 'standard',
      delivery_name    TEXT,
      delivery_phone   TEXT,
      delivery_email   TEXT,
      delivery_line1   TEXT,
      delivery_line2   TEXT,
      delivery_city    TEXT,
      delivery_state   TEXT,
      delivery_pincode TEXT,
      notes            TEXT DEFAULT '',
      placed_at        TEXT DEFAULT (datetime('now')),
      updated_at       TEXT DEFAULT (datetime('now'))
    );

    -- Order items
    CREATE TABLE IF NOT EXISTS order_items (
      id           TEXT PRIMARY KEY,
      order_id     TEXT REFERENCES orders(id) ON DELETE CASCADE,
      product_id   TEXT,
      product_name TEXT NOT NULL,
      size         TEXT NOT NULL,
      color_name   TEXT NOT NULL,
      quantity     INTEGER NOT NULL,
      unit_price   REAL NOT NULL,
      total_price  REAL NOT NULL
    );

    -- Newsletter
    CREATE TABLE IF NOT EXISTS newsletter (
      id         TEXT PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Password Reset Tokens
    CREATE TABLE IF NOT EXISTS password_resets (
      id         TEXT PRIMARY KEY,
      user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used       INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- User Addresses
    CREATE TABLE IF NOT EXISTS addresses (
      id         TEXT PRIMARY KEY,
      user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
      label      TEXT DEFAULT 'Home',
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      line1      TEXT NOT NULL,
      line2      TEXT DEFAULT '',
      city       TEXT NOT NULL,
      state      TEXT NOT NULL,
      pincode    TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Returns / Refunds
    CREATE TABLE IF NOT EXISTS returns (
      id          TEXT PRIMARY KEY,
      order_id    TEXT REFERENCES orders(id) ON DELETE CASCADE,
      user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
      reason      TEXT NOT NULL,
      details     TEXT DEFAULT '',
      status      TEXT DEFAULT 'requested',
      admin_notes TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now')),
      updated_at  TEXT DEFAULT (datetime('now'))
    );

    -- Safety trigger: prevent inventory stock going below 0
    CREATE TRIGGER IF NOT EXISTS prevent_negative_stock
      BEFORE UPDATE OF stock ON inventory
      FOR EACH ROW
      WHEN NEW.stock < 0
    BEGIN
      SELECT RAISE(ABORT, 'Stock cannot go below zero');
    END;
  `);

  // Safe migrations for existing databases
  try { db.exec("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''"); } catch(e) {}
  try { db.exec("ALTER TABLE coupons ADD COLUMN expires_at TEXT DEFAULT NULL"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch(e) {}

  seedData(db);
  console.log('✅ Database initialized');
}

function seedData(db) {
  const already = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (already.c > 0) return;

  const cats = [
    { id: uuid(), slug: 'shoes', label: 'Shoes' },
    { id: uuid(), slug: 'tops', label: 'Tops' },
    { id: uuid(), slug: 'bottoms', label: 'Bottoms' },
    { id: uuid(), slug: 'outerwear', label: 'Outerwear' },
    { id: uuid(), slug: 'accessories', label: 'Accessories' },
  ];
  const catStmt = db.prepare('INSERT INTO categories (id,slug,label) VALUES (?,?,?)');
  cats.forEach(c => catStmt.run(c.id, c.slug, c.label));

  const brands = [
    { id: uuid(), slug: 'story', name: 'STORY™' },
    { id: uuid(), slug: 'arcane', name: 'ARCANE' },
    { id: uuid(), slug: 'monolith', name: 'MONOLITH' },
    { id: uuid(), slug: 'void', name: 'VOID' },
  ];
  const brandStmt = db.prepare('INSERT INTO brands (id,slug,name) VALUES (?,?,?)');
  brands.forEach(b => brandStmt.run(b.id, b.slug, b.name));

  const products = [
    { slug: 'phantom-runner-v2', name: 'PHANTOM RUNNER V2', price: 8999, orig: 11999, icon: '◎', tag: 'NEW', cat: 'shoes', brand: 'story', desc: 'Ultralight performance runner with reactive foam sole and breathable mesh upper.' },
    { slug: 'obsidian-blazer', name: 'OBSIDIAN BLAZER', price: 12999, orig: 16999, icon: '◈', tag: 'BESTSELLER', cat: 'outerwear', brand: 'arcane', desc: 'Structured blazer in premium obsidian wool blend. Unlined for breathability.' },
    { slug: 'void-cargo-pant', name: 'VOID CARGO PANT', price: 6499, orig: 8499, icon: '▣', tag: 'SALE', cat: 'bottoms', brand: 'void', desc: 'Technical cargo silhouette with zippered pockets and adjustable ankle cuffs.' },
    { slug: 'monolith-tee', name: 'MONOLITH TEE', price: 2999, orig: 3999, icon: '◉', tag: '', cat: 'tops', brand: 'monolith', desc: 'Heavyweight 280gsm jersey tee. Preshrunk. Pigment-dyed for lived-in tone.' },
    { slug: 'shadow-hoodie', name: 'SHADOW HOODIE', price: 7499, orig: 9499, icon: '◐', tag: 'NEW', cat: 'tops', brand: 'story', desc: 'Brushed fleece interior with dropped shoulder and kangaroo pocket.' },
    { slug: 'arc-sneaker-lo', name: 'ARC SNEAKER LO', price: 9999, orig: 12999, icon: '◯', tag: '', cat: 'shoes', brand: 'arcane', desc: 'Low-top vulcanized silhouette with suede overlays and gum sole.' },
    { slug: 'terrain-jacket', name: 'TERRAIN JACKET', price: 15999, orig: 19999, icon: '◆', tag: 'LIMITED', cat: 'outerwear', brand: 'story', desc: 'Waterproof nylon shell with sealed seams, packable into chest pocket.' },
    { slug: 'signal-cap', name: 'SIGNAL CAP', price: 1999, orig: 2499, icon: '◇', tag: '', cat: 'accessories', brand: 'monolith', desc: 'Six-panel structured cap with tonal embroidery and adjustable strap.' },
  ];

  const sizes = { shoes: ['40','41','42','43','44','45'], tops: ['XS','S','M','L','XL','XXL'], bottoms: ['28','30','32','34','36'], outerwear: ['S','M','L','XL'], accessories: ['ONE SIZE'] };
  const colors = [
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'White', hex: '#f5f5f0' },
    { name: 'Slate', hex: '#4a5568' },
    { name: 'Sand', hex: '#c4a882' },
  ];

  const catMap = {};
  cats.forEach(c => catMap[c.slug] = c.id);
  const brandMap = {};
  brands.forEach(b => brandMap[b.slug] = b.id);

  const seedAll = db.transaction(() => {
    products.forEach(p => {
      const pid = uuid();
      db.prepare('INSERT INTO products (id,slug,name,description,price,orig_price,icon,tag,brand_id,category_id) VALUES (?,?,?,?,?,?,?,?,?,?)')
        .run(pid, p.slug, p.name, p.desc, p.price, p.orig, p.icon, p.tag, brandMap[p.brand], catMap[p.cat]);

      const pSizes = sizes[p.cat] || sizes.tops;
      pSizes.forEach(s => db.prepare('INSERT INTO product_sizes (id,product_id,size) VALUES (?,?,?)').run(uuid(), pid, s));
      colors.forEach(c => db.prepare('INSERT INTO product_colors (id,product_id,color_name,color_hex) VALUES (?,?,?,?)').run(uuid(), pid, c.name, c.hex));

      pSizes.forEach(s => colors.forEach(c => {
        db.prepare('INSERT OR IGNORE INTO inventory (id,product_id,size,color_name,stock) VALUES (?,?,?,?,?)')
          .run(uuid(), pid, s, c.name, Math.floor(Math.random() * 20) + 5);
      }));
    });

    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT OR IGNORE INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)')
      .run(uuid(), 'Admin', 'admin@story.com', hash, 'admin');

    [
      { code: 'WELCOME10', type: 'percent', value: 10, min_order: 0, max_discount: 500 },
      { code: 'FLAT500', type: 'flat', value: 500, min_order: 2000 },
      { code: 'STORY20', type: 'percent', value: 20, min_order: 5000, max_discount: 2000 },
    ].forEach(c => db.prepare('INSERT OR IGNORE INTO coupons (id,code,type,value,min_order,max_discount) VALUES (?,?,?,?,?,?)')
      .run(uuid(), c.code, c.type, c.value, c.min_order || 0, c.max_discount || null));
  });

  seedAll();
  console.log('✅ Seed data inserted');
}
