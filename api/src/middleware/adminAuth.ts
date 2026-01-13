import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AdminJwtPayload } from "../types";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;

    req.admin = {
      id: payload.adminId,
      username: payload.username,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}
