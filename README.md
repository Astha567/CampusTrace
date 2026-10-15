# CampusTrace 🗺️📍

### A Student-Friendly Digital Guide to University Life

**Developed by Team Offshore**

CampusTrace is a mobile-friendly web application that helps students navigate their campus, discover events and opportunities, track deadlines, find faculty contacts, and get reliable answers through an AI-powered campus assistant.

Our goal is to make campus information easier to find, access, and manage — all in one place.

## 🌐 Live Demo

**Explore CampusTrace here:**

🔗 [Launch CampusTrace — Live Demo](https://everywhere-door-campus-guide-930800913027.asia-east1.run.app/)

Explore the interactive campus map, discover events and opportunities, manage deadlines, and experience the AI-powered campus assistant.


## ✨ Key Features

### 🗺️ 1. Interactive Campus Map

- Explore six campus blocks using an interactive 2D map.
- View floor plans and locate classrooms, labs, offices, and other facilities.
- Search for rooms with autocomplete.
- Get step-by-step walking directions with estimated distance and time.
- Explore an experimental 3D building view.

### 🎯 2. Events & Opportunities

- Discover hackathons, workshops, seminars, internships, and college fests.
- Filter opportunities by category, department, and registration status.
- Save events and access official registration links.
- View event locations directly on the campus map.

### 📅 3. Calendar & Reminders

- View upcoming events and registration deadlines.
- Track saved opportunities with countdowns.
- Export events to your calendar using `.ics` files.
- Generate Google Calendar links.
- Set reminder preferences and enable browser notifications.

### 🤖 4. AI Campus Assistant

- Ask questions about campus facilities, events, and contacts.
- Uses verified campus records to provide relevant answers.
- Avoids guessing unverified information and directs students to official offices when needed.
- Supports interactive links to maps, events, and contacts.
- Includes a local fallback for basic answers when the AI service is unavailable.

### 👥 5. Faculty & Student Directory

- Find faculty advisors and student club leaders.
- View office hours and approved contact methods.
- Display direct WhatsApp links only when permission has been granted.

### 🔐 6. Admin Portal

- Add, edit, and archive events.
- Manage event verification status.
- Update contact consent settings.
- Review feedback and reported information.

**Demo password:** `offshore2026`

*Note: The admin portal is for demonstration purposes and is not intended for production security.*

### ℹ️ 7. About & Trust

- Learn how campus information is verified.
- Explore frequently asked questions for new students.
- Review privacy principles and deployment requirements.
- Discover future improvements and planned features.

## 🛠️ Tech Stack

| Area                 | Technologies                          |
| -------------------- | ------------------------------------- |
| Frontend             | React 18, TypeScript                  |
| Styling & UI         | Tailwind CSS v4, Motion, Lucide Icons |
| Maps & Visualization | SVG, Three.js                         |
| Search               | Fuse.js                               |
| AI Assistant         | Google Gemini API, `@google/genai`    |
| Backend              | Node.js, Express                      |
| Data Storage         | LocalStorage                          |
| Build Tools          | Vite                                  |

The project uses a centralized data service, making it easier to integrate a database such as Supabase or Firebase in the future.

## 👨‍💻 Team Offshore — Team Members & Roles

| Team Member      | Role                             |
| ---------------- | -------------------------------- |
| Avni Gupta       | Backend Developer                |
| Astha Yadav      | AI/ML Developer                  |
| Bhoomi Choudhary | UI/UX Designer & Researcher      |
| Avni Gaur        | Database Developer               |
| Dhwani Sharma    | Frontend Developer               |
| Himangana Mishra | Testing & Quality Assurance (QA) |

**Team Offshore** is focused on building a student-friendly, accessible, and reliable digital campus experience.

##

## 📂 Project Structure

```text
CampusTrace/
├── server.ts
├── src/
│   ├── components/    # Reusable UI components
│   ├── context/       # Application state management
│   ├── data/          # Campus buildings, events, contacts, FAQs
│   ├── pages/         # Main application pages
│   ├── services/      # Data, AI, and calendar services
│   ├── types/         # TypeScript types
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── package.json
└── README.md
```

## 🔄 Using Real Campus Data

CampusTrace currently uses sample campus data for demonstration. Before deploying it at a real university, replace the sample records in `src/data/` with verified information.

- **Buildings:** Add official building names, floor plans, room details, and walking routes.
- **Events:** Add confirmed event dates, eligibility requirements, venues, and official registration links.
- **Contacts:** Include verified faculty and student details only with appropriate consent.
- **FAQs:** Use official university handbooks and trusted university sources.

The centralized `src/services/dataService.ts` helps manage data access and supports future database integration.

## 🔒 Privacy & Verification

CampusTrace is designed with student privacy and information accuracy in mind.

- Only use verified campus information wherever possible.
- Obtain appropriate permission before publishing personal contact details.
- Keep API keys and sensitive credentials out of public repositories.
- Review the AI assistant's answers and grounding data before deployment.
- Use proper authentication and authorization before introducing a production admin portal.

## ✅ Before University Deployment

Before making CampusTrace available to students:

- [ ] Obtain permission to publish campus maps and indoor floor plans.
- [ ] Establish a process for verifying and updating events.
- [ ] Obtain consent for publishing faculty and student contact details.
- [ ] Confirm whether official university APIs can be integrated.
- [ ] Test calendar exports and reminder functionality.
- [ ] Verify AI responses against official campus records.
- [ ] Add secure authentication and database-backed storage.
- [ ] Test accessibility, mobile responsiveness, and overall usability.

## 🔮 Future Scope

- Real-time campus data synchronization.
- Integration with university ERP and official information systems.
- Secure cloud database and authentication.
- Improved accessibility and navigation routes.
- Advanced 3D campus visualization.
- More reliable push notifications and event updates.

## ❤️ Our Mission

**CampusTrace aims to make university life simpler by bringing campus navigation, opportunities, important deadlines, and trusted information together in one accessible platform.**

*Built with care by Team Offshore.*
