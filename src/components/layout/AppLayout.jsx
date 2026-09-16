import React from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DesktopNavbar } from './DesktopNavbar';
import { AppFooter } from './AppFooter';

export const AppLayout = ({
  children,
  title,
  subtitle,
  showBack = false,
  hideNav = false,
  showFooter = true,
}) => {
  return (
    <div className="app-container">
      {!hideNav && <DesktopNavbar />}
      <AppHeader title={title} subtitle={subtitle} showBack={showBack} />
      <main className={`app-content ${hideNav ? 'no-bottom-nav' : ''}`}>
        {children}
        {showFooter && <AppFooter />}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
