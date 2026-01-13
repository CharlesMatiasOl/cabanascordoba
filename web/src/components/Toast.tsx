"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  push: (t: { type: ToastType; title: string; message?: string; ttlMs?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function typeStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        wrap: "border-emerald-200 bg-emerald-50",
        dot: "bg-emerald-600",
        title: "text-emerald-900",
        msg: "text-emerald-800"
      };
    case "error":
      return {
        wrap: "border-red-200 bg-red-50",
        dot: "bg-red-600",
        title: "text-red-900",
        msg: "text-red-800"
      };
    default:
      return {
        wrap: "border-slate-200 bg-white",
        dot: "bg-slate-600",
        title: "text-slate-900",
        msg: "text-slate-700"
      };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    const t = timers.current[id];
    if (t) {
      window.clearTimeout(t);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (t: { type: ToastType; title: string; message?: string; ttlMs?: number }) => {
      const id = uid();
      const item: ToastItem = { id, type: t.type, title: t.title, message: t.message };
      setItems((prev) => [item, ...prev].slice(0, 4));

      const ttl = typeof t.ttlMs === "number" ? t.ttlMs : 3500;
      timers.current[id] = window.setTimeout(() => remove(id), ttl);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, message) => push({ type: "success", title, message }),
      error: (title, message) => push({ type: "error", title, message, ttlMs: 5500 }),
      info: (title, message) => push({ type: "info", title, message })
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Viewport */}
      <div className="fixed top-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] space-y-2">
        {items.map((t) => {
          const s = typeStyles(t.type);
          return (
            <div
              key={t.id}
              className={`rounded-2xl border ${s.wrap} shadow-sm p-4 backdrop-blur`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${s.title}`}>{t.title}</div>
                  {t.message ? <div className={`text-sm mt-1 ${s.msg}`}>{t.message}</div> : null}
                </div>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="btn-ghost px-2 py-1 text-xs"
                  aria-label="Cerrar"
                >
                  Cerrar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
