// src/App.jsx — STORY (TM) Full Stack App
//
// While the storefront runs in backend-less demo mode, three frontend
// contracts are swapped for static-data drop-ins:
//   - useProducts  -> useStaticProducts  (catalog from src/data/products.js)
//   - useStore     -> useStaticStore     (cart + wishlist via localStorage)
//   - AuthProvider -> StaticAuthProvider (always-on guest user)
// Each of these aliases preserves the original hook/component contract,
// so every page, drawer, and component keeps working unchanged. To flip
// back to the live backend, restore the original imports below.
//
// Routes are CODE-SPLIT via React.lazy so the home page ships in the
// initial bundle while heavier surfaces (PDP, checkout, admin, profile,
// etc.) load on demand. AdminPage is the largest and benefits the most.
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { StaticAuthProvider as AuthProvider } from './context/StaticAuthProvider.jsx';
import { useStaticStore as useStore } from './hooks/useStaticStore.js';
import { useStaticProducts as useProducts } from './hooks/useStaticProducts.js';
import { ToastProvider, useToast } from './components/feedback/Toast.jsx';
import ErrorBoundary from './components/feedback/ErrorBoundary.jsx';
import { PageTransition } from './components/motion/Motion.jsx';

import BrandTicker   from './components/layout/BrandTicker.jsx';
import Navbar        from './components/layout/Navbar.jsx';
import CartDrawer    from './components/layout/CartDrawer.jsx';
import LoadingScreen from './components/feedback/LoadingScreen.jsx';

// HomePage stays eagerly imported so the first paint is instant. Every
// other route is split into its own chunk and lazy-loaded on first use.
import HomePage from './pages/HomePage.jsx';

const AboutPage    = lazy(() => import('./pages/AboutPage.jsx'));
const ShopPage     = lazy(() => import('./pages/ShopPage.jsx'));
const DetailPage   = lazy(() => import('./pages/DetailPage.jsx'));
const CartPage     = lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const ConfirmPage  = lazy(() => import('./pages/ConfirmPage.jsx'));
const AuthPage     = lazy(() => import('./pages/AuthPage.jsx'));
const OrdersPage   = lazy(() => import('./pages/OrdersPage.jsx'));
const ProfilePage  = lazy(() => import('./pages/ProfilePage.jsx'));
const AdminPage    = lazy(() => import('./pages/AdminPage.jsx'));

// Tiny wrapper that pairs every routed page with its <PageTransition>
// cross-fade and a shared <Suspense> fallback. Centralising this here
// keeps the route table below readable and consistent.
function Route({ keyId, children }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PageTransition keyId={keyId}>{children}</PageTransition>
    </Suspense>
  );
}

function AppInner() {
  const [page, setPageRaw]              = useState('home');
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [curProductId, setCurProductId] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewOrderId, setViewOrderId]   = useState(null);
  const [authMode, setAuthMode]         = useState('login');
  const [resetToken, setResetToken]     = useState(null);

  const { user, isLoggedIn, logout, loading: authLoading } = useAuth();
  const toast = useToast();
  const { cart, cTotal, cCount, addCart, remCart, chQty, togWish, isWish, clearCart, reloadAfterLogin } = useStore(toast);
  const { products } = useProducts({ limit: 50 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setAuthMode('reset');
      setPageRaw('auth');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const setPage = (p, opts = {}) => {
    if (p === 'admin' && user?.role !== 'admin') return;
    if (p === 'orders' && opts.orderId) setViewOrderId(opts.orderId);
    setPageRaw(p);
    window.scrollTo(0, 0);
  };

  const openDetail = (id) => { setCurProductId(id); setPage('detail'); };

  const quickAdd = async (id) => {
    const p = products.find(x => String(x.id) === String(id));
    if (!p || !p.sizes?.length || !p.colors?.length) return;
    const ok = await addCart(p, p.sizes[0], p.colors[0]);
    if (ok) {
      toast('Added to bag!', 'success');
      setDrawerOpen(true);
    }
  };

  const handlePlaceOrder = (order) => {
    setConfirmedOrder(order);
    clearCart();
    toast('Order placed successfully', 'success');
    setPage('confirm');
  };

  const handleLogout = () => {
    logout();
    toast('Signed out successfully', 'info');
  };

  if (authLoading) return <LoadingScreen />;

  const commonProps = { setPage, openDetail, quickAdd, isWish, togWish, toast };

  return (
    <>
      <BrandTicker />
      <Navbar
        page={page}
        setPage={setPage}
        cartCount={cCount()}
        openDrawer={() => setDrawerOpen(true)}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        chQty={chQty}
        remCart={remCart}
        setPage={setPage}
        cTotal={cTotal}
        toast={toast}
      />

      {/* Home route — eagerly loaded, no Suspense needed */}
      {page === 'home' && (
        <PageTransition keyId="home">
          <HomePage {...commonProps} />
        </PageTransition>
      )}

      {/* All other routes are code-split */}
      {page === 'about'    && <Route keyId="about"><AboutPage setPage={setPage} /></Route>}
      {page === 'shop'     && <Route keyId="shop"><ShopPage {...commonProps} /></Route>}
      {page === 'detail'   && curProductId && (
        <Route keyId={`detail-${curProductId}`}>
          <DetailPage productId={curProductId} addCart={addCart} openDrawer={() => setDrawerOpen(true)} {...commonProps} />
        </Route>
      )}
      {page === 'detail'   && !curProductId && (
        <Route keyId="detail-empty">
          <div style={{ textAlign: 'center', padding: 'var(--sp-7) var(--sp-3)' }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 'var(--fz-2)', letterSpacing: '.2em', marginBottom: 'var(--sp-4)' }}>
              PRODUCT NOT FOUND
            </div>
            <button className="btn btn-k" onClick={() => setPage('shop')}>{'\u2190 BACK TO SHOP'}</button>
          </div>
        </Route>
      )}
      {page === 'cart'     && <Route keyId="cart"><CartPage cart={cart} chQty={chQty} remCart={remCart} setPage={setPage} cTotal={cTotal} toast={toast} /></Route>}
      {page === 'checkout' && <Route keyId="checkout"><CheckoutPage cart={cart} cTotal={cTotal} setPage={setPage} clearCart={clearCart} onPlaceOrder={handlePlaceOrder} toast={toast} /></Route>}
      {page === 'confirm'  && <Route keyId="confirm"><ConfirmPage order={confirmedOrder} setPage={setPage} /></Route>}
      {page === 'auth'     && <Route keyId="auth"><AuthPage setPage={setPage} reloadAfterLogin={reloadAfterLogin} initialMode={authMode} initialToken={resetToken} toast={toast} /></Route>}
      {page === 'orders'   && <Route keyId="orders"><OrdersPage setPage={setPage} initialOrderId={viewOrderId} toast={toast} /></Route>}
      {page === 'profile'  && <Route keyId="profile"><ProfilePage setPage={setPage} user={user} /></Route>}
      {page === 'admin'    && <Route keyId="admin"><AdminPage setPage={setPage} /></Route>}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
