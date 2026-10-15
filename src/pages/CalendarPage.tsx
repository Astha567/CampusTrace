import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Event, SavedItem } from '../types';
import { downloadICSFile, generateICSContent, getGoogleCalendarUrl } from '../services/calendarExport';
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  BellRing,
  Download,
  ChevronLeft,
  ChevronRight,
  BookmarkX,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const {
    savedItems,
    toggleSaveEvent,
    updateReminderSetting,
    navigateToEvent,
    showToast,
  } = useApp();

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 15)); // October 2026
  const [filterScope, setFilterScope] = useState<'saved_only' | 'all'>('saved_only');

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  useEffect(() => {
    dataService.getEvents().then(setAllEvents);
  }, []);

  const requestNotificationAccess = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          showToast('Browser notifications enabled for CampusTrace saved deadlines!');
        } else {
          showToast('Notification permission was not granted.');
        }
      } catch (e) {
        showToast('Browser notifications not supported in this environment.');
      }
    }
  };

  const displayedEvents = useMemo(() => {
    if (filterScope === 'saved_only') {
      return allEvents.filter((e) => savedItems.some((s) => s.eventId === e.id));
    }
    return allEvents;
  }, [allEvents, savedItems, filterScope]);

  const opportunities = useMemo(() => {
    const list = allEvents.filter((e) => savedItems.some((s) => s.eventId === e.id));
    return list.map((evt) => {
      const savedConfig = savedItems.find((s) => s.eventId === evt.id);
      const deadlineDate = new Date(evt.deadline);
      const diffMs = deadlineDate.getTime() - new Date().getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let countdown = '';
      if (diffMs < 0) {
        countdown = 'Registration Closed';
      } else if (diffDays > 0) {
        countdown = `${diffDays}d ${diffHours % 24}h remaining`;
      } else {
        countdown = `${diffHours} hours left!`;
      }

      return {
        event: evt,
        savedConfig,
        countdown,
        isClosingSoon: diffMs > 0 && diffHours < 48,
        isExpired: diffMs < 0,
      };
    });
  }, [allEvents, savedItems]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      eventDates: Event[];
      deadlineDates: Event[];
    }> = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        dayNum: 0,
        dateStr: '',
        isCurrentMonth: false,
        eventDates: [],
        deadlineDates: [],
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const dayISO = dayDate.toISOString().split('T')[0];

      const eventDates = displayedEvents.filter((e) => {
        const eDate = new Date(e.startDateTime).toISOString().split('T')[0];
        return eDate === dayISO;
      });

      const deadlineDates = displayedEvents.filter((e) => {
        const dDate = new Date(e.deadline).toISOString().split('T')[0];
        return dDate === dayISO;
      });

      days.push({
        dayNum: d,
        dateStr: dayISO,
        isCurrentMonth: true,
        eventDates,
        deadlineDates,
      });
    }

    return days;
  }, [year, month, firstDayOfWeek, daysInMonth, displayedEvents]);

  const handleExportSavedICS = () => {
    const savedEventObjects = allEvents.filter((e) => savedItems.some((s) => s.eventId === e.id));
    if (savedEventObjects.length === 0) {
      showToast('No saved events to export. Save an event first!');
      return;
    }
    const ics = generateICSContent(savedEventObjects);
    downloadICSFile('my-saved-campustrace-events', ics);
    showToast(`Exported ${savedEventObjects.length} events to .ics!`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
            CampusTrace Calendar & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Event dates (Rose) and registration deadlines (Peach) highlighted in distinctive palette colors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-[#ECC0C2]/60 dark:bg-[#2A1F26] rounded-2xl border border-[#F2B4C0]/60">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#1E171C] text-[#D94A6E] dark:text-[#F2B4C0] shadow-sm'
                  : 'text-[#7A616B] dark:text-[#BFA5AF]'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-[#1E171C] text-[#D94A6E] dark:text-[#F2B4C0] shadow-sm'
                  : 'text-[#7A616B] dark:text-[#BFA5AF]'
              }`}
            >
              Agenda List
            </button>
          </div>

          <button
            onClick={handleExportSavedICS}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D94A6E] hover:bg-[#BF3659] text-white shadow-md shadow-[#D94A6E]/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .ics ({savedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Banner Prompt with Palette */}
      {notificationPermission !== 'granted' && (
        <div className="p-4 rounded-3xl bg-[#FBEEBF] dark:bg-[#2A201A] border border-[#F3D3C9] dark:border-[#4A3926] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#C45E12] dark:text-[#F3D3C9] shrink-0" />
            <div>
              <span className="font-bold text-[#6B350A] dark:text-[#F3D3C9]">
                Enable Browser Reminders for Approaching Deadlines
              </span>
              <p className="text-[#8C521E] dark:text-[#D9B89E] text-[11px] mt-0.5">
                Receive browser alerts 24 hours and 1 hour before saved hackathons or workshops close.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationAccess}
            className="px-3.5 py-1.5 bg-[#D94A6E] hover:bg-[#BF3659] text-white font-bold rounded-xl text-xs shrink-0 transition"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Color Legend & Scope Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#20181D] p-3.5 rounded-2xl border border-[#F2B4C0] dark:border-[#422C36] text-xs">
        {/* Filter scope */}
        <div className="flex items-center gap-2">
          <span className="text-[#7A616B] font-semibold">Show:</span>
          <button
            onClick={() => setFilterScope('saved_only')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              filterScope === 'saved_only'
                ? 'bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] border border-[#F2B4C0]'
                : 'text-[#7A616B] dark:text-[#BFA5AF] hover:text-[#2D1F25]'
            }`}
          >
            My Bookmarked Only ({savedItems.length})
          </button>
          <button
            onClick={() => setFilterScope('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              filterScope === 'all'
                ? 'bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] border border-[#F2B4C0]'
                : 'text-[#7A616B] dark:text-[#BFA5AF] hover:text-[#2D1F25]'
            }`}
          >
            All Verified Events ({allEvents.length})
          </button>
        </div>

        {/* Legend with Palette */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#D94A6E]" />
            <span className="font-semibold text-[#2D1F25] dark:text-[#FBEEBF]">Event Date (Rose)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#F59E38]" />
            <span className="font-semibold text-[#2D1F25] dark:text-[#FBEEBF]">Registration Deadline (Peach)</span>
          </div>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] shadow-sm p-4 sm:p-6 space-y-4">
          {/* Month Header controls */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/50 dark:border-[#38202A]">
            <h2 className="text-lg font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] hover:bg-[#FBEEBF] text-[#2D1F25] dark:text-[#FBEEBF] transition"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(2026, 9, 15))}
                className="px-2.5 py-1 rounded-xl text-xs font-bold border border-[#F2B4C0] dark:border-[#422C36] hover:bg-[#FBEEBF] text-[#2D1F25] dark:text-[#FBEEBF] transition"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-xl border border-[#F2B4C0] dark:border-[#422C36] hover:bg-[#FBEEBF] text-[#2D1F25] dark:text-[#FBEEBF] transition"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-[#8C203B] dark:text-[#F2B4C0] uppercase tracking-wider py-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid Matrix */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[70px] sm:min-h-[100px] rounded-2xl bg-[#FFF5D6]/30 dark:bg-[#1A1217]/30 border border-transparent"
                  />
                );
              }

              const hasItems = cell.eventDates.length > 0 || cell.deadlineDates.length > 0;

              return (
                <div
                  key={idx}
                  className={`min-h-[70px] sm:min-h-[100px] rounded-2xl p-1.5 sm:p-2 border transition flex flex-col justify-between ${
                    hasItems
                      ? 'bg-[#FFF5D6] dark:bg-[#251B22] border-[#F2B4C0] dark:border-[#4A2D39] shadow-xs'
                      : 'bg-white dark:bg-[#20181D] border-[#F2B4C0]/40 dark:border-[#38202A]'
                  }`}
                >
                  <span className="text-xs font-bold text-[#2D1F25] dark:text-[#FBEEBF] self-start">
                    {cell.dayNum}
                  </span>

                  <div className="space-y-1 mt-1 overflow-hidden">
                    {/* Event Dates (Rose) */}
                    {cell.eventDates.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => navigateToEvent(evt.id)}
                        title={`Event: ${evt.title}`}
                        className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#D94A6E] text-white truncate cursor-pointer hover:bg-[#BF3659] transition"
                      >
                        {evt.title}
                      </div>
                    ))}

                    {/* Deadline Dates (Peach) */}
                    {cell.deadlineDates.map((evt) => (
                      <div
                        key={`dl-${evt.id}`}
                        onClick={() => navigateToEvent(evt.id)}
                        title={`Deadline: ${evt.title}`}
                        className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-[#E08A38] text-white truncate cursor-pointer hover:bg-[#C47225] transition"
                      >
                        ⏱ {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] shadow-sm p-5 space-y-4">
          <h2 className="text-base font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
            Agenda Schedule
          </h2>

          <div className="space-y-3">
            {displayedEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl border border-[#F2B4C0]/70 dark:border-[#422C36] hover:border-[#D94A6E] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0]">
                      {evt.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#8C3A00] dark:text-[#F3D3C9] font-semibold">
                      Deadline: {new Date(evt.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigateToEvent(evt.id)}
                    className="font-bold text-sm text-[#2D1F25] dark:text-[#FBEEBF] hover:text-[#D94A6E] cursor-pointer"
                  >
                    {evt.title}
                  </h3>

                  <div className="text-xs text-[#7A616B] dark:text-[#A88E98] flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#D94A6E]" />
                    <span>{new Date(evt.startDateTime).toLocaleString()}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-[#C45E12]" />
                    <span>{evt.venue}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getGoogleCalendarUrl(evt)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FBEEBF] dark:bg-[#2A1F26] hover:bg-[#F3D3C9] transition text-[#2D1F25] dark:text-[#FBEEBF] border border-[#F3D3C9]"
                  >
                    Google Cal
                  </a>
                  <button
                    onClick={() => toggleSaveEvent(evt.id)}
                    className="p-1.5 rounded-xl text-[#8F7580] hover:text-[#D94A6E] hover:bg-[#ECC0C2] transition"
                    title="Remove from saved"
                  >
                    <BookmarkX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "MY OPPORTUNITIES" DEADLINE TRACKER */}
      <section className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0] dark:border-[#422C36] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C45E12] dark:text-[#F3D3C9]" />
            <h2 className="text-lg font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
              My Opportunities & Deadline Countdown ({opportunities.length})
            </h2>
          </div>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-10 text-[#7A616B] text-xs space-y-2">
            <p>You haven't bookmarked any events yet.</p>
            <p>Browse the Events Hub and tap the bookmark icon on any hackathon, workshop, or audition to track deadlines here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map(({ event, savedConfig, countdown, isClosingSoon, isExpired }) => (
              <div
                key={event.id}
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  isClosingSoon
                    ? 'border-[#F3D3C9] bg-[#F3D3C9]/40 dark:bg-[#382618]/30'
                    : isExpired
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50 opacity-60'
                    : 'border-[#F2B4C0] bg-white dark:bg-[#20181D]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4
                    onClick={() => navigateToEvent(event.id)}
                    className="font-bold text-sm text-[#2D1F25] dark:text-[#FBEEBF] hover:text-[#D94A6E] cursor-pointer line-clamp-1"
                  >
                    {event.title}
                  </h4>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isClosingSoon
                        ? 'bg-[#E08A38] text-white animate-pulse'
                        : isExpired
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-[#ECC0C2] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#F2B4C0]'
                    }`}
                  >
                    {countdown}
                  </span>
                </div>

                <div className="text-xs text-[#5C454F] dark:text-[#C7B0BA] space-y-1">
                  <div>Venue: {event.venue}</div>
                  <div>
                    Deadline: {new Date(event.deadline).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Reminder selector */}
                <div className="pt-2 border-t border-[#F2B4C0]/50 dark:border-[#38202A] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#7A616B]">
                    <BellRing className="w-3.5 h-3.5 text-[#D94A6E]" />
                    <select
                      value={savedConfig?.reminderSetting || '1_day_before'}
                      onChange={(e) =>
                        updateReminderSetting(
                          event.id,
                          e.target.value as SavedItem['reminderSetting']
                        )
                      }
                      className="text-[11px] font-semibold bg-transparent border-0 text-[#8C203B] dark:text-[#F2B4C0] focus:outline-none cursor-pointer"
                    >
                      <option value="none">No reminder</option>
                      <option value="1_hour_before">1 hour before</option>
                      <option value="1_day_before">1 day before</option>
                      <option value="both">1 day & 1 hour</option>
                    </select>
                  </div>

                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#D94A6E] dark:text-[#F2B4C0] hover:underline flex items-center gap-1"
                  >
                    Register <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
