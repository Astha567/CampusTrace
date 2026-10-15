import React from 'react';
import { useApp, TabType } from '../context/AppContext';
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Sun,
  Moon,
  HelpCircle,
  ShieldAlert,
  Home,
  Lock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    setShowOnboarding,
    savedItems,
    openReportModal,
  } = useApp();

  const navItems: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'events', label: 'Events & Ops', icon: Calendar },
    { id: 'calendar', label: 'My Calendar', icon: Calendar, badge: savedItems.length || undefined },
    { id: 'assistant', label: 'Assistant', icon: Sparkles },
    { id: 'contacts', label: 'Directory', icon: Users },
    { id: 'admin', label: 'Admin', icon: Lock },
    { id: 'about', label: 'About & Trust', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#1E171C]/95 backdrop-blur-md border-b border-[#FFCED8]/60 dark:border-[#422C36] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group focus-visible:ring-2 focus-visible:ring-[#D94A6E] rounded-xl p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D94A6E] via-[#FFCED8] to-[#FFE8C4] text-[#4A1422] flex items-center justify-center shadow-md shadow-[#D94A6E]/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#6B182E]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#2D1F25] dark:text-[#F8EDF1] group-hover:text-[#D94A6E] transition-colors">
                CampusTrace
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] border border-[#FFCED8] dark:border-[#5C2B3C]">
                Digital Guide
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#7A616B] dark:text-[#BFA5AF] leading-none">
              by Team Offshore
            </p>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#8C203B] dark:text-[#FFCED8] bg-[#FFDDDD]/80 dark:bg-[#3D1E28]'
                    : 'text-[#5C454F] dark:text-[#C7B0BA] hover:text-[#2D1F25] dark:hover:text-[#FFF4DE] hover:bg-[#FFF4DE]/60 dark:hover:bg-[#2C2128]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D94A6E] dark:text-[#FFCED8]' : 'text-[#8F7580]'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#D94A6E] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D94A6E] dark:bg-[#FFCED8] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Report Button */}
          <button
            onClick={() => openReportModal('general', undefined, 'General Campus Data Correction')}
            title="Report incorrect information"
            aria-label="Report incorrect information"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8C203B] dark:text-[#FFCED8] bg-[#FFDDDD]/80 dark:bg-[#3D1E28] border border-[#FFCED8] dark:border-[#5C2B3C] hover:bg-[#FFCED8] transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#D94A6E]" />
            <span className="hidden md:inline">Report Issue</span>
          </button>

          {/* Onboarding Help */}
          <button
            onClick={() => setShowOnboarding(true)}
            title="Guide & Onboarding"
            aria-label="Open Onboarding Guide"
            className="p-2 rounded-xl text-[#7A616B] hover:text-[#2D1F25] dark:text-[#C7B0BA] dark:hover:text-[#FFF4DE] hover:bg-[#FFF4DE] dark:hover:bg-[#2C2128] transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-xl text-[#7A616B] hover:text-[#2D1F25] dark:text-[#C7B0BA] dark:hover:text-[#FFF4DE] hover:bg-[#FFF4DE] dark:hover:bg-[#2C2128] transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#FFE8C4]" /> : <Moon className="w-4 h-4 text-[#4A1422]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
