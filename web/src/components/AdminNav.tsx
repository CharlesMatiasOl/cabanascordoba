"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogout } from "@/lib/api";
import { useToast } from "@/components/Toast";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={active ? "btn-primary px-3 py-2" : "btn-secondary px-3 py-2"}
    >
      {label}
    </Link>
  );
}

export default function AdminNav() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    try {
      setLoading(true);
      await adminLogout();
      toast.success("Sesión cerrada", "Volviste al login.");
      router.push("/admin/login");
    } catch (e: any) {
      toast.error("No se pudo cerrar sesión", e?.message ?? "Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <NavLink href="/admin/cabanas" label="Cabañas" />
        <Link href="/" className="btn-ghost px-3 py-2 text-sm">
          Volver al sitio
        </Link>
      </div>

      <button
        onClick={onLogout}
        disabled={loading}
        className="btn-secondary px-3 py-2"
      >
        {loading ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </div>
  );
}
