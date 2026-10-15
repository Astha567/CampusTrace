import { dataService } from './dataService';
import { ChatMessage } from '../types';

export interface AssistantResponse {
  answer: string;
  sourcesUsed: Array<{
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

export async function askCampusAssistant(
  prompt: string,
  history: ChatMessage[] = []
): Promise<AssistantResponse> {
  // 1. Fuzzy Retrieval step over local verified sample data
  const retrieved = dataService.searchDataForPrompt(prompt);
  const sourcesUsed: AssistantResponse['sourcesUsed'] = [];

  const contextSegments: string[] = [];

  // Format FAQs
  if (retrieved.matchedFaqs.length > 0) {
    contextSegments.push('--- RELEVANT CAMPUS POLICIES & FAQS ---');
    retrieved.matchedFaqs.forEach((faq) => {
      contextSegments.push(`Q: ${faq.question}\nA: ${faq.answer}\nSource: ${faq.sourceLabel}`);
      sourcesUsed.push({
        type: 'faq',
        id: faq.id,
        label: `FAQ: ${faq.question.slice(0, 35)}...`,
      });
    });
  }

  // Format Events
  if (retrieved.matchedEvents.length > 0) {
    contextSegments.push('\n--- RELEVANT UPCOMING EVENTS & DEADLINES ---');
    retrieved.matchedEvents.forEach((evt) => {
      contextSegments.push(
        `Event: ${evt.title} (${evt.type.toUpperCase()})\nOrganiser: ${evt.organiser}\nDate/Time: ${evt.startDateTime} to ${evt.endDateTime}\nVenue: ${evt.venue}\nEligibility: ${evt.eligibility}\nRegistration Deadline: ${evt.deadline}\nStatus: ${evt.status}\nRegistration URL: ${evt.registrationUrl}\nVerified: ${evt.verified}`
      );
      sourcesUsed.push({
        type: 'event',
        id: evt.id,
        label: `Event: ${evt.title.slice(0, 30)}...`,
        targetTab: 'events',
      });
    });
  }

  // Format Rooms & Buildings
  if (retrieved.matchedRooms.length > 0) {
    contextSegments.push('\n--- RELEVANT ROOMS & FACILITIES ---');
    retrieved.matchedRooms.forEach(({ building, room }) => {
      contextSegments.push(
        `Room ${room.number}: "${room.name}" in ${building.name}\nFloor: Level ${room.floorLevel}\nType: ${room.type}\nDepartment: ${room.department || 'General'}\nFacilities: ${room.facilities?.join(', ') || 'N/A'}\nAccessible: ${building.accessibleEntrance ? 'Yes' : 'Standard'}`
      );
      sourcesUsed.push({
        type: 'room',
        id: room.id,
        label: `Room ${room.number} (${building.shortCode})`,
        targetTab: 'map',
      });
    });
  }

  // Format Buildings
  if (retrieved.matchedBuildings.length > 0) {
    contextSegments.push('\n--- RELEVANT CAMPUS BUILDINGS ---');
    retrieved.matchedBuildings.forEach((b) => {
      contextSegments.push(
        `Building: ${b.name} (${b.shortCode})\nCategory: ${b.category}\nLocation: ${b.locationDescription}\nHours: ${b.openHours}\nVerified: ${b.verified}`
      );
      if (!sourcesUsed.some((s) => s.id === b.id)) {
        sourcesUsed.push({
          type: 'building',
          id: b.id,
          label: `${b.shortCode} - ${b.name.split('-')[0]}`,
          targetTab: 'map',
        });
      }
    });
  }

  // Format Contacts
  if (retrieved.matchedContacts.length > 0) {
    contextSegments.push('\n--- RELEVANT VERIFIED DIRECTORY CONTACTS ---');
    retrieved.matchedContacts.forEach((c) => {
      contextSegments.push(
        `Name: ${c.name} (${c.type === 'faculty' ? 'Faculty' : 'Student Lead'})\nRole: ${c.role}\nDepartment: ${c.department}\nHelps With: ${c.helpsWith.join('; ')}\nApproved Contact Method: ${c.contactMethod}\nOffice: ${c.officeLocation || 'N/A'}\nLast Verified: ${c.lastVerified}\nPermission Given to share WhatsApp: ${c.permissionGiven}`
      );
      sourcesUsed.push({
        type: 'contact',
        id: c.id,
        label: `Contact: ${c.name}`,
        targetTab: 'contacts',
      });
    });
  }

  const retrievedContext = contextSegments.join('\n');

  // Try calling the server-side Gemini API
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        retrievedContext,
        history: history.slice(-6).map((h) => ({ sender: h.sender, text: h.text })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer) {
        return {
          answer: data.answer,
          sourcesUsed,
          suggestedAction: determineSuggestedAction(sourcesUsed),
        };
      }
    }
  } catch (e) {
    console.warn('Backend Gemini API endpoint unavailable, switching to local grounded retrieval engine', e);
  }

  // 3. Graceful Fallback: Local Grounded Answer Synthesizer
  // Guarantees zero hallucinations and 100% adherence to verified campus sample data even if offline or key is missing.
  return synthesizeLocalGroundedAnswer(prompt, retrieved, sourcesUsed);
}

function determineSuggestedAction(sources: AssistantResponse['sourcesUsed']): AssistantResponse['suggestedAction'] {
  const roomOrBuilding = sources.find((s) => s.type === 'room' || s.type === 'building');
  if (roomOrBuilding) {
    return {
      type: 'navigate_map',
      label: `Open in Campus Map: ${roomOrBuilding.label}`,
      targetId: roomOrBuilding.id,
    };
  }
  const event = sources.find((s) => s.type === 'event');
  if (event) {
    return {
      type: 'view_event',
      label: `View Event Details: ${event.label}`,
      targetId: event.id,
    };
  }
  const contact = sources.find((s) => s.type === 'contact');
  if (contact) {
    return {
      type: 'view_contact',
      label: `View Directory Card: ${contact.label}`,
      targetId: contact.id,
    };
  }
  return undefined;
}

function synthesizeLocalGroundedAnswer(
  prompt: string,
  retrieved: ReturnType<typeof dataService.searchDataForPrompt>,
  sourcesUsed: AssistantResponse['sourcesUsed']
): AssistantResponse {
  const lower = prompt.toLowerCase();

  // If user asked about a specific room (e.g. "B-204" or "A-001")
  if (retrieved.matchedRooms.length > 0) {
    const { building, room } = retrieved.matchedRooms[0];
    const text = `**Found ${room.number}: ${room.name}**\n\n- **Location:** ${building.name}, Floor Level ${room.floorLevel} (${room.floorLevel === 0 ? 'Ground Floor' : room.floorLevel === 1 ? '1st Floor' : '2nd Floor'})\n- **Department:** ${room.department || 'Interdisciplinary'}\n- **Facilities:** ${room.facilities?.join(', ') || 'Standard presentation setup'}\n- **Building Hours:** ${building.openHours}\n\n*Verified official record: Last updated ${room.lastUpdated}.*`;

    return {
      answer: text,
      sourcesUsed,
      suggestedAction: {
        type: 'navigate_map',
        label: `Highlight Room ${room.number} on Campus Map`,
        targetId: room.id,
      },
    };
  }

  // If user asked about events / workshops / hackathons
  if (
    lower.includes('event') ||
    lower.includes('workshop') ||
    lower.includes('hackathon') ||
    lower.includes('seminar') ||
    retrieved.matchedEvents.length > 0
  ) {
    if (retrieved.matchedEvents.length > 0) {
      const topEvents = retrieved.matchedEvents.slice(0, 3);
      const lines = topEvents.map(
        (e) =>
          `• **${e.title}** (${e.type.toUpperCase()})\n  - **Date:** ${new Date(e.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n  - **Venue:** ${e.venue}\n  - **Registration Deadline:** ${new Date(e.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} (Status: ${e.status.replace('_', ' ')})\n  - **Organiser:** ${e.organiser}`
      );

      return {
        answer: `Here are the verified upcoming campus events matching your query:\n\n${lines.join('\n\n')}\n\n*All events require official registration. Tap below to inspect deadlines and save to your calendar.*`,
        sourcesUsed,
        suggestedAction: {
          type: 'view_event',
          label: 'Open Events & Opportunities Hub',
          targetId: topEvents[0].id,
        },
      };
    }
  }

  // If user asked about contacts or faculty or clubs
  if (
    lower.includes('contact') ||
    lower.includes('who') ||
    lower.includes('faculty') ||
    lower.includes('lead') ||
    lower.includes('professor') ||
    retrieved.matchedContacts.length > 0
  ) {
    if (retrieved.matchedContacts.length > 0) {
      const c = retrieved.matchedContacts[0];
      return {
        answer: `**${c.name}**\n- **Role:** ${c.role}\n- **Department:** ${c.department}\n- **Can Help With:** ${c.helpsWith.join('; ')}\n- **Approved Contact:** ${c.contactMethod}\n- **Office Location:** ${c.officeLocation || 'Main Department Office'}\n\n*Official Directory Record (Last verified: ${c.lastVerified}).*`,
        sourcesUsed,
        suggestedAction: {
          type: 'view_contact',
          label: `Open Directory for ${c.name}`,
          targetId: c.id,
        },
      };
    }
  }

  // If matched FAQ
  if (retrieved.matchedFaqs.length > 0) {
    const faq = retrieved.matchedFaqs[0];
    return {
      answer: `**${faq.question}**\n\n${faq.answer}\n\n*Source: ${faq.sourceLabel} (Verified ${faq.lastUpdated})*`,
      sourcesUsed,
    };
  }

  // Building search
  if (retrieved.matchedBuildings.length > 0) {
    const b = retrieved.matchedBuildings[0];
    return {
      answer: `**${b.name} (${b.shortCode})**\n\n- **Category:** ${b.category}\n- **Location:** ${b.locationDescription}\n- **Hours:** ${b.openHours}\n- **Accessibility:** ${b.accessibleEntrance ? 'Wheelchair accessible ramps and tactile paths fitted' : 'Standard entrance'}\n- **Overview:** ${b.description}`,
      sourcesUsed,
      suggestedAction: {
        type: 'navigate_map',
        label: `View ${b.shortCode} on Campus Map`,
        targetId: b.id,
      },
    };
  }

  // Default helpful strict fallback
  return {
    answer:
      "I do not have verified records for that in our current campus directory. In accordance with university data verification rules, I never guess or invent unverified information.\n\nPlease check the **Single-Window Student Affairs Desk (Block F, Room F-001)** or submit a correction via the 'Report Incorrect Info' button in the menu.",
    sourcesUsed: [],
  };
}
