import React, { useState } from 'react';
import { useApp, TabType } from '../context/AppContext';
import { Home, MapPin, Calendar, Sparkles, MoreHorizontal, Users, Lock, Shield, X, ShieldAlert } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, savedItems, openReportModal } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Map', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: savedItems.length || undefined },
    { id: 'assistant', label: 'Assistant', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Drawer Menu for More Tabs */}
      {showMoreMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden bg-[#2D1F25]/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-[#FFFDF9] dark:bg-[#20181D] rounded-t-3xl border-t border-[#FFCED8] dark:border-[#472935] p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#FFCED8]/50 dark:border-[#38202A]">
              <span className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm">More CampusTrace Services</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-[#8F7580] hover:text-[#2D1F25] dark:hover:text-[#FFF4DE] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setActiveTab('contacts');
                  setShowMoreMenu(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  activeTab === 'contacts'
                    ? 'border-[#D94A6E] bg-[#FFDDDD]/60 dark:bg-[#3D1E28]'
                    : 'border-[#FFCED8]/60 dark:border-[#422C36] bg-[#FFF4DE]/40 dark:bg-[#2A1F26] hover:bg-[#FFDDDD]/40'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D1F25] dark:text-[#FFF4DE]">Verified Contacts</div>
                  <div className="text-[10px] text-[#7A616B] dark:text-[#BFA5AF]">Faculty & leads directory</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('admin');
                  setShowMoreMenu(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  activeTab === 'admin'
                    ? 'border-[#D94A6E] bg-[#FFDDDD]/60 dark:bg-[#3D1E28]'
                    : 'border-[#FFCED8]/60 dark:border-[#422C36] bg-[#FFF4DE]/40 dark:bg-[#2A1F26] hover:bg-[#FFDDDD]/40'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFE8C4] dark:bg-[#3D2C1E] text-[#8C521E] dark:text-[#FFE8C4] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D1F25] dark:text-[#FFF4DE]">Admin Mock</div>
                  <div className="text-[10px] text-[#7A616B] dark:text-[#BFA5AF]">Manage data & reports</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('about');
                  setShowMoreMenu(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                  activeTab === 'about'
                    ? 'border-[#D94A6E] bg-[#FFDDDD]/60 dark:bg-[#3D1E28]'
                    : 'border-[#FFCED8]/60 dark:border-[#422C36] bg-[#FFF4DE]/40 dark:bg-[#2A1F26] hover:bg-[#FFDDDD]/40'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFCED8] dark:bg-[#471E2B] text-[#8C203B] dark:text-[#FFCED8] flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D1F25] dark:text-[#FFF4DE]">About & Trust</div>
                  <div className="text-[10px] text-[#7A616B] dark:text-[#BFA5AF]">Policy & roadmap</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  openReportModal('general', undefined, 'General Campus Feedback');
                }}
                className="p-3.5 rounded-2xl border border-[#FFCED8] dark:border-[#5C2B3C] bg-[#FFDDDD]/50 dark:bg-[#3D1E28]/50 text-left flex items-start gap-3 transition hover:bg-[#FFCED8]/60"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FFCED8] dark:bg-[#4A1F2B] text-[#A62545] dark:text-[#FFCED8] flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#8C203B] dark:text-[#FFCED8]">Report Issue</div>
                  <div className="text-[10px] text-[#A62545] dark:text-[#E08A9E]">Submit a correction</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#1E171C]/95 backdrop-blur-md border-t border-[#FFCED8]/60 dark:border-[#422C36] px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-w-[56px] ${
                  isActive
                    ? 'text-[#8C203B] dark:text-[#FFCED8] font-bold'
                    : 'text-[#7A616B] dark:text-[#A8929B] hover:text-[#2D1F25]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#D94A6E] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-6 h-0.5 bg-[#D94A6E] dark:bg-[#FFCED8] rounded-full" />
                )}
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition min-w-[56px] ${
              ['contacts', 'admin', 'about'].includes(activeTab)
                ? 'text-[#8C203B] dark:text-[#FFCED8] font-bold'
                : 'text-[#7A616B] dark:text-[#A8929B] hover:text-[#2D1F25]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight leading-none">More</span>
          </button>
        </div>
      </div>
    </>
  );
};
