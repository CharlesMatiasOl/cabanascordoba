const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(s: unknown): s is string {
  return typeof s === "string" && RE_DATE.test(s);
}

/**
 * Comparación lexicográfica segura para YYYY-MM-DD
 * retorna:
 *  -1 si a < b
 *   0 si a == b
 *   1 si a > b
 */
export function compareDateStr(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function assertValidRange(from: unknown, to: unknown): { from: string; to: string } {
  if (!isValidDateString(from) || !isValidDateString(to)) {
    const err = new Error("Fechas inválidas. Usá formato YYYY-MM-DD (ej: 2026-01-20).");
    // @ts-ignore
    err.status = 400;
    throw err;
  }
  if (compareDateStr(to, from) <= 0) {
    const err = new Error("check_out (to) debe ser posterior a check_in (from). Mínimo 1 día.");
    // @ts-ignore
    err.status = 400;
    throw err;
  }
  return { from, to };
}

export function parseIntSafe(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

export function parseNumberSafe(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n)) return fallback;
  return n;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
