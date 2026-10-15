import React, { createContext, useContext, useState, useEffect } from 'react';
import { Building, Event, Room, SavedItem, ReportTargetType } from '../types';
import { dataService } from '../services/dataService';

export type TabType = 'home' | 'map' | 'events' | 'calendar' | 'assistant' | 'contacts' | 'admin' | 'about';

interface ReportModalState {
  isOpen: boolean;
  targetType: ReportTargetType;
  targetId?: string;
  targetName?: string;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  savedItemIds: string[];
  toggleSaveEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  savedItems: SavedItem[];
  updateReminderSetting: (eventId: string, setting: SavedItem['reminderSetting']) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  reportModal: ReportModalState;
  openReportModal: (targetType: ReportTargetType, targetId?: string, targetName?: string) => void;
  closeReportModal: () => void;
  navigateToRoomOnMap: (buildingId: string, roomId: string) => void;
  navigateToEvent: (eventId: string) => void;
  navigateToContact: (contactId: string) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('blk-a');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Saved events persistence
  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    try {
      const stored =
        localStorage.getItem('campustrace_saved_items') ||
        localStorage.getItem('everywhere_door_saved_items');
      return stored ? JSON.parse(stored) : [
        { id: 'save-1', eventId: 'evt-01', reminderSetting: '1_day_before', savedAt: new Date().toISOString() },
        { id: 'save-2', eventId: 'evt-02', reminderSetting: '1_hour_before', savedAt: new Date().toISOString() },
      ];
    } catch {
      return [];
    }
  });

  // Dark mode persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved =
        localStorage.getItem('campustrace_dark_mode') ??
        localStorage.getItem('everywhere_door_dark_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Onboarding persistence
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return !(
        localStorage.getItem('campustrace_onboarding_completed') ||
        localStorage.getItem('everywhere_door_onboarding_completed')
      );
    } catch {
      return false;
    }
  });

  // Report modal state
  const [reportModal, setReportModal] = useState<ReportModalState>({
    isOpen: false,
    targetType: 'general',
  });

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('campustrace_saved_items', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Could not save items to storage', e);
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      localStorage.setItem('campustrace_dark_mode', JSON.stringify(isDarkMode));
    } catch (e) {
      console.warn('Could not save theme preference', e);
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const toggleSaveEvent = (eventId: string) => {
    setSavedItems((prev) => {
      const exists = prev.some((item) => item.eventId === eventId);
      if (exists) {
        showToast('Removed from My Calendar');
        return prev.filter((item) => item.eventId !== eventId);
      } else {
        showToast('Saved to My Calendar & Opportunities');
        return [
          ...prev,
          {
            id: `save-${Date.now()}`,
            eventId,
            reminderSetting: '1_day_before',
            savedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const isEventSaved = (eventId: string) => savedItems.some((item) => item.eventId === eventId);

  const updateReminderSetting = (eventId: string, setting: SavedItem['reminderSetting']) => {
    setSavedItems((prev) =>
      prev.map((item) => (item.eventId === eventId ? { ...item, reminderSetting: setting } : item))
    );
    showToast(`Reminder set: ${setting.replace(/_/g, ' ')}`);
  };

  const openReportModal = (targetType: ReportTargetType, targetId?: string, targetName?: string) => {
    setReportModal({
      isOpen: true,
      targetType,
      targetId,
      targetName,
    });
  };

  const closeReportModal = () => {
    setReportModal((prev) => ({ ...prev, isOpen: false }));
  };

  const navigateToRoomOnMap = (buildingId: string, roomId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedRoomId(roomId);
    setActiveTab('map');
  };

  const navigateToEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('events');
  };

  const navigateToContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setActiveTab('contacts');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedBuildingId,
        setSelectedBuildingId,
        selectedRoomId,
        setSelectedRoomId,
        selectedEventId,
        setSelectedEventId,
        savedItemIds: savedItems.map((s) => s.eventId),
        toggleSaveEvent,
        isEventSaved,
        savedItems,
        updateReminderSetting,
        isDarkMode,
        toggleDarkMode,
        showOnboarding,
        setShowOnboarding: (val: boolean) => {
          setShowOnboarding(val);
          if (!val) {
            try {
              localStorage.setItem('campustrace_onboarding_completed', 'true');
            } catch {}
          }
        },
        reportModal,
        openReportModal,
        closeReportModal,
        navigateToRoomOnMap,
        navigateToEvent,
        navigateToContact,
        selectedContactId,
        setSelectedContactId,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
