"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error global:", error);
  }, [error]);

  const msg = (error?.message || "").toLowerCase();
  const isApiDown =
    msg.includes("fetch failed") || msg.includes("econnrefused") || msg.includes("failed to fetch");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="card p-6 space-y-2">
        <div className="text-2xl font-bold">Se rompió algo</div>

        <div className="text-sm text-slate-700">
          {isApiDown
            ? "Parece que la API no está respondiendo. Verificá que el servidor esté levantado."
            : "Ocurrió un error inesperado."}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button type="button" onClick={reset} className="btn-primary">
            Reintentar
          </button>

          <Link href="/" className="btn-secondary">
            Ir al inicio
          </Link>

          <Link href="/cabanas" className="btn-ghost">
            Ver cabañas
          </Link>
        </div>

        <p className="help">
          Tip: en local, confirmá que la API responde{" "}
          <span className="font-mono">http://localhost:4000/api/health</span>.
        </p>
      </div>
    </div>
  );
}
