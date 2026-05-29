// ShopPage — sidebar-driven filtering, search, sort
// Product data is sourced from the centralized static catalog
// (src/data/products.js) via the useStaticProducts hook. The category /
// sort / search params still flow through unchanged so the existing tab
// rail, sidebar filters, sort dropdown and search bar all keep working.
import { useState, useCallback, useMemo } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import ProductCard from '../components/product/ProductCard.jsx';
import LoadingScreen from '../components/feedback/LoadingScreen.jsx';
import EmptyState from '../components/feedback/EmptyState.jsx';
import Footer from '../components/layout/Footer.jsx';
import CategoryTabs from '../components/shop/CategoryTabs.jsx';
import CategoryFilterSidebar from '../components/shop/CategoryFilterSidebar.jsx';
import SortDropdown from '../components/shop/SortDropdown.jsx';
import GridSwitcher from '../components/shop/GridSwitcher.jsx';
import MobileFilterDrawer from '../components/shop/MobileFilterDrawer.jsx';
import { Stagger, FadeUpItem } from '../components/motion/Motion.jsx';
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

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
  // Sum of selected sidebar filters — surfaced as a small badge on the
  // mobile FILTERS button so users know they have active selections.
  const sidebarFilterCount =
    groupSel.size + brandSel.size + sizeSel.size + priceSel.size;
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
      <div className="shop-header">
        <div className="shop-header-count">
          {loading ? 'LOADING...' : `${safeProducts.length} PRODUCT${safeProducts.length !== 1 ? 'S' : ''}`}
        </div>

        {/* Search */}
        <div className="shop-header-search">
          <input className="fi2" placeholder="Search products..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            style={{ flex: 1 }}
            aria-label="Search products"
          />
          <button className="btn btn-k shop-header-search-btn" onClick={doSearch}>
            SEARCH
          </button>
          {search && (
            <button
              className="btn btn-w shop-header-search-clear"
              onClick={() => { setSearch(''); setSearchInput(''); }}
              aria-label="Clear search"
            >{'\u2715'}</button>
          )}
        </div>

        <div className="shop-header-controls">
          {/* Sort */}
          <SortDropdown value={sort} options={SORTS} onChange={setSort} />

          {/* Mobile-only filter trigger — desktop uses the always-visible sidebar */}
          <button
            type="button"
            className="mobile-filter-btn"
            onClick={() => setFilterDrawerOpen(true)}
            aria-label="Open filters"
          >
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M0 1.5h14M2 5.5h10M4 9.5h6" strokeLinecap="square" />
            </svg>
            FILTERS
            {sidebarFilterCount > 0 && (
              <span className="mobile-filter-btn-count">{sidebarFilterCount}</span>
            )}
          </button>

          {/* Grid cols — hidden on mobile */}
          <GridSwitcher cols={cols} onChange={setCols} className="col-switcher" />

          {hasAnyFilter && (
            <button onClick={clearAll} className="shop-header-clear">
              CLEAR ALL
            </button>
          )}
        </div>
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
            <Stagger
              key={`${tab}|${sort}|${search}|${cols}|${groupSel.size}|${brandSel.size}|${sizeSel.size}|${priceSel.size}`}
              className={`products-grid cols-${cols}`}
              stagger={0.05}
              delay={0.02}
              viewport={{ once: true, amount: 0.05 }}
            >
              {safeProducts.map(p => (
                <FadeUpItem key={p.id} y={16}>
                  <ProductCard product={p} onClick={() => openDetail(p.id)}
                    onQuickAdd={quickAdd} isWish={isWish(p.id)} onToggleWish={togWish} />
                </FadeUpItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>

      {/* Mobile filter drawer — wraps the same CategoryFilterSidebar so
          desktop and mobile share one filter implementation */}
      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        productCount={safeProducts.length}
        onClearAll={clearAll}
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

      <Footer setPage={setPage} />

      <style>{`
        .shop-header {
          border-bottom: var(--bd);
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          background: #fff;
        }
        .shop-header-count {
          font-family: var(--fm);
          font-size: 9px;
          letter-spacing: .2em;
          color: #888;
          font-weight: 500;
          flex-shrink: 0;
        }
        .shop-header-search {
          display: flex;
          gap: 8px;
          flex: 1;
          max-width: 400px;
        }
        .shop-header-search-btn {
          font-size: 8px;
          padding: 10px 18px;
          white-space: nowrap;
        }
        .shop-header-search-clear {
          font-size: 8px;
          padding: 10px 12px;
          flex-shrink: 0;
        }
        .shop-header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .shop-header-clear {
          padding: 8px 14px;
          border: none;
          background: none;
          color: #888;
          font-family: var(--fm);
          font-size: 8px;
          letter-spacing: .15em;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 600;
        }
        .shop-header-clear:hover { color: #111; }

        @media (max-width: 900px) {
          .shop-header { padding: 16px 20px; gap: 12px; }
          .shop-header-search { max-width: 100%; flex-basis: 100%; order: 2; }
          .shop-header-controls { order: 3; flex-basis: 100%; justify-content: space-between; }
        }
        @media (max-width: 700px) {
          .shop-header {
            padding: 14px 16px;
            gap: 10px;
          }
          .shop-header-count { flex-basis: 100%; order: 1; }
          .shop-header-search-btn,
          .shop-header-search-clear {
            min-height: 44px;
            padding: 10px 14px;
          }
        }

        @media (max-width: 640px) {
          .col-switcher { display: none !important; }
        }
      `}</style>
    </div>
  );
}
