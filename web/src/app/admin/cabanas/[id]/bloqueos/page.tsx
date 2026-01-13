"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { adminCreateBlock, adminDeleteBlock, adminListBlocks, adminMe, Block } from "@/lib/api";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { nightsBetween } from "@/lib/dates";

function isValidDateString(s: string) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function AdminBlocksPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const cabinId = Number(params.id);

  const invalidId = useMemo(() => !Number.isFinite(cabinId) || cabinId <= 0, [cabinId]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Block[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("Mantenimiento");
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const rangeDays = useMemo(() => {
    if (!isValidDateString(fromDate) || !isValidDateString(toDate)) return null;
    const n = nightsBetween(fromDate, toDate);
    return n;
  }, [fromDate, toDate]);

  const invalidRange = useMemo(() => {
    if (!isValidDateString(fromDate) || !isValidDateString(toDate)) return false;
    return (rangeDays ?? 0) < 1;
  }, [fromDate, toDate, rangeDays]);

  async function load() {
    setLoading(true);
    try {
      await adminMe();
      const resp = await adminListBlocks(cabinId);

      // orden por from_date asc
      const sorted = [...resp.data].sort((a, b) => String(a.from_date).localeCompare(String(b.from_date)));
      setItems(sorted);
    } catch (e: any) {
      toast.error("No se pudo cargar", e?.message ?? "Revisá tu sesión.");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      if (invalidId) {
        router.push("/admin/cabanas");
        return;
      }
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinId, invalidId]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();

    if (invalidRange) {
      toast.error("Rango inválido", "La fecha 'Hasta' debe ser posterior a 'Desde' (mínimo 1 día).");
      return;
    }

    try {
      setSaving(true);

      await adminCreateBlock(cabinId, {
        from_date: fromDate,
        to_date: toDate,
        reason: reason || null
      });

      toast.success("Bloqueo creado", "La disponibilidad se actualizará según este rango.");
      setFromDate("");
      setToDate("");
      await load();
    } catch (e: any) {
      toast.error("No se pudo crear el bloqueo", e?.message ?? "Verificá fechas y probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function askDelete(id: number) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function doDelete() {
    if (!pendingDeleteId) return;
    try {
      await adminDeleteBlock(pendingDeleteId);
      toast.success("Bloqueo eliminado", "El rango dejó de bloquear disponibilidad.");
      await load();
    } catch (e: any) {
      toast.error("No se pudo eliminar", e?.message ?? "Intentá de nuevo.");
    } finally {
      setPendingDeleteId(null);
    }
  }

  function daysChip(from: string, to: string) {
    try {
      const n = nightsBetween(from, to);
      if (n >= 1) return <span className="badge-slate">{n} día(s)</span>;
      return <span className="badge-slate">Rango inválido</span>;
    } catch {
      return <span className="badge-slate">-</span>;
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar bloqueo"
        description="Este rango dejará de bloquear disponibilidad. ¿Querés continuar?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        onConfirm={doDelete}
        onClose={() => setConfirmOpen(false)}
      />

      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Bloqueos (mantenimiento)</h1>
            <p className="text-sm text-slate-600">Cabaña ID: {cabinId}</p>
          </div>

          <button type="button" onClick={() => router.push(`/admin/cabanas/${cabinId}/editar`)} className="btn-secondary">
            Volver a editar
          </button>
        </div>

        <AdminNav />
      </div>

      <form onSubmit={onCreate} className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Crear bloqueo</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="space-y-1">
            <div className="label">Desde</div>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input" required />
          </label>

          <label className="space-y-1">
            <div className="label">Hasta</div>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input" required />
          </label>

          <label className="space-y-1">
            <div className="label">Motivo</div>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="input" placeholder="Mantenimiento" />
          </label>
        </div>

        {fromDate && toDate ? (
          invalidRange ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Rango inválido: la fecha <b>Hasta</b> debe ser posterior a <b>Desde</b> (mínimo 1 día).
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Duración del bloqueo: <b>{rangeDays}</b> día(s).
            </div>
          )
        ) : null}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Creando..." : "Crear bloqueo"}
        </button>

        <p className="help">
          Regla de solapamiento: <span className="font-mono">block.from &lt; to</span> y{" "}
          <span className="font-mono">block.to &gt; from</span>.
        </p>
      </form>

      {loading ? (
        <div className="card p-6">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="card p-6">No hay bloqueos cargados.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
            <div className="col-span-3 p-3">Desde</div>
            <div className="col-span-3 p-3">Hasta</div>
            <div className="col-span-4 p-3">Motivo</div>
            <div className="col-span-2 p-3 text-right">Acción</div>
          </div>

          {items.map((b) => (
            <div key={b.id} className="grid grid-cols-12 border-b border-slate-100">
              <div className="col-span-3 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span>{b.from_date}</span>
                  {daysChip(b.from_date, b.to_date)}
                </div>
              </div>
              <div className="col-span-3 p-3 text-sm">{b.to_date}</div>
              <div className="col-span-4 p-3 text-sm text-slate-700">{b.reason ?? "-"}</div>
              <div className="col-span-2 p-3 text-right">
                <button onClick={() => askDelete(b.id)} className="btn-secondary px-3 py-2">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
