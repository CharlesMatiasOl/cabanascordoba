"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Img = { id: number; url: string; alt: string | null; sort_order: number };

export default function Gallery({ title, images }: { title: string; images: Img[] }) {
  const list = useMemo(() => images ?? [], [images]);
  const [active, setActive] = useState(0);

  const main = list[active];

  return (
    <div className="card p-4 space-y-3">
      <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
        {main ? (
          <Image
            src={main.url}
            alt={main.alt ?? title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-500">Sin imágenes</div>
        )}
      </div>

      {list.length > 1 ? (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {list.slice(0, 12).map((img, idx) => {
            const isActive = idx === active;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(idx)}
                className={`relative h-16 rounded-xl overflow-hidden border ${
                  isActive ? "border-slate-900" : "border-slate-200"
                } bg-slate-100`}
                title="Ver foto"
              >
                <Image src={img.url} alt={img.alt ?? title} fill className="object-cover" sizes="120px" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
