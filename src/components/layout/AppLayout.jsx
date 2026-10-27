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
  rightAction = null,
  customHeader = null,
  hideDesktopNav = false,
}) => {
  return (
    <div className="app-container">
      {!hideNav && !hideDesktopNav && <DesktopNavbar />}
      {customHeader ? (
        customHeader
      ) : (
        <AppHeader title={title} subtitle={subtitle} showBack={showBack} rightAction={rightAction} />
      )}
      <main className={`app-content ${hideNav ? 'no-bottom-nav' : ''}`}>
        {children}
        {showFooter && <AppFooter />}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
