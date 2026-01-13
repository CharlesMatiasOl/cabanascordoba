import Link from "next/link";
import CabinCard from "@/components/CabinCard";
import DateRangePicker from "@/components/DateRangePicker";
import { apiListCabins, CabinSort } from "@/lib/api";
import { nightsBetween } from "@/lib/dates";
import Image from "next/image";

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumber(v: unknown): number | undefined {
  const s = asString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    const str = String(v);
    if (str === "") continue;
    sp.set(k, str);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function chip(label: string, value?: string) {
  if (!value) return null;
  return (
    <span className="badge-slate">
      <span className="text-slate-500">{label}:</span> {value}
    </span>
  );
}

export default async function CabinsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const from = asString(searchParams.from);
  const to = asString(searchParams.to);

  const guests = asNumber(searchParams.guests);
  const minPrice = asNumber(searchParams.minPrice);
  const maxPrice = asNumber(searchParams.maxPrice);

  const page = Math.max(1, asNumber(searchParams.page) ?? 1);
  const limit = Math.min(24, Math.max(6, asNumber(searchParams.limit) ?? 12));

  const sortRaw = asString(searchParams.sort) as CabinSort;
  const sort: CabinSort =
    sortRaw === "price_asc" || sortRaw === "price_desc" || sortRaw === "newest"
      ? sortRaw
      : "newest";

  let error: string | null = null;

  // Validaciones UX (sin tocar lógica backend)
  if ((from && !to) || (!from && to)) {
    error = "Para filtrar por disponibilidad, completá check-in y check-out.";
  } else if (from && to) {
    const n = nightsBetween(from, to);
    if (n < 1) error = "";
  }

  const resp = error
    ? { data: [], page, limit, total: 0 }
    : await apiListCabins({
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
        sort,
        guests: guests || undefined,
        minPrice,
        maxPrice,
      });

  const totalPages = Math.max(1, Math.ceil((resp.total || 0) / limit));

  const hasFilters =
    !!from ||
    !!to ||
    typeof guests === "number" ||
    typeof minPrice === "number" ||
    typeof maxPrice === "number" ||
    sort !== "newest";

  const baseParams = {
    from: from || undefined,
    to: to || undefined,
    guests: guests || undefined,
    minPrice,
    maxPrice,
    sort: sort || undefined,
    limit,
  };

  const prevHref =
    page > 1 ? `/cabanas${buildQuery({ ...baseParams, page: page - 1 })}` : null;
  const nextHref =
    page < totalPages ? `/cabanas${buildQuery({ ...baseParams, page: page + 1 })}` : null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cabañas</h1>
          <p className="text-sm text-slate-600">
            Elegí fechas para ver disponibilidad real.
          </p>
        </div>

        <div className="text-sm text-slate-600">
          {resp.total ? `${resp.total} resultados` : ""}
        </div>
      </div>

      <form method="get" className="card p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <DateRangePicker fromDefault={from} toDefault={to} />
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <label className="space-y-1">
              <div className="label">Huéspedes (mín.)</div>
              <input
                type="number"
                name="guests"
                defaultValue={guests ?? ""}
                min={1}
                className="input"
                placeholder="Ej: 4"
              />
            </label>

            <label className="space-y-1">
              <div className="label">Precio mín.</div>
              <input
                type="number"
                name="minPrice"
                defaultValue={minPrice ?? ""}
                min={0}
                className="input"
                placeholder="Ej: 50000"
              />
            </label>

            <label className="space-y-1">
              <div className="label">Precio máx.</div>
              <input
                type="number"
                name="maxPrice"
                defaultValue={maxPrice ?? ""}
                min={0}
                className="input"
                placeholder="Ej: 90000"
              />
            </label>

            <label className="space-y-1">
              <div className="label">Orden</div>
              <select name="sort" defaultValue={sort} className="input bg-white">
                <option value="newest">Más nuevas</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
            </label>
          </div>
        </div>

        {/* Mantener page/limit controlados por query */}
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="limit" value={String(limit)} />

        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={!!error}>
              Buscar
            </button>

            <a href="/cabanas" className="btn-secondary">
              Limpiar
            </a>

            {error ? <span className="text-sm text-red-600">{error}</span> : null}
          </div>

          {hasFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {chip("Desde", from)}
              {chip("Hasta", to)}
              {chip("Huéspedes", typeof guests === "number" ? String(guests) : undefined)}
              {chip("Precio mín.", typeof minPrice === "number" ? String(minPrice) : undefined)}
              {chip("Precio máx.", typeof maxPrice === "number" ? String(maxPrice) : undefined)}
              {chip("Orden", sort !== "newest" ? sort : undefined)}
              {chip("Límite", String(limit))}
            </div>
          ) : (
            <div className="help">
              Tip: si no elegís fechas, se listan cabañas.
            </div>
          )}
        </div>

        <p className="help">
          
        </p>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      ) : resp.data.length === 0 ? (
        <div className="card p-6 space-y-2">
          <div className="font-semibold">No encontramos resultados</div>
          <div className="text-sm text-slate-700">
            Probá ampliar el rango de fechas, subir el precio máximo o bajar huéspedes mínimos.
          </div>
          <div>
            <a href="/cabanas" className="btn-secondary mt-2">
              Limpiar filtros
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resp.data.map((c) => (
              <CabinCard key={c.id} cabin={c} />
            ))}
          </div>

          {/* Paginación real */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Página <span className="font-semibold">{page}</span> de{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              {prevHref ? (
                <Link href={prevHref} className="btn-secondary">
                  Anterior
                </Link>
              ) : (
                <button className="btn-secondary" disabled>
                  Anterior
                </button>
              )}

              {nextHref ? (
                <Link href={nextHref} className="btn-secondary">
                  Siguiente
                </Link>
              ) : (
                <button className="btn-secondary" disabled>
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
