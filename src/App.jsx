/**
 * ShopSilo Customer Web Application Router
 * 
 * Routes:
 * - '/'             -> Nearby discovery with GPS & Radius slider
 * - '/deals'        -> Live deals & promotional offers feed
 * - '/saved'        -> Saved items & favorite shops (Wishlist)
 * - '/shop/:slug'   -> Merchant storefront, catalog & pickup booking
 * - '/reservations' -> Customer Pickup Orders & QR verification codes
 * - '/khata'        -> Digital Khata Passbook & Ledger
 * - '/profile'      -> Account settings, addresses & preferences
 * - '/login'        -> Customer Login
 * - '/register'     -> Customer Signup
 * - '/reset-password' -> Password Recovery
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';

// Lazy-loaded Auth Pages
const LoginScreen = lazy(() => import('./pages/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const RegisterScreen = lazy(() => import('./pages/auth/RegisterScreen').then(m => ({ default: m.RegisterScreen })));
const ResetPasswordScreen = lazy(() => import('./pages/auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));

// Lazy-loaded Customer Pages
const ExploreShopsScreen = lazy(() => import('./pages/customer/ExploreShopsScreen').then(m => ({ default: m.ExploreShopsScreen })));
const DealsScreen = lazy(() => import('./pages/customer/DealsScreen').then(m => ({ default: m.DealsScreen })));
const SavedScreen = lazy(() => import('./pages/customer/SavedScreen').then(m => ({ default: m.SavedScreen })));
const StorefrontScreen = lazy(() => import('./pages/customer/StorefrontScreen').then(m => ({ default: m.StorefrontScreen })));
const ReservationsScreen = lazy(() => import('./pages/customer/ReservationsScreen').then(m => ({ default: m.ReservationsScreen })));
const CustomerKhataScreen = lazy(() => import('./pages/customer/CustomerKhataScreen').then(m => ({ default: m.CustomerKhataScreen })));
const CustomerProfileScreen = lazy(() => import('./pages/customer/CustomerProfileScreen').then(m => ({ default: m.CustomerProfileScreen })));

// Suspense fallback for route loading
const RouteFallback = () => {
  const { isHindi } = useLanguage();
  return <LoadingSpinner message={isHindi ? "पेज लोड हो रहा है..." : "Loading page..."} fullScreen />;
};

// Protected Route Guard for Customer Profile / Orders / Khata
const ProtectedCustomerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isHindi } = useLanguage();

  if (loading) {
    return <LoadingSpinner message={isHindi ? "सत्र सत्यापित किया जा रहा है..." : "Verifying session..."} fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <LocationProvider>
              <SavedProvider>
                <CartProvider>
                  <BrowserRouter>
                    <CartDrawer />
                    <CheckoutModal />
                    <Suspense fallback={<RouteFallback />}>
                      <Routes>
                        {/* Public Store Discovery, Deals & Shopping */}
                        <Route path="/" element={<ExploreShopsScreen />} />
                        <Route path="/deals" element={<DealsScreen />} />
                        <Route path="/saved" element={<SavedScreen />} />
                        <Route path="/shop/:slug" element={<StorefrontScreen />} />

                        {/* Customer Pickups & Orders */}
                        <Route path="/reservations" element={<ReservationsScreen />} />

                        {/* Customer Khata Passbook & Udhar */}
                        <Route
                          path="/khata"
                          element={
                            <ProtectedCustomerRoute>
                              <CustomerKhataScreen />
                            </ProtectedCustomerRoute>
                          }
                        />

                        {/* Customer Profile */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedCustomerRoute>
                              <CustomerProfileScreen />
                            </ProtectedCustomerRoute>
                          }
                        />

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />
                        <Route path="/reset-password" element={<ResetPasswordScreen />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </CartProvider>
              </SavedProvider>
            </LocationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
