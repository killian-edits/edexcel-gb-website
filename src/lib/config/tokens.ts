/**
 * Design tokens — single source of truth for the design system.
 *
 * These values drive Tailwind's theme extension and are also
 * available as TypeScript constants for programmatic use
 * (e.g. chart colours in Recharts).
 */

export const colors = {
  background: '#FAFAFA',
  'background-secondary': '#F5F5F0',
  foreground: '#1A1A1A',
  'foreground-secondary': '#6B6B6B',
  accent: '#0284C7',
  'accent-hover': '#0369A1',
  'accent-light': '#E0F2FE',
  destructive: '#DC2626',
  'destructive-hover': '#B91C1C',
  success: '#16A34A',
  'success-light': '#DCFCE7',
  warning: '#D97706',
  'warning-light': '#FEF3C7',
  border: '#E5E5E5',
  'border-focus': '#0284C7',
  surface: '#FFFFFF',
} as const;

export const spacing = {
  /** 8 px base unit */
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const typography = {
  fontFamily: {
    body: 'Inter, system-ui, -apple-system, sans-serif',
    heading: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const;

export const layout = {
  maxWidth: '1440px',
  paddingMobile: '24px',
  paddingDesktop: '64px',
} as const;

/** Grade colour scale — never use colour alone to convey meaning */
export const gradeColors: Record<string, string> = {
  'A*': '#16A34A',
  A: '#22C55E',
  B: '#84CC16',
  C: '#EAB308',
  D: '#F97316',
  E: '#EF4444',
  F: '#DC2626',
  G: '#B91C1C',
  U: '#6B7280',
};

