import { Request, Response } from "express";
import { pool } from "../db/pool";
import { assertValidRange, clamp, parseIntSafe, parseNumberSafe } from "../utils/dates";
import { CabinSort, CabinSummary } from "../types";
import type { RowDataPacket } from "mysql2/promise";




type CountRow = RowDataPacket & { n: number };


function sortToSql(sort: CabinSort | null): string {
  switch (sort) {
    case "price_asc":
      return "c.price_per_night ASC, c.id ASC";
    case "price_desc":
      return "c.price_per_night DESC, c.id ASC";
    case "newest":
    default:
      return "c.created_at DESC, c.id DESC";
  }
}

export async function listCabins(req: Request, res: Response) {
  const fromRaw = req.query.from;
  const toRaw = req.query.to;

  let range: { from: string; to: string } | null = null;
  if (fromRaw != null || toRaw != null) {
    range = assertValidRange(fromRaw, toRaw);
  }

  const page = clamp(parseIntSafe(req.query.page, 1), 1, 10_000);
  const limit = clamp(parseIntSafe(req.query.limit, 12), 1, 50);
  const offset = (page - 1) * limit;

  const sort = (typeof req.query.sort === "string" ? req.query.sort : "") as CabinSort;
  const sortSql = sortToSql(sort || null);

  const guests = clamp(parseIntSafe(req.query.guests, 0), 0, 50);
  const minPrice = parseNumberSafe(req.query.minPrice, NaN);
  const maxPrice = parseNumberSafe(req.query.maxPrice, NaN);

  const where: string[] = ["c.is_active = 1"];
  const params: any[] = [];

  if (guests > 0) {
    where.push("c.max_guests >= ?");
    params.push(guests);
  }
  if (Number.isFinite(minPrice)) {
    where.push("c.price_per_night >= ?");
    params.push(minPrice);
  }
  if (Number.isFinite(maxPrice)) {
    where.push("c.price_per_night <= ?");
    params.push(maxPrice);
  }

  if (range) {
    // Regla de solapamiento: block.from < to y block.to > from
    where.push(
      "NOT EXISTS (SELECT 1 FROM blocks b WHERE b.cabin_id = c.id AND b.from_date < ? AND b.to_date > ?)"
    );
    params.push(range.to, range.from);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*) AS n
    FROM cabins c
    ${whereSql}
  `.trim();

  const [countRows] = await pool.query<CountRow[]>(countSql, params);
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
      (
        SELECT ci.image_url
        FROM cabin_images ci
        WHERE ci.cabin_id = c.id
        ORDER BY ci.sort_order ASC, ci.id ASC
        LIMIT 1
      ) AS cover_image
    FROM cabins c
    ${whereSql}
    ORDER BY ${sortSql}
    LIMIT ?
    OFFSET ?
  `.trim();

  const listParams = [...params, limit, offset];

  const [rows] = await pool.query<any[]>(listSql, listParams);

  const data: CabinSummary[] = rows.map((r) => ({
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
    cover_image: r.cover_image ?? null
  }));

  return res.json({
    data,
    page,
    limit,
    total
  });
}

export async function getCabinById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const cabinSql = `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.short_description,
      c.description,
      c.city,
      c.province,
      c.price_per_night,
      c.max_guests,
      c.bedrooms,
      c.bathrooms,
      c.is_featured,
      c.is_active
    FROM cabins c
    WHERE c.id = ?
    LIMIT 1
  `.trim();

  const [cabRows] = await pool.query<any[]>(cabinSql, [id]);
  const cabin = cabRows[0];

  if (!cabin || !cabin.is_active) {
    return res.status(404).json({ error: "Cabaña no encontrada" });
  }

  const imagesSql = `
    SELECT id, image_url, alt_text, sort_order
    FROM cabin_images
    WHERE cabin_id = ?
    ORDER BY sort_order ASC, id ASC
  `.trim();

  const [imgRows] = await pool.query<any[]>(imagesSql, [id]);

  return res.json({
    id: cabin.id,
    title: cabin.title,
    slug: cabin.slug,
    short_description: cabin.short_description,
    description: cabin.description,
    city: cabin.city,
    province: cabin.province,
    price_per_night: Number(cabin.price_per_night),
    max_guests: cabin.max_guests,
    bedrooms: cabin.bedrooms,
    bathrooms: cabin.bathrooms,
    is_featured: !!cabin.is_featured,
    cover_image: imgRows?.[0]?.image_url ?? null,
    images: imgRows.map((x: any) => ({
      id: x.id,
      url: x.image_url,
      alt: x.alt_text ?? null,
      sort_order: x.sort_order
    }))
  });
}
