import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cabañas Cordoba",
  description: "Plataforma de alquiler de cabañas (demo) - búsqueda por disponibilidad",
};

function TopLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-slate-700 hover:text-slate-900 hover:underline underline-offset-4">
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="container-app py-4 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                
              </div>
              <div className="leading-tight">
                <div className="font-bold">Cabañas Cordoba</div>
                <div className="text-xs text-slate-500"></div>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <TopLink href="/" label="Inicio" />
              <TopLink href="/cabanas" label="Cabañas" />
              <TopLink href="/admin/login" label="Admin" />
            </nav>
          </div>
        </header>

        <main className="container-app py-10">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="container-app py-8 text-sm text-slate-600 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <span className="font-medium text-slate-900">Cabañas Cordoba</span>
            </div>
            <div className="text-xs text-slate-500">
              
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
