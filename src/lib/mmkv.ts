import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'takeone.preferences' });

export const KEYS = {
  themeMode: 'takeone.themeMode',
  accent: 'takeone.accent',
  corners: 'takeone.corners',
  headline: 'takeone.headline',
  userName: 'takeone.userName',
  haptics: 'takeone.haptics',
  pendingInviteCode: 'takeone.pendingInviteCode',
  activeCompanyId: 'takeone.activeCompanyId',
  activeEnvironmentId: 'takeone.activeEnvironmentId',
} as const;

export type ThemeMode = 'light' | 'dark' | 'auto';

export function getThemeMode(): ThemeMode {
  return (storage.getString(KEYS.themeMode) as ThemeMode | undefined) ?? 'auto';
}

export function setThemeMode(mode: ThemeMode) {
  storage.set(KEYS.themeMode, mode);
}

export type AccentOption = 'emerald' | 'ocean' | 'amber' | 'rose';

export function getAccent(): AccentOption {
  return (storage.getString(KEYS.accent) as AccentOption | undefined) ?? 'emerald';
}

export function setAccent(accent: AccentOption) {
  storage.set(KEYS.accent, accent);
}

export function getCorners(): 'standard' | 'rounded' | 'pill' {
  return (storage.getString(KEYS.corners) as 'standard' | 'rounded' | 'pill' | undefined) ?? 'standard';
}

export function setCorners(corners: 'standard' | 'rounded' | 'pill') {
  storage.set(KEYS.corners, corners);
}

export type HeadlineOption = 'system' | 'editorial';

export function getHeadline(): HeadlineOption {
  return (storage.getString(KEYS.headline) as HeadlineOption | undefined) ?? 'system';
}

export function setHeadline(headline: HeadlineOption) {
  storage.set(KEYS.headline, headline);
}

export function getUserName(): string | undefined {
  return storage.getString(KEYS.userName);
}

export function setUserName(name: string) {
  storage.set(KEYS.userName, name);
}

export function getHaptics(): boolean {
  return storage.getBoolean(KEYS.haptics) ?? true;
}

export function setHaptics(enabled: boolean) {
  storage.set(KEYS.haptics, enabled);
}

export function getActiveCompanyId(): string | undefined {
  return storage.getString(KEYS.activeCompanyId);
}

export function setActiveCompanyId(companyId: string) {
  storage.set(KEYS.activeCompanyId, companyId);
}

export function getActiveEnvironmentId(): string | undefined {
  return storage.getString(KEYS.activeEnvironmentId);
}

export function setActiveEnvironmentId(environmentId: string) {
  storage.set(KEYS.activeEnvironmentId, environmentId);
}
