"use client";

import { useEffect } from "react";

export default function ConfirmDialog(props: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const {
    open,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    danger = false,
    onConfirm,
    onClose
  } = props;

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-6">
          <div className="space-y-2">
            <div className="text-lg font-semibold">{title}</div>
            {description ? <div className="text-sm text-slate-700">{description}</div> : null}
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              {cancelText}
            </button>

            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={danger ? "btn px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700" : "btn-primary"}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
