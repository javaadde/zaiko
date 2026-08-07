export const lightColors = {
  primary: '#000000',
  primaryLight: '#2D2D2D',
  primaryDark: '#000000',
  primaryGlow: 'rgba(0,0,0,0.05)',
  accent: '#E63946',
  accentLight: 'rgba(230, 57, 70, 0.1)',
  bg: '#EFF6FF',
  bgCard: '#FFFFFF',
  bgCardAlt: '#F1F3F5',
  bgSurface: '#FFFFFF',
  bgOverlay: 'rgba(255,255,255,0.9)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  textPrimary: '#121212',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  border: 'rgba(0,0,0,0.05)',
  borderActive: 'rgba(0,0,0,0.15)',
  gradPrimary: ['#222222', '#000000'],
  gradAccent: ['#FF4D6D', '#E63946'],
  gradCard: ['#FFFFFF', '#FFFFFF'],
  gradDanger: ['#FF6B6B', '#EE5253'],
  gradSuccess: ['#20BF6B', '#10AC84'],
  gradDash: ['#EFF6FF', '#DBEAFE'],
} as const;

export const darkColors = {
  ...lightColors,
  bg: '#0B1220',
  bgCard: '#111827',
  bgCardAlt: '#0F172A',
  bgSurface: '#111827',
  bgOverlay: 'rgba(17,24,39,0.9)',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(255,255,255,0.18)',
  primaryGlow: 'rgba(255,255,255,0.05)',
  gradDash: ['#0B1220', '#111827'],
} as const;

export const accentPalettes = {
  emerald: {
    light: { accent: '#10B981', accentLight: 'rgba(16,185,129,0.12)' },
    dark: { accent: '#34D399', accentLight: 'rgba(52,211,153,0.14)' },
  },
  ocean: {
    light: { accent: '#3B82F6', accentLight: 'rgba(59,130,246,0.12)' },
    dark: { accent: '#60A5FA', accentLight: 'rgba(96,165,250,0.14)' },
  },
  amber: {
    light: { accent: '#F59E0B', accentLight: 'rgba(245,158,11,0.12)' },
    dark: { accent: '#FBBF24', accentLight: 'rgba(251,191,36,0.14)' },
  },
  rose: {
    light: { accent: '#E63946', accentLight: 'rgba(230,57,70,0.12)' },
    dark: { accent: '#FB7185', accentLight: 'rgba(251,113,133,0.14)' },
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  medium: 12,
  large: 16,
} as const;

export type RadiiKey = keyof typeof radii;

export const cornerPresets = {
  standard: { card: 16, md: 12, sm: 8, pill: 9999 },
  rounded: { card: 24, md: 16, sm: 12, pill: 9999 },
  pill: { card: 9999, md: 9999, sm: 9999, pill: 9999 },
} as const;

export type CornerPreset = keyof typeof cornerPresets;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export type ShadowStyle = typeof shadows.card;

export const typeScale = {
  largeTitle: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38 },
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
  bg: string;
  bgCard: string;
  bgCardAlt: string;
  bgSurface: string;
  bgOverlay: string;
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
