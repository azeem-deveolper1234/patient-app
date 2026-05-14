import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getExpoGoProjectConfig } from 'expo';
import { logDevApiBootstrap } from './config/environment';
/**
 * Metro / Expo Go debugger string se LAN IP nikaalo, e.g. "192.168.1.5:8081" -> "192.168.1.5"
 * Real phone + Expo Go: backend same Wi‑Fi par PC ke port 5000 par chal sakti hai.
 */
function extractLanIp(hostUri: string | undefined | null): string | null {
  if (!hostUri || typeof hostUri !== 'string') return null;
  const host = hostUri.split(':')[0]?.trim();
  if (host && /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
  return null;
}

function expoDevLanIp(): string | null {
  const fromExpoGo = extractLanIp(getExpoGoProjectConfig()?.debuggerHost);
  if (fromExpoGo) return fromExpoGo;
  return extractLanIp(Constants.expoConfig?.hostUri);
}

/**
 * API base URL, trailing slash ke bina, e.g. http://192.168.1.5:5000/api
 * 1) EXPO_PUBLIC_API_URL (.env) — tunnel / custom host ke liye
 * 2) Expo Go dev: Metro host ka LAN IP + port 5000
 * 3) Android emulator: 10.0.2.2
 * 4) iOS simulator / dev: localhost
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '').trim();
  if (fromEnv) return fromEnv;

  const lan = expoDevLanIp();
  if (lan) return `http://${lan}:5000/api`;

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = resolveBaseUrl();
logDevApiBootstrap(API_BASE_URL);