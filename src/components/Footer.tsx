import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, openReportModal } = useApp();

  return (
    <footer className="mt-auto border-t border-[#F2B4C0]/60 dark:border-[#38202A] bg-[#FFF5D6]/80 dark:bg-[#1E171C]/80 backdrop-blur-sm py-8 px-4 sm:px-6 text-xs text-[#7A616B] dark:text-[#BFA5AF] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D94A6E] to-[#F3D3C9] text-[#4A1422] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <Compass className="w-4 h-4 text-[#5A1527]" />
          </div>
          <div>
            <div className="font-extrabold text-[#2D1F25] dark:text-[#FBEEBF] text-xs">
              CampusTrace
            </div>
            <div className="text-[11px] text-[#8F7580] dark:text-[#A8929B]">
              Built with care by Team Offshore • Verified campus data update: October 15, 2026
            </div>
          </div>
        </div>

        {/* Center / Right Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('about')}
            className="hover:text-[#D94A6E] dark:hover:text-[#F2B4C0] transition"
          >
            Trust & Verification
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveTab('about')}
            className="hover:text-[#D94A6E] dark:hover:text-[#F2B4C0] transition"
          >
            Zero-Tracking Privacy
          </button>
          <span>•</span>
          <button
            onClick={() => openReportModal('general', undefined, 'Footer Feedback')}
            className="text-[#D94A6E] dark:text-[#F2B4C0] hover:underline inline-flex items-center gap-1 font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Report incorrect info
          </button>
        </div>
      </div>
    </footer>
  );
};
