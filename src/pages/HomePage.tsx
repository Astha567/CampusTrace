import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Event, Building, Room, Floor } from '../types';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Coffee,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setActiveTab,
    navigateToRoomOnMap,
    navigateToEvent,
    navigateToContact,
    toggleSaveEvent,
    isEventSaved,
    savedItems,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    rooms: Array<{ building: Building; floor: Floor; room: Room }>;
    events: Event[];
  }>({ rooms: [], events: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    dataService.getEvents().then(setEvents);
    dataService.getBuildings().then(setBuildings);
  }, []);

  // Handle Search Autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ rooms: [], events: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const rooms = await dataService.searchRooms(searchQuery);
      const allEvents = await dataService.getEvents();
      const q = searchQuery.toLowerCase();
      const matchedEvents = allEvents
        .filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q)) ||
            e.type.toLowerCase().includes(q)
        )
        .slice(0, 4);

      setSearchResults({ rooms: rooms.slice(0, 5), events: matchedEvents });
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const upcomingEvents = events
    .filter((e) => e.status !== 'expired' && e.status !== 'cancelled')
    .slice(0, 6);

  // Saved events with deadlines
  const savedEventsList = events.filter((e) =>
    savedItems.some((s) => s.eventId === e.id)
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section styled with Palette */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8C1E37] via-[#C73356] to-[#42111E] text-white p-6 sm:p-10 shadow-xl border border-[#FFCED8]/40">
        {/* Luminous Glow Orbs from palette */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-[#FFE8C4]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 rounded-full bg-[#FFCED8]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FFDDDD]/25 text-[#FFF4DE] border border-[#FFCED8]/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#FFE8C4] animate-pulse" />
            CampusTrace • University Life Guide by Team Offshore
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#FFFDF9]">
            Campus Navigation & University Life in One Place.
          </h1>

          <p className="text-[#FFDDDD] text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Find lecture halls across 6 blocks, track verified club deadlines, explore interactive 2D floor plans, and get grounded answers from the CampusTrace assistant.
          </p>

          {/* Unified Smart Search Bar */}
          <div className="pt-2 relative">
            <div className="relative flex items-center bg-white/15 backdrop-blur-md border border-[#FFCED8]/50 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#FFE8C4] focus-within:border-transparent transition shadow-lg">
              <Search className="w-5 h-5 text-[#FFE8C4] ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search "Room B-204", "workshops this week", "library hours"...'
                className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base text-white placeholder:text-[#FFDDDD]/70 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-xs text-[#FFDDDD] hover:text-white rounded-lg transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Instant Search Dropdown Autocomplete */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#FFFDF9] dark:bg-[#20181D] text-[#2D1F25] dark:text-[#FFF4DE] rounded-2xl shadow-2xl border border-[#FFCED8] dark:border-[#422C36] p-4 z-30 max-h-96 overflow-y-auto space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Rooms */}
                {searchResults.rooms.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#A62545] dark:text-[#FFCED8] mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D94A6E]" />
                      Classrooms & Facilities
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.rooms.map(({ building, floor, room }) => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSearchQuery('');
                            navigateToRoomOnMap(building.id, room.id);
                          }}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-[#FFDDDD]/60 dark:hover:bg-[#2C2128] flex items-center justify-between group transition"
                        >
                          <div>
                            <div className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE] group-hover:text-[#D94A6E]">
                              {room.number}: {room.name}
                            </div>
                            <div className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                              {building.name} • Level {room.floorLevel}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#D94A6E] opacity-0 group-hover:opacity-100 transition">
                            View on map →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {searchResults.events.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#C45E12] dark:text-[#FFE8C4] mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#F59E38]" />
                      Events & Deadlines
                    </div>
                    <div className="space-y-1.5">
                      {searchResults.events.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => {
                            setSearchQuery('');
                            navigateToEvent(evt.id);
                          }}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-[#FFE8C4]/50 dark:hover:bg-[#2C2128] flex items-center justify-between group transition"
                        >
                          <div>
                            <div className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE] group-hover:text-[#C45E12]">
                              {evt.title}
                            </div>
                            <div className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                              Deadline: {new Date(evt.deadline).toLocaleDateString()} • {evt.venue}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#C45E12] dark:text-[#FFE8C4] opacity-0 group-hover:opacity-100 transition">
                            View event →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.rooms.length === 0 && searchResults.events.length === 0 && !isSearching && (
                  <div className="text-center py-6 text-[#8F7580] text-xs">
                    No exact room or event matched. Try asking the{' '}
                    <button
                      onClick={() => setActiveTab('assistant')}
                      className="text-[#D94A6E] dark:text-[#FFCED8] font-bold underline"
                    >
                      CampusTrace Assistant
                    </button>{' '}
                    for broader guidance.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#FFF4DE]">
            <span className="text-[#FFDDDD]/80 self-center">Try:</span>
            {[
              'Find Room B-204',
              'Alan Turing Auditorium',
              'Robotics Arena',
              'HackOffshore 2026',
              '24/7 Library Study',
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-[#FFFDF9] transition text-[11px] font-semibold border border-white/20"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Action Navigation Grid (Pastel Palette) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('map')}
          className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#20181D] border border-[#FFCED8] dark:border-[#422C36] shadow-sm hover:shadow-md hover:border-[#D94A6E] text-left group transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm group-hover:text-[#D94A6E] transition-colors">
              Campus Map
            </h3>
            <p className="text-[11px] text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
              6 blocks, 18 SVG floor plans & routes
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#20181D] border border-[#FFE8C4] dark:border-[#4A3926] shadow-sm hover:shadow-md hover:border-[#F59E38] text-left group transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFE8C4] dark:bg-[#3D2C1E] text-[#8C521E] dark:text-[#FFE8C4] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm group-hover:text-[#C45E12] transition-colors">
              Events Hub
            </h3>
            <p className="text-[11px] text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
              Hackathons, workshops & auditions
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#20181D] border border-[#FFF4DE] dark:border-[#382E34] shadow-sm hover:shadow-md hover:border-[#D94A6E] text-left group transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFF4DE] dark:bg-[#35252F] text-[#D94A6E] dark:text-[#FFCED8] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm group-hover:text-[#D94A6E] transition-colors">
              AI Assistant
            </h3>
            <p className="text-[11px] text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
              Grounded answers from campus CAD
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#20181D] border border-[#FFCED8] dark:border-[#422C36] shadow-sm hover:shadow-md hover:border-[#D94A6E] text-left group transition flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFCED8]/70 dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-[#2D1F25] dark:text-[#FFF4DE] text-sm group-hover:text-[#D94A6E] transition-colors">
              Verified Contacts
            </h3>
            <p className="text-[11px] text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
              Faculty & Student Leads directory
            </p>
          </div>
        </button>
      </section>

      {/* Saved Events & Deadline Reminders Widget */}
      {savedEventsList.length > 0 && (
        <section className="bg-gradient-to-r from-[#FFE8C4]/60 via-[#FFF4DE]/70 to-transparent border border-[#FFE8C4] dark:border-[#4A3926] rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#6B350A] dark:text-[#FFE8C4]">
              <Clock className="w-4 h-4 text-[#C45E12] dark:text-[#FFE8C4]" />
              <h2 className="font-bold text-sm sm:text-base">
                My Saved Opportunities & Deadlines ({savedEventsList.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-[#8C3A00] dark:text-[#FFE8C4] hover:underline flex items-center gap-1"
            >
              Open My Calendar
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedEventsList.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                onClick={() => navigateToEvent(evt.id)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#20181D] border border-[#FFE8C4] dark:border-[#4A3926] shadow-sm hover:shadow-md cursor-pointer transition flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#2D1F25] dark:text-[#FFF4DE] line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="text-[11px] text-[#C45E12] dark:text-[#FFE8C4] font-semibold mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Deadline: {new Date(evt.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-[#7A616B] dark:text-[#BFA5AF] mt-0.5 line-clamp-1">
                    {evt.venue}
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE8C4] text-[#7A3A00] dark:bg-[#382618] dark:text-[#FFE8C4]">
                  {evt.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Campus Opportunities Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE]">
              Upcoming Events & Opportunities
            </h2>
            <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
              Verified campus workshops, hackathons, and recruitments
            </p>
          </div>
          <button
            onClick={() => setActiveTab('events')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#D94A6E] hover:text-[#BF3659] dark:text-[#FFCED8]"
          >
            View All ({events.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map((evt) => {
            const saved = isEventSaved(evt.id);
            return (
              <div
                key={evt.id}
                className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8]/70 dark:border-[#422C36] p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] border border-[#FFCED8] dark:border-[#5C2B3C]">
                      {evt.type.replace('_', ' ')}
                    </span>
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

                  <h3
                    onClick={() => navigateToEvent(evt.id)}
                    className="font-bold text-base text-[#2D1F25] dark:text-[#FFF4DE] group-hover:text-[#D94A6E] cursor-pointer line-clamp-2 transition-colors"
                  >
                    {evt.title}
                  </h3>

                  <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1 pt-1 text-xs text-[#7A616B] dark:text-[#A88E98]">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#D94A6E] shrink-0" />
                      <span className="truncate">
                        {new Date(evt.startDateTime).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C45E12] shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FFCED8]/40 dark:border-[#38202A] flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-[#8C3A00] dark:text-[#FFE8C4]">
                    Closes: {new Date(evt.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    onClick={() => navigateToEvent(evt.id)}
                    className="text-xs font-bold text-[#D94A6E] dark:text-[#FFCED8] hover:underline inline-flex items-center gap-1"
                  >
                    Details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Daily Campus Essentials Spotlight */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFDDDD]/50 dark:bg-[#2A1C23] border border-[#FFCED8] dark:border-[#422C36] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#D94A6E] text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE]">
            Central Library (Block D)
          </h4>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            Night Owl Study Commons is open 24/7. Acoustic pods P1-P6 available for group reservation on 1st Floor.
          </p>
          <button
            onClick={() => navigateToRoomOnMap('blk-d', 'room-d-002')}
            className="text-xs font-bold text-[#D94A6E] dark:text-[#FFCED8] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Locate Library Pods →
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFE8C4]/50 dark:bg-[#2F241C] border border-[#FFE8C4] dark:border-[#4A3926] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#F59E38] text-white flex items-center justify-center">
            <Coffee className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE]">
            Student Union Dining (Block E)
          </h4>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            Main Cafeteria operating 7:00 AM - 11:00 PM. Vegetarian, vegan, and halal options available.
          </p>
          <button
            onClick={() => navigateToRoomOnMap('blk-e', 'room-e-001')}
            className="text-xs font-bold text-[#C45E12] dark:text-[#FFE8C4] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Locate Cafeteria →
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF4DE]/60 dark:bg-[#29221C] border border-[#FFE8C4] dark:border-[#4A3926] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#D94A6E] text-white flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE]">
            CampusTrace Trust & Accuracy
          </h4>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            Every room and contact carries a "Last verified" date. Spotted an error? Tap the report button anytime.
          </p>
          <button
            onClick={() => setActiveTab('about')}
            className="text-xs font-bold text-[#8C203B] dark:text-[#FFCED8] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Read Trust Policy →
          </button>
        </div>
      </section>
    </div>
  );
};
