// ShopPage — with real brands list, filter sidebar, search
import { useState, useCallback, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import CategoryFilterSidebar from '../components/CategoryFilterSidebar.jsx';
import { tabToCategorySlug, refineByTab } from '../utils/categoryTabs.js';
import { filterByGroups, countByGroup } from '../utils/categoryGroups.js';

const BRANDS = [
  { slug: '', label: 'ALL' },
  { slug: 'versace', label: 'VERSACE' },
  { slug: 'karl-lagerfeld', label: 'KARL LAGERFELD' },
  { slug: 'lacoste', label: 'LACOSTE' },
  { slug: 'superdry', label: 'SUPERDRY' },
  { slug: 'tommy-hilfiger', label: 'TOMMY HILFIGER' },
  { slug: 'burberry', label: 'BURBERRY' },
  { slug: 'true-religion', label: 'TRUE RELIGION' },
  { slug: 'rare-rabbit', label: 'RARE RABBIT' },
  { slug: 'blackberrys', label: 'BLACKBERRYS' },
  { slug: 'zara', label: 'ZARA' },
  { slug: 'calvin-klein', label: 'CALVIN KLEIN' },
  { slug: 'michael-kors', label: 'MICHAEL KORS' },
  { slug: 'hugo-boss', label: 'HUGO BOSS' },
  { slug: 'ralph-lauren', label: 'RALPH LAUREN' },
];

const SORTS = [
  { v: 'newest', l: 'NEWEST FIRST' },
  { v: 'price_asc', l: 'PRICE: LOW → HIGH' },
  { v: 'price_desc', l: 'PRICE: HIGH → LOW' },
];

export default function ShopPage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const [tab, setTab]       = useState('all');
  const [brand, setBrand]   = useState('');
  const [sort, setSort]     = useState('newest');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cols, setCols]     = useState(3);
  const [groupSel, setGroupSel] = useState(() => new Set());

  const params = {};
  const catSlug = tabToCategorySlug(tab);
  if (catSlug) params.category = catSlug;
  if (brand)   params.brand    = brand;
  if (sort)    params.sort     = sort;
  if (search)  params.search   = search;

  const { products, loading, error } = useProducts(params);

  // Pipeline: server (category/brand/sort/search) -> tab refinement ->
  // sidebar group filter. Each stage is a pure transform of an array.
  const tabFiltered = useMemo(
    () => refineByTab(Array.isArray(products) ? products : [], tab),
    [products, tab]
  );
  const safeProducts = useMemo(
    () => filterByGroups(tabFiltered, groupSel),
    [tabFiltered, groupSel]
  );
  // Counts for the sidebar — show how many of the currently visible (pre-group)
  // products fall into each meta-group, so the user sees what each tick adds.
  const groupCounts = useMemo(() => countByGroup(tabFiltered), [tabFiltered]);

  const doSearch = useCallback(() => setSearch(searchInput), [searchInput]);

  const toggleGroup = useCallback((id) => {
    setGroupSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearGroups = useCallback(() => setGroupSel(new Set()), []);

  const clearAll = () => {
    setTab('all');
    setBrand('');
    setSearch('');
    setSearchInput('');
    setGroupSel(new Set());
  };

  return (
    <div>
      {/* Shop header */}
      <div style={{ borderBottom: 'var(--bd)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: '#fff' }}>
        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '.2em', color: '#888', fontWeight: 500 }}>
          {loading ? 'LOADING...' : `${safeProducts.length} PRODUCT${safeProducts.length !== 1 ? 'S' : ''}`}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 400 }}>
          <input className="fi2" placeholder="Search products..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-k" style={{ fontSize: '8px', padding: '10px 18px', whiteSpace: 'nowrap' }} onClick={doSearch}>
            SEARCH
          </button>
          {search && (
            <button className="btn btn-w" style={{ fontSize: '8px', padding: '10px 12px' }}
              onClick={() => { setSearch(''); setSearchInput(''); }}>✕</button>
          )}
        </div>

        {/* Sort */}
        <select className="fs2" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', minWidth: 190 }}>
          {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>

        {/* Grid cols — hidden on mobile */}
        <div style={{ display: 'flex', gap: 4 }} className="col-switcher">
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => setCols(n)}
              style={{ width: 34, height: 34, border: cols === n ? '2px solid #111' : 'var(--bd)', background: cols === n ? '#111' : '#fff', color: cols === n ? '#fff' : '#111', fontFamily: 'var(--fm)', fontSize: '9px', cursor: 'pointer', transition: 'all .15s', fontWeight: 600 }}>
              {n}×
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs — primary axis */}
      <CategoryTabs value={tab} onChange={setTab} />

      {/* Brand filter pills */}
      <div style={{ borderBottom: 'var(--bd)', padding: '14px 40px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#fafafa', overflowX: 'auto' }}>
        {BRANDS.map(b => (
          <button key={b.slug} onClick={() => setBrand(b.slug)}
            style={{
              padding: '7px 18px', whiteSpace: 'nowrap',
              border: brand === b.slug ? '1.5px solid #111' : '1px solid #ddd',
              background: brand === b.slug ? '#111' : '#fff',
              color: brand === b.slug ? '#fff' : '#111',
              fontFamily: 'var(--fm)', fontSize: '7.5px', letterSpacing: '.15em',
              cursor: 'pointer', transition: 'all .15s', fontWeight: 600,
            }}>
            {b.label}
          </button>
        ))}
        {(brand || search || tab !== 'all' || groupSel.size > 0) && (
          <button onClick={clearAll}
            style={{ padding:'7px 14px', border:'none', background:'none', color:'#888', fontFamily:'var(--fm)', fontSize:'7.5px', letterSpacing:'.1em', cursor:'pointer', textDecoration:'underline' }}>
            CLEAR
          </button>
        )}
      </div>

      {/* Sidebar + Grid layout */}
      <div className="shop-layout">
        <aside className="shop-filters">
          <CategoryFilterSidebar
            selected={groupSel}
            counts={groupCounts}
            onToggle={toggleGroup}
            onClear={clearGroups}
          />
        </aside>

        <div className="shop-grid" style={{ minHeight: '50vh', background: '#fff' }}>
          {loading ? (
            <LoadingScreen message="LOADING PRODUCTS..." />
          ) : error ? (
            <EmptyState icon="!" title="COULDN'T LOAD PRODUCTS"
              subtitle={error || 'Please check your connection and try again.'}
              action="RETRY" onAction={() => window.location.reload()} />
          ) : safeProducts.length === 0 ? (
            <EmptyState icon="O" title="NO PRODUCTS FOUND"
              subtitle={search ? `No results for "${search}"` : 'Try a different filter'}
              action="CLEAR FILTERS" onAction={clearAll} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, background: '#e0e0e0' }}>
              {safeProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => openDetail(p.id)}
                  onQuickAdd={quickAdd} isWish={isWish(p.id)} onToggleWish={togWish} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer setPage={setPage} />

      <style>{`
        @media (max-width: 640px) {
          .col-switcher { display: none !important; }
        }
        .brand-pill-bar { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .brand-pill-bar::-webkit-scrollbar { height: 0; }
      `}</style>
    </div>
  );
}
