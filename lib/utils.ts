import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date based on current locale
 * @param date - Date string or Date object
 * @param locale - Current locale (ja or en)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  locale: string = 'ja',
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Default options for different contexts
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    month: 'short',
    day: 'numeric'
  };

  // Map locale to proper locale code
  const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';
  
  return dateObj.toLocaleDateString(localeCode, defaultOptions);
}

/**
 * Format relative time (e.g., "2 days ago", "3時間前")
 * @param date - Date string or Date object
 * @param locale - Current locale (ja or en)
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'ja'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Define time units in seconds
  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  for (const { unit, seconds } of units) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const localeCode = locale === 'ja' ? 'ja-JP' : 'en-US';
      const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });
      return rtf.format(-interval, unit as Intl.RelativeTimeFormatUnit);
    }
  }
  
  // Just now
  return locale === 'ja' ? 'たった今' : 'just now';
}
