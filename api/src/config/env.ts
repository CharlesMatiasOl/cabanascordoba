import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno requerida: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.trunc(n);
}

export const env = {
  PORT: optionalInt("PORT", 4000),
  NODE_ENV: optional("NODE_ENV", "development"),
  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:3000"),

  DB_HOST: required("DB_HOST"),
  DB_PORT: optionalInt("DB_PORT", 3306),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: optional("DB_PASSWORD", ""),
  DB_NAME: required("DB_NAME"),

  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_DAYS: optionalInt("JWT_EXPIRES_DAYS", 7),
  ADMIN_COOKIE_NAME: optional("ADMIN_COOKIE_NAME", "cabanas_admin"),
} as const;
