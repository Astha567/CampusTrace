/**
 * Data Service Abstraction Layer
 * All UI components read and write data through this service.
 * In production, this can be swapped with Supabase (PostgreSQL) or Firebase Firestore.
 */

import { Building, Event, Contact, FAQ, Report, Floor, Room } from '../types';
import { SAMPLE_BUILDINGS } from '../data/buildings';
import { SAMPLE_EVENTS } from '../data/events';
import { SAMPLE_CONTACTS } from '../data/contacts';
import { SAMPLE_FAQS } from '../data/faq';
import Fuse from 'fuse.js';

const STORAGE_KEYS = {
  EVENTS: 'campustrace_events_v1',
  CONTACTS: 'campustrace_contacts_v1',
  REPORTS: 'campustrace_reports_v1',
  SAVED_ITEMS: 'campustrace_saved_items_v1',
  REMINDER_SETTINGS: 'campustrace_reminders_v1',
};

class DataService {
  private events: Event[] = [];
  private contacts: Contact[] = [];
  private buildings: Building[] = SAMPLE_BUILDINGS;
  private faqs: FAQ[] = SAMPLE_FAQS;
  private reports: Report[] = [];

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Load events from localStorage or fallback to sample data
    try {
      const storedEvents =
        localStorage.getItem(STORAGE_KEYS.EVENTS) ||
        localStorage.getItem('everywhere_door_events_v1');
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      } else {
        this.events = [...SAMPLE_EVENTS];
        this.persistEvents();
      }
    } catch {
      this.events = [...SAMPLE_EVENTS];
    }

    // Load contacts
    try {
      const storedContacts =
        localStorage.getItem(STORAGE_KEYS.CONTACTS) ||
        localStorage.getItem('everywhere_door_contacts_v1');
      if (storedContacts) {
        this.contacts = JSON.parse(storedContacts);
      } else {
        this.contacts = [...SAMPLE_CONTACTS];
        this.persistContacts();
      }
    } catch {
      this.contacts = [...SAMPLE_CONTACTS];
    }

    // Load reports
    try {
      const storedReports =
        localStorage.getItem(STORAGE_KEYS.REPORTS) ||
        localStorage.getItem('everywhere_door_reports_v1');
      if (storedReports) {
        this.reports = JSON.parse(storedReports);
      } else {
        this.reports = [
          {
            id: 'rep-init-01',
            targetType: 'room',
            targetId: 'room-a-204',
            targetName: 'Room A-204 Projector Cable',
            message: 'HDMI cable in Room A-204 is loose and flickers during presentations. Needs replacement.',
            createdAt: '2026-10-13T10:30:00Z',
            status: 'pending',
          },
        ];
        this.persistReports();
      }
    } catch {
      this.reports = [];
    }
  }

  private persistEvents() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    } catch (e) {
      console.warn('Could not persist events to localStorage', e);
    }
  }

  private persistContacts() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.contacts));
    } catch (e) {
      console.warn('Could not persist contacts to localStorage', e);
    }
  }

  private persistReports() {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Could not persist reports to localStorage', e);
    }
  }

  // --- BUILDINGS & ROOMS ---
  async getBuildings(): Promise<Building[]> {
    return [...this.buildings];
  }

  async getBuildingById(id: string): Promise<Building | undefined> {
    return this.buildings.find((b) => b.id.toLowerCase() === id.toLowerCase());
  }

  async searchRooms(query: string): Promise<Array<{ building: Building; floor: Floor; room: Room }>> {
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return [];

    const results: Array<{ building: Building; floor: Floor; room: Room }> = [];

    for (const b of this.buildings) {
      for (const f of b.floors) {
        for (const r of f.rooms) {
          const matchNumber = r.number.toLowerCase().includes(cleanQ);
          const matchName = r.name.toLowerCase().includes(cleanQ);
          const matchDept = r.department?.toLowerCase().includes(cleanQ);
          const matchFacilities = r.facilities?.some((fac) => fac.toLowerCase().includes(cleanQ));

          if (matchNumber || matchName || matchDept || matchFacilities) {
            results.push({ building: b, floor: f, room: r });
          }
        }
      }
    }

    return results;
  }

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.events.find((e) => e.id === id);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'lastUpdated'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `evt-custom-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      verified: true,
    };
    this.events.unshift(newEvent);
    this.persistEvents();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;

    this.events[idx] = {
      ...this.events[idx],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    this.persistEvents();
    return this.events[idx];
  }

  async deleteOrArchiveEvent(id: string): Promise<void> {
    this.events = this.events.filter((e) => e.id !== id);
    this.persistEvents();
  }

  // --- CONTACTS ---
  async getContacts(): Promise<Contact[]> {
    return [...this.contacts];
  }

  async createContact(contactData: Omit<Contact, 'id' | 'lastVerified'>): Promise<Contact> {
    const newContact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.contacts.unshift(newContact);
    this.persistContacts();
    return newContact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | undefined> {
    const idx = this.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;

    this.contacts[idx] = {
      ...this.contacts[idx],
      ...updates,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    this.persistContacts();
    return this.contacts[idx];
  }

  // --- FAQS ---
  async getFAQs(): Promise<FAQ[]> {
    return [...this.faqs];
  }

  // --- REPORTS ---
  async getReports(): Promise<Report[]> {
    return [...this.reports];
  }

  async submitReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>): Promise<Report> {
    const newReport: Report = {
      ...reportData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    this.reports.unshift(newReport);
    this.persistReports();
    return newReport;
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<void> {
    const rep = this.reports.find((r) => r.id === id);
    if (rep) {
      rep.status = status;
      this.persistReports();
    }
  }

  // --- SEARCH FOR AI RETRIEVAL ---
  searchDataForPrompt(query: string) {
    // 1. Fuse on FAQs
    const faqFuse = new Fuse(this.faqs, {
      keys: ['question', 'answer', 'category'],
      threshold: 0.45,
    });
    const matchedFaqs = faqFuse.search(query).map((res) => res.item).slice(0, 3);

    // 2. Fuse on Events
    const eventFuse = new Fuse(this.events, {
      keys: ['title', 'description', 'organiser', 'venue', 'tags', 'department', 'club'],
      threshold: 0.45,
    });
    const matchedEvents = eventFuse.search(query).map((res) => res.item).slice(0, 4);

    // 3. Fuse on Contacts
    const contactFuse = new Fuse(this.contacts, {
      keys: ['name', 'role', 'department', 'helpsWith', 'officeLocation'],
      threshold: 0.45,
    });
    const matchedContacts = contactFuse.search(query).map((res) => res.item).slice(0, 3);

    // 4. Rooms & Buildings
    const flatRooms: Array<{ building: Building; room: Room }> = [];
    this.buildings.forEach((b) => {
      b.floors.forEach((f) => {
        f.rooms.forEach((r) => {
          flatRooms.push({ building: b, room: r });
        });
      });
    });

    const roomFuse = new Fuse(flatRooms, {
      keys: ['room.number', 'room.name', 'room.department', 'room.facilities', 'building.name'],
      threshold: 0.4,
    });
    const matchedRooms = roomFuse.search(query).map((res) => res.item).slice(0, 3);

    const bldgFuse = new Fuse(this.buildings, {
      keys: ['name', 'shortCode', 'category', 'description', 'locationDescription'],
      threshold: 0.45,
    });
    const matchedBuildings = bldgFuse.search(query).map((res) => res.item).slice(0, 2);

    return {
      matchedFaqs,
      matchedEvents,
      matchedContacts,
      matchedRooms,
      matchedBuildings,
    };
  }

  // Reset to original sample data
  resetToSampleData() {
    this.events = [...SAMPLE_EVENTS];
    this.contacts = [...SAMPLE_CONTACTS];
    this.persistEvents();
    this.persistContacts();
  }
}

export const dataService = new DataService();
