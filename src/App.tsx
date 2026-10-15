/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { Footer } from './components/Footer';
import { SampleDataBanner } from './components/SampleDataBanner';
import { OnboardingModal } from './components/OnboardingModal';
import { ReportModal } from './components/ReportModal';
import { Toast } from './components/Toast';

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

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF9F2] dark:bg-[#181216] text-[#2C2126] dark:text-[#F7EBEF] font-sans transition-colors">
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
    </AppProvider>
  );
}
