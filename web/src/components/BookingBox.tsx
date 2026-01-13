"use client";

import { useMemo, useState } from "react";
import { formatMoneyARS, nightsBetween } from "@/lib/dates";

export default function BookingBox({ pricePerNight }: { pricePerNight: number }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const nights = useMemo(() => {
    if (!from || !to) return 1;
    const n = nightsBetween(from, to);
    return n >= 1 ? n : 0; // 0 = inválido
  }, [from, to]);

  const total = useMemo(() => {
    const n = nights >= 1 ? nights : 1;
    return n * pricePerNight;
  }, [nights, pricePerNight]);

  const invalidRange = from && to && nights === 0;

  return (
    <div className="card p-6 space-y-4 lg:sticky lg:top-24 h-fit">
      <div className="space-y-1">
        <div className="text-sm text-slate-600">Precio</div>
        <div className="text-2xl font-bold">
          {formatMoneyARS(pricePerNight)}
          <span className="text-sm font-medium text-slate-600"> / noche</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="space-y-1 block">
          <div className="label">Check-in</div>
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>

        <label className="space-y-1 block">
          <div className="label">Check-out</div>
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>

        {invalidRange ? (
          <div className="text-sm text-red-600">
            check-out debe ser posterior a check-in (mínimo 1 noche).
          </div>
        ) : (
          <div className="help">Total = noches × precio/noche (mínimo 1 noche).</div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
        <div className="text-sm text-slate-600">Total estimado</div>
        <div className="text-2xl font-bold">{formatMoneyARS(total)}</div>
        <div className="text-xs text-slate-500">
          {invalidRange ? "Rango inválido" : nights >= 1 ? `${nights} noche(s)` : "1 noche (mínimo)"}
        </div>
      </div>

      <button className="btn-primary w-full" disabled title="Próximamente">
        Pagar (próximamente)
      </button>

      <p className="help">Nota: no se realizan pagos ni reservas. Esto es solo cálculo y UI.</p>
    </div>
  );
}
