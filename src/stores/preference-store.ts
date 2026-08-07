import { create } from 'zustand';
import type { PreferenceStore, PreferenceState } from './types';
import {
  getThemeMode,
  setThemeMode,
  getAccent,
  setAccent,
  getCorners,
  setCorners,
  getHeadline,
  setHeadline,
  getUserName,
  setUserName,
  getHaptics,
  setHaptics,
} from '@/lib/mmkv';

const loadPreferences = (): PreferenceState => ({
  themeMode: getThemeMode(),
  accent: getAccent(),
  corners: getCorners(),
  headline: getHeadline(),
  userName: getUserName() ?? '',
  haptics: getHaptics(),
});

export const usePreferenceStore = create<PreferenceStore>((set) => ({
  ...loadPreferences(),
  setThemeMode: (mode) => {
    setThemeMode(mode);
    set({ themeMode: mode });
  },
  setAccent: (accent) => {
    setAccent(accent);
    set({ accent });
  },
  setCorners: (corners) => {
    setCorners(corners);
    set({ corners });
  },
  setHeadline: (headline) => {
    setHeadline(headline);
    set({ headline });
  },
  setUserName: (name) => {
    setUserName(name);
    set({ userName: name });
  },
  setHaptics: (enabled) => {
    setHaptics(enabled);
    set({ haptics: enabled });
  },
}));
