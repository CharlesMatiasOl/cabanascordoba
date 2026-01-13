import { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db/pool";
import { assertValidRange } from "../utils/dates";

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function adminListBlocksForCabin(req: Request, res: Response) {
  const cabinId = Number(req.params.id);
  if (!Number.isFinite(cabinId) || cabinId <= 0) {
    return res.status(400).json({ error: "ID de cabaña inválido" });
  }

  const [cabRows] = await pool.query<any[]>("SELECT id FROM cabins WHERE id = ? LIMIT 1", [cabinId]);
  if (!cabRows[0]) {
    return res.status(404).json({ error: "Cabaña no encontrada" });
  }

  const sql = `
    SELECT id, cabin_id, from_date, to_date, reason, created_at
    FROM blocks
    WHERE cabin_id = ?
    ORDER BY from_date ASC, id ASC
  `.trim();

  const [rows] = await pool.query<any[]>(sql, [cabinId]);

  return res.json({
    data: rows.map((r) => ({
      id: r.id,
      cabin_id: r.cabin_id,
      from_date: r.from_date,
      to_date: r.to_date,
      reason: r.reason ?? null,
      created_at: r.created_at
    }))
  });
}

export async function adminCreateBlockForCabin(req: Request, res: Response) {
  const cabinId = Number(req.params.id);
  if (!Number.isFinite(cabinId) || cabinId <= 0) {
    return res.status(400).json({ error: "ID de cabaña inválido" });
  }

  const [cabRows] = await pool.query<any[]>("SELECT id FROM cabins WHERE id = ? LIMIT 1", [cabinId]);
  if (!cabRows[0]) {
    return res.status(404).json({ error: "Cabaña no encontrada" });
  }

  const { from, to } = assertValidRange(req.body?.from_date, req.body?.to_date);
  const reason = asString(req.body?.reason) || null;

  // Evitar doble bloqueo solapado
  const overlapSql = `
    SELECT id
    FROM blocks
    WHERE cabin_id = ?
      AND from_date < ?
      AND to_date > ?
    LIMIT 1
  `.trim();

  const [overRows] = await pool.query<any[]>(overlapSql, [cabinId, to, from]);
  if (overRows[0]) {
    return res.status(409).json({ error: "El bloqueo se solapa con otro existente" });
  }

  const insertSql = `
    INSERT INTO blocks (cabin_id, from_date, to_date, reason)
    VALUES (?, ?, ?, ?)
  `.trim();

  const [result] = await pool.execute<ResultSetHeader>(insertSql, [cabinId, from, to, reason]);

  return res.status(201).json({ ok: true, id: result.insertId });
}

export async function adminDeleteBlock(req: Request, res: Response) {
  const blockId = Number(req.params.blockId);
  if (!Number.isFinite(blockId) || blockId <= 0) {
    return res.status(400).json({ error: "ID de bloqueo inválido" });
  }

  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM blocks WHERE id = ?", [blockId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Bloqueo no encontrado" });
  }

  return res.json({ ok: true });
}
