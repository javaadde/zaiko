import { createContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferenceStore } from '@/stores/preference-store';
import type { ThemeColors, AccentOption, CornerPreset, ShadowStyle, TypeStyle, TypeVariant, SpacingKey } from '@/constants/tokens';
import type { ThemeMode, HeadlineOption } from '@/lib/mmkv';
import {
  lightColors,
  darkColors,
  accentPalettes,
  spacing,
  radii,
  cornerPresets,
  shadows,
  typeScale,
  fonts,
} from '@/constants/tokens';

export type Theme = {
  colors: ThemeColors;
  spacing: Record<SpacingKey, number>;
  radii: Record<RadiiKey, number>;
  shadows: typeof shadows;
  typography: Record<TypeVariant, TypeStyle>;
  fonts: typeof fonts;
  scheme: 'light' | 'dark';
  themeMode: ThemeMode;
  accent: AccentOption;
  corners: CornerPreset;
  headline: HeadlineOption;
};

export type RadiiKey = keyof typeof radii;

export const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = usePreferenceStore((s) => s.themeMode);
  const accent = usePreferenceStore((s) => s.accent);
  const corners = usePreferenceStore((s) => s.corners);
  const headline = usePreferenceStore((s) => s.headline);

  const scheme: 'light' | 'dark' =
    themeMode === 'auto'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themeMode;

  const theme = useMemo<Theme>(() => {
    const baseColors = scheme === 'dark' ? darkColors : lightColors;
    const accentColors = accentPalettes[accent][scheme];
    const colors: ThemeColors = {
      primary: baseColors.primary,
      primaryLight: baseColors.primaryLight,
      primaryDark: baseColors.primaryDark,
      primaryGlow: baseColors.primaryGlow,
      accent: accentColors.accent,
      accentLight: accentColors.accentLight,
      pastelYellow: baseColors.pastelYellow,
      pastelGreen: baseColors.pastelGreen,
      pastelPurple: baseColors.pastelPurple,
      pastelBlue: baseColors.pastelBlue,
      bg: baseColors.bg,
      bgCard: baseColors.bgCard,
      bgCardAlt: baseColors.bgCardAlt,
      bgSurface: baseColors.bgSurface,
      bgOverlay: baseColors.bgOverlay,
      bgPillBar: baseColors.bgPillBar,
      success: baseColors.success,
      successLight: baseColors.successLight,
      warning: baseColors.warning,
      warningLight: baseColors.warningLight,
      danger: baseColors.danger,
      dangerLight: baseColors.dangerLight,
      textPrimary: baseColors.textPrimary,
      textSecondary: baseColors.textSecondary,
      textMuted: baseColors.textMuted,
      textInverse: baseColors.textInverse,
      border: baseColors.border,
      borderActive: baseColors.borderActive,
      gradPrimary: baseColors.gradPrimary,
      gradAccent: baseColors.gradAccent,
      gradCard: baseColors.gradCard,
      gradDanger: baseColors.gradDanger,
      gradSuccess: baseColors.gradSuccess,
      gradDash: baseColors.gradDash,
    } as ThemeColors;

    return {
      colors,
      spacing,
      radii: { ...radii },
      shadows: { ...shadows },
      typography: { ...typeScale },
      fonts,
      scheme,
      themeMode,
      accent,
      corners,
      headline,
    };
  }, [scheme, themeMode, accent, corners, headline]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
