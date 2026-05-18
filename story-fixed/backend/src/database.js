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
      images         TEXT DEFAULT '[]',
      badges         TEXT DEFAULT '[]',
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
  try { db.exec("ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'"); } catch(e) {}
  try { db.exec("ALTER TABLE products ADD COLUMN badges TEXT DEFAULT '[]'"); } catch(e) {}
  try { db.exec("ALTER TABLE coupons ADD COLUMN expires_at TEXT DEFAULT NULL"); } catch(e) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch(e) {}

  seedData(db);
  console.log('✅ Database initialized');
}

// ── Image helper ───────────────────────────────────────────
// Uses picsum.photos with a stable seed so demo images are deterministic,
// CDN-cached, and free to hot-link. The grayscale filter gives an editorial
// monochrome feel that matches the luxury aesthetic of the rest of the UI.
const img = (slug, n) => `https://picsum.photos/seed/story-${slug}-${n}/800/1000?grayscale`;
const imageSet = (slug) => [img(slug, 1), img(slug, 2), img(slug, 3), img(slug, 4)];

// ── Demo product catalogue (18 luxury / streetwear pieces) ─
const COLORS = {
  black: { name: 'Black', hex: '#0a0a0a' },
  white: { name: 'White', hex: '#f5f5f0' },
  slate: { name: 'Slate', hex: '#4a5568' },
  sand:  { name: 'Sand',  hex: '#c4a882' },
  bone:  { name: 'Bone',  hex: '#e8e2d4' },
  ink:   { name: 'Ink',   hex: '#1a1a1f' },
};

const SIZES = {
  apparel:    ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  outerwear:  ['S', 'M', 'L', 'XL'],
  bottoms:    ['28', '30', '32', '34', '36'],
  shoes:      ['40', '41', '42', '43', '44', '45'],
  watch:      ['38mm', '41mm', '44mm'],
  belt:       ['S', 'M', 'L'],
  one:        ['ONE SIZE'],
};

const CATALOGUE = [
  // ── T-Shirts ────────────────────────────────────────────
  { slug: 'monolith-heavyweight-tee', name: 'MONOLITH HEAVYWEIGHT TEE', cat: 'tops', brand: 'story',    price: 2999,  orig: 3999,  icon: '◉', tag: 'NEW',        badges: ['NEW'],
    desc: 'Heavyweight 280gsm cotton jersey, garment-dyed for a lived-in tone. Boxy fit, dropped shoulder, ribbed crew.',
    sizes: SIZES.apparel, colors: ['black', 'white', 'sand'] },
  { slug: 'eclipse-box-tee', name: 'ECLIPSE BOX TEE', cat: 'tops', brand: 'void', price: 3499, orig: 4499, icon: '◐', tag: 'HOT', badges: ['HOT'],
    desc: 'Mid-weight pima cotton with a cropped, boxy silhouette. Tonal chest embroidery and a clean hem stitch.',
    sizes: SIZES.apparel, colors: ['slate', 'black'] },
  { slug: 'arc-logo-tee', name: 'ARC LOGO TEE', cat: 'tops', brand: 'arcane', price: 2799, orig: 3499, icon: '◯', tag: '',  badges: [],
    desc: 'Soft-hand 220gsm jersey with reflective ARC monogram on the chest. Regular fit through body and sleeve.',
    sizes: SIZES.apparel, colors: ['white', 'sand', 'black'] },

  // ── Hoodies ─────────────────────────────────────────────
  { slug: 'shadow-hoodie', name: 'SHADOW HOODIE', cat: 'tops', brand: 'story', price: 7499, orig: 9499, icon: '◐', tag: 'NEW', badges: ['NEW'],
    desc: 'Brushed-fleece interior, dropped shoulder, kangaroo pocket and self-fabric drawcord. Cut for a relaxed silhouette.',
    sizes: SIZES.apparel, colors: ['black', 'slate'] },
  { slug: 'atlas-pullover', name: 'ATLAS PULLOVER', cat: 'tops', brand: 'monolith', price: 6499, orig: 8499, icon: '◉', tag: 'SALE', badges: ['SALE'],
    desc: 'Heavyweight French terry with a clean half-zip placket. Sand-washed for a soft, faded finish.',
    sizes: SIZES.apparel, colors: ['sand', 'black'] },
  { slug: 'halo-zip-hoodie', name: 'HALO ZIP HOODIE', cat: 'tops', brand: 'halo', price: 8499, orig: 10999, icon: '◇', tag: '', badges: [],
    desc: 'Full-zip hoodie cut from Italian loop-back cotton. Concealed YKK zip and side seam pockets.',
    sizes: SIZES.apparel, colors: ['slate', 'white'] },

  // ── Jackets ─────────────────────────────────────────────
  { slug: 'terrain-shell-jacket', name: 'TERRAIN SHELL JACKET', cat: 'outerwear', brand: 'story', price: 15999, orig: 19999, icon: '◆', tag: 'LIMITED', badges: ['HOT'],
    desc: 'Waterproof 3-layer nylon shell with sealed seams and a packable construction. Adjustable storm hood.',
    sizes: SIZES.outerwear, colors: ['black', 'slate'] },
  { slug: 'obsidian-blazer', name: 'OBSIDIAN BLAZER', cat: 'outerwear', brand: 'arcane', price: 12999, orig: 16999, icon: '◈', tag: 'BESTSELLER', badges: [],
    desc: 'Unstructured blazer in mid-weight wool blend. Patch pockets, single vent, horn buttons.',
    sizes: SIZES.outerwear, colors: ['black', 'sand'] },
  { slug: 'north-parka', name: 'NORTH PARKA', cat: 'outerwear', brand: 'vesper', price: 18999, orig: 24999, icon: '◇', tag: 'NEW', badges: ['NEW'],
    desc: 'Premium recycled-down parka with rib-knit cuffs and a removable fur trim. Built for sub-zero comfort.',
    sizes: SIZES.outerwear, colors: ['slate', 'ink'] },

  // ── Sneakers ────────────────────────────────────────────
  { slug: 'phantom-runner-v2', name: 'PHANTOM RUNNER V2', cat: 'shoes', brand: 'story', price: 8999, orig: 11999, icon: '◎', tag: 'NEW', badges: ['NEW'],
    desc: 'Ultralight performance runner with reactive foam sole, breathable engineered mesh upper and a dual-density heel.',
    sizes: SIZES.shoes, colors: ['black', 'white'] },
  { slug: 'arc-sneaker-lo', name: 'ARC SNEAKER LO', cat: 'shoes', brand: 'arcane', price: 9999, orig: 12999, icon: '◯', tag: '', badges: [],
    desc: 'Low-top vulcanized silhouette with suede toe-cap, gum sole, and a tonal embroidered arc on the side panel.',
    sizes: SIZES.shoes, colors: ['black', 'sand'] },
  { slug: 'axis-court', name: 'AXIS COURT', cat: 'shoes', brand: 'axis', price: 7999, orig: 9999, icon: '◉', tag: 'SALE', badges: ['SALE'],
    desc: 'Minimal court silhouette in tumbled leather. Cup-sole construction with a perforated toe-box.',
    sizes: SIZES.shoes, colors: ['white', 'slate'] },

  // ── Watches ─────────────────────────────────────────────
  { slug: 'vesper-noir-automatic', name: 'VESPER NOIR AUTOMATIC', cat: 'watches', brand: 'vesper', price: 24999, orig: 29999, icon: '◴', tag: 'HOT', badges: ['HOT'],
    desc: 'Swiss-movement automatic with a brushed-steel case, sapphire crystal and 50m water resistance. Black sunburst dial.',
    sizes: SIZES.watch, colors: ['black', 'slate'] },
  { slug: 'axis-chronograph', name: 'AXIS CHRONOGRAPH', cat: 'watches', brand: 'axis', price: 18999, orig: 22999, icon: '◵', tag: '', badges: [],
    desc: 'Multifunction chronograph with three sub-dials, tachymeter bezel and a brushed bracelet. Ronda Swiss quartz movement.',
    sizes: SIZES.watch, colors: ['black', 'white'] },

  // ── Bags ────────────────────────────────────────────────
  { slug: 'void-duffle', name: 'VOID DUFFLE', cat: 'bags', brand: 'void', price: 11999, orig: 14999, icon: '▣', tag: 'NEW', badges: ['NEW'],
    desc: 'Weather-resistant 1000D nylon duffle with leather trim, magnetic closures and a detachable shoulder strap.',
    sizes: SIZES.one, colors: ['black', 'slate'] },
  { slug: 'monolith-weekender', name: 'MONOLITH WEEKENDER', cat: 'bags', brand: 'monolith', price: 14999, orig: 18999, icon: '▢', tag: '', badges: [],
    desc: 'Italian full-grain leather weekender with brass hardware, padded laptop sleeve and a structured base.',
    sizes: SIZES.one, colors: ['sand', 'black'] },

  // ── Accessories ─────────────────────────────────────────
  { slug: 'signal-cap', name: 'SIGNAL CAP', cat: 'accessories', brand: 'monolith', price: 1999, orig: 2499, icon: '◇', tag: '', badges: [],
    desc: 'Six-panel structured cap in washed cotton twill. Tonal embroidery and an antique-brass adjustable strap.',
    sizes: SIZES.one, colors: ['black', 'white', 'sand'] },
  { slug: 'arc-leather-belt', name: 'ARC LEATHER BELT', cat: 'accessories', brand: 'arcane', price: 4499, orig: 5999, icon: '◇', tag: 'SALE', badges: ['SALE'],
    desc: 'Italian vegetable-tanned leather belt with a brushed-steel arc buckle. Slim 30mm width.',
    sizes: SIZES.belt, colors: ['black', 'sand'] },
];

function seedData(db) {
  const already = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if (already.c > 0) return;

  // ── Categories ──
  const cats = [
    { slug: 'shoes',       label: 'Sneakers'    },
    { slug: 'tops',        label: 'Tops'        },
    { slug: 'bottoms',     label: 'Bottoms'     },
    { slug: 'outerwear',   label: 'Outerwear'   },
    { slug: 'watches',     label: 'Watches'     },
    { slug: 'bags',        label: 'Bags'        },
    { slug: 'accessories', label: 'Accessories' },
  ].map(c => ({ id: uuid(), ...c }));
  const catStmt = db.prepare('INSERT INTO categories (id,slug,label) VALUES (?,?,?)');
  cats.forEach(c => catStmt.run(c.id, c.slug, c.label));

  // ── Brands ──
  const brands = [
    { slug: 'story',    name: 'STORY™'   },
    { slug: 'arcane',   name: 'ARCANE'   },
    { slug: 'monolith', name: 'MONOLITH' },
    { slug: 'void',     name: 'VOID'     },
    { slug: 'vesper',   name: 'VESPER'   },
    { slug: 'axis',     name: 'AXIS'     },
    { slug: 'halo',     name: 'HALO'     },
  ].map(b => ({ id: uuid(), ...b }));
  const brandStmt = db.prepare('INSERT INTO brands (id,slug,name) VALUES (?,?,?)');
  brands.forEach(b => brandStmt.run(b.id, b.slug, b.name));

  const catMap   = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  const brandMap = Object.fromEntries(brands.map(b => [b.slug, b.id]));

  // ── Insert products ──
  const insertProduct = db.prepare(`
    INSERT INTO products
      (id, slug, name, description, price, orig_price, icon, image_url, images, badges, tag, brand_id, category_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const insertSize  = db.prepare('INSERT INTO product_sizes (id,product_id,size) VALUES (?,?,?)');
  const insertColor = db.prepare('INSERT INTO product_colors (id,product_id,color_name,color_hex) VALUES (?,?,?,?)');
  const insertInv   = db.prepare('INSERT OR IGNORE INTO inventory (id,product_id,size,color_name,stock) VALUES (?,?,?,?,?)');

  const seedAll = db.transaction(() => {
    CATALOGUE.forEach(p => {
      const pid    = uuid();
      const images = imageSet(p.slug);
      insertProduct.run(
        pid, p.slug, p.name, p.desc,
        p.price, p.orig,
        p.icon, images[0],
        JSON.stringify(images),
        JSON.stringify(p.badges || []),
        p.tag || '',
        brandMap[p.brand] || null,
        catMap[p.cat] || null
      );

      // sizes
      p.sizes.forEach(s => insertSize.run(uuid(), pid, s));

      // colors
      const colorList = p.colors.map(k => COLORS[k]);
      colorList.forEach(c => insertColor.run(uuid(), pid, c.name, c.hex));

      // stock — vary so cards naturally show low / urgent / fully stocked states
      p.sizes.forEach((s, sIdx) => colorList.forEach((c, cIdx) => {
        // bias: a few combos go OOS, a few go low (≤5), most are healthy
        const seed = (sIdx * 7 + cIdx * 13 + p.slug.length) % 100;
        let stock;
        if (seed < 8)       stock = 0;
        else if (seed < 22) stock = (seed % 4) + 2;     // 2..5 (low)
        else if (seed < 50) stock = (seed % 8) + 8;     // 8..15
        else                stock = (seed % 18) + 12;   // 12..29
        insertInv.run(uuid(), pid, s, c.name, stock);
      }));
    });

    // ── Admin user ──
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT OR IGNORE INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)')
      .run(uuid(), 'Admin', 'admin@story.com', hash, 'admin');

    // ── Coupons ──
    [
      { code: 'WELCOME10', type: 'percent', value: 10, min_order: 0,    max_discount: 500  },
      { code: 'FLAT500',   type: 'flat',    value: 500, min_order: 2000                    },
      { code: 'STORY20',   type: 'percent', value: 20, min_order: 5000, max_discount: 2000 },
    ].forEach(c =>
      db.prepare('INSERT OR IGNORE INTO coupons (id,code,type,value,min_order,max_discount) VALUES (?,?,?,?,?,?)')
        .run(uuid(), c.code, c.type, c.value, c.min_order || 0, c.max_discount || null)
    );
  });

  seedAll();
  console.log(`✅ Seeded ${CATALOGUE.length} luxury products across ${cats.length} categories`);
}
