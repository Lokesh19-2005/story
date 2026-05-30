// ShopPage  --  luxury monochrome editorial shop.
//
// This is a full visual rebuild of the previous shop layout. The data
// pipeline (search / sort / category tabs / size + price sidebar /
// quick-add / wishlist / product routing) is preserved end-to-end so
// existing flows (cart, wishlist, auth, admin) keep working unchanged.
// What changed is the page architecture:
//
//   1. EDITORIAL HEADER — a tall masthead with eyebrow + giant display
//      headline + italic subtitle + edition meta. Replaces the previous
//      cramped one-line bar.
//   2. CONTROL RAIL — search + sort + filter trigger + grid switcher
//      laid out on a single rule-bordered row, properly aligned.
//   3. CATEGORY TABS — promoted to the primary category axis (UPPERS /
//      BOTTOMS / ACCESSORIES / CO-ORDS + ALL). The duplicate sidebar
//      CATEGORY section is hidden via showCategory={false}.
//   4. SIDEBAR — slim, editorial, only SIZE + PRICE. BRAND removed.
//   5. PRODUCT GRID — balanced editorial spacing, proper gaps, no grey
//      gridline borders, responsive 4 / 3 / 2 column layout.
//   6. PAGINATION — minimal monochrome PREV / 01 / 02 / NEXT pager,
//      12 products per page.
//   7. EMPTY STATE — compact editorial block, no oversized blank zone.
//
// All filtering / sorting / search query semantics are unchanged from
// the previous shop, so the existing categoryGroups / brandList /
// sizeList / priceRanges utilities remain valid for the
// (now-tab-driven) filter axes that still apply.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useStaticProducts as useProducts } from '../hooks/useStaticProducts.js';
import ProductCard from '../components/ProductCard.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Footer from '../components/Footer.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import CategoryFilterSidebar from '../components/CategoryFilterSidebar.jsx';
import SortDropdown from '../components/SortDropdown.jsx';
import GridSwitcher from '../components/GridSwitcher.jsx';
import MobileFilterDrawer from '../components/MobileFilterDrawer.jsx';
import Pagination from '../components/Pagination.jsx';
import { tabToCategorySlug, refineByTab } from '../utils/categoryTabs.js';
import { filterBySizes, countBySizes } from '../utils/sizeList.js';
import { filterByPrices, countByPrices } from '../utils/priceRanges.js';

// Display labels are luxury-tuned; the `v` values match the backend
// `?sort=` contract (newest | price_asc | price_desc) -- do not change.
const SORTS = [
  { v: 'newest',     l: 'NEW IN' },
  { v: 'price_asc',  l: 'PRICE \u2191' },
  { v: 'price_desc', l: 'PRICE \u2193' },
];

const PAGE_SIZE = 12;

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4.2" />
      <path d="M8.7 8.7l3.5 3.5" strokeLinecap="square" />
    </svg>
  );
}

export default function ShopPage({ setPage, openDetail, quickAdd, isWish, togWish }) {
  const [tab, setTab]               = useState('all');
  const [sizeSel, setSizeSel]       = useState(() => new Set());
  const [priceSel, setPriceSel]     = useState(() => new Set());
  const [sort, setSort]             = useState('newest');
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [cols, setCols]             = useState(3);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [pageNum, setPageNum]       = useState(1);

  const gridTopRef = useRef(null);

  // Server-style query — preserves the original API contract so a future
  // swap back to the live useProducts() backend hook is a one-line edit.
  const params = {};
  const catSlug = tabToCategorySlug(tab);
  if (catSlug) params.category = catSlug;
  if (sort)    params.sort     = sort;
  if (search)  params.search   = search;

  const { products, loading, error } = useProducts(params);

  // Pipeline: server (category/sort/search) -> tab refine (no-op) ->
  // sidebar size -> sidebar price. CATEGORY + BRAND filters were removed
  // from the sidebar; the tab rail is now the primary category axis.
  const tabFiltered = useMemo(
    () => refineByTab(Array.isArray(products) ? products : [], tab),
    [products, tab]
  );

  // Cross-axis counts: each section's numbers reflect what would happen
  // if the user toggled an option, given the OTHER axes are still applied.
  const sizeCounts = useMemo(
    () => countBySizes(filterByPrices(tabFiltered, priceSel)),
    [tabFiltered, priceSel]
  );
  const priceCounts = useMemo(
    () => countByPrices(filterBySizes(tabFiltered, sizeSel)),
    [tabFiltered, sizeSel]
  );

  const safeProducts = useMemo(
    () => filterByPrices(filterBySizes(tabFiltered, sizeSel), priceSel),
    [tabFiltered, sizeSel, priceSel]
  );

  // Pagination — clamp current page when the result set shrinks below it.
  const totalPages = Math.max(1, Math.ceil(safeProducts.length / PAGE_SIZE));
  useEffect(() => {
    if (pageNum > totalPages) setPageNum(1);
  }, [totalPages, pageNum]);

  // Reset to first page whenever the filter axes change.
  useEffect(() => { setPageNum(1); }, [tab, sort, search, sizeSel, priceSel]);

  const pageProducts = useMemo(() => {
    const start = (pageNum - 1) * PAGE_SIZE;
    return safeProducts.slice(start, start + PAGE_SIZE);
  }, [safeProducts, pageNum]);

  const goToPage = useCallback((n) => {
    setPageNum(n);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handlers — search / sidebar toggles / clear-all
  const doSearch = useCallback(() => setSearch(searchInput), [searchInput]);

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

  const sidebarFilterCount = sizeSel.size + priceSel.size;
  const hasAnyFilter =
    tab !== 'all' || sizeSel.size > 0 || priceSel.size > 0 || !!search;

  const clearAll = () => {
    setTab('all');
    setSizeSel(new Set());
    setPriceSel(new Set());
    setSearch('');
    setSearchInput('');
    setPageNum(1);
  };

  // Derived display strings
  const totalCount   = safeProducts.length;
  const startIdx     = totalCount === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  const endIdx       = Math.min(pageNum * PAGE_SIZE, totalCount);
  const countLabel   = loading
    ? 'LOADING...'
    : totalCount === 0
      ? 'NO PIECES'
      : `SHOWING ${String(startIdx).padStart(2,'0')}-${String(endIdx).padStart(2,'0')} / ${String(totalCount).padStart(2,'0')}`;

  return (
    <div className="shop-page">
      {/* ───────────────────── EDITORIAL MASTHEAD ───────────────────── */}
      <header className="shop-mast">
        <div className="shop-mast-top">
          <span className="shop-mast-eyebrow">{'EDITION 01 \u2014 SHADOWLINE'}</span>
          <span className="shop-mast-meta">{'FW \u2022 26'}</span>
        </div>
        <h1 className="shop-mast-title">
          <span>the</span>
          <span className="shop-mast-italic">archive</span>
        </h1>
        <p className="shop-mast-sub">
          {'A monochrome wardrobe, composed slowly. Browse the four rooms of STORY\u2122 \u2014 cut for those who prefer a whisper.'}
        </p>
      </header>

      {/* ───────────────────── CONTROL RAIL ─────────────────────────── */}
      <div className="shop-controls">
        <div className="shop-controls-left">
          <span className="shop-count">{countLabel}</span>
        </div>

        <div className="shop-search">
          <span className="shop-search-icon" aria-hidden="true"><SearchIcon /></span>
          <input
            className="shop-search-input"
            placeholder="Search the archive"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          {searchInput && (
            <button
              type="button"
              className="shop-search-clear"
              aria-label="Clear search"
              onClick={() => { setSearchInput(''); setSearch(''); }}
            >{'\u2715'}</button>
          )}
          <button
            type="button"
            className="shop-search-btn"
            onClick={doSearch}
            aria-label="Search"
          >
            SEARCH
          </button>
        </div>

        <div className="shop-controls-right">
          <SortDropdown value={sort} options={SORTS} onChange={setSort} />

          <button
            type="button"
            className="mobile-filter-btn shop-filter-btn"
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

          <GridSwitcher cols={cols} onChange={setCols} className="col-switcher" />

          {hasAnyFilter && (
            <button type="button" className="shop-clear" onClick={clearAll}>
              CLEAR ALL
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────── CATEGORY TABS ────────────────────────── */}
      <CategoryTabs value={tab} onChange={setTab} />

      {/* ───────────────────── SIDEBAR + GRID ───────────────────────── */}
      <div className="shop-layout" ref={gridTopRef}>
        <aside className="shop-filters">
          <div className="shop-filters-head">
            <span>REFINE</span>
            {sidebarFilterCount > 0 && (
              <button type="button" className="shop-filters-clear" onClick={() => { clearSizes(); clearPrices(); }}>
                RESET
              </button>
            )}
          </div>
          <CategoryFilterSidebar
            showCategory={false}
            showBrand={false}
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

        <div className="shop-grid">
          {loading ? (
            <LoadingScreen message="LOADING THE ARCHIVE..." />
          ) : error ? (
            <EmptyState
              hint="A QUIET ERROR"
              title="The archive is unavailable."
              subtitle={error || 'Please check your connection and try again in a moment.'}
              action="RETRY"
              onAction={() => window.location.reload()}
            />
          ) : safeProducts.length === 0 ? (
            <EmptyState
              hint="NO RESULTS"
              title={'Nothing in this room \u2014 yet.'}
              subtitle={
                search
                  ? `No pieces matched \u201C${search}\u201D within the current filters.`
                  : 'Try fewer refinements, or browse another room of the archive.'
              }
              action="CLEAR FILTERS"
              onAction={clearAll}
            />
          ) : (
            <>
              <div
                className={`shop-grid-inner cols-${cols}`}
                style={{ '--shop-cols': cols }}
              >
                {pageProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => openDetail(p.id)}
                    onQuickAdd={quickAdd}
                    isWish={isWish(p.id)}
                    onToggleWish={togWish}
                  />
                ))}
              </div>

              <Pagination
                page={pageNum}
                totalPages={totalPages}
                onChange={goToPage}
              />
            </>
          )}
        </div>
      </div>

      {/* ───────────────────── MOBILE FILTER DRAWER ─────────────────── */}
      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        productCount={safeProducts.length}
        onClearAll={clearAll}
        showCategory={false}
        showBrand={false}
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
    </div>
  );
}
