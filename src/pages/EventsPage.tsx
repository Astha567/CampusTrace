import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Event, EventStatus } from '../types';
import { downloadICSFile, generateICSContent, getGoogleCalendarUrl } from '../services/calendarExport';
import {
  Calendar,
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const {
    selectedEventId,
    setSelectedEventId,
    toggleSaveEvent,
    isEventSaved,
    navigateToRoomOnMap,
    openReportModal,
    showToast,
  } = useApp();

  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'soonest' | 'deadline'>('soonest');

  // Active detail modal event
  const [modalEvent, setModalEvent] = useState<Event | null>(null);

  useEffect(() => {
    dataService.getEvents().then(setEvents);
  }, []);

  useEffect(() => {
    if (selectedEventId && events.length) {
      const match = events.find((e) => e.id === selectedEventId);
      if (match) setModalEvent(match);
    }
  }, [selectedEventId, events]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((evt) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            evt.title.toLowerCase().includes(q) ||
            evt.description.toLowerCase().includes(q) ||
            evt.organiser.toLowerCase().includes(q) ||
            evt.venue.toLowerCase().includes(q) ||
            evt.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }

        if (selectedType !== 'all' && evt.type !== selectedType) {
          return false;
        }

        if (selectedStatus !== 'all') {
          if (selectedStatus === 'open' && !['registration_open', 'closing_soon'].includes(evt.status)) {
            return false;
          }
          if (selectedStatus === 'closing_soon' && evt.status !== 'closing_soon') {
            return false;
          }
          if (selectedStatus === 'closed' && !['expired', 'cancelled'].includes(evt.status)) {
            return false;
          }
        }

        if (selectedDepartment !== 'all' && evt.department !== selectedDepartment) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
      });
  }, [events, searchQuery, selectedType, selectedStatus, selectedDepartment, sortBy]);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'registration_open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFDDDD] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#FFCED8] border border-[#FFCED8]">
            Registration Open
          </span>
        );
      case 'closing_soon':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFE8C4] text-[#7A3A00] dark:bg-[#382618] dark:text-[#FFE8C4] border border-[#FFE8C4] animate-pulse">
            Closing Soon
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF4DE] text-[#6B350A] dark:bg-[#2A201A] dark:text-[#FFE8C4] border border-[#FFE8C4]">
            Upcoming
          </span>
        );
      case 'updated':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFCED8]/60 text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#FFCED8] border border-[#FFCED8]">
            Updated Venue
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFDDDD] text-[#A62545] dark:bg-[#3D1E28] dark:text-[#FFCED8] border border-[#FFCED8]">
            Cancelled / Postponed
          </span>
        );
      case 'expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300">
            Ended
          </span>
        );
    }
  };

  const handleShare = async (e: Event) => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: e.title,
          text: `Check out ${e.title} at ${e.venue}. Registration deadline: ${new Date(e.deadline).toLocaleDateString()}`,
          url,
        });
      } catch {}
    } else {
      navigator.clipboard?.writeText(`${e.title} - ${e.venue}\nDetails: ${url}`);
      showToast('Event summary copied to clipboard!');
    }
  };

  const handleExportICS = (e: Event) => {
    const ics = generateICSContent([e]);
    downloadICSFile(`campustrace-event-${e.id}`, ics);
    showToast(`Downloaded .ics for "${e.title}"`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE]">
            Events & Opportunities Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Verified university hackathons, workshops, club auditions, seminars, and placement drives.
          </p>
        </div>

        {/* Global Export Button */}
        <button
          onClick={() => {
            const ics = generateICSContent(events.filter((e) => e.status !== 'cancelled' && e.status !== 'expired'));
            downloadICSFile('all-verified-campustrace-events', ics);
            showToast('Downloaded full CampusTrace semester calendar (.ics)');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFFDF9] dark:bg-[#20181D] border border-[#FFCED8] dark:border-[#422C36] hover:bg-[#FFF4DE] text-[#2D1F25] dark:text-[#FFF4DE] shadow-sm transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#D94A6E]" />
          <span>Export All Verified (.ics)</span>
        </button>
      </div>

      {/* Filter and Search Bar with Palette */}
      <div className="bg-white dark:bg-[#20181D] p-4 rounded-3xl border border-[#FFCED8] dark:border-[#422C36] shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#C45E12] dark:text-[#FFE8C4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title, keyword (AI, coding, music), venue or club..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#FFFDF9] dark:bg-[#1A1217] border border-[#FFCED8] dark:border-[#4A2D39] text-[#2D1F25] dark:text-[#FFF4DE] placeholder:text-[#A8929B] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F7580] hover:text-[#2D1F25] text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-[#FFFDF9] dark:bg-[#1E171C] text-[#2D1F25] dark:text-[#FFF4DE] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
          >
            <option value="all">All Categories</option>
            <option value="hackathon">Hackathons</option>
            <option value="workshop">Workshops</option>
            <option value="seminar">Seminars</option>
            <option value="guest_talk">Guest Talks</option>
            <option value="competition">Competitions</option>
            <option value="fest">College Fests</option>
            <option value="club_recruitment">Club Recruitment</option>
            <option value="audition">Auditions</option>
            <option value="internship_placement">Internships / Placements</option>
            <option value="volunteering">Volunteering</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-[#FFFDF9] dark:bg-[#1E171C] text-[#2D1F25] dark:text-[#FFF4DE] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
          >
            <option value="all">Any Status</option>
            <option value="open">Open for Registration</option>
            <option value="closing_soon">Closing Soon</option>
            <option value="closed">Closed / Past</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-[#FFFDF9] dark:bg-[#1E171C] text-[#2D1F25] dark:text-[#FFF4DE] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D94A6E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-[#FFFDF9] dark:bg-[#1E171C] text-[#2D1F25] dark:text-[#FFF4DE] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
            >
              <option value="soonest">Sort: Event Date (Soonest)</option>
              <option value="deadline">Sort: Registration Deadline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((evt) => {
          const saved = isEventSaved(evt.id);
          const isDimmed = evt.status === 'cancelled' || evt.status === 'expired';

          return (
            <div
              key={evt.id}
              onClick={() => {
                setModalEvent(evt);
                setSelectedEventId(evt.id);
              }}
              className={`rounded-3xl border p-5 transition flex flex-col justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-md ${
                isDimmed
                  ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                  : 'bg-white dark:bg-[#20181D] border-[#FFCED8]/70 dark:border-[#422C36] hover:border-[#D94A6E]'
              }`}
            >
              <div className="space-y-3">
                {/* Status and Bookmark */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(evt.status)}
                    <span className="text-[10px] font-bold text-[#8F7580] uppercase tracking-wider">
                      {evt.type.replace('_', ' ')}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveEvent(evt.id);
                    }}
                    aria-label={saved ? 'Remove from saved' : 'Save event'}
                    className={`p-1.5 rounded-xl transition ${
                      saved
                        ? 'text-[#D94A6E] bg-[#FFDDDD] dark:bg-[#3D1E28]'
                        : 'text-[#8F7580] hover:text-[#D94A6E] hover:bg-[#FFF4DE]'
                    }`}
                  >
                    {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                {/* Event Title */}
                <h3 className="font-extrabold text-base text-[#2D1F25] dark:text-[#FFF4DE] group-hover:text-[#D94A6E] transition-colors line-clamp-2">
                  {evt.title}
                </h3>

                {/* Organiser */}
                <div className="text-xs text-[#8C203B] dark:text-[#FFCED8] font-semibold line-clamp-1">
                  Organised by {evt.organiser}
                </div>

                {/* Short description */}
                <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>

                {/* Venue and Date pills */}
                <div className="space-y-1.5 pt-1 text-xs text-[#7A616B] dark:text-[#A88E98]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D94A6E] shrink-0" />
                    <span className="truncate">
                      {new Date(evt.startDateTime).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C45E12] shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {evt.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FFF4DE] dark:bg-[#2A1F26] text-[#6B350A] dark:text-[#FFE8C4] border border-[#FFE8C4]/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom footer */}
              <div className="pt-3 border-t border-[#FFCED8]/40 dark:border-[#38202A] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8C3A00] dark:text-[#FFE8C4]">
                  <Clock className="w-3 h-3" />
                  <span>
                    Deadline:{' '}
                    {new Date(evt.deadline).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <span className="font-bold text-[#D94A6E] dark:text-[#FFCED8] group-hover:underline">
                  View Details →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] space-y-3">
          <Calendar className="w-10 h-10 text-[#FFCED8] mx-auto" />
          <h3 className="font-bold text-base text-[#2D1F25] dark:text-[#FFF4DE]">
            No events match your current filter
          </h3>
          <p className="text-xs text-[#7A616B] max-w-sm mx-auto">
            Try adjusting search terms, clearing category filters, or switching status options.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
              setSelectedDepartment('all');
            }}
            className="px-4 py-2 text-xs font-bold text-[#8C203B] bg-[#FFDDDD] dark:bg-[#3D1E28] rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* EVENT DETAIL MODAL with Palette */}
      {modalEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-event-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D1F25]/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setModalEvent(null);
            setSelectedEventId(null);
          }}
        >
          <div
            className="bg-[#FFFDF9] dark:bg-[#20181D] rounded-3xl max-w-2xl w-full border border-[#FFCED8] dark:border-[#422C36] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#FFCED8]/60 dark:border-[#38202A]">
              <div className="flex flex-wrap items-center gap-2">
                {getStatusBadge(modalEvent.status)}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8]">
                  {modalEvent.type.replace('_', ' ')}
                </span>
                {modalEvent.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C203B] dark:text-[#FFCED8] bg-[#FFCED8]/50 dark:bg-[#3D1E28] px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-[#D94A6E]" />
                    Verified Campus Listing
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openReportModal('event', modalEvent.id, modalEvent.title)}
                  className="p-1.5 text-[#8F7580] hover:text-[#D94A6E] rounded-lg transition"
                  title="Report outdated info"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setModalEvent(null);
                    setSelectedEventId(null);
                  }}
                  className="p-1.5 text-[#8F7580] hover:text-[#2D1F25] dark:hover:text-[#FFF4DE] rounded-lg transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title & Organiser */}
            <div>
              <h2 id="modal-event-title" className="text-xl sm:text-2xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE] leading-snug">
                {modalEvent.title}
              </h2>
              <div className="text-xs font-semibold text-[#D94A6E] dark:text-[#FFCED8] mt-1">
                Organised by {modalEvent.organiser}
              </div>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FFF4DE]/60 dark:bg-[#2A1F26] border border-[#FFE8C4] dark:border-[#422C36] text-xs">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#8C521E] dark:text-[#FFE8C4]">Event Date & Time</div>
                <div className="font-semibold text-[#2D1F25] dark:text-[#FFF4DE] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D94A6E]" />
                  <span>
                    {new Date(modalEvent.startDateTime).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#C45E12] dark:text-[#FFE8C4]">
                  Registration Deadline
                </div>
                <div className="font-semibold text-[#6B350A] dark:text-[#FFE8C4] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C45E12]" />
                  <span>
                    {new Date(modalEvent.deadline).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="text-[10px] uppercase font-bold text-[#8C521E] dark:text-[#FFE8C4]">Venue & Navigation</div>
                <div className="font-semibold text-[#2D1F25] dark:text-[#FFF4DE] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#D94A6E] shrink-0" />
                    {modalEvent.venue}
                  </span>
                  {modalEvent.buildingId && (
                    <button
                      onClick={() => {
                        const bId = modalEvent.buildingId!;
                        const rId = modalEvent.roomId || 'room-a-001';
                        setModalEvent(null);
                        setSelectedEventId(null);
                        navigateToRoomOnMap(bId, rId);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#8C203B] dark:text-[#FFCED8] bg-[#FFDDDD] dark:bg-[#3D1E28] hover:bg-[#FFCED8] transition"
                    >
                      Show on Map →
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="text-[10px] uppercase font-bold text-[#8C521E] dark:text-[#FFE8C4]">Eligibility & Requirements</div>
                <div className="font-medium text-[#5C454F] dark:text-[#D9C4CC]">
                  {modalEvent.eligibility}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#7A616B] dark:text-[#BFA5AF]">
                About this Opportunity
              </h4>
              <p className="text-sm text-[#5C454F] dark:text-[#D9C4CC] leading-relaxed whitespace-pre-line">
                {modalEvent.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {modalEvent.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#FFF4DE] dark:bg-[#2A1F26] text-[#6B350A] dark:text-[#FFE8C4] border border-[#FFE8C4]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Verification & Source */}
            <div className="p-3 rounded-2xl bg-[#FFFDF9] dark:bg-[#1A1217] text-[11px] text-[#7A616B] dark:text-[#BFA5AF] flex items-center justify-between border border-[#FFCED8]/60 dark:border-[#38202A]">
              <span>Source: {modalEvent.sourceLabel} • Last verified {modalEvent.lastUpdated}</span>
              {modalEvent.sourceUrl && (
                <a
                  href={modalEvent.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D94A6E] dark:text-[#FFCED8] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Official Page <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#FFCED8]/60 dark:border-[#38202A]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveEvent(modalEvent.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isEventSaved(modalEvent.id)
                      ? 'bg-[#D94A6E] text-white'
                      : 'bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] hover:bg-[#FFCED8]'
                  }`}
                >
                  {isEventSaved(modalEvent.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4" /> Saved in My Calendar
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" /> Save Event
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExportICS(modalEvent)}
                  title="Download .ics calendar file"
                  className="p-2 rounded-xl text-xs font-bold bg-[#FFF4DE] dark:bg-[#2A1F26] hover:bg-[#FFE8C4] text-[#2D1F25] dark:text-[#FFF4DE] transition border border-[#FFE8C4]"
                >
                  <Download className="w-4 h-4" />
                </button>

                <a
                  href={getGoogleCalendarUrl(modalEvent)}
                  target="_blank"
                  rel="noreferrer"
                  title="Add to Google Calendar"
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#FFF4DE] dark:bg-[#2A1F26] hover:bg-[#FFE8C4] text-[#2D1F25] dark:text-[#FFF4DE] transition inline-flex items-center gap-1 border border-[#FFE8C4]"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D94A6E]" />
                  <span className="hidden sm:inline">Google Cal</span>
                </a>

                <button
                  onClick={() => handleShare(modalEvent)}
                  title="Share event link"
                  className="p-2 rounded-xl text-xs font-bold bg-[#FFF4DE] dark:bg-[#2A1F26] hover:bg-[#FFE8C4] text-[#2D1F25] dark:text-[#FFF4DE] transition border border-[#FFE8C4]"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Official Registration Button */}
              <a
                href={modalEvent.registrationUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#D94A6E] hover:bg-[#BF3659] active:scale-95 shadow-md shadow-[#D94A6E]/25 transition inline-flex items-center gap-1.5"
              >
                <span>Register (Official Link)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
