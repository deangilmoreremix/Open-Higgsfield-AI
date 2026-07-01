/**
 * Design System Tokens - Shared design primitives
 */

export const colors = {
  primary: 'oklch(35% 18% 300deg)',
  primaryHover: 'oklch(40% 18% 300deg)',
  background: 'oklch(6% 0.003 270deg)',
  surface: 'oklch(9% 0.003 270deg)',
  text: 'oklch(94% 0.005 270deg)',
  textSecondary: 'oklch(58% 0.01 270deg)',
  border: 'oklch(35% 0.005 270deg / 0.15)',
};

export const spacing = {
  headerHeight: '3.5rem',
  sidebarWidth: '240px',
  containerMaxWidth: '7xl',
};

export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};

export default {
  colors,
  spacing,
  typography,
};