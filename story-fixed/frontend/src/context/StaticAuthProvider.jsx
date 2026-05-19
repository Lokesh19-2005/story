// src/context/StaticAuthProvider.jsx
// =============================================================================
//  STATIC AUTH PROVIDER  -  backend-less demo mode
// =============================================================================
//
//  Drop-in replacement for the API-backed `AuthProvider`. Publishes a guest
//  user into the SAME `AuthContext` (re-exported from AuthContext.jsx), so
//  every existing consumer of `useAuth()` receives the static value with
//  zero call-site changes.
//
//  Behaviour:
//    - On mount, hydrates the user from localStorage; if absent, seeds a
//      DEFAULT_GUEST so `isLoggedIn` is always true.
//    - login(email) and register(name, email) update the local user record
//      synchronously - no API calls. This lets the existing AuthPage form
//      submit without crashing when no backend is reachable, and the user
//      record is persisted across reloads.
//    - logout() reverts to the guest user (rather than an unauthenticated
//      state) so cart actions on the PDP keep working post-logout.
//
//  Real authentication is only available with the real `AuthProvider` and
//  the backend running; flip back via the App.jsx import alias.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext.jsx';

const STORAGE_KEY = 'story_static_user';

const DEFAULT_GUEST = Object.freeze({
  id:    'guest',
  name:  'Guest',
  email: 'guest@story.local',
  role:  'guest',
});

function readStoredUser() {
  if (typeof localStorage === 'undefined') return DEFAULT_GUEST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GUEST;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
    return DEFAULT_GUEST;
  } catch {
    return DEFAULT_GUEST;
  }
}

function writeStoredUser(user) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(user)); }
  catch { /* quota / private mode - non-fatal */ }
}

export function StaticAuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  // Keep localStorage in sync so the user record survives reloads.
  useEffect(() => { writeStoredUser(user); }, [user]);

  const login = useCallback(async (email /* , password */) => {
    const cleanEmail = String(email || '').trim() || DEFAULT_GUEST.email;
    const inferredName = cleanEmail.split('@')[0] || 'Guest';
    const next = {
      id:    `user-${Date.now()}`,
      name:  inferredName,
      email: cleanEmail,
      role:  'user',
    };
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (name, email /* , password, phone */) => {
    const cleanEmail = String(email || '').trim() || DEFAULT_GUEST.email;
    const cleanName  = String(name  || '').trim() || cleanEmail.split('@')[0] || 'Guest';
    const next = {
      id:    `user-${Date.now()}`,
      name:  cleanName,
      email: cleanEmail,
      role:  'user',
    };
    setUser(next);
    return next;
  }, []);

  // Revert to the guest user rather than an unauthenticated state - so the
  // PDP auth gate keeps passing and the cart drawer doesn't suddenly reject
  // additions after the user "signs out".
  const logout = useCallback(() => {
    setUser({ ...DEFAULT_GUEST });
  }, []);

  const updateProfile = useCallback(async (data) => {
    const next = { ...user, ...(data || {}) };
    setUser(next);
    return next;
  }, [user]);

  // Static demo: nothing to verify, nothing to mutate. Resolved silently.
  const changePassword = useCallback(async () => {}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        // Always logged-in in static mode so the storefront's auth gates
        // (PDP add-to-cart, wishlist, etc.) pass without redirecting to
        // /auth in the absence of a backend.
        isLoggedIn: true,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default StaticAuthProvider;
