import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { Building, Floor, Room } from '../types';
import { SAMPLE_CAMPUS_ROUTES } from '../data/buildings';
import { ThreeDBuildingModal } from '../components/ThreeDBuildingModal';
import {
  MapPin,
  Search,
  Navigation,
  Layers,
  Box,
  Compass,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Footprints,
  X,
} from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  const {
    selectedBuildingId,
    setSelectedBuildingId,
    selectedRoomId,
    setSelectedRoomId,
    openReportModal,
    showToast,
  } = useApp();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [activeFloorLevel, setActiveFloorLevel] = useState<number>(0);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ building: Building; floor: Floor; room: Room }>
  >([]);

  // Directions state
  const [directionsMode, setDirectionsMode] = useState(false);
  const [startBuildingId, setStartBuildingId] = useState<string>('blk-a');
  const [destBuildingId, setDestBuildingId] = useState<string>('blk-d');

  // 3D modal
  const [showThreeD, setShowThreeD] = useState(false);

  // Selected room details
  const [focusedRoom, setFocusedRoom] = useState<Room | null>(null);

  // View mode on mobile: 'campus' | 'floorplan' | 'directions'
  const [mobileView, setMobileView] = useState<'campus' | 'floorplan' | 'directions'>('campus');

  useEffect(() => {
    dataService.getBuildings().then((bldgs) => {
      setBuildings(bldgs);
    });
  }, []);

  const currentBuilding = useMemo(() => {
    if (!buildings.length) return null;
    return buildings.find((b) => b.id === selectedBuildingId) || buildings[0];
  }, [buildings, selectedBuildingId]);

  useEffect(() => {
    if (selectedRoomId && currentBuilding) {
      for (const fl of currentBuilding.floors) {
        const found = fl.rooms.find((r) => r.id === selectedRoomId);
        if (found) {
          setActiveFloorLevel(fl.level);
          setFocusedRoom(found);
          setMobileView('floorplan');
          break;
        }
      }
    }
  }, [selectedRoomId, currentBuilding]);

  // Handle Autocomplete Room Search
  useEffect(() => {
    if (!roomSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const results = await dataService.searchRooms(roomSearchQuery);
      setSearchResults(results.slice(0, 6));
    }, 120);
    return () => clearTimeout(t);
  }, [roomSearchQuery]);

  const currentFloor = useMemo(() => {
    if (!currentBuilding) return null;
    return (
      currentBuilding.floors.find((f) => f.level === activeFloorLevel) ||
      currentBuilding.floors[0]
    );
  }, [currentBuilding, activeFloorLevel]);

  // Route calculation
  const activeRoute = useMemo(() => {
    if (!directionsMode) return null;
    const routeKey = `${startBuildingId}-${destBuildingId}`;
    const reverseRouteKey = `${destBuildingId}-${startBuildingId}`;

    if (SAMPLE_CAMPUS_ROUTES[routeKey]) {
      return SAMPLE_CAMPUS_ROUTES[routeKey];
    }
    if (SAMPLE_CAMPUS_ROUTES[reverseRouteKey]) {
      const r = SAMPLE_CAMPUS_ROUTES[reverseRouteKey];
      return {
        ...r,
        path: [...r.path].reverse(),
        steps: r.steps.map((s, idx) => `Step ${idx + 1}: Reverse route: ${s}`),
      };
    }

    return {
      distance: '250 meters',
      time: '3.5 mins walk',
      steps: [
        'Exit the building lobby towards the central quadrangle.',
        'Follow the illuminated brick pathway heading toward the destination block.',
        'Enter through the universal accessible ramp.',
      ],
      path: [
        buildings.find((b) => b.id === startBuildingId)?.coordinates || { x: 30, y: 30 },
        { x: 50, y: 50 },
        buildings.find((b) => b.id === destBuildingId)?.coordinates || { x: 70, y: 70 },
      ],
    };
  }, [directionsMode, startBuildingId, destBuildingId, buildings]);

  const selectRoomFromSearch = (building: Building, floor: Floor, room: Room) => {
    setSelectedBuildingId(building.id);
    setActiveFloorLevel(floor.level);
    setSelectedRoomId(room.id);
    setFocusedRoom(room);
    setRoomSearchQuery('');
    setSearchResults([]);
    setMobileView('floorplan');
    showToast(`Focused on ${room.number}: ${room.name}`);
  };

  // Color mapping based on new palette: #FFCED8, #FFDDDD, #FFF4DE, #FFE8C4
  const getRoomTypeColor = (type: Room['type'], isSelected: boolean) => {
    if (isSelected) {
      return 'fill-[#D94A6E] stroke-[#8C1E37] stroke-[3] text-white';
    }
    switch (type) {
      case 'auditorium':
        return 'fill-[#FFCED8] hover:fill-[#F8B7C5] dark:fill-[#4A2633] dark:hover:fill-[#5C2E3F] stroke-[#D94A6E]';
      case 'lab':
        return 'fill-[#FFDDDD] hover:fill-[#FFCED8] dark:fill-[#3D1E28] dark:hover:fill-[#4F2634] stroke-[#E08A9E]';
      case 'classroom':
        return 'fill-[#FFF4DE] hover:fill-[#FFE8C4] dark:fill-[#382B21] dark:hover:fill-[#4A382A] stroke-[#E5C492]';
      case 'cafeteria':
        return 'fill-[#FFE8C4] hover:fill-[#FDD59F] dark:fill-[#3D2C1E] dark:hover:fill-[#523B28] stroke-[#F59E38]';
      case 'library_zone':
        return 'fill-[#FFF4DE] hover:fill-[#FFE8C4] dark:fill-[#2F2922] dark:hover:fill-[#40382E] stroke-[#D4AF37]';
      case 'student_services':
      case 'admin_office':
        return 'fill-[#FFDDDD] hover:fill-[#FFCED8] dark:fill-[#3D1E28] dark:hover:fill-[#4F2634] stroke-[#D94A6E]';
      default:
        return 'fill-[#FFF9F2] hover:fill-[#FFDDDD] dark:fill-[#261E23] dark:hover:fill-[#33272F] stroke-[#FFCED8]';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE]">
              CampusTrace Map & Floor Plans
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] border border-[#FFCED8] dark:border-[#5C2B3C]">
              <CheckCircle2 className="w-3 h-3 text-[#D94A6E]" />
              Verified CAD 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Select any building to inspect SVG floor plans or generate step-by-step walking routes.
          </p>
        </div>

        {/* Action Buttons: Directions & 3D view */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDirectionsMode((prev) => !prev);
              if (!directionsMode) setMobileView('directions');
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition shadow-sm ${
              directionsMode
                ? 'bg-[#D94A6E] border-[#D94A6E] text-white shadow-[#D94A6E]/25'
                : 'bg-white dark:bg-[#20181D] border-[#FFCED8] dark:border-[#422C36] text-[#2D1F25] dark:text-[#FFF4DE] hover:bg-[#FFF4DE]'
            }`}
          >
            <Navigation className="w-4 h-4 text-[#D94A6E] [div>&]:text-white" />
            <span>{directionsMode ? 'Exit Directions' : 'Walking Directions'}</span>
          </button>

          {currentBuilding && (
            <button
              onClick={() => setShowThreeD(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D94A6E] hover:bg-[#BF3659] text-white transition shadow-sm border border-[#FFCED8]"
            >
              <Box className="w-4 h-4 text-[#FFE8C4]" />
              <span>3D View (Experimental)</span>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Search Bar */}
      <div className="relative">
        <div className="relative flex items-center bg-white dark:bg-[#20181D] rounded-2xl border border-[#FFCED8] dark:border-[#422C36] p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#D94A6E] transition">
          <Search className="w-5 h-5 text-[#C45E12] dark:text-[#FFE8C4] ml-2 shrink-0" />
          <input
            type="text"
            value={roomSearchQuery}
            onChange={(e) => setRoomSearchQuery(e.target.value)}
            placeholder='Find room or lab in CampusTrace (e.g. "B-204", "Robotics Arena", "Auditorium", "Library")...'
            className="w-full bg-transparent px-3 py-1.5 text-sm text-[#2D1F25] dark:text-[#FFF4DE] placeholder:text-[#A8929B] focus:outline-none"
          />
          {roomSearchQuery && (
            <button
              onClick={() => setRoomSearchQuery('')}
              className="p-1 text-[#8F7580] hover:text-[#2D1F25] rounded-lg text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Autocomplete Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFDF9] dark:bg-[#20181D] rounded-2xl shadow-2xl border border-[#FFCED8] dark:border-[#422C36] p-3 z-30 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {searchResults.map(({ building, floor, room }) => (
              <button
                key={room.id}
                onClick={() => selectRoomFromSearch(building, floor, room)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[#FFDDDD]/60 dark:hover:bg-[#2C2128] transition flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE] group-hover:text-[#D94A6E]">
                    {room.number}: {room.name}
                  </div>
                  <div className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                    {building.name} • Level {room.floorLevel} ({floor.name})
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#D94A6E] opacity-0 group-hover:opacity-100 transition">
                  Highlight Room →
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Mode Switcher Tabs */}
      <div className="flex sm:hidden p-1 bg-[#FFDDDD]/60 dark:bg-[#2C2128] rounded-2xl border border-[#FFCED8]/50">
        <button
          onClick={() => setMobileView('campus')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mobileView === 'campus'
              ? 'bg-white dark:bg-[#20181D] text-[#D94A6E] shadow-sm'
              : 'text-[#7A616B] dark:text-[#BFA5AF]'
          }`}
        >
          Campus Map
        </button>
        <button
          onClick={() => setMobileView('floorplan')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mobileView === 'floorplan'
              ? 'bg-white dark:bg-[#20181D] text-[#D94A6E] shadow-sm'
              : 'text-[#7A616B] dark:text-[#BFA5AF]'
          }`}
        >
          Floor Plan
        </button>
        {directionsMode && (
          <button
            onClick={() => setMobileView('directions')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mobileView === 'directions'
                ? 'bg-white dark:bg-[#20181D] text-[#D94A6E] shadow-sm'
                : 'text-[#7A616B] dark:text-[#BFA5AF]'
            }`}
          >
            Route
          </button>
        )}
      </div>

      {/* Directions Control Bar (when activated) */}
      {directionsMode && (
        <div className="bg-[#FFF4DE] dark:bg-[#2A201A] border border-[#FFE8C4] dark:border-[#4A3926] rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
            <div className="w-full sm:w-1/2 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A3A00] dark:text-[#FFE8C4] flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-[#D94A6E]" /> Start Location:
              </label>
              <select
                value={startBuildingId}
                onChange={(e) => setStartBuildingId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-white dark:bg-[#1E171C] p-2 text-[#2D1F25] dark:text-[#FFF4DE] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortCode} - {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block text-[#D94A6E] font-bold">→</div>

            <div className="w-full sm:w-1/2 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A3A00] dark:text-[#FFE8C4] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#D94A6E]" /> Destination:
              </label>
              <select
                value={destBuildingId}
                onChange={(e) => setDestBuildingId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-[#FFCED8] dark:border-[#422C36] bg-white dark:bg-[#1E171C] p-2 text-[#2D1F25] dark:text-[#FFF4DE] focus:outline-none focus:ring-2 focus:ring-[#D94A6E]"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.shortCode} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeRoute && (
            <div className="bg-white dark:bg-[#20181D] px-4 py-2.5 rounded-2xl border border-[#FFCED8] dark:border-[#422C36] flex items-center gap-4 text-xs shrink-0 justify-between">
              <div>
                <span className="text-[#7A616B] dark:text-[#BFA5AF] block text-[10px]">Estimated Walk</span>
                <span className="font-extrabold text-[#D94A6E] dark:text-[#FFCED8] text-sm">
                  {activeRoute.time} ({activeRoute.distance})
                </span>
              </div>
              <button
                onClick={() => setDirectionsMode(false)}
                className="text-[#8F7580] hover:text-[#2D1F25] p-1"
                aria-label="Close directions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Campus Map (Left) + Floor Plan & Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Campus Overview Map (SVG based) */}
        <div
          className={`lg:col-span-7 bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] p-4 sm:p-6 shadow-sm flex flex-col justify-between ${
            mobileView !== 'campus' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#FFCED8]/50 dark:border-[#38202A]">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D94A6E]" />
              <h3 className="font-extrabold text-[#2D1F25] dark:text-[#FFF4DE] text-sm sm:text-base">
                Campus Overview Layout
              </h3>
            </div>
            <span className="text-[11px] text-[#7A616B] dark:text-[#BFA5AF]">
              Tap building to open floor plan
            </span>
          </div>

          {/* Interactive SVG Campus Map styled with Palette */}
          <div className="relative w-full aspect-[4/3] bg-[#FFFDF9] dark:bg-[#1A1217] rounded-2xl border border-[#FFCED8]/70 dark:border-[#422C36] overflow-hidden shadow-inner">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none cursor-pointer"
              aria-label="University Campus Map"
            >
              {/* Campus Grounds / Landscaping */}
              <rect x="0" y="0" width="100" height="100" fill="#FFFDF9" className="dark:fill-[#1A1217]" />

              {/* Water feature / Lake styled in delicate blush */}
              <ellipse cx="48" cy="20" rx="14" ry="7" fill="#FFDDDD" stroke="#FFCED8" strokeWidth="0.5" className="dark:fill-[#381D26] dark:stroke-[#592635]" />
              <text x="48" y="21" fontSize="2.2" textAnchor="middle" fill="#8C203B" className="dark:fill-[#FFCED8] font-bold">
                Campus Lake
              </text>

              {/* Central Clock Tower & Fountain in cream/rose */}
              <circle cx="50" cy="50" r="4.5" fill="#FFF4DE" stroke="#FFE8C4" strokeWidth="0.5" className="dark:fill-[#33261C] dark:stroke-[#4A382A]" />
              <circle cx="50" cy="50" r="1.5" fill="#D94A6E" />
              <text x="50" y="56" fontSize="1.8" textAnchor="middle" fill="#6B350A" className="dark:fill-[#FFE8C4] font-semibold">
                Central Fountain
              </text>

              {/* Walking Pathways */}
              <path
                d="M 26 32 L 48 48 L 74 72 M 68 28 L 48 48 L 46 84 M 22 70 L 46 84 M 26 32 L 68 28"
                fill="none"
                stroke="#FFE8C4"
                strokeWidth="1.0"
                strokeDasharray="1.5,1.5"
                className="dark:stroke-[#4A3926]"
              />

              {/* Active Walking Route (Directions) */}
              {directionsMode && activeRoute && (
                <path
                  d={activeRoute.path.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')}
                  fill="none"
                  stroke="#D94A6E"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Buildings on SVG */}
              {buildings.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                const isStart = directionsMode && b.id === startBuildingId;
                const isDest = directionsMode && b.id === destBuildingId;

                return (
                  <g
                    key={b.id}
                    onClick={() => {
                      setSelectedBuildingId(b.id);
                      setMobileView('floorplan');
                    }}
                    className="cursor-pointer transition-transform duration-200"
                  >
                    {/* Building Footprint Rectangle */}
                    <rect
                      x={b.coordinates.x - 7}
                      y={b.coordinates.y - 5.5}
                      width={14}
                      height={11}
                      rx={2.5}
                      fill={
                        isSelected
                          ? '#D94A6E'
                          : isStart
                          ? '#FFE8C4'
                          : isDest
                          ? '#FFCED8'
                          : '#FFF4DE'
                      }
                      stroke={isSelected ? '#8C1E37' : '#FFCED8'}
                      strokeWidth={isSelected ? '0.9' : '0.5'}
                      className="transition-all duration-200 dark:stroke-[#592635]"
                    />

                    {/* Building Short Code Label */}
                    <text
                      x={b.coordinates.x}
                      y={b.coordinates.y - 0.5}
                      fontSize="2.8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#2D1F25'}
                      className="dark:fill-[#FFF4DE]"
                    >
                      {b.shortCode}
                    </text>

                    {/* Category Label */}
                    <text
                      x={b.coordinates.x}
                      y={b.coordinates.y + 2.8}
                      fontSize="1.6"
                      fontWeight="600"
                      textAnchor="middle"
                      fill={isSelected ? '#FFE8C4' : '#8C203B'}
                      className="dark:fill-[#FFCED8]"
                    >
                      {b.category}
                    </text>

                    {/* Direction Markers */}
                    {isStart && (
                      <circle cx={b.coordinates.x - 5} cy={b.coordinates.y - 4} r="1.5" fill="#F59E38" />
                    )}
                    {isDest && (
                      <circle cx={b.coordinates.x + 5} cy={b.coordinates.y - 4} r="1.5" fill="#D94A6E" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Building Quick selector pills below map */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-[#FFCED8]/50 dark:border-[#38202A]">
            <span className="text-xs text-[#7A616B] font-bold mr-1">Select:</span>
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBuildingId(b.id);
                  setMobileView('floorplan');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                  selectedBuildingId === b.id
                    ? 'bg-[#D94A6E] border-[#D94A6E] text-white'
                    : 'bg-[#FFF4DE] dark:bg-[#2A1F26] border-[#FFE8C4] dark:border-[#422C36] text-[#2D1F25] dark:text-[#FFF4DE] hover:bg-[#FFDDDD]'
                }`}
              >
                {b.shortCode}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Building Floor Plan & Room Detail Inspector */}
        <div
          className={`lg:col-span-5 flex flex-col gap-5 ${
            mobileView === 'campus' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {currentBuilding && currentFloor && (
            <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] p-5 sm:p-6 shadow-sm space-y-4">
              {/* Building Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8]">
                      {currentBuilding.shortCode}
                    </span>
                    <span className="text-xs text-[#7A616B] dark:text-[#BFA5AF]">
                      {currentBuilding.openHours}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#2D1F25] dark:text-[#FFF4DE] mt-1">
                    {currentBuilding.name}
                  </h2>
                </div>

                <button
                  onClick={() => openReportModal('building', currentBuilding.id, currentBuilding.name)}
                  className="text-xs text-[#8F7580] hover:text-[#D94A6E] p-1 flex items-center gap-1 transition"
                  title="Report error with this building"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>

              {/* Floor Level Selector */}
              <div className="flex items-center gap-2 p-1 bg-[#FFF4DE] dark:bg-[#2A1F26] rounded-2xl border border-[#FFE8C4] dark:border-[#422C36]">
                {currentBuilding.floors.map((fl) => (
                  <button
                    key={fl.id}
                    onClick={() => {
                      setActiveFloorLevel(fl.level);
                      setSelectedRoomId(null);
                      setFocusedRoom(null);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                      activeFloorLevel === fl.level
                        ? 'bg-[#D94A6E] text-white shadow-sm'
                        : 'text-[#7A616B] dark:text-[#BFA5AF] hover:text-[#2D1F25]'
                    }`}
                  >
                    {fl.name}
                  </button>
                ))}
              </div>

              {/* Floor Description */}
              <div className="text-xs text-[#7A616B] dark:text-[#BFA5AF] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D94A6E]" />
                <span>{currentFloor.description}</span>
              </div>

              {/* SVG 2D Floor Plan Canvas with Palette Styling */}
              <div className="relative w-full aspect-[5/3] bg-[#FFFDF9] dark:bg-[#1A1217] rounded-2xl border border-[#FFCED8] dark:border-[#422C36] p-2 overflow-hidden shadow-inner">
                <svg
                  viewBox="0 0 520 280"
                  className="w-full h-full select-none"
                  aria-label={`Floor Plan: ${currentFloor.name}`}
                >
                  {/* Outer Floor Perimeter */}
                  <rect
                    x="10"
                    y="10"
                    width="500"
                    height="260"
                    rx="12"
                    fill="none"
                    stroke="#FFCED8"
                    strokeWidth="3"
                    className="dark:stroke-[#592635]"
                  />

                  {/* Central Corridor in Cream */}
                  <rect
                    x="15"
                    y="125"
                    width="490"
                    height="30"
                    fill="#FFF4DE"
                    className="dark:fill-[#2A201A]"
                  />
                  <text
                    x="260"
                    y="144"
                    fontSize="11"
                    textAnchor="middle"
                    fill="#8C521E"
                    className="dark:fill-[#FFE8C4] font-bold tracking-widest uppercase"
                  >
                    Main Hallway Corridor
                  </text>

                  {/* Interactive Rooms */}
                  {currentFloor.rooms.map((room) => {
                    const isSelected = room.id === selectedRoomId;
                    const coords = room.svgPolygon?.split(' ') || [];
                    if (coords.length < 4) return null;

                    const [p1, p2, p3, p4] = coords.map((c) => {
                      const [x, y] = c.split(',').map(Number);
                      return { x, y };
                    });

                    const width = p2.x - p1.x;
                    const height = p4.y - p1.y;
                    const cx = p1.x + width / 2;
                    const cy = p1.y + height / 2;

                    return (
                      <g
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setFocusedRoom(room);
                        }}
                        className="cursor-pointer group"
                      >
                        <rect
                          x={p1.x}
                          y={p1.y}
                          width={width}
                          height={height}
                          rx="6"
                          className={`transition-all duration-150 ${getRoomTypeColor(
                            room.type,
                            isSelected
                          )}`}
                        />

                        {/* Room Number */}
                        <text
                          x={cx}
                          y={cy - 4}
                          fontSize="13"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill={isSelected ? '#FFFFFF' : '#2D1F25'}
                          className="dark:fill-[#FFF4DE]"
                        >
                          {room.number}
                        </text>

                        {/* Room Name */}
                        <text
                          x={cx}
                          y={cy + 12}
                          fontSize="9"
                          fontWeight="500"
                          textAnchor="middle"
                          fill={isSelected ? '#FFE8C4' : '#7A616B'}
                          className="dark:fill-[#BFA5AF]"
                        >
                          {room.name.length > 20 ? room.name.slice(0, 18) + '...' : room.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Selected Room Details Card */}
              {focusedRoom ? (
                <div className="bg-[#FFDDDD]/50 dark:bg-[#2F1F27] border border-[#FFCED8] dark:border-[#4F2634] rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-[#2D1F25] dark:text-[#FFF4DE]">
                          {focusedRoom.number}: {focusedRoom.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FFCED8] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#FFCED8]">
                          {focusedRoom.type}
                        </span>
                      </div>
                      <div className="text-xs text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
                        {focusedRoom.department || 'General Facility'} • Capacity: {focusedRoom.capacity || 'N/A'} seats
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        openReportModal(
                          'room',
                          focusedRoom.id,
                          `Room ${focusedRoom.number} (${currentBuilding.name})`
                        )
                      }
                      className="text-xs font-semibold text-[#D94A6E] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Report detail
                    </button>
                  </div>

                  {focusedRoom.facilities && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {focusedRoom.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-[#1E171C] text-[#2D1F25] dark:text-[#FFF4DE] border border-[#FFCED8] dark:border-[#422C36]"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  )}

                  {focusedRoom.accessibilityNotes && (
                    <div className="text-xs text-[#7A3A00] dark:text-[#FFE8C4] bg-[#FFE8C4]/60 dark:bg-[#382618] p-2 rounded-xl border border-[#FFE8C4] dark:border-[#523A25]">
                      ♿ {focusedRoom.accessibilityNotes}
                    </div>
                  )}

                  <div className="text-[11px] text-[#8F7580] pt-1 flex items-center justify-between border-t border-[#FFCED8]/60 dark:border-[#38202A]">
                    <span>Verified: {focusedRoom.lastUpdated}</span>
                    {focusedRoom.sourceUrl && (
                      <a
                        href={focusedRoom.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#D94A6E] dark:text-[#FFCED8] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Source Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-[#8F7580] text-xs italic">
                  Tap any room in the floor plan above to inspect capacity, facilities, and accessibility.
                </div>
              )}
            </div>
          )}

          {/* Walking Route Step-by-Step Card (When Directions are Active) */}
          {directionsMode && activeRoute && (
            <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#D94A6E] dark:text-[#FFCED8]">
                <Footprints className="w-4 h-4" />
                <h4 className="font-bold text-sm text-[#2D1F25] dark:text-[#FFF4DE]">
                  Step-by-Step Walking Route
                </h4>
              </div>

              <div className="space-y-2 text-xs text-[#5C454F] dark:text-[#D9C4CC]">
                {activeRoute.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3D Building Viewer Modal */}
      {showThreeD && currentBuilding && (
        <ThreeDBuildingModal
          building={currentBuilding}
          onClose={() => setShowThreeD(false)}
          onSelectFloor={(lvl) => {
            setActiveFloorLevel(lvl);
            setMobileView('floorplan');
          }}
        />
      )}
    </div>
  );
};
