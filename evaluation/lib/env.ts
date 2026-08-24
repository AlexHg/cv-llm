import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.local", ".env"];

function stripQuotes(value: string) {
  const quoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));
  return quoted ? value.slice(1, -1) : value;
}

/**
 * Carga `.env.local` y `.env` sin dependencias externas.
 * Lo ya presente en `process.env` gana: el entorno real manda sobre el archivo.
 */
export function loadEnvFiles(cwd = process.cwd()) {
  for (const file of ENV_FILES) {
    const full = path.resolve(cwd, file);
    if (!existsSync(full)) continue;

    for (const raw of readFileSync(full, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;

      const separator = line.indexOf("=");
      if (separator === -1) continue;

      const key = line.slice(0, separator).trim();
      if (!key || process.env[key] != null) continue;

      process.env[key] = stripQuotes(line.slice(separator + 1).trim());
    }
  }
}

export function requireEnv(key: string, hint: string) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Falta la variable de entorno ${key}. ${hint}`);
  }
  return value;
}
