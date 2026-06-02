export const Colors = {
  // Primary palette - crisp and modern
  primary: "#000000",
  primaryLight: "#2D2D2D",
  primaryDark: "#000000",
  primaryGlow: "rgba(0,0,0,0.05)",

  // Accent - for call to action and highlights
  accent: "#E63946", // A vibrant red/coral
  accentLight: "rgba(230, 57, 70, 0.1)",

  // Background layers - clean and spacious
  bg: "#EFF6FF",
  bgCard: "#FFFFFF",
  bgCardAlt: "#F1F3F5",
  bgSurface: "#FFFFFF",
  bgOverlay: "rgba(255,255,255,0.9)",

  // Status colors
  success: "#10B981",
  successLight: "rgba(16, 185, 129, 0.1)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.1)",
  danger: "#EF4444",
  dangerLight: "rgba(239, 68, 68, 0.1)",

  // Text
  textPrimary: "#121212",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Borders
  border: "rgba(0,0,0,0.05)",
  borderActive: "rgba(0,0,0,0.15)",

  // Gradients
  gradPrimary: ["#222222", "#000000"],
  gradAccent: ["#FF4D6D", "#E63946"],
  gradCard: ["#FFFFFF", "#FFFFFF"],
  gradDanger: ["#FF6B6B", "#EE5253"],
  gradSuccess: ["#20BF6B", "#10AC84"],
  gradDash: ["#EFF6FF", "#DBEAFE"],
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  nav: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
  },
};

export const BorderRadius = {
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  full: 9999,
};

