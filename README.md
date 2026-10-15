# CampusTrace 🗺️📍
*A Student-Friendly Digital Guide to University Life by Team Offshore*

**CampusTrace** is a mobile-first, accessible web application designed to help university students navigate campus buildings, discover verified opportunities and deadlines, export calendar reminders, look up faculty/student leads, and receive grounded answers from an AI campus assistant.

---

## 🌟 Key Features

1. **Interactive Campus Map & SVG Floor Plans**
   - 2D SVG Campus layout with clickable buildings across 6 blocks.
   - Interactive SVG floor plans with room highlights (classrooms, labs, offices, cafeteria, student services).
   - Instant Room Search ("Find Room B-204") with autocomplete, auto-selection of building, floor level, and room pulsing.
   - Step-by-step walking directions prototype with estimated walking time and distance.
   - Experimental 3D View modal using Three.js with exploded floor stack controls.

2. **Events & Opportunities Hub**
   - 20 realistic verified events: hackathons, workshops, seminars, auditions, internships, and fests.
   - Filters by category, department, registration status (open / closing soon / closed), and text search.
   - Status indicators with clear expiration/cancellation states.
   - Direct integration: Save/bookmark, official registration links, and "Show on Map" button.

3. **Personal Calendar & Reminders**
   - Month view and agenda list highlighting **Event Dates** (indigo) and **Registration Deadlines** (amber) in distinctive colors.
   - "My Opportunities" dashboard with live countdown clocks (e.g. "Closes in 2d 4h").
   - 1-click **.ics** (iCalendar) export for single or all saved events.
   - Direct "Add to Google Calendar" web link generator.
   - In-app reminder settings (1 day / 1 hour before) and browser notification permission prompt.

4. **Grounded AI Campus Assistant (Gemini API via `@google/genai`)**
   - Strictly grounded retrieval: performs fuzzy keyword search (Fuse.js) over verified local campus records and passes only matched context to the Gemini model on the server.
   - System instruction strictly prohibits inventing rooms, contacts, or dates; when uncertain, directs students to official offices.
   - Interactive link chips inside assistant responses navigate directly to map locations, event details, or contact directory cards.
   - Resilient fallback engine ensures verified answers even if offline or without an API key.

5. **Verified Faculty & Student Leads Directory**
   - Filterable directory of faculty advisors and student club presidents.
   - Strict privacy rule: direct messaging (WhatsApp) links are only displayed if the individual's `permissionGiven` consent flag is `true`.
   - Clear office hours, approved contact methods, and verification timestamps.

6. **Admin Verification Mock Portal**
   - Password-gated demo portal (Demo Password: `offshore2026`).
   - Create, edit, and archive events; toggle verification badges.
   - Manage WhatsApp consent flags for directory contacts.
   - Community Feedback Inbox showing user-submitted corrections from the "Report Incorrect Info" modal.

7. **About & Trust Page**
   - Transparent data verification principles and zero-tracking privacy stance.
   - 15 comprehensive freshman FAQs.
   - Interactive university deployment confirmation checklist.
   - Future roadmap (3D digital twin, multi-source event sync, accessibility routing).

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas-Confetti, Three.js
- **Search & Retrieval:** Fuse.js for fuzzy retrieval over verified sample data
- **AI & Server:** Node.js Express server with `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Persistence:** LocalStorage for saved events, reminder preferences, theme mode, and admin overrides
- **Designed for Backend Swap:** All data access is abstracted behind `src/services/dataService.ts`, making it straightforward to swap in Supabase (PostgreSQL) or Firebase Firestore.

---

## 📂 Project Structure

```
├── server.ts                 # Full-stack Express server + Vite middlewares & Gemini API proxy
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Navbar.tsx        # Top navigation with badges and quick actions
│   │   ├── BottomTabBar.tsx  # Mobile-first persistent bottom bar
│   │   ├── Footer.tsx        # Global footer with data timestamps and privacy notes
│   │   ├── SampleDataBanner.tsx # Disclaimer banner for sample data
│   │   ├── ReportModal.tsx   # Modal to submit data corrections
│   │   ├── OnboardingModal.tsx # 3-step introductory tour for students
│   │   ├── ThreeDBuildingModal.tsx # Three.js 3D building viewer
│   │   └── Toast.tsx         # Notification alerts
│   ├── context/
│   │   └── AppContext.tsx    # App-wide state (tabs, bookmarks, theme, navigation)
│   ├── data/                 # Separated, easy-to-edit campus sample files
│   │   ├── buildings.ts      # 6 buildings, 18 SVG floor plans, 35+ rooms, walking routes
│   │   ├── events.ts         # 20 events across all campus categories
│   │   ├── contacts.ts       # 12 verified faculty and student leads
│   │   └── faq.ts            # 15 freshman campus FAQs
│   ├── pages/
│   │   ├── HomePage.tsx      # Unified search, quick links, deadlines, carousel
│   │   ├── CampusMapPage.tsx # SVG campus map, interactive floor plans, walking directions
│   │   ├── EventsPage.tsx    # Filterable opportunities hub & event detail modal
│   │   ├── CalendarPage.tsx  # Month calendar, deadline colors, .ics export
│   │   ├── AssistantPage.tsx # Grounded chat assistant with map action chips
│   │   ├── ContactsPage.tsx  # Verified faculty & student leads directory
│   │   ├── AdminPage.tsx     # Mock admin portal for events, consent, reports
│   │   └── AboutPage.tsx     # Trust policy, production checklist, roadmap, FAQs
│   ├── services/
│   │   ├── dataService.ts    # Centralized data access & fuzzy retrieval
│   │   ├── geminiService.ts  # Grounded Gemini assistant client & local fallback
│   │   └── calendarExport.ts # .ics file generator & Google Calendar URLs
│   ├── types/
│   │   └── index.ts          # Relational-ready TypeScript domain models
│   ├── App.tsx               # Main application layout
│   ├── index.css             # Tailwind CSS & custom styling
│   └── main.tsx              # React DOM entry point
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# GEMINI_API_KEY: In AI Studio this is automatically injected via the Secrets panel.
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

---

## 🔄 How to Replace Sample Data with Real Campus Data

All campus records are isolated in the `/src/data/` directory so university administrators can update them without altering component logic:

1. **Buildings & Floor Plans (`src/data/buildings.ts`):**
   - Update `SAMPLE_BUILDINGS` array with real building names, categories, GPS/relative coordinates, open hours, and rooms.
   - For floor plans, define room polygons in the `svgPolygon` attribute using coordinate tuples (`"x1,y1 x2,y2 x3,y3 x4,y4"`).
   - Add walking routes to `SAMPLE_CAMPUS_ROUTES` with turn-by-turn text instructions.

2. **Campus Events (`src/data/events.ts`):**
   - Populate `SAMPLE_EVENTS` with official dates, descriptions, venues, eligibility, and registration URLs.

3. **Faculty & Student Contacts (`src/data/contacts.ts`):**
   - Populate `SAMPLE_CONTACTS`. Ensure `permissionGiven: true` is only assigned when explicit written consent for public communication exists.

4. **Freshman FAQs (`src/data/faq.ts`):**
   - Update `SAMPLE_FAQS` with verified university handbook answers and official source links.

---

## ✅ "What Needs to be Confirmed" University Checklist

Before replacing sample data and publishing CampusTrace for student use, confirm the following with university stakeholders:

- [ ] **Campus Floor Plans & CAD Permissions:** Obtain formal written clearance from the University Estates Directorate to publish interior room floor plans and emergency exit paths.
- [ ] **Event Verification Committee:** Designate student union officers and faculty liaisons responsible for approving and archiving hackathons, workshops, and audition deadlines.
- [ ] **Contact-Publishing Consent:** Secure signed or digital consent forms from faculty members and student club leaders before listing contact numbers or WhatsApp hotlines.
- [ ] **Official University ERP/Feeds:** Assess if official APIs (LDAP, student information system, library room reservation software) can be connected via `src/services/dataService.ts`.
- [ ] **Calendar & Push Delivery Feasibility:** Determine whether students prefer direct iCalendar `.ics` downloads, Google Calendar web links, or browser Web Push / SMS notifications.
- [ ] **AI Assistant Data Boundaries:** Audit the grounding dataset so that the assistant only answers verified questions and safely refers students to physical desks for unverified queries.
