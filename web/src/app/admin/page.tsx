"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminMe } from "@/lib/api";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await adminMe();
        router.replace("/admin/cabanas");
      } catch {
        router.replace("/admin/login");
      }
    })();
  }, [router]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      Cargando admin...
    </div>
  );
}
