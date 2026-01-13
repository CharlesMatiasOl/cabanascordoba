import Image from "next/image";
import Link from "next/link";
import { CabinSummary } from "@/lib/api";
import { formatMoneyARS } from "@/lib/dates";

export default function CabinCard({ cabin }: { cabin: CabinSummary }) {
  return (
    <div className="card overflow-hidden hover:shadow-md transition">
      <div className="relative h-48 w-full bg-slate-100">
        {cabin.cover_image ? (
          <Image
            src={cabin.cover_image}
            alt={cabin.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500">
            Sin imagen
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          {cabin.is_featured ? <span className="badge-amber">Destacada</span> : null}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold leading-snug">{cabin.title}</h3>
          <p className="text-sm text-slate-600">
            {cabin.city}, {cabin.province}
          </p>
        </div>

        <p className="text-sm text-slate-700 line-clamp-2">
          {cabin.short_description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="text-sm">
            <span className="font-semibold">{formatMoneyARS(cabin.price_per_night)}</span>
            <span className="text-slate-600"> / noche</span>
          </div>

          <Link href={`/cabanas/${cabin.id}`} className="btn-primary px-3 py-2">
            Ver detalles
          </Link>
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
          <span className="badge-slate">Máx. {cabin.max_guests} huéspedes</span>
          <span className="badge-slate">{cabin.bedrooms} dorm.</span>
          <span className="badge-slate">{cabin.bathrooms} baño(s)</span>
        </div>
      </div>
    </div>
  );
}
