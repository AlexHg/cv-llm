export function asString(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

export function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
