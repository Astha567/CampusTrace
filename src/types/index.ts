/**
 * CampusTrace - TypeScript Domain Models
 * Designed to mirror a relational database schema for easy future migration
 * to Supabase (PostgreSQL) or Firebase Firestore.
 */

export type BuildingCategory =
  | 'academic'
  | 'library'
  | 'canteen'
  | 'hostel'
  | 'admin'
  | 'sports'
  | 'student_services';

export type RoomType =
  | 'classroom'
  | 'lab'
  | 'faculty_office'
  | 'admin_office'
  | 'auditorium'
  | 'library_zone'
  | 'cafeteria'
  | 'study_room'
  | 'student_services'
  | 'restroom'
  | 'utility';

export interface Room {
  id: string;
  floorId: string;
  buildingId: string;
  number: string;
  name: string;
  type: RoomType;
  department?: string;
  capacity?: number;
  accessibilityNotes?: string;
  facilities?: string[];
  lastUpdated: string;
  sourceUrl?: string;
  svgPolygon?: string; // Coordinates for SVG floor plan highlighting
  floorLevel: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number; // 0 = Ground, 1 = 1st Floor, 2 = 2nd Floor
  name: string; // e.g. "Ground Floor", "1st Floor"
  description?: string;
  rooms: Room[];
  svgPath?: string;
  lastUpdated: string;
}

export interface Building {
  id: string;
  name: string;
  shortCode: string; // e.g. "BLK-A", "LIB"
  category: BuildingCategory;
  description: string;
  locationDescription: string;
  coordinates: { x: number; y: number }; // Relative percentage coordinates on 2D campus map (0-100)
  dimensions?: { width: number; height: number };
  floors: Floor[];
  verified: boolean;
  lastUpdated: string;
  sourceUrl: string;
  accessibleEntrance: boolean;
  openHours: string;
}

export type EventType =
  | 'hackathon'
  | 'workshop'
  | 'seminar'
  | 'guest_talk'
  | 'competition'
  | 'fest'
  | 'club_recruitment'
  | 'audition'
  | 'internship_placement'
  | 'volunteering';

export type EventStatus =
  | 'upcoming'
  | 'registration_open'
  | 'closing_soon'
  | 'cancelled'
  | 'updated'
  | 'expired';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  organiser: string;
  description: string;
  startDateTime: string; // ISO 8601 string
  endDateTime: string;   // ISO 8601 string
  venue: string;         // Building and room or physical location
  buildingId?: string;
  roomId?: string;
  onlineLink?: string;
  eligibility: string;   // e.g. "All undergraduate & postgraduate students"
  deadline: string;      // ISO 8601 string for registration deadline
  registrationUrl: string;
  status: EventStatus;
  tags: string[];
  department?: string;
  club?: string;
  lastUpdated: string;
  verified: boolean;
  sourceLabel: string;
  sourceUrl: string;
  isArchived?: boolean;
}

export interface Club {
  id: string;
  name: string;
  type: 'technical' | 'cultural' | 'sports' | 'social' | 'academic';
  department?: string;
  description: string;
  leadContactId?: string;
  lastUpdated: string;
}

export type ContactType = 'faculty' | 'student_lead';

export interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  helpsWith: string[];
  contactMethod: string; // e.g., "Office Hours (Tue/Thu 2-4pm, Room B-204) or Email"
  email?: string;
  officeLocation?: string;
  whatsappUrl?: string;
  permissionGiven: boolean; // WhatsApp/direct contact only shown if true
  type: ContactType;
  lastVerified: string;
  sourceLabel: string;
  sourceUrl: string;
  photoUrl?: string;
}

export type ReminderSetting = 'none' | '1_hour_before' | '1_day_before' | 'both';

export interface SavedItem {
  id: string;
  eventId: string;
  reminderSetting: ReminderSetting;
  savedAt: string;
  notified?: boolean;
}

export type ReportTargetType = 'event' | 'room' | 'building' | 'contact' | 'general';

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId?: string;
  targetName?: string;
  message: string;
  email?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'academics' | 'facilities' | 'events' | 'admin' | 'campus_life';
  sourceLabel: string;
  sourceUrl?: string;
  lastUpdated: string;
}

export interface CampusPathStep {
  instruction: string;
  landmark?: string;
  distanceMeters?: number;
}

export interface CampusRoute {
  fromBuildingId: string;
  toBuildingId: string;
  distanceApprox: string;
  timeApprox: string;
  steps: CampusPathStep[];
  pathPoints: Array<{ x: number; y: number }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sourcesUsed?: Array<{
    type: 'building' | 'room' | 'event' | 'contact' | 'faq';
    id: string;
    label: string;
    targetTab?: 'map' | 'events' | 'contacts';
  }>;
  suggestedAction?: {
    type: 'navigate_map' | 'view_event' | 'view_contact';
    label: string;
    targetId: string;
  };
}
