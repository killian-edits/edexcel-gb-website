/**
 * General utility functions.
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge Tailwind classes with conflict resolution.
 * Lightweight alternative to tailwind-merge for simple cases.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a series identifier for display with its year.
 * e.g. ("june-2024") → "June 2024"
 * e.g. ("June", 2025) → "June 2025"
 * e.g. ("June 2025") → "June 2025"
 */
export function formatSeries(series: string, year?: number | null): string {
  if (!series) return year ? String(year) : '';

  const hyphenParts = series.split('-');
  if (hyphenParts.length === 2 && /^\d{4}$/.test(hyphenParts[1])) {
    const season = hyphenParts[0].charAt(0).toUpperCase() + hyphenParts[0].slice(1).toLowerCase();
    return `${season} ${hyphenParts[1]}`;
  }

  const spaceParts = series.trim().split(/\s+/);
  if (spaceParts.length >= 2 && /^\d{4}$/.test(spaceParts[spaceParts.length - 1])) {
    const season = spaceParts[0].charAt(0).toUpperCase() + spaceParts[0].slice(1).toLowerCase();
    return `${season} ${spaceParts.slice(1).join(' ')}`;
  }

  const capitalizedSeries = series.charAt(0).toUpperCase() + series.slice(1);
  if (year) {
    return `${capitalizedSeries} ${year}`;
  }
  return capitalizedSeries;
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Delay utility for async operations.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a stable unique ID for client components.
 */
let idCounter = 0;
export function generateId(prefix = 'bp'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

