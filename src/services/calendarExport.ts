import { Event } from '../types';

/**
 * Format Date to iCalendar UTC string format: YYYYMMDDTHHMMSSZ
 */
function formatDateToICS(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Sanitize text for iCalendar syntax
 */
function cleanIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate .ics content for one or multiple events
 */
export function generateICSContent(events: Event[]): string {
  const now = formatDateToICS(new Date().toISOString());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusTrace//Team Offshore//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((evt) => {
    const startStr = formatDateToICS(evt.startDateTime);
    const endStr = evt.endDateTime ? formatDateToICS(evt.endDateTime) : startStr;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${evt.id}-${Date.now()}@campustrace.offshore-univ.edu`,
      `DTSTAMP:${now}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${cleanIcsText(evt.title)}`,
      `DESCRIPTION:${cleanIcsText(evt.description + `\\n\\nOrganiser: ${evt.organiser}\\nOfficial Link: ${evt.registrationUrl}`)}`,
      `LOCATION:${cleanIcsText(evt.venue)}`,
      `URL:${evt.registrationUrl || evt.sourceUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers browser download of .ics file
 */
export function downloadICSFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate Google Calendar web add link
 */
export function getGoogleCalendarUrl(evt: Event): string {
  const start = formatDateToICS(evt.startDateTime);
  const end = evt.endDateTime ? formatDateToICS(evt.endDateTime) : start;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evt.title,
    dates: `${start}/${end}`,
    details: `${evt.description}\n\nOrganiser: ${evt.organiser}\nRegistration: ${evt.registrationUrl}\nSource: ${evt.sourceUrl}`,
    location: evt.venue,
    sprop: 'website:campustrace.offshore-univ.edu',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
