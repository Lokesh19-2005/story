// src/App.jsx — STORY™ Full Stack App
//
// While the storefront runs in backend-less demo mode, three frontend
// contracts are swapped for static-data drop-ins:
//   - useProducts  -> useStaticProducts  (catalog from src/data/products.js)
//   - useStore     -> useStaticStore     (cart + wishlist via localStorage)
//   - AuthProvider -> StaticAuthProvider (always-on guest user)
// Each of these aliases preserves the original hook/component contract,
// so every page, drawer, and component keeps working unchanged. To flip
// back to the live backend, restore the original imports below.
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { StaticAuthProvider as AuthProvider } from './context/StaticAuthProvider.jsx';
import { useStaticStore as useStore } from './hooks/useStaticStore.js';
import { useStaticProducts as useProducts } from './hooks/useStaticProducts.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import BrandTicker   from './components/BrandTicker.jsx';
import Navbar        from './components/Navbar.jsx';
import CartDrawer    from './components/CartDrawer.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

import HomePage    from './pages/HomePage.jsx';
import AboutPage   from './pages/AboutPage.jsx';
import ShopPage    from './pages/ShopPage.jsx';
import DetailPage  from './pages/DetailPage.jsx';
import CartPage    from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmPage  from './pages/ConfirmPage.jsx';
import AuthPage     from './pages/AuthPage.jsx';
import OrdersPage   from './pages/OrdersPage.jsx';
import ProfilePage  from './pages/ProfilePage.jsx';
import AdminPage    from './pages/AdminPage.jsx';
import ProductArchivePage from './pages/ProductArchivePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';

function AppInner() {
  const [page, setPageRaw]              = useState('home');
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [curProductId, setCurProductId] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [viewOrderId, setViewOrderId]   = useState(null);
  const [authMode, setAuthMode]         = useState('login');
  const [resetToken, setResetToken]     = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { user, isLoggedIn, logout, loading: authLoading } = useAuth();
  const toast = useToast();
  const { cart, wish, cTotal, cCount, addCart, remCart, chQty, togWish, isWish, clearCart, reloadAfterLogin } = useStore(toast);
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

  const setCategory = (cat) => {
    setSelectedCategory(cat);
    setPage('category');
  };

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
    toast('Order placed successfully! 🎉', 'success');
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

      {page === 'home'     && <HomePage {...commonProps} />}
      {page === 'about'    && <AboutPage setPage={setPage} />}
      {page === 'shop'     && <ShopPage  {...commonProps} />}
      {page === 'detail'   && curProductId && (
        <DetailPage productId={curProductId} addCart={addCart} openDrawer={() => setDrawerOpen(true)} {...commonProps} />
      )}
      {page === 'detail'   && !curProductId && (
        <div style={{ textAlign:'center', padding:'120px 20px' }}>
          <div style={{ fontFamily:'var(--fm)', fontSize:'11px', letterSpacing:'.2em', marginBottom:24 }}>PRODUCT NOT FOUND</div>
          <button className="btn btn-k" onClick={() => setPage('shop')}>← BACK TO SHOP</button>
        </div>
      )}
      {page === 'cart'     && <CartPage cart={cart} chQty={chQty} remCart={remCart} setPage={setPage} cTotal={cTotal} toast={toast} />}
      {page === 'checkout' && <CheckoutPage cart={cart} cTotal={cTotal} setPage={setPage} clearCart={clearCart} onPlaceOrder={handlePlaceOrder} toast={toast} />}
      {page === 'confirm'  && <ConfirmPage order={confirmedOrder} setPage={setPage} />}
      {page === 'auth'     && <AuthPage setPage={setPage} reloadAfterLogin={reloadAfterLogin} initialMode={authMode} initialToken={resetToken} toast={toast} />}
      {page === 'orders'   && <OrdersPage setPage={setPage} initialOrderId={viewOrderId} toast={toast} />}
      {page === 'profile'  && <ProfilePage setPage={setPage} user={user} />}
      {page === 'admin'    && <AdminPage setPage={setPage} />}
      {page === 'archive'  && <ProductArchivePage setPage={setPage} setCategory={setCategory} />}
      {page === 'category' && <CategoryPage setPage={setPage} selectedCategory={selectedCategory} openDetail={openDetail} quickAdd={quickAdd} isWish={isWish} togWish={togWish} />}
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
