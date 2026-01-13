"use client";

export default function Switch(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  const { checked, onChange, disabled, label } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 transition ${
        checked ? "bg-emerald-50 border-emerald-200" : "bg-slate-100 border-slate-200"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white"}`}
      aria-pressed={checked}
    >
      <span
        className={`h-5 w-9 rounded-full relative transition ${
          checked ? "bg-emerald-600" : "bg-slate-400"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>

      <span className="text-xs font-medium text-slate-800">
        {label ?? (checked ? "Activa" : "Inactiva")}
      </span>
    </button>
  );
}
