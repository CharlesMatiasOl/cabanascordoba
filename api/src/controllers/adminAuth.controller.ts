import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db/pool";
import { env } from "../config/env";
import type { RowDataPacket } from "mysql2/promise";




type AdminRow = RowDataPacket & {
  id: number;
  username: string;
  password_salt: string; // hex
  password_hash: string; // hex
  password_iters: number;
};


function pbkdf2Hash(password: string, saltHex: string, iters: number): Promise<string> {
  const salt = Buffer.from(saltHex, "hex");
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iters, 32, "sha256", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
}

function setAdminCookie(res: Response, token: string) {
  const days = env.JWT_EXPIRES_DAYS;
  res.cookie(env.ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: days * 24 * 60 * 60 * 1000
  });
}

export async function adminLogin(req: Request, res: Response) {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  const [rows] = await pool.query<AdminRow[]>(
    "SELECT id, username, password_salt, password_hash, password_iters FROM admins WHERE username = ? LIMIT 1",
    [username]
  );

  const admin = rows[0];
  if (!admin) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const computed = await pbkdf2Hash(password, admin.password_salt, admin.password_iters);

  const ok = crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(admin.password_hash, "hex")
  );

  if (!ok) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign(
    { adminId: admin.id, username: admin.username },
    env.JWT_SECRET,
    { expiresIn: `${env.JWT_EXPIRES_DAYS}d` }
  );

  setAdminCookie(res, token);

  return res.json({ ok: true, admin: { id: admin.id, username: admin.username } });
}

export async function adminLogout(_req: Request, res: Response) {
  res.clearCookie(env.ADMIN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/"
  });
  return res.json({ ok: true });
}

export async function adminMe(req: Request, res: Response) {
  return res.json({ ok: true, admin: req.admin });
}
