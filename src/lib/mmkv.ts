declare const require: any;

type StorageLike = {
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  set: (key: string, value: string | boolean) => void;
};

function createFallbackStorage(): StorageLike {
  const values = new Map<string, string | boolean>();

  return {
    getString: (key) => {
      const value = values.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getBoolean: (key) => {
      const value = values.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    set: (key, value) => {
      values.set(key, value);
    },
  };
}

export const storage: StorageLike = (() => {
  try {
    const { createMMKV } = require('react-native-mmkv');
    return createMMKV({ id: 'zaiko.preferences' });
  } catch {
    return createFallbackStorage();
  }
})();

export const KEYS = {
  themeMode: 'zaiko.themeMode',
  accent: 'zaiko.accent',
  corners: 'zaiko.corners',
  headline: 'zaiko.headline',
  userName: 'zaiko.userName',
  haptics: 'zaiko.haptics',
  pendingInviteCode: 'zaiko.pendingInviteCode',
  activeCompanyId: 'zaiko.activeCompanyId',
  activeEnvironmentId: 'zaiko.activeEnvironmentId',
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
