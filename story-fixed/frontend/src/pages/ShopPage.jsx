// ShopPage — sidebar-driven filtering, search, sort
import { useState, useCallback, useMemo } from 'react';
import { useProducts } from '../hooks/useProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import CategoryFilterSidebar from '../components/CategoryFilterSidebar.jsx';
import SortDropdown from '../components/SortDropdown.jsx';
import GridSwitcher from '../components/GridSwitcher.jsx';
import { tabToCategorySlug, refineByTab } from '../utils/categoryTabs.js';
import { filterByGroups, countByGroup } from '../utils/categoryGroups.js';
import { filterByBrands, countByBrands } from '../utils/brandList.js';
import { filterBySizes, countBySizes } from '../utils/sizeList.js';
import { filterByPrices, countByPrices } from '../utils/priceRanges.js';

// Display labels are luxury-tuned; the `v` values match the backend
// `?sort=` contract (newest | price_asc | price_desc) — do not change.
const SORTS = [
  { v: 'newest',     l: 'NEW IN' },
  { v: 'price_asc',  l: 'PRICE: LOW \u2192 HIGH' },
  { v: 'price_desc', l: 'PRICE: HIGH \u2192 LOW' },
];

export default function ShopPage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const [tab, setTab]               = useState('all');
  const [groupSel, setGroupSel]     = useState(() => new Set());
  const [brandSel, setBrandSel]     = useState(() => new Set());
  const [sizeSel, setSizeSel]       = useState(() => new Set());
  const [priceSel, setPriceSel]     = useState(() => new Set());
  const [sort, setSort]             = useState('newest');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cols, setCols]             = useState(3);

  const params = {};
  const catSlug = tabToCategorySlug(tab);
  if (catSlug) params.category = catSlug;
  if (sort)    params.sort     = sort;
  if (search)  params.search   = search;

  const { products, loading, error } = useProducts(params);

  // Pipeline: server (category/sort/search) -> tab refine -> sidebar groups
  // -> sidebar brands -> sidebar sizes. Each stage is a pure transform.
  const tabFiltered = useMemo(
    () => refineByTab(Array.isArray(products) ? products : [], tab),
    [products, tab]
  );

  // Counts use cross-axis filtering so each section's numbers reflect what
  // would happen if the user ticked that option, given the OTHER axes.
  const groupCounts = useMemo(
    () => countByGroup(
      filterByPrices(filterBySizes(filterByBrands(tabFiltered, brandSel), sizeSel), priceSel)
    ),
    [tabFiltered, brandSel, sizeSel, priceSel]
  );
  const brandCounts = useMemo(
    () => countByBrands(
      filterByPrices(filterBySizes(filterByGroups(tabFiltered, groupSel), sizeSel), priceSel)
    ),
    [tabFiltered, groupSel, sizeSel, priceSel]
  );
  const sizeCounts = useMemo(
    () => countBySizes(
      filterByPrices(filterByBrands(filterByGroups(tabFiltered, groupSel), brandSel), priceSel)
    ),
    [tabFiltered, groupSel, brandSel, priceSel]
  );
  const priceCounts = useMemo(
    () => countByPrices(
      filterBySizes(filterByBrands(filterByGroups(tabFiltered, groupSel), brandSel), sizeSel)
    ),
    [tabFiltered, groupSel, brandSel, sizeSel]
  );

  const safeProducts = useMemo(
    () => filterByPrices(
      filterBySizes(
        filterByBrands(filterByGroups(tabFiltered, groupSel), brandSel),
        sizeSel
      ),
      priceSel
    ),
    [tabFiltered, groupSel, brandSel, sizeSel, priceSel]
  );

  // ── Handlers
  const doSearch = useCallback(() => setSearch(searchInput), [searchInput]);

  const toggleGroup = useCallback((id) => {
    setGroupSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearGroups = useCallback(() => setGroupSel(new Set()), []);

  const toggleBrand = useCallback((id) => {
    setBrandSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearBrands = useCallback(() => setBrandSel(new Set()), []);

  const toggleSize = useCallback((id) => {
    setSizeSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearSizes = useCallback(() => setSizeSel(new Set()), []);

  const togglePrice = useCallback((id) => {
    setPriceSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);
  const clearPrices = useCallback(() => setPriceSel(new Set()), []);

  const hasAnyFilter =
    tab !== 'all' ||
    groupSel.size > 0 ||
    brandSel.size > 0 ||
    sizeSel.size > 0 ||
    priceSel.size > 0 ||
    !!search;
  const clearAll = () => {
    setTab('all');
    setGroupSel(new Set());
    setBrandSel(new Set());
    setSizeSel(new Set());
    setPriceSel(new Set());
    setSearch('');
    setSearchInput('');
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
              onClick={() => { setSearch(''); setSearchInput(''); }}>{'\u2715'}</button>
          )}
        </div>

        {/* Sort */}
        <SortDropdown value={sort} options={SORTS} onChange={setSort} />

        {/* Grid cols — hidden on mobile */}
        <GridSwitcher cols={cols} onChange={setCols} className="col-switcher" />

        {hasAnyFilter && (
          <button onClick={clearAll}
            style={{ padding:'8px 14px', border:'none', background:'none', color:'#888', fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.15em', cursor:'pointer', textDecoration:'underline', fontWeight:600 }}>
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Category tabs — primary axis */}
      <CategoryTabs value={tab} onChange={setTab} />

      {/* Sidebar + Grid layout */}
      <div className="shop-layout">
        <aside className="shop-filters">
          <CategoryFilterSidebar
            selected={groupSel}
            counts={groupCounts}
            onToggle={toggleGroup}
            onClear={clearGroups}
            selectedBrands={brandSel}
            brandCounts={brandCounts}
            onToggleBrand={toggleBrand}
            onClearBrands={clearBrands}
            selectedSizes={sizeSel}
            sizeCounts={sizeCounts}
            onToggleSize={toggleSize}
            onClearSizes={clearSizes}
            selectedPrices={priceSel}
            priceCounts={priceCounts}
            onTogglePrice={togglePrice}
            onClearPrices={clearPrices}
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
      `}</style>
    </div>
  );
}
