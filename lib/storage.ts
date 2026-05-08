/**
 * Typed localStorage helpers. SSR-safe: every getter returns null on the
 * server (or when storage is unavailable). Writes are silently best-effort —
 * a quota error or a private-mode browser shouldn't crash the app.
 */

const PREFIX = "wilhelm:";

export const KEYS = {
  chatSession: "chat-session",
  packing: "packing",
} as const;

function key(name: string): string {
  return `${PREFIX}${name}`;
}

export function readJSON<T>(name: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON<T>(name: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — drop silently.
  }
}

export function remove(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(name));
  } catch {
    /* ignore */
  }
}
