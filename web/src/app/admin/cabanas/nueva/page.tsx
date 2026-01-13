"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { adminCreateCabin, adminMe } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function AdminNewCabinPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Córdoba");
  const [province, setProvince] = useState("Córdoba");
  const [pricePerNight, setPricePerNight] = useState(65000);
  const [maxGuests, setMaxGuests] = useState(4);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [imagesText, setImagesText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await adminMe();
      } catch {
        router.push("/admin/login");
      }
    })();
  }, [router]);

  function parseImages(text: string) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return lines.map((url) => ({ url }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Falta el título", "Completá el campo Título para continuar.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title,
        slug: slug || undefined,
        short_description: shortDescription,
        description,
        city,
        province,
        price_per_night: Number(pricePerNight),
        max_guests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        is_featured: isFeatured,
        is_active: isActive,
        images: parseImages(imagesText)
      };

      const created = await adminCreateCabin(payload);
      toast.success("Cabaña creada", "Ahora podés editarla y cargar bloqueos.");
      router.push(`/admin/cabanas/${created.id}/editar`);
    } catch (e: any) {
      toast.error("No se pudo crear la cabaña", e?.message ?? "Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Nueva cabaña</h1>
          <p className="text-sm text-slate-600">Creá una cabaña para publicar en el sitio.</p>
        </div>
        <AdminNav />
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <div className="label">Título</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          </label>

          <label className="space-y-1">
            <div className="label">Slug (opcional)</div>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" placeholder="cabana-mi-slug" />
          </label>
        </div>

        <label className="space-y-1 block">
          <div className="label">Descripción corta</div>
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="input" />
        </label>

        <label className="space-y-1 block">
          <div className="label">Descripción completa</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="input" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="space-y-1">
            <div className="label">Ciudad</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="input" />
          </label>
          <label className="space-y-1">
            <div className="label">Provincia</div>
            <input value={province} onChange={(e) => setProvince(e.target.value)} className="input" />
          </label>
          <label className="space-y-1">
            <div className="label">Precio / noche</div>
            <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} className="input" />
          </label>
          <label className="space-y-1">
            <div className="label">Huéspedes máx.</div>
            <input type="number" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} className="input" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="space-y-1">
            <div className="label">Dormitorios</div>
            <input type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className="input" />
          </label>
          <label className="space-y-1">
            <div className="label">Baños</div>
            <input type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className="input" />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <span className="text-sm">Destacada</span>
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <span className="text-sm">Activa</span>
          </label>
        </div>

        <label className="space-y-1 block">
          <div className="label">Imágenes (1 URL por línea)</div>
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            rows={4}
            className="input"
            placeholder="https://...\nhttps://..."
          />
          <p className="help">Tip: podés pegar URLs de picsum.photos para probar rápido.</p>
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creando..." : "Crear"}
          </button>

          <button type="button" onClick={() => router.push("/admin/cabanas")} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
