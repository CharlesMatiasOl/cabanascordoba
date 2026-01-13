import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === "number" ? err.status : 500;
  const message =
    typeof err?.message === "string" && err.message.length > 0
      ? err.message
      : "Error interno";

  if (status >= 500) {
    console.error("[API] Error:", err);
  }

  res.status(status).json({ error: message });
}
