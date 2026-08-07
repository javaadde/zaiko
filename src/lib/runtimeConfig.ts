import { Platform } from 'react-native';

const DEV_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  web: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

const PROD_BASE_URL = 'https://zaiko-stocks.onrender.com/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ||
  (typeof __DEV__ !== 'undefined' && __DEV__ ? DEV_BASE_URL : PROD_BASE_URL);

export const APP_VERSION = '1.0.0';
