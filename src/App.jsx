/**
 * ShopSilo Customer Web Application Router
 * 
 * Ported from Flutter APK (QuickPick) routes:
 * - '/'             -> Nearby discovery with GPS & Radius slider
 * - '/deals'        -> Live deals & promotional offers feed
 * - '/saved'        -> Saved items & favorite shops
 * - '/shop/:slug'   -> Dukan ka storefront, live items aur pickup booking
 * - '/reservations' -> Grahak ke hold kiye huye item pickup codes (OTP)
 * - '/khata'        -> Grahak Digital Khata Passbook, Udhar & UPI Payments
 * - '/profile'      -> Grahak ka profile aur account settings
 * - '/login'        -> Customer Login
 * - '/register'     -> Customer Signup
 * 
 * Performance: All page components are lazy-loaded with React.lazy() for
 * code splitting. Each route loads only when navigated to.
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { SavedProvider } from './context/SavedContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

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
const RouteFallback = () => (
  <LoadingSpinner message="Page load ho raha hai..." fullScreen />
);

// Protected Route Guard for Customer Profile / Orders / Khata
const ProtectedCustomerRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Session verify ho raha hai..." fullScreen />;
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
                <BrowserRouter>
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
              </SavedProvider>
            </LocationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
