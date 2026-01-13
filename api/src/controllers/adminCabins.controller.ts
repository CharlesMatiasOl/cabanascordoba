import { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool } from "../db/pool";
import { clamp, parseIntSafe } from "../utils/dates";

type CountRow = RowDataPacket & { n: number };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca tildes
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : NaN;
}

function asInt(v: unknown): number {
  const n = asNumber(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

export async function adminListCabins(req: Request, res: Response) {
  const page = clamp(parseIntSafe(req.query.page, 1), 1, 10_000);
  const limit = clamp(parseIntSafe(req.query.limit, 20), 1, 100);
  const offset = (page - 1) * limit;

  const countSql = `SELECT COUNT(*) AS n FROM cabins`;
  const [countRows] = await pool.query<CountRow[]>(countSql);
  const total = countRows[0]?.n ?? 0;

  const listSql = `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.short_description,
      c.city,
      c.province,
      c.price_per_night,
      c.max_guests,
      c.bedrooms,
      c.bathrooms,
      c.is_featured,
      c.is_active,
      (
        SELECT ci.image_url
        FROM cabin_images ci
        WHERE ci.cabin_id = c.id
        ORDER BY ci.sort_order ASC, ci.id ASC
        LIMIT 1
      ) AS cover_image
    FROM cabins c
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT ?
    OFFSET ?
  `.trim();

  const [rows] = await pool.query<any[]>(listSql, [limit, offset]);

  return res.json({
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      short_description: r.short_description,
      city: r.city,
      province: r.province,
      price_per_night: Number(r.price_per_night),
      max_guests: r.max_guests,
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      is_featured: !!r.is_featured,
      is_active: !!r.is_active,
      cover_image: r.cover_image ?? null
    })),
    page,
    limit,
    total
  });
}

export async function adminCreateCabin(req: Request, res: Response) {
  const title = asString(req.body?.title);
  const short_description = asString(req.body?.short_description);
  const description = asString(req.body?.description);

  const city = asString(req.body?.city) || "Córdoba";
  const province = asString(req.body?.province) || "Córdoba";

  const price_per_night = asNumber(req.body?.price_per_night);
  const max_guests = asInt(req.body?.max_guests);

  const bedrooms = Number.isFinite(asInt(req.body?.bedrooms)) ? asInt(req.body?.bedrooms) : 1;
  const bathrooms = Number.isFinite(asInt(req.body?.bathrooms)) ? asInt(req.body?.bathrooms) : 1;

  const is_featured = !!req.body?.is_featured ? 1 : 0;
  const is_active = req.body?.is_active === false ? 0 : 1;

  const slugInput = asString(req.body?.slug);
  const slug = slugInput ? slugify(slugInput) : slugify(title);

  if (!title || !short_description || !description) {
    return res.status(400).json({ error: "Faltan campos: title, short_description, description" });
  }
  if (!Number.isFinite(price_per_night) || price_per_night <= 0) {
    return res.status(400).json({ error: "price_per_night inválido" });
  }
  if (!Number.isFinite(max_guests) || max_guests <= 0) {
    return res.status(400).json({ error: "max_guests inválido" });
  }

  try {
    const insertSql = `
      INSERT INTO cabins
      (title, slug, short_description, description, city, province, price_per_night, max_guests, bedrooms, bathrooms, is_featured, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `.trim();

    const [result] = await pool.execute<ResultSetHeader>(insertSql, [
      title,
      slug,
      short_description,
      description,
      city,
      province,
      price_per_night,
      max_guests,
      bedrooms,
      bathrooms,
      is_featured,
      is_active
    ]);

    const cabinId = result.insertId as number;

    const images: unknown = req.body?.images;
    if (Array.isArray(images) && images.length > 0) {
      const values = images
        .map((it, idx) => {
          const url = asString((it as any)?.url ?? it);
          const alt = typeof (it as any)?.alt === "string" ? (it as any).alt.trim() : null;
          if (!url) return null;
          return [cabinId, url, alt, idx] as const;
        })
        .filter(Boolean) as any[];

      if (values.length > 0) {
        const imgSql = `
          INSERT INTO cabin_images (cabin_id, image_url, alt_text, sort_order)
          VALUES ${values.map(() => "(?, ?, ?, ?)").join(", ")}
        `.trim();

        await pool.execute<ResultSetHeader>(imgSql, values.flat());
      }
    }

    return res.status(201).json({ ok: true, id: cabinId });
  } catch {
    return res.status(400).json({ error: "No se pudo crear la cabaña (¿slug duplicado?)" });
  }
}

export async function adminUpdateCabin(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const title = asString(req.body?.title);
  const short_description = asString(req.body?.short_description);
  const description = asString(req.body?.description);

  const city = asString(req.body?.city) || "Córdoba";
  const province = asString(req.body?.province) || "Córdoba";

  const price_per_night = asNumber(req.body?.price_per_night);
  const max_guests = asInt(req.body?.max_guests);

  const bedrooms = Number.isFinite(asInt(req.body?.bedrooms)) ? asInt(req.body?.bedrooms) : 1;
  const bathrooms = Number.isFinite(asInt(req.body?.bathrooms)) ? asInt(req.body?.bathrooms) : 1;

  const is_featured = !!req.body?.is_featured ? 1 : 0;

  const slugInput = asString(req.body?.slug);
  const slug = slugInput ? slugify(slugInput) : slugify(title);

  if (!title || !short_description || !description) {
    return res.status(400).json({ error: "Faltan campos: title, short_description, description" });
  }
  if (!Number.isFinite(price_per_night) || price_per_night <= 0) {
    return res.status(400).json({ error: "price_per_night inválido" });
  }
  if (!Number.isFinite(max_guests) || max_guests <= 0) {
    return res.status(400).json({ error: "max_guests inválido" });
  }

  try {
    const updateSql = `
      UPDATE cabins
      SET title = ?, slug = ?, short_description = ?, description = ?,
          city = ?, province = ?, price_per_night = ?, max_guests = ?,
          bedrooms = ?, bathrooms = ?, is_featured = ?
      WHERE id = ?
    `.trim();

    const [result] = await pool.execute<ResultSetHeader>(updateSql, [
      title,
      slug,
      short_description,
      description,
      city,
      province,
      price_per_night,
      max_guests,
      bedrooms,
      bathrooms,
      is_featured,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cabaña no encontrada" });
    }

    // Si mandan images, reemplazamos. Si no, dejamos como estaba.
    const images: unknown = req.body?.images;
    if (Array.isArray(images)) {
      await pool.execute<ResultSetHeader>("DELETE FROM cabin_images WHERE cabin_id = ?", [id]);

      const values = images
        .map((it, idx) => {
          const url = asString((it as any)?.url ?? it);
          const alt = typeof (it as any)?.alt === "string" ? (it as any).alt.trim() : null;
          if (!url) return null;
          return [id, url, alt, idx] as const;
        })
        .filter(Boolean) as any[];

      if (values.length > 0) {
        const imgSql = `
          INSERT INTO cabin_images (cabin_id, image_url, alt_text, sort_order)
          VALUES ${values.map(() => "(?, ?, ?, ?)").join(", ")}
        `.trim();

        await pool.execute<ResultSetHeader>(imgSql, values.flat());
      }
    }

    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ error: "No se pudo actualizar (¿slug duplicado?)" });
  }
}

export async function adminSetCabinActive(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const activeRaw = req.body?.active;
  const hasActive = typeof activeRaw === "boolean";

  if (hasActive) {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE cabins SET is_active = ? WHERE id = ?",
      [activeRaw ? 1 : 0, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cabaña no encontrada" });
    }
    return res.json({ ok: true, is_active: !!activeRaw });
  }

  // Si no mandan body.active, togglear
  const [rows] = await pool.query<any[]>("SELECT is_active FROM cabins WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    return res.status(404).json({ error: "Cabaña no encontrada" });
  }

  const next = rows[0].is_active ? 0 : 1;

  await pool.execute<ResultSetHeader>("UPDATE cabins SET is_active = ? WHERE id = ?", [next, id]);

  return res.json({ ok: true, is_active: !!next });
}
