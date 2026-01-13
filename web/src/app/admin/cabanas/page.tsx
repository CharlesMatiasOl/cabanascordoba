"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { adminListCabins, adminMe, adminSetCabinActive, CabinSummary } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { formatMoneyARS } from "@/lib/dates";
import { useToast } from "@/components/Toast";
import Switch from "@/components/Switch";

type FilterTab = "todas" | "activas" | "inactivas" | "destacadas";
type SortMode = "newest" | "price_asc" | "price_desc" | "title_asc";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function AdminCabinsPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CabinSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // UX state
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<FilterTab>("todas");
  const [sort, setSort] = useState<SortMode>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((x: any) => x.is_active).length;
    const featured = items.filter((x: any) => x.is_featured).length;
    return { total, active, featured };
  }, [items]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      await adminMe();
      const resp = await adminListCabins({ page: 1, limit: 200 });
      setItems(resp.data);
    } catch (e: any) {
      const msg = e?.message ?? "No se pudo cargar";
      setError(msg);

      const low = String(msg).toLowerCase();
      if (low.includes("no autenticado") || low.includes("sesión")) {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: number, current: boolean) {
    try {
      setBusyId(id);
      const resp = await adminSetCabinActive(id, !current);
      toast.success("Estado actualizado", resp.is_active ? "Cabaña activada." : "Cabaña desactivada.");
      await load();
    } catch (e: any) {
      toast.error("No se pudo actualizar estado", e?.message ?? "Intentá de nuevo.");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros
  const filtered = useMemo(() => {
    const query = normalize(q);

    let arr = [...items];

    // Tab
    if (tab === "activas") arr = arr.filter((x: any) => !!x.is_active);
    if (tab === "inactivas") arr = arr.filter((x: any) => !x.is_active);
    if (tab === "destacadas") arr = arr.filter((x: any) => !!x.is_featured);

    // Search
    if (query) {
      arr = arr.filter((x: any) => {
        const hay = `${x.title} ${x.city} ${x.province}`.toLowerCase();
        return hay.includes(query);
      });
    }

    // Sort (sin tocar API)
    if (sort === "price_asc") {
      arr.sort((a: any, b: any) => (a.price_per_night ?? 0) - (b.price_per_night ?? 0));
    } else if (sort === "price_desc") {
      arr.sort((a: any, b: any) => (b.price_per_night ?? 0) - (a.price_per_night ?? 0));
    } else if (sort === "title_asc") {
      arr.sort((a: any, b: any) => String(a.title).localeCompare(String(b.title), "es"));
    } else {
      // newest: respetamos el orden que llega (normalmente por id desc o created_at desc)
      // no hacemos nada
    }

    return arr;
  }, [items, q, tab, sort]);

  // Paginación visual
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  // cuando cambian filtros, volvemos a page 1
  useEffect(() => {
    setPage(1);
  }, [q, tab, sort]);

  function TabButton({ value, label }: { value: FilterTab; label: string }) {
    const active = tab === value;
    return (
      <button
        type="button"
        onClick={() => setTab(value)}
        className={active ? "btn-primary px-3 py-2" : "btn-secondary px-3 py-2"}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Panel Admin</h1>
            <p className="text-sm text-slate-600">
              {stats.total} cabañas • {stats.active} activas • {stats.featured} destacadas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className="btn-secondary">
              Refrescar
            </button>

            <Link href="/admin/cabanas/nueva" className="btn-primary">
              Nueva cabaña
            </Link>
          </div>
        </div>

        <AdminNav />

        {/* Controles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <label className="space-y-1 block">
              <div className="label">Buscar</div>
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por título, ciudad o provincia..."
              />
              <p className="help"></p>
            </label>
          </div>

          <div className="lg:col-span-3">
            <label className="space-y-1 block">
              <div className="label">Orden</div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="input bg-white">
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="title_asc">Título: A → Z</option>
              </select>
            </label>
          </div>

          <div className="lg:col-span-2 flex items-center justify-stretch gap-2 pt-4">
  <button
    type="button"
    className="btn-secondary w-full"
    onClick={() => {
      setQ("");
      setTab("todas");
      setSort("newest");
    }}
  >
    Limpiar filtros
  </button>
</div>

        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <TabButton value="todas" label={`Todas (${items.length})`} />
          <TabButton value="activas" label={`Activas (${items.filter((x: any) => x.is_active).length})`} />
          <TabButton value="inactivas" label={`Inactivas (${items.filter((x: any) => !x.is_active).length})`} />
          <TabButton value="destacadas" label={`Destacadas (${items.filter((x: any) => x.is_featured).length})`} />
        </div>
      </div>

      {loading ? (
        <div className="card p-6">Cargando...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="font-semibold">Error</div>
          <div className="text-sm mt-1">{error}</div>
          <div className="mt-3">
            <Link href="/admin/login" className="btn-secondary">
              Ir a login
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-6 space-y-2">
          <div className="font-semibold">No hay resultados</div>
          <div className="text-sm text-slate-700">
            Probá cambiar el filtro o buscar con otra palabra.
          </div>
        </div>
      ) : (
        <>
          {/* Tabla */}
          <div className="card overflow-hidden">
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <div className="col-span-5 p-3">Cabaña</div>
              <div className="col-span-2 p-3">Precio</div>
              <div className="col-span-2 p-3">Estado</div>
              <div className="col-span-3 p-3 text-right">Acciones</div>
            </div>

            {paged.map((c: any) => (
              <div key={c.id} className="grid grid-cols-12 border-b border-slate-100">
                <div className="col-span-5 p-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{c.title}</div>
                    {c.is_featured ? <span className="badge-amber">Destacada</span> : null}
                  </div>
                  <div className="text-xs text-slate-500">
                    {c.city}, {c.province} • ID {c.id}
                  </div>
                </div>

                <div className="col-span-2 p-3 text-sm">{formatMoneyARS(c.price_per_night)}</div>

                <div className="col-span-2 p-3">
                  <Switch
                    checked={!!c.is_active}
                    disabled={busyId === c.id}
                    onChange={() => toggleActive(c.id, !!c.is_active)}
                    label={busyId === c.id ? "Actualizando..." : c.is_active ? "Activa" : "Inactiva"}
                  />
                </div>

                <div className="col-span-3 p-3 flex items-center justify-end gap-2">
                  <Link href={`/admin/cabanas/${c.id}/editar`} className="btn-secondary px-3 py-2">
                    Editar
                  </Link>

                  <Link href={`/admin/cabanas/${c.id}/bloqueos`} className="btn-secondary px-3 py-2">
                    Bloqueos
                  </Link>

                  <Link href={`/cabanas/${c.id}`} className="btn-ghost px-3 py-2">
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Mostrando {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} de {filtered.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>

              <span className="text-sm text-slate-700">
                Página <span className="font-semibold">{safePage}</span> / {totalPages}
              </span>

              <button
                type="button"
                className="btn-secondary"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
