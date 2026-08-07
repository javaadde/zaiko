export type PreferenceState = {
  themeMode: 'light' | 'dark' | 'auto';
  accent: 'emerald' | 'ocean' | 'amber' | 'rose';
  corners: 'standard' | 'rounded' | 'pill';
  headline: 'system' | 'editorial';
  userName: string;
  haptics: boolean;
};

export type PreferenceActions = {
  setThemeMode: (mode: PreferenceState['themeMode']) => void;
  setAccent: (accent: PreferenceState['accent']) => void;
  setCorners: (corners: PreferenceState['corners']) => void;
  setHeadline: (headline: PreferenceState['headline']) => void;
  setUserName: (name: string) => void;
  setHaptics: (enabled: boolean) => void;
};

export type PreferenceStore = PreferenceState & PreferenceActions;
