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

import React from 'react';
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

import { LoginScreen } from './pages/auth/LoginScreen';
import { RegisterScreen } from './pages/auth/RegisterScreen';
import { ResetPasswordScreen } from './pages/auth/ResetPasswordScreen';

import { ExploreShopsScreen } from './pages/customer/ExploreShopsScreen';
import { DealsScreen } from './pages/customer/DealsScreen';
import { SavedScreen } from './pages/customer/SavedScreen';
import { StorefrontScreen } from './pages/customer/StorefrontScreen';
import { ReservationsScreen } from './pages/customer/ReservationsScreen';
import { CustomerKhataScreen } from './pages/customer/CustomerKhataScreen';
import { CustomerProfileScreen } from './pages/customer/CustomerProfileScreen';

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

// Direct URL Redirect Helper for Merchant OS & Admin
const ExternalRedirect = ({ url }) => {
  const { isHindi } = useLanguage();
  React.useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
      <LoadingSpinner message={isHindi ? "दुकानदार डैशबोर्ड पर भेजा जा रहा है..." : "Redirecting to ShopSilo Merchant OS..."} fullScreen />
      <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
        {isHindi ? 'यदि स्वतः रीडायरेक्ट नहीं होता है, तो ' : 'If not redirected automatically, '}
        <a href={url} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
          {isHindi ? 'यहाँ क्लिक करें' : 'click here'}
        </a>
      </p>
    </div>
  );
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

                      {/* Merchant OS & Dashboard Redirects */}
                      <Route path="/dashboard" element={<ExternalRedirect url="https://shop.shopsilo.in/merchant" />} />
                      <Route path="/merchant" element={<ExternalRedirect url="https://shop.shopsilo.in/merchant" />} />
                      <Route path="/merchant/*" element={<ExternalRedirect url="https://shop.shopsilo.in/merchant" />} />
                      <Route path="/seller" element={<ExternalRedirect url="https://shop.shopsilo.in/merchant" />} />
                      <Route path="/pos" element={<ExternalRedirect url="https://shop.shopsilo.in/pos" />} />
                      <Route path="/inventory" element={<ExternalRedirect url="https://shop.shopsilo.in/inventory" />} />
                      <Route path="/expenses" element={<ExternalRedirect url="https://shop.shopsilo.in/expenses" />} />

                      {/* Admin Portal Redirects */}
                      <Route path="/admin" element={<ExternalRedirect url="https://admin.shopsilo.in" />} />
                      <Route path="/admin/*" element={<ExternalRedirect url="https://admin.shopsilo.in" />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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
