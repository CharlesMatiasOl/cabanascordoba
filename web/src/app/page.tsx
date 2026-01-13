import Link from "next/link";
import CabinCard from "@/components/CabinCard";
import { apiListCabins } from "@/lib/api";
import Image from "next/image";


export default async function HomePage() {
  const resp = await apiListCabins({ page: 1, limit: 12, sort: "newest" });
  const featured = resp.data.filter((c) => c.is_featured);
  const list = (featured.length > 0 ? featured : resp.data).slice(0, 6);

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-white to-amber-200/30" />
        <div className="relative p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-700">
                Disponibilidad reservas
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Encontrá tu próxima escapada en Córdoba
              </h1>

              <p className="text-slate-700">
                Buscá por fechas y mirá qué cabañas están disponibles.
              </p>

              <div className="flex items-center gap-3">
                <Link href="/cabanas" className="btn-primary">
                  Ver cabañas
                </Link>
                <Link href="/admin/login" className="btn-secondary">
                  Ir a Admin
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div className="card-soft p-4">
                  <div className="text-sm font-semibold"></div>
                  <div className="help"></div>
                </div>
                <div className="card-soft p-4">
                  <div className="text-sm font-semibold"></div>
                  <div className="help"></div>
                </div>
                <div className="card-soft p-4">
                  <div className="text-sm font-semibold"></div>
                  <div className="help"></div>
                </div>
              </div>
            </div>

            {/* Panel visual */}
            <div className="card p-6">
              <div className="text-sm text-slate-600">Vista previa</div>
              <div className="mt-2 text-slate-900 font-semibold">
                Sierras • Lago • Naturaleza
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
  {[
    { src: "/images/C1.png", alt: "Vista cabaña 1" },
    { src: "/images/C2.png", alt: "Vista cabaña 2" },
    { src: "/images/C3.png", alt: "Vista cabaña 3" },
  ].map((img) => (
    <div
      key={img.src}
      className="relative h-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 200px"
        priority
      />
    </div>
  ))}
</div>


              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Tip</div>
                <div className="text-sm text-slate-700">
                  Probá buscar fechas y ver qué queda disponible.
                </div>
              </div>

              <p className="help mt-3">
                
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADAS */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Cabañas destacadas</h2>
            <p className="text-sm text-slate-600">Elegidas para mostrar la mejor experiencia.</p>
          </div>
          <Link href="/cabanas" className="btn-secondary">
            Ver todas
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="card p-6 text-slate-700">
            No hay cabañas activas para mostrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((c) => (
              <CabinCard key={c.id} cabin={c} />
            ))}
          </div>
        )}
      </section>

      {/* BLOQUE: “Cómo funciona” */}
      <section className="card p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Cómo funciona</h3>
            <p className="text-sm text-slate-600 mt-1">
              La disponibilidad se calcula por bloqueos de mantenimiento.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold">1) Elegís fechas</div>
            <p className="text-sm text-slate-700 mt-1">
              
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold">2) Filtramos disponibilidad</div>
            <p className="text-sm text-slate-700 mt-1">
              
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
