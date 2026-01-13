"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { adminMe, adminUpdateCabin, apiGetCabin } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function AdminEditCabinPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const toast = useToast();
  const cabinId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Córdoba");
  const [province, setProvince] = useState("Córdoba");
  const [pricePerNight, setPricePerNight] = useState(0);
  const [maxGuests, setMaxGuests] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);

  const [imagesText, setImagesText] = useState("");

  const invalidId = useMemo(() => !Number.isFinite(cabinId) || cabinId <= 0, [cabinId]);

  useEffect(() => {
    (async () => {
      try {
        await adminMe();
        if (invalidId) {
          router.push("/admin/cabanas");
          return;
        }

        const c = await apiGetCabin(cabinId);
        setTitle(c.title);
        setSlug(c.slug);
        setShortDescription(c.short_description);
        setDescription(c.description);
        setCity(c.city);
        setProvince(c.province);
        setPricePerNight(c.price_per_night);
        setMaxGuests(c.max_guests);
        setBedrooms(c.bedrooms);
        setBathrooms(c.bathrooms);
        setIsFeatured(c.is_featured);

        const urls = (c.images ?? []).map((x) => x.url).join("\n");
        setImagesText(urls);
      } catch (e: any) {
        const msg = e?.message ?? "No se pudo cargar";
        toast.error("Error al cargar", msg);

        const low = String(msg).toLowerCase();
        if (low.includes("no autenticado") || low.includes("sesión")) {
          router.push("/admin/login");
        } else {
          router.push("/admin/cabanas");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router, cabinId, invalidId, toast]);

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
      toast.error("Falta el título", "Completá el campo Título para guardar.");
      return;
    }

    try {
      setSaving(true);

      await adminUpdateCabin(cabinId, {
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
        images: parseImages(imagesText)
      });

      toast.success("Guardado OK", "Los cambios se aplicaron correctamente.");
    } catch (e: any) {
      toast.error("No se pudo guardar", e?.message ?? "Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Editar cabaña</h1>
            <p className="text-sm text-slate-600">ID: {cabinId}</p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/admin/cabanas/${cabinId}/bloqueos`)}
            className="btn-secondary"
          >
            Ver bloqueos
          </button>
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
            <div className="label">Slug</div>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" />
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
        </div>

        <label className="space-y-1 block">
          <div className="label">Imágenes (1 URL por línea)</div>
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={4} className="input" />
        </label>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>

          <button type="button" onClick={() => router.push("/admin/cabanas")} className="btn-secondary">
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
