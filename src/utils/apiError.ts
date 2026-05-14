import { STRINGS } from '../constants/app';

/** Maps axios / network failures to clear, user-facing copy. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: { message?: unknown } };
  };

  if (e.code === 'ECONNABORTED') {
    return STRINGS.network.timeout;
  }

  if (!e.response) {
    return STRINGS.network.unreachable;
  }
  const raw = e.response.data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (raw && typeof raw === 'object' && 'message' in raw && typeof (raw as { message: unknown }).message === 'string') {
    return (raw as { message: string }).message;
  }

  if (e.message && typeof e.message === 'string' && e.message !== 'Network Error') {
    return e.message;
  }

  return fallback;
}
