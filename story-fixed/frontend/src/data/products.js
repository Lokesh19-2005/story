// src/data/products.js
// =============================================================================
//  STORY (TM)  -  CENTRALIZED FRONTEND PRODUCT CATALOG
// =============================================================================
//
//  Purpose
//  -------
//  Single source of truth for STATIC, frontend-side product data while the
//  backend-driven catalog (server.js + /api/products) remains the canonical
//  long-term source. This module exists so the storefront can render a fully
//  populated, on-brand luxury catalog without depending on the network or the
//  admin-uploaded image flow.
//
//  IMPORTANT: this file is purely additive. The backend architecture is left
//  untouched - nothing here imports, mutates, or replaces server-side state.
//  Once the live API is fully populated, callers can swap `useProducts()` /
//  `productsAPI.list()` back in by simply not importing PRODUCTS.
//
//  Aesthetic
//  ---------
//  - Monochrome / editorial luxury fashion imagery (Unsplash CDN).
//  - Every image is locked to a 3:4 aspect ratio (900 x 1200) so the grid,
//    ProductCard, and PDP gallery stay perfectly aligned.
//  - Black / white / stone / ivory colourways only - no off-brand hues.
//
//  Schema
//  ------
//  See the `Product` typedef below. All fields are REQUIRED unless marked
//  optional. The shape was designed to be a strict superset of what the
//  existing UI (ProductCard, DetailPage, ShopPage) consumes, so it can be
//  rendered directly with no normalization.
// =============================================================================

/**
 * @typedef {('NEW'|'SALE'|'EXCLUSIVE'|'BESTSELLER'|'LIMITED'|null)} ProductBadge
 */

/**
 * @typedef {Object} Product
 * @property {string}        id            Stable unique identifier (e.g. "prd_001")
 * @property {string}        slug          URL slug, kebab-case, unique
 * @property {string}        name          Display name
 * @property {CategoryId}    category      One of CATEGORIES[].id
 * @property {string}        brand         Brand display label
 * @property {number}        price         Current selling price (INR)
 * @property {number}        originalPrice MSRP / pre-sale price (INR). Equals `price` when not on sale.
 * @property {string}        image         Primary hero image URL (3:4)
 * @property {string}        hoverImage    Alternate angle for grid hover swap (3:4)
 * @property {string[]}      galleryImages Full PDP gallery, hero first (3:4 each)
 * @property {string}        description   Editorial product copy
 * @property {string[]}      sizes         Available sizes (apparel / waist / footwear / "ONE SIZE")
 * @property {number}        stock         Aggregate units available
 * @property {ProductBadge}  badge         Editorial badge (or null)
 * @property {string[]}      colors        Colourway labels offered
 */

// ---------------------------------------------------------------------------
//  Image helper - guarantees a consistent 3:4 luxury crop for every product.
// ---------------------------------------------------------------------------
const W = 900;
const H = 1200; // 900 * 4 / 3
const lux = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${W}&h=${H}&q=85`;

// ---------------------------------------------------------------------------
//  Categories - the four luxury editorial verticals.
//
//  This was reduced from a 7-vertical model (outwear / headwear / knit /
//  jeans / pants / shoes / accessories) to a 4-room editorial wardrobe so
//  the shop reads as a curated luxury house rather than a generic e-comm
//  taxonomy. Existing products are remapped below; the adapter still
//  emits a legacy `category_slug` so productImages.js fallbacks keep
//  working.
// ---------------------------------------------------------------------------
/** @typedef {('uppers'|'bottoms'|'accessories'|'co-ords')} CategoryId */

export const CATEGORIES = Object.freeze([
  { id: 'uppers',      label: 'UPPERS',      slug: 'uppers'      },
  { id: 'bottoms',     label: 'BOTTOMS',     slug: 'bottoms'     },
  { id: 'accessories', label: 'ACCESSORIES', slug: 'accessories' },
  { id: 'co-ords',     label: 'CO-ORDS',     slug: 'co-ords'     },
]);

export const CATEGORY_IDS = CATEGORIES.map(c => c.id);

// ---------------------------------------------------------------------------
//  Badges - controlled vocabulary used by ProductCard for the top-left chip.
// ---------------------------------------------------------------------------
export const BADGES = Object.freeze({
  NEW:         'NEW',
  SALE:        'SALE',
  EXCLUSIVE:   'EXCLUSIVE',
  BESTSELLER:  'BESTSELLER',
  LIMITED:     'LIMITED',
});

// ---------------------------------------------------------------------------
//  Colour palette - black / white luxury vocabulary only.
// ---------------------------------------------------------------------------
export const COLORS = Object.freeze({
  BLACK:    'Black',
  ONYX:     'Onyx',
  CHARCOAL: 'Charcoal',
  SLATE:    'Slate',
  ASH:      'Ash',
  STONE:    'Stone',
  BONE:     'Bone',
  IVORY:    'Ivory',
  PEARL:    'Pearl',
  WHITE:    'White',
});

// ---------------------------------------------------------------------------
//  Standard size kits per category.
// ---------------------------------------------------------------------------
const SZ_APPAREL  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SZ_WAIST    = ['28', '30', '32', '34', '36', '38'];
const SZ_FOOTWEAR = ['7', '8', '9', '10', '11', '12'];
const SZ_ONE      = ['ONE SIZE'];

// ---------------------------------------------------------------------------
//  PRODUCTS - the catalog.
//  Image IDs are drawn from the project's existing curated luxury fashion set
//  (see utils/productImages.js) so the visual language stays consistent.
// ---------------------------------------------------------------------------

/** @type {Product[]} */
export const PRODUCTS = Object.freeze([
  // ============================== OUTWEAR ==================================
  {
    id: 'prd_001',
    slug: 'obsidian-tailored-trench',
    name: 'Obsidian Tailored Trench',
    category: 'uppers',
    brand: 'STORY ATELIER',
    price: 24900,
    originalPrice: 29900,
    image:        lux('1594938298603-c8148c4dae35'),
    hoverImage:   lux('1551028719-00167b16eac5'),
    galleryImages: [
      lux('1594938298603-c8148c4dae35'),
      lux('1551028719-00167b16eac5'),
      lux('1591047139829-d91aecb6caea'),
    ],
    description:
      'A floor-skimming double-breasted trench cut from heavy Italian gabardine. ' +
      'Storm flap, articulated raglan shoulder, and bone horn buttons - architectural ' +
      'tailoring engineered for a clean monochrome silhouette.',
    sizes: SZ_APPAREL,
    stock: 42,
    badge: BADGES.EXCLUSIVE,
    colors: [COLORS.BLACK, COLORS.STONE, COLORS.BONE],
  },
  {
    id: 'prd_002',
    slug: 'phantom-wool-overcoat',
    name: 'Phantom Wool Overcoat',
    category: 'uppers',
    brand: 'NOIR HOUSE',
    price: 18900,
    originalPrice: 18900,
    image:        lux('1593030761757-71fae45fa0e7'),
    hoverImage:   lux('1600185365926-3a2ce3cdb9eb'),
    galleryImages: [
      lux('1593030761757-71fae45fa0e7'),
      lux('1600185365926-3a2ce3cdb9eb'),
      lux('1617137968427-85924c800a22'),
    ],
    description:
      'Unstructured single-breasted overcoat in pressed virgin wool. Drop-shoulder ' +
      'construction and a clean notch lapel give it a quiet, considered presence.',
    sizes: SZ_APPAREL,
    stock: 28,
    badge: BADGES.NEW,
    colors: [COLORS.CHARCOAL, COLORS.BLACK, COLORS.ASH],
  },
  {
    id: 'prd_003',
    slug: 'voidshell-bomber-jacket',
    name: 'Voidshell Bomber Jacket',
    category: 'uppers',
    brand: 'STORY ATELIER',
    price: 12900,
    originalPrice: 15900,
    image:        lux('1551028719-00167b16eac5'),
    hoverImage:   lux('1591047139829-d91aecb6caea'),
    galleryImages: [
      lux('1551028719-00167b16eac5'),
      lux('1591047139829-d91aecb6caea'),
      lux('1594938298603-c8148c4dae35'),
    ],
    description:
      'A weight-balanced bomber in matte technical shell with concealed two-way ' +
      'zipper and ribbed onyx trims. Tailored armhole, cropped hem, no logos.',
    sizes: SZ_APPAREL,
    stock: 56,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.SLATE],
  },
  {
    id: 'prd_004',
    slug: 'monolith-leather-biker',
    name: 'Monolith Leather Biker',
    category: 'co-ords',
    brand: 'NOIR HOUSE',
    price: 32900,
    originalPrice: 32900,
    image:        lux('1617137968427-85924c800a22'),
    hoverImage:   lux('1593030761757-71fae45fa0e7'),
    galleryImages: [
      lux('1617137968427-85924c800a22'),
      lux('1593030761757-71fae45fa0e7'),
      lux('1595950653106-6c9ebd614d3a'),
    ],
    description:
      'Vegetable-tanned Italian lambskin biker with asymmetric YKK Excella zip, ' +
      'satin viscose lining, and articulated elbows. Ages into a personal patina.',
    sizes: SZ_APPAREL,
    stock: 14,
    badge: BADGES.LIMITED,
    colors: [COLORS.BLACK, COLORS.ONYX],
  },

  // ============================== HEADWEAR =================================
  {
    id: 'prd_005',
    slug: 'eclipse-wool-beanie',
    name: 'Eclipse Wool Beanie',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 2400,
    originalPrice: 2400,
    image:        lux('1588850561407-ed78c282e89b'),
    hoverImage:   lux('1521369909029-2afed882baee'),
    galleryImages: [
      lux('1588850561407-ed78c282e89b'),
      lux('1521369909029-2afed882baee'),
    ],
    description:
      'Densely-knit merino beanie with a deep cuff and a subtle ribbed tonal weave. ' +
      'Cut for a clean, minimal silhouette.',
    sizes: SZ_ONE,
    stock: 120,
    badge: BADGES.NEW,
    colors: [COLORS.BLACK, COLORS.CHARCOAL, COLORS.IVORY],
  },
  {
    id: 'prd_006',
    slug: 'noir-structured-cap',
    name: 'Noir Structured Cap',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 2900,
    originalPrice: 3400,
    image:        lux('1521369909029-2afed882baee'),
    hoverImage:   lux('1588850561407-ed78c282e89b'),
    galleryImages: [
      lux('1521369909029-2afed882baee'),
      lux('1588850561407-ed78c282e89b'),
    ],
    description:
      'Six-panel structured cap in matte cotton twill with a low, curved brim and ' +
      'a hidden brass slider closure. No logos, no noise.',
    sizes: SZ_ONE,
    stock: 96,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.STONE, COLORS.WHITE],
  },
  {
    id: 'prd_007',
    slug: 'onyx-bucket-hat',
    name: 'Onyx Bucket Hat',
    category: 'accessories',
    brand: 'NOIR HOUSE',
    price: 3200,
    originalPrice: 3200,
    image:        lux('1588850561407-ed78c282e89b'),
    hoverImage:   lux('1521369909029-2afed882baee'),
    galleryImages: [
      lux('1588850561407-ed78c282e89b'),
      lux('1521369909029-2afed882baee'),
    ],
    description:
      'Wide-brim bucket in matte recycled nylon with a fully tonal grosgrain inner ' +
      'band. Engineered to hold its shape after the rain.',
    sizes: SZ_ONE,
    stock: 64,
    badge: null,
    colors: [COLORS.BLACK, COLORS.ASH],
  },

  // ================================ KNIT ===================================
  {
    id: 'prd_008',
    slug: 'specter-mohair-sweater',
    name: 'Specter Mohair Sweater',
    category: 'co-ords',
    brand: 'NOIR HOUSE',
    price: 14900,
    originalPrice: 17900,
    image:        lux('1620799140408-edc6dcb6d633'),
    hoverImage:   lux('1556821840-3a63f95609a7'),
    galleryImages: [
      lux('1620799140408-edc6dcb6d633'),
      lux('1556821840-3a63f95609a7'),
      lux('1521572163474-6864f9cf17ab'),
    ],
    description:
      'Brushed kid-mohair crewneck with a halo finish and a relaxed drop-shoulder ' +
      'silhouette. Layers cleanly under outerwear, wears alone with weight.',
    sizes: SZ_APPAREL,
    stock: 38,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.BONE, COLORS.CHARCOAL],
  },
  {
    id: 'prd_009',
    slug: 'atelier-cashmere-crew',
    name: 'Atelier Cashmere Crewneck',
    category: 'uppers',
    brand: 'STORY ATELIER',
    price: 19900,
    originalPrice: 19900,
    image:        lux('1556821840-3a63f95609a7'),
    hoverImage:   lux('1583743814966-8936f5b7be1a'),
    galleryImages: [
      lux('1556821840-3a63f95609a7'),
      lux('1583743814966-8936f5b7be1a'),
      lux('1620799140408-edc6dcb6d633'),
    ],
    description:
      'Inner-Mongolian 12-gauge cashmere crewneck knit. Tonal jersey-bound ' +
      'neckline, minimal seams, fully fashioned to drape without distortion after wear.',
    sizes: SZ_APPAREL,
    stock: 22,
    badge: BADGES.EXCLUSIVE,
    colors: [COLORS.IVORY, COLORS.BLACK, COLORS.STONE],
  },
  {
    id: 'prd_010',
    slug: 'shadow-cable-cardigan',
    name: 'Shadow Cable Cardigan',
    category: 'co-ords',
    brand: 'STORY ATELIER',
    price: 11900,
    originalPrice: 13900,
    image:        lux('1620799140408-edc6dcb6d633'),
    hoverImage:   lux('1556821840-3a63f95609a7'),
    galleryImages: [
      lux('1620799140408-edc6dcb6d633'),
      lux('1556821840-3a63f95609a7'),
    ],
    description:
      'Heavyweight cable-knit cardigan with horn buttons and ribbed welt pockets. ' +
      'Cut long, cut clean, cut to wear over everything.',
    sizes: SZ_APPAREL,
    stock: 31,
    badge: BADGES.SALE,
    colors: [COLORS.CHARCOAL, COLORS.BLACK],
  },
  {
    id: 'prd_011',
    slug: 'halo-ribbed-polo',
    name: 'Halo Ribbed Polo',
    category: 'uppers',
    brand: 'NOIR HOUSE',
    price: 7900,
    originalPrice: 7900,
    image:        lux('1521572163474-6864f9cf17ab'),
    hoverImage:   lux('1583743814966-8936f5b7be1a'),
    galleryImages: [
      lux('1521572163474-6864f9cf17ab'),
      lux('1583743814966-8936f5b7be1a'),
    ],
    description:
      'Fine-gauge ribbed knit polo in mercerised cotton with a clean two-button ' +
      'placket. Sits under tailoring without bulk.',
    sizes: SZ_APPAREL,
    stock: 74,
    badge: BADGES.NEW,
    colors: [COLORS.BLACK, COLORS.WHITE, COLORS.ASH],
  },

  // =============================== JEANS ===================================
  {
    id: 'prd_012',
    slug: 'vault-selvedge-slim-jean',
    name: 'Vault Selvedge Slim Jean',
    category: 'bottoms',
    brand: 'STORY ATELIER',
    price: 12900,
    originalPrice: 14900,
    image:        lux('1624378439575-d8705ad7ae80'),
    hoverImage:   lux('1473966968600-fa801b43a042'),
    galleryImages: [
      lux('1624378439575-d8705ad7ae80'),
      lux('1473966968600-fa801b43a042'),
    ],
    description:
      '14oz Japanese selvedge denim, rope-dyed onyx with a clean unwashed finish. ' +
      'Slim-straight leg, hidden rivet, made to break in on the wearer.',
    sizes: SZ_WAIST,
    stock: 48,
    badge: BADGES.SALE,
    colors: [COLORS.ONYX, COLORS.BLACK],
  },
  {
    id: 'prd_013',
    slug: 'carbon-tapered-denim',
    name: 'Carbon Tapered Denim',
    category: 'bottoms',
    brand: 'NOIR HOUSE',
    price: 9900,
    originalPrice: 9900,
    image:        lux('1473966968600-fa801b43a042'),
    hoverImage:   lux('1624378439575-d8705ad7ae80'),
    galleryImages: [
      lux('1473966968600-fa801b43a042'),
      lux('1624378439575-d8705ad7ae80'),
    ],
    description:
      'Mid-rise tapered denim in coal-washed 12oz cotton with subtle stretch and a ' +
      'tonal stitch. A clean everyday silhouette.',
    sizes: SZ_WAIST,
    stock: 62,
    badge: BADGES.NEW,
    colors: [COLORS.CHARCOAL, COLORS.BLACK],
  },
  {
    id: 'prd_014',
    slug: 'ivory-wide-leg-jean',
    name: 'Ivory Wide-Leg Jean',
    category: 'bottoms',
    brand: 'STORY ATELIER',
    price: 11900,
    originalPrice: 11900,
    image:        lux('1624378439575-d8705ad7ae80'),
    hoverImage:   lux('1473966968600-fa801b43a042'),
    galleryImages: [
      lux('1624378439575-d8705ad7ae80'),
      lux('1473966968600-fa801b43a042'),
    ],
    description:
      'Bone-washed rigid denim cut wide and clean from a high-rise waist. ' +
      'Falls in a single column - a quiet statement piece.',
    sizes: SZ_WAIST,
    stock: 24,
    badge: BADGES.EXCLUSIVE,
    colors: [COLORS.IVORY, COLORS.BONE],
  },

  // =============================== PANTS ===================================
  {
    id: 'prd_015',
    slug: 'void-cargo-pant',
    name: 'Void Cargo Pant',
    category: 'bottoms',
    brand: 'NOIR HOUSE',
    price: 9900,
    originalPrice: 11900,
    image:        lux('1624378439575-d8705ad7ae80'),
    hoverImage:   lux('1473966968600-fa801b43a042'),
    galleryImages: [
      lux('1624378439575-d8705ad7ae80'),
      lux('1473966968600-fa801b43a042'),
    ],
    description:
      'Heavy-twill utility cargo with bellowed thigh pockets, articulated knee ' +
      'darts, and a drawcord hem. Tactical lines, atelier finishing.',
    sizes: SZ_WAIST,
    stock: 58,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.SLATE, COLORS.STONE],
  },
  {
    id: 'prd_016',
    slug: 'pillar-pleated-trouser',
    name: 'Pillar Pleated Trouser',
    category: 'bottoms',
    brand: 'STORY ATELIER',
    price: 13900,
    originalPrice: 13900,
    image:        lux('1473966968600-fa801b43a042'),
    hoverImage:   lux('1624378439575-d8705ad7ae80'),
    galleryImages: [
      lux('1473966968600-fa801b43a042'),
      lux('1624378439575-d8705ad7ae80'),
    ],
    description:
      'Double-pleated wool trouser with a clean break and side-tab adjusters. ' +
      'High waist, full leg, sharp without trying.',
    sizes: SZ_WAIST,
    stock: 36,
    badge: BADGES.NEW,
    colors: [COLORS.CHARCOAL, COLORS.BLACK, COLORS.STONE],
  },
  {
    id: 'prd_017',
    slug: 'strata-tailored-chino',
    name: 'Strata Tailored Chino',
    category: 'co-ords',
    brand: 'NOIR HOUSE',
    price: 7900,
    originalPrice: 8900,
    image:        lux('1624378439575-d8705ad7ae80'),
    hoverImage:   lux('1473966968600-fa801b43a042'),
    galleryImages: [
      lux('1624378439575-d8705ad7ae80'),
      lux('1473966968600-fa801b43a042'),
    ],
    description:
      'Mid-rise garment-dyed chino in compact cotton with a tapered ankle and a ' +
      'minimal hidden waistband. A wardrobe foundation piece.',
    sizes: SZ_WAIST,
    stock: 84,
    badge: BADGES.BESTSELLER,
    colors: [COLORS.STONE, COLORS.BLACK, COLORS.BONE],
  },

  // =============================== SHOES ===================================
  {
    id: 'prd_018',
    slug: 'phantom-runner-v2',
    name: 'Phantom Runner V2',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 14900,
    originalPrice: 17900,
    image:        lux('1542291026-7eec264c27ff'),
    hoverImage:   lux('1606107557195-0e29a4b5b4aa'),
    galleryImages: [
      lux('1542291026-7eec264c27ff'),
      lux('1606107557195-0e29a4b5b4aa'),
      lux('1525966222134-fcfa99b8ae77'),
    ],
    description:
      'A sculpted technical runner on a sculpted carbon-look midsole. Engineered ' +
      'mesh upper in deep onyx with tonal overlays. Quiet performance.',
    sizes: SZ_FOOTWEAR,
    stock: 68,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.ASH, COLORS.WHITE],
  },
  {
    id: 'prd_019',
    slug: 'arc-sneaker-lo',
    name: 'Arc Sneaker Lo',
    category: 'accessories',
    brand: 'NOIR HOUSE',
    price: 11900,
    originalPrice: 11900,
    image:        lux('1606107557195-0e29a4b5b4aa'),
    hoverImage:   lux('1542291026-7eec264c27ff'),
    galleryImages: [
      lux('1606107557195-0e29a4b5b4aa'),
      lux('1542291026-7eec264c27ff'),
      lux('1525966222134-fcfa99b8ae77'),
    ],
    description:
      'A pared-back low-top in full-grain leather over a vulcanised crepe sole. ' +
      'Tonal eyelets, no branding, ages with character.',
    sizes: SZ_FOOTWEAR,
    stock: 52,
    badge: BADGES.NEW,
    colors: [COLORS.WHITE, COLORS.BLACK, COLORS.BONE],
  },
  {
    id: 'prd_020',
    slug: 'onyx-derby',
    name: 'Onyx Derby',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 18900,
    originalPrice: 18900,
    image:        lux('1525966222134-fcfa99b8ae77'),
    hoverImage:   lux('1542291026-7eec264c27ff'),
    galleryImages: [
      lux('1525966222134-fcfa99b8ae77'),
      lux('1542291026-7eec264c27ff'),
      lux('1606107557195-0e29a4b5b4aa'),
    ],
    description:
      'Hand-finished blake-stitched derby in box calf leather. A clean three-eyelet ' +
      'lacing and a slim almond toe make it the quiet upgrade for tailoring.',
    sizes: SZ_FOOTWEAR,
    stock: 18,
    badge: BADGES.EXCLUSIVE,
    colors: [COLORS.BLACK, COLORS.ONYX],
  },
  {
    id: 'prd_021',
    slug: 'nightfall-combat-boot',
    name: 'Nightfall Combat Boot',
    category: 'accessories',
    brand: 'NOIR HOUSE',
    price: 21900,
    originalPrice: 24900,
    image:        lux('1525966222134-fcfa99b8ae77'),
    hoverImage:   lux('1606107557195-0e29a4b5b4aa'),
    galleryImages: [
      lux('1525966222134-fcfa99b8ae77'),
      lux('1606107557195-0e29a4b5b4aa'),
      lux('1542291026-7eec264c27ff'),
    ],
    description:
      'Goodyear-welted combat boot on a matte commando sole. Oiled black leather ' +
      'with a padded collar and a reinforced shank. Built to outlast trends.',
    sizes: SZ_FOOTWEAR,
    stock: 26,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.ONYX],
  },

  // ============================ ACCESSORIES ================================
  {
    id: 'prd_022',
    slug: 'halo-leather-belt',
    name: 'Halo Leather Belt',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 4900,
    originalPrice: 4900,
    image:        lux('1521369909029-2afed882baee'),
    hoverImage:   lux('1588850561407-ed78c282e89b'),
    galleryImages: [
      lux('1521369909029-2afed882baee'),
      lux('1588850561407-ed78c282e89b'),
    ],
    description:
      '35mm full-grain bridle leather belt with a brushed gunmetal pin buckle and ' +
      'tonal edge paint. Ages into a personal patina.',
    sizes: SZ_WAIST,
    stock: 92,
    badge: BADGES.NEW,
    colors: [COLORS.BLACK, COLORS.STONE],
  },
  {
    id: 'prd_023',
    slug: 'specter-card-holder',
    name: 'Specter Card Holder',
    category: 'accessories',
    brand: 'NOIR HOUSE',
    price: 3900,
    originalPrice: 4500,
    image:        lux('1588850561407-ed78c282e89b'),
    hoverImage:   lux('1521369909029-2afed882baee'),
    galleryImages: [
      lux('1588850561407-ed78c282e89b'),
      lux('1521369909029-2afed882baee'),
    ],
    description:
      'Slim six-slot card holder in saffiano leather with a center pull-tab. ' +
      'Heat-debossed STORY mark on the inner spine.',
    sizes: SZ_ONE,
    stock: 110,
    badge: BADGES.SALE,
    colors: [COLORS.BLACK, COLORS.IVORY],
  },
  {
    id: 'prd_024',
    slug: 'eclipse-sunglasses',
    name: 'Eclipse Sunglasses',
    category: 'accessories',
    brand: 'STORY ATELIER',
    price: 8900,
    originalPrice: 8900,
    image:        lux('1521369909029-2afed882baee'),
    hoverImage:   lux('1588850561407-ed78c282e89b'),
    galleryImages: [
      lux('1521369909029-2afed882baee'),
      lux('1588850561407-ed78c282e89b'),
    ],
    description:
      'Hand-polished acetate frame with a flat brow line and CR-39 polarised ' +
      'lenses. Custom hinges, no visible branding, premium feel through the bridge.',
    sizes: SZ_ONE,
    stock: 44,
    badge: BADGES.LIMITED,
    colors: [COLORS.BLACK, COLORS.ONYX, COLORS.STONE],
  },
]);

// =============================================================================
//  Helpers - lightweight, pure, dependency-free.
// =============================================================================

/** Look up a product by slug. */
export function findProductBySlug(slug) {
  if (!slug) return null;
  return PRODUCTS.find(p => p.slug === slug) || null;
}

/** Look up a product by id. */
export function findProductById(id) {
  if (id == null) return null;
  const key = String(id);
  return PRODUCTS.find(p => String(p.id) === key) || null;
}

/** All products in a category. Empty array if the id is unknown. */
export function getProductsByCategory(categoryId) {
  if (!categoryId) return [];
  return PRODUCTS.filter(p => p.category === categoryId);
}

/** All products for a brand label (case-insensitive exact match). */
export function getProductsByBrand(brand) {
  if (!brand) return [];
  const target = brand.toString().toLowerCase().trim();
  return PRODUCTS.filter(p => p.brand.toLowerCase() === target);
}

/** Products currently discounted (price < originalPrice). */
export function getOnSaleProducts() {
  return PRODUCTS.filter(p => Number(p.price) < Number(p.originalPrice));
}

/** Products tagged NEW. */
export function getNewArrivals() {
  return PRODUCTS.filter(p => p.badge === BADGES.NEW);
}

/**
 * Up to `limit` products in the same category, excluding the source product.
 * Useful for "you may also like" rails on the PDP.
 */
export function getRelatedProducts(slug, limit = 4) {
  const src = findProductBySlug(slug);
  if (!src) return [];
  return PRODUCTS
    .filter(p => p.category === src.category && p.slug !== src.slug)
    .slice(0, Math.max(0, limit));
}

/** Default export = the catalog itself, for ergonomic imports. */
export default PRODUCTS;
