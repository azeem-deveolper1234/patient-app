function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function localDateInputValue(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** `YYYY-MM-DD` ko local noon par map karo — ISO string UTC shift se galat din nahi aata */
export function dateFromLocalInput(ymd: string, fallback = new Date()): Date {
  const s = String(ymd || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, mo, d] = s.split('-').map((x) => parseInt(x, 10));
    const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
    return Number.isNaN(dt.getTime()) ? fallback : dt;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? fallback : dt;
}
