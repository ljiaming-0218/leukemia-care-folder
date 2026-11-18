import { useSyncExternalStore } from "react";

const KEY = "marrow-factory:stickers";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode: stickers last for this visit only.
  }
  listeners.forEach((listener) => listener());
}

export function addSticker(id: string) {
  const current = read();
  if (!current.includes(id)) write([...current, id]);
}

export function clearStickers() {
  write([]);
}

const EMPTY: string[] = [];

export function useStickers(): string[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => EMPTY,
  );
}
