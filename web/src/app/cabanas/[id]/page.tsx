import { apiGetCabin } from "@/lib/api";
import BookingBox from "@/components/BookingBox";
import Gallery from "@/components/Gallery";

export default async function CabinDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return <div className="card p-6">ID inválido</div>;
  }

  const cabin = await apiGetCabin(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {cabin.is_featured ? <span className="badge-amber">Destacada</span> : null}
            <span className="badge-slate">
              Máx. {cabin.max_guests} huéspedes • {cabin.bedrooms} dorm. • {cabin.bathrooms} baño(s)
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">{cabin.title}</h1>
          <p className="text-slate-600">
            {cabin.city}, {cabin.province}
          </p>
          <p className="text-slate-700">{cabin.short_description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Gallery title={cabin.title} images={cabin.images ?? []} />

          <div className="card p-6 space-y-3">
            <h2 className="text-lg font-semibold">Descripción</h2>
            <p className="text-slate-700 whitespace-pre-line">{cabin.description}</p>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold">Importante</h3>
            <p className="text-sm text-slate-700 mt-1">
              Pagos y reservas todavía no están implementados. El botón existe como “próximamente”.
            </p>
          </div>
        </div>

        <BookingBox pricePerNight={cabin.price_per_night} />
      </div>
    </div>
  );
}
