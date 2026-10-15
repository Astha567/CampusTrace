/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { Footer } from './components/Footer';
import { SampleDataBanner } from './components/SampleDataBanner';
import { OnboardingModal } from './components/OnboardingModal';
import { ReportModal } from './components/ReportModal';
import { Toast } from './components/Toast';
import { SplashLanding } from './components/SplashLanding';

import { HomePage } from './pages/HomePage';
import { CampusMapPage } from './pages/CampusMapPage';
import { EventsPage } from './pages/EventsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AssistantPage } from './pages/AssistantPage';
import { ContactsPage } from './pages/ContactsPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'map' && <CampusMapPage />}
      {activeTab === 'events' && <EventsPage />}
      {activeTab === 'calendar' && <CalendarPage />}
      {activeTab === 'assistant' && <AssistantPage />}
      {activeTab === 'contacts' && <ContactsPage />}
      {activeTab === 'admin' && <AdminPage />}
      {activeTab === 'about' && <AboutPage />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '/' || path === '' ? '/' : path;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path === '' ? '/' : path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSplashComplete = () => {
    // Replace state so the user cannot navigate back to the splash animation
    window.history.replaceState(null, '', '/home');
    setCurrentRoute('/home');
  };

  if (currentRoute === '/') {
    return <SplashLanding onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5D6] dark:bg-[#181216] text-[#2D1F25] dark:text-[#F7EBEF] font-sans transition-colors">
      {/* Top Sample Data Disclaimer */}
      <SampleDataBanner />

      {/* Global Navigation Header */}
      <Navbar />

      {/* Primary Page Content */}
      <MainContent />

      {/* Global Footer */}
      <Footer />

      {/* Mobile Persistent Touch Bar */}
      <BottomTabBar />

      {/* Global Modals & Notifications */}
      <OnboardingModal />
      <ReportModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
