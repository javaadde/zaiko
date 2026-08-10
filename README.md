<h1 align="center">Zaiko</h1>

<div align="center">
  <img src="./images/zaiko rounded.png" alt="Zaiko Stocks logo" width="140" />

  <br />
  <br />

  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=111827" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

  <p>Mobile inventory and sales management for Zaiko Mobiles.</p>
</div>

## Overview

Zaiko is an Expo + React Native inventory app built for a mobile retail workflow. It combines stock tracking, sales handling, archived item management, and Firebase-backed authentication in one app.

## What It Does

- Dashboard with live inventory stats, top brands, estimated profit, and best-seller insights
- Add and edit stock with brand selection, pricing rules, IMEI, supplier, color, and product photos
- Browse inventory with search, brand filters, stock-status filters, and sorting
- Sell flow with verification screens and sales history
- Archive, restore, or delete retired stock
- Google, Apple, and email/password authentication
- Company onboarding and workspace setup
- Server connectivity check in Settings

## Tech Stack

- Expo Router
- React Native
- Firebase Auth, Firestore, Crashlytics, and Remote Config
- Cloudinary for direct image uploads
- Zustand for local state
- MMKV for fast persistence
- `lucide-react-native` for iconography
- `react-native-svg` for vector rendering

## Project Structure

- `app/` - Expo Router entry routes
- `src/screens/` - Screen-level UI
- `src/components/` - Shared UI components
- `src/services/` - Inventory and sales logic
- `src/stores/` - Auth and preference state
- `src/lib/` - Firebase, runtime config, and utilities
- `assets/logos/` - Brand logos used across the app
- `images/` - Primary project logo assets

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 11+
- Expo CLI-compatible environment
- Firebase project configured for Auth, Firestore, and Storage

### Install

```bash
pnpm install
```

### Firebase Setup

This project expects native Firebase config files in place:

- iOS: `GoogleService-Info.plist` at the project root
- Android: `android/app/google-services.json`

Also make sure these Firebase services are enabled:

- Authentication providers for Google, Apple, and email/password
- Firestore database
- Storage bucket if you still use Firebase Storage elsewhere

### Environment

The app can use a custom API base URL when needed:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api.example.com/api
```

If not set, the app uses the local development URL in development and the hosted production URL in release builds.

For image uploads, set:

```bash
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Run

```bash
pnpm start
```

Available targets:

```bash
pnpm android
pnpm ios
pnpm web
```

## Scripts

- `pnpm start` - Start Expo
- `pnpm android` - Launch on Android
- `pnpm ios` - Launch on iOS
- `pnpm web` - Launch in web mode
- `pnpm lint` - Run linting
- `pnpm deploy:rules` - Deploy Firestore rules
- `pnpm deploy:indexes` - Deploy Firestore indexes

## Brand Assets

The app includes local logo assets for the main brands used in inventory views and selectors:

- Apple
- Samsung
- Google
- Xiaomi
- OnePlus
- Vivo
- Oppo
- Motorola
- iQOO
- Realme

The new project logo files live in `images/`:

- `images/zaiko.png`
- `images/zaiko rounded.png`

## Notes

- The app uses Expo Router typed routes.
- Inventory images can be captured from camera or selected from the gallery.
- Success feedback includes an in-app confirmation sound.
- The Settings screen surfaces app version and backend connectivity.

## License

No license has been provided in this repository.
