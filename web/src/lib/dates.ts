const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(s: unknown): s is string {
  return typeof s === "string" && RE_DATE.test(s);
}

/**
 * Calcula noches entre dos fechas (YYYY-MM-DD), asumiendo [from, to)
 * Ej:
 *  from=2026-01-20, to=2026-01-21 => 1 noche
 */
export function nightsBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  const ms = b.getTime() - a.getTime();
  const nights = Math.floor(ms / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) ? nights : 0;
}

export function formatMoneyARS(n: number): string {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `$ ${Math.round(n)}`;
  }
}
