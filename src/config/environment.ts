/** Axios request timeout (ms). */
export const API_TIMEOUT_MS = 25_000;

let didLogBootstrap = false;

/** Dev only: confirms which base URL the bundle is using (helps device / LAN setup). */
export function logDevApiBootstrap(baseUrl: string): void {
  if (!__DEV__ || didLogBootstrap) return;
  didLogBootstrap = true;
  // eslint-disable-next-line no-console -- intentional dev-only operator hint
  console.log(`[patient-app] API_BASE_URL = ${baseUrl}`);
}
