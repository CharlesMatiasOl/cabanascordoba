"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await adminLogin(username, password);
      toast.success("Login OK", "Bienvenido al panel.");
      router.push("/admin/cabanas");
    } catch (err: any) {
      toast.error("No se pudo iniciar sesión", err?.message ?? "Revisá usuario/contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-slate-600 mt-1">Ingresá para gestionar cabañas y bloqueos.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="space-y-1 block">
            <div className="label">Usuario</div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
            />
          </label>

          <label className="space-y-1 block">
            <div className="label">Contraseña</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="help">
            Credenciales DEV por seed: <span className="font-mono">admin / admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
