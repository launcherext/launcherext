// Theme constants for Launch Ext (pump.fun inspired)

export const colors = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
  },
  accent: {
    green: '#00ff88',
    greenHover: '#00cc6a',
    greenDark: '#00aa55',
  },
  text: {
    primary: '#ffffff',
    secondary: '#888888',
    muted: '#555555',
  },
  border: {
    default: '#2a2a2a',
    hover: '#3a3a3a',
  },
  success: '#00ff88',
  error: '#ff4444',
  warning: '#ffaa00',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
} as const;
