export const lightColors = {
  primary: '#18191E',
  primaryLight: '#2D2F38',
  primaryDark: '#0E0F13',
  primaryGlow: 'rgba(243, 232, 121, 0.2)',
  accent: '#F3E879', // Pastel Gold/Yellow from mockup
  accentLight: 'rgba(243, 232, 121, 0.25)',
  pastelYellow: '#F3E879',
  pastelGreen: '#5EEA9A',
  pastelPurple: '#9C8FFF',
  pastelBlue: '#8C86FF',
  bg: '#EBE8DB', // Warm soft olive beige from light mockup
  bgCard: '#FFFFFF',
  bgCardAlt: '#F5F4EC',
  bgSurface: '#FFFFFF',
  bgOverlay: 'rgba(255,255,255,0.92)',
  bgPillBar: '#1C1D23', // Dark capsule floating bottom bar
  success: '#5EEA9A',
  successLight: 'rgba(94, 234, 154, 0.18)',
  warning: '#F3E879',
  warningLight: 'rgba(243, 232, 121, 0.2)',
  danger: '#FF6B6B',
  dangerLight: 'rgba(255, 107, 107, 0.15)',
  textPrimary: '#18191E',
  textSecondary: '#787D8A',
  textMuted: '#A0A5B2',
  textInverse: '#FFFFFF',
  border: 'rgba(0,0,0,0.06)',
  borderActive: 'rgba(0,0,0,0.15)',
  gradPrimary: ['#282A33', '#18191E'],
  gradAccent: ['#F6ED8F', '#F3E879'],
  gradCard: ['#FFFFFF', '#FFFFFF'],
  gradDanger: ['#FF6B6B', '#EE5253'],
  gradSuccess: ['#69F1A2', '#5EEA9A'],
  gradDash: ['#EBE8DB', '#E4E0D2'],
} as const;

export const darkColors = {
  ...lightColors,
  primary: '#FFFFFF',
  primaryLight: '#E2E8F0',
  primaryDark: '#FFFFFF',
  primaryGlow: 'rgba(94, 234, 154, 0.15)',
  bg: '#15171E', // Dark obsidian matte background
  bgCard: '#23252E', // Dark slate rounded card background
  bgCardAlt: '#2B2D37',
  bgSurface: '#23252E',
  bgOverlay: 'rgba(23, 25, 32, 0.95)',
  bgPillBar: '#1C1D23',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E95A5',
  textMuted: '#5C6272',
  textInverse: '#18191E',
  border: 'rgba(255,255,255,0.07)',
  borderActive: 'rgba(255,255,255,0.18)',
  gradDash: ['#15171E', '#23252E'],
} as const;

export const accentPalettes = {
  emerald: {
    light: { accent: '#5EEA9A', accentLight: 'rgba(94,234,154,0.2)' },
    dark: { accent: '#5EEA9A', accentLight: 'rgba(94,234,154,0.2)' },
  },
  ocean: {
    light: { accent: '#9C8FFF', accentLight: 'rgba(156,143,255,0.2)' },
    dark: { accent: '#9C8FFF', accentLight: 'rgba(156,143,255,0.2)' },
  },
  amber: {
    light: { accent: '#F3E879', accentLight: 'rgba(243,232,121,0.25)' },
    dark: { accent: '#F3E879', accentLight: 'rgba(243,232,121,0.25)' },
  },
  rose: {
    light: { accent: '#FF6B6B', accentLight: 'rgba(255,107,107,0.2)' },
    dark: { accent: '#FF6B6B', accentLight: 'rgba(255,107,107,0.2)' },
  },
} as const;

export type AccentOption = keyof typeof accentPalettes;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  card: 28,
  full: 9999,
  medium: 16,
  large: 28,
} as const;

export type RadiiKey = keyof typeof radii;

export const cornerPresets = {
  standard: { card: 28, md: 16, sm: 10, pill: 9999 },
  rounded: { card: 32, md: 20, sm: 12, pill: 9999 },
  pill: { card: 9999, md: 9999, sm: 9999, pill: 9999 },
} as const;

export type CornerPreset = keyof typeof cornerPresets;

export const shadows = {
  card: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export type ShadowStyle = typeof shadows.card;

export const typeScale = {
  largeTitle: { fontSize: 34, fontWeight: '800' as const, lineHeight: 40 },
  title: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  headline: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  callout: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18 },
  footnote: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '600' as const, lineHeight: 14 },
} as const;

export type TypeVariant = keyof typeof typeScale;
export type TypeStyle = (typeof typeScale)[TypeVariant];

export const fonts = {
  regular: 'System',
  editorial: 'System',
} as const;

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;
  accent: string;
  accentLight: string;
  pastelYellow: string;
  pastelGreen: string;
  pastelPurple: string;
  pastelBlue: string;
  bg: string;
  bgCard: string;
  bgCardAlt: string;
  bgSurface: string;
  bgOverlay: string;
  bgPillBar: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderActive: string;
  gradPrimary: readonly [string, string];
  gradAccent: readonly [string, string];
  gradCard: readonly [string, string];
  gradDanger: readonly [string, string];
  gradSuccess: readonly [string, string];
  gradDash: readonly [string, string];
};

export const Colors = lightColors;
export const BorderRadius = radii;
