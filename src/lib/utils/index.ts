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
 * Format a series identifier for display.
 * e.g. "june-2024" → "June 2024"
 */
export function formatSeries(series: string): string {
  const parts = series.split('-');
  if (parts.length !== 2) return series;
  const [season, year] = parts;
  return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
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

