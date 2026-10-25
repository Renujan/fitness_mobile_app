/**
 * FitTrack Design System Colors
 * High-contrast, premium dark mode palette
 */
export const Palette = {
  background: '#0B0F14',
  card: '#151B23',
  cardElevated: '#1C2430',
  cardBorder: '#232D3B',
  primary: '#B8FF65',          // Electric Volt Green
  primaryDark: '#96E044',
  primaryGlow: 'rgba(184, 255, 101, 0.15)',
  secondary: '#73DFFF',        // Neon Cyan
  secondaryDark: '#4AC8ED',
  secondaryGlow: 'rgba(115, 223, 255, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#929AA5',
  textMuted: '#5F6876',
  border: '#212833',
  divider: '#1A212A',
  danger: '#FF5A5F',
  dangerGlow: 'rgba(255, 90, 95, 0.15)',
  warning: '#FFB84C',
  success: '#B8FF65',
  info: '#73DFFF',
  inputBg: '#0F151C',
  inputBorder: '#232C3A',
  overlay: 'rgba(11, 15, 20, 0.85)',
};

export const Colors = {
  dark: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    card: Palette.card,
    border: Palette.border,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.primary,
  },
  light: {
    // FitTrack is optimized dark first; fallback retains sleek dark-balanced palette
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    card: Palette.card,
    border: Palette.border,
    tabIconDefault: Palette.textSecondary,
    tabIconSelected: Palette.primary,
  },
};

export default Colors;
