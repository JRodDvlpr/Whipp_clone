// Week helpers. Weeks run Monday → Sunday and are keyed by the Monday's local ISO date.

const pad = (n: number) => String(n).padStart(2, '0');

export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function weekStart(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - dow);
  return isoDate(date);
}

export function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export const addWeeks = (iso: string, n: number) => addDays(iso, n * 7);

export const dayDate = (week: string, day: number) => parseIso(addDays(week, day));

/** Today's index in the week (0 = Mon) if `week` is the current week, else -1. */
export function todayIndex(week: string, now = new Date()): number {
  if (weekStart(now) !== week) return -1;
  return (now.getDay() + 6) % 7;
}

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 7 – 13" or "Aug 31 – Sep 6". */
export function weekRange(week: string): string {
  const a = parseIso(week);
  const b = parseIso(addDays(week, 6));
  if (a.getMonth() === b.getMonth()) return `${MONTH[a.getMonth()]} ${a.getDate()} – ${b.getDate()}`;
  return `${MONTH[a.getMonth()]} ${a.getDate()} – ${MONTH[b.getMonth()]} ${b.getDate()}`;
}

export const shortDate = (d: Date) => `${MONTH[d.getMonth()]} ${d.getDate()}`;

/** "This week", "Next week", "Last week", "In 2 weeks", or the range. */
export function weekLabel(week: string, now = new Date()): string {
  const cur = weekStart(now);
  const diff = Math.round((parseIso(week).getTime() - parseIso(cur).getTime()) / (7 * 864e5));
  if (diff === 0) return 'This week';
  if (diff === 1) return 'Next week';
  if (diff === -1) return 'Last week';
  if (diff > 1) return `In ${diff} weeks`;
  return weekRange(week);
}
