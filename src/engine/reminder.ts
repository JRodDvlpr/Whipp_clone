import type { Reminder } from '../types';

const DAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const pad = (n: number) => String(n).padStart(2, '0');

/** Next date (local) that falls on the reminder's weekday and time. */
export function nextOccurrence(r: Reminder, now = new Date()): Date {
  const [h, m] = r.time.split(':').map(Number);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const dow = (d.getDay() + 6) % 7;
  let add = (r.day - dow + 7) % 7;
  if (add === 0 && d <= now) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

const local = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

/**
 * A weekly calendar event with an alert. Opening it on an iPhone offers "Add to Calendar",
 * which gives a real phone notification without any server — the app itself stays offline.
 */
export function reminderIcs(r: Reminder, appUrl: string, now = new Date()): string {
  const start = nextOccurrence(r, now);
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Whipp clone//Weekly reminder//EN',
    'BEGIN:VEVENT',
    'UID:whipp-weekly-reminder@whipp-clone',
    `DTSTAMP:${stamp}`,
    `DTSTART:${local(start)}`,
    'DURATION:PT15M',
    `RRULE:FREQ=WEEKLY;BYDAY=${DAY_CODES[r.day]}`,
    "SUMMARY:Plan next week's meals 🥗",
    `DESCRIPTION:Open Whipp to plan next week and get your grocery list: ${appUrl}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0M',
    'ACTION:DISPLAY',
    "DESCRIPTION:Plan next week's meals",
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** "Sundays at 5:00 PM" */
export function reminderLabel(r: Reminder): string {
  const days = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
  const [h, m] = r.time.split(':').map(Number);
  const t = new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${days[r.day]} at ${t}`;
}
