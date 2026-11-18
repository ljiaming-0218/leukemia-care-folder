import { useSyncExternalStore } from "react";

const KEY = "marrow-factory:asked-doctor";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function toggleAsked(id: string) {
  const current = read();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode: the marks last for this visit only.
  }
  notify();
}

export function clearAsked() {
  cache = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Private mode: nothing persisted.
  }
  notify();
}

export function useAskedDoctor(): string[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => [],
  );
}
