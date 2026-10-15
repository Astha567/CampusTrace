import React, { useState } from 'react';
import { AlertCircle, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SampleDataBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { setActiveTab } = useApp();

  if (dismissed) return null;

  return (
    <div className="bg-[#FFE8C4]/80 dark:bg-[#382618]/90 border-b border-[#FFE8C4] dark:border-[#523A25] text-[#5C2B05] dark:text-[#FFE8C4] px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <AlertCircle className="w-4 h-4 text-[#C45E12] dark:text-[#FBBF72] shrink-0" />
        <span className="truncate">
          <strong className="font-semibold">Sample data prototype:</strong> CampusTrace rooms, events, and contacts are realistic simulations to be replaced with verified university CAD & records.
        </span>
        <button
          onClick={() => setActiveTab('about')}
          className="ml-auto shrink-0 inline-flex items-center gap-1 text-[#8C3A00] dark:text-[#FFCED8] hover:text-[#522200] dark:hover:text-[#FFF4DE] underline decoration-[#C45E12] underline-offset-2 font-semibold text-xs"
        >
          Trust & Policy
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="text-[#8C3A00] dark:text-[#FFCED8] hover:text-[#522200] p-1 rounded-md ml-2 shrink-0 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
