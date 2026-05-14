const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmpty(s: string): boolean {
  return s.trim().length > 0;
}

export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(s.trim().toLowerCase());
}
