/**
 * Utility functions for formatting dates in UTC timezone
 * to avoid timezone conversion issues (+2H problem)
 */

/**
 * Format a date string in UTC timezone
 * @param dateString - ISO date string from database
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string in UTC
 */
export function formatDateUTC(dateString: string, includeTime: boolean = false): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  // Get UTC components
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} à ${hours}:${minutes}`;
}

/**
 * Format a date string for display (date only, no time)
 * @param dateString - ISO date string from database
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  return formatDateUTC(dateString, false);
}

/**
 * Format a date string with time for display
 * @param dateString - ISO date string from database
 * @returns Formatted datetime string (DD/MM/YYYY à HH:mm)
 */
export function formatDateTime(dateString: string): string {
  return formatDateUTC(dateString, true);
}

/**
 * Format a date string for long display (with day name)
 * @param dateString - ISO date string from database
 * @returns Formatted date string with day name
 */
export function formatDateLong(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const monthNames = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const dayName = dayNames[date.getUTCDay()];
  const day = date.getUTCDate();
  const monthName = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${dayName} ${day} ${monthName} ${year} à ${hours}:${minutes}`;
}
