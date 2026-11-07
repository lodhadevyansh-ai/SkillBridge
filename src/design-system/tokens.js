/**
 * SkillBridge Centralized Design System Tokens
 * Derived from Figma Prototype & Screen References
 */

export const colors = {
  // Brand & Accents
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5', // Main Primary Button & Brand
    700: '#4338CA', // Primary Hover
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  lavender: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
  },
  // Feedback & Status
  success: {
    lightBg: '#ECFDF5',
    lightText: '#065F46',
    lightBorder: '#A7F3D0',
    darkBg: 'rgba(6, 78, 59, 0.35)',
    darkText: '#34D399',
    darkBorder: 'rgba(52, 211, 153, 0.25)',
  },
  warning: {
    lightBg: '#FEF3C7',
    lightText: '#92400E',
    lightBorder: '#FDE68A',
    darkBg: 'rgba(120, 53, 15, 0.35)',
    darkText: '#FBBF24',
    darkBorder: 'rgba(251, 191, 36, 0.25)',
  },
  danger: {
    lightBg: '#FEE2E2',
    lightText: '#991B1B',
    lightBorder: '#FECACA',
    darkBg: 'rgba(127, 29, 29, 0.35)',
    darkText: '#F87171',
    darkBorder: 'rgba(248, 113, 113, 0.25)',
  },
  info: {
    lightBg: '#EFF6FF',
    lightText: '#1E40AF',
    lightBorder: '#BFDBFE',
    darkBg: 'rgba(30, 64, 175, 0.35)',
    darkText: '#60A5FA',
    darkBorder: 'rgba(96, 165, 250, 0.25)',
  },
  // Surfaces & Backgrounds
  canvas: {
    light: '#F8FAFC',
    dark: '#0B0D14',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#161928',
    darkElevated: '#1E2238',
  },
  border: {
    light: '#E2E8F0',
    lightSubtle: '#F1F5F9',
    dark: '#282D4A',
    darkSubtle: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    lightPrimary: '#0F172A',
    lightSecondary: '#64748B',
    lightMuted: '#94A3B8',
    darkPrimary: '#F8FAFC',
    darkSecondary: '#94A3B8',
    darkMuted: '#64748B',
  },
}

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 24px -4px rgba(79, 70, 229, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
}

export const radius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.25rem',// 20px
  full: '9999px',
}

export const typography = {
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  display: 'font-bold tracking-tight',
  heading: 'font-semibold tracking-tight',
  body: 'font-normal leading-relaxed',
  caption: 'text-xs font-medium tracking-wide',
}

