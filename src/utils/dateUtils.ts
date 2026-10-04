/**
 * Standard date formatting and manipulation utilities
 */

export function getTodayString(): string {
  const now = new Date();
  return formatDate(now);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatFriendlyDate(dateStr: string): string {
  const today = getTodayString();
  if (dateStr === today) {
    return 'Today';
  }
  const date = parseDateString(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatDate(yesterday)) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 || hour < 4) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name}`;
}
