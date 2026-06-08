import { Pool } from "pg";

let pool: Pool | null = null;

function getRequiredEnv(name: string, fallback?: string) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: getRequiredEnv("DB_HOST", "127.0.0.1"),
      port: Number(process.env.DB_PORT || 5432),
      user: getRequiredEnv("DB_USER", "dupoin"),
      password: getRequiredEnv("DB_PASSWORD"),
      database: getRequiredEnv("DB_NAME", "dupoin_hr"),
      max: Number(process.env.DB_MAX || 5),
    });
  }
  return pool;
}
