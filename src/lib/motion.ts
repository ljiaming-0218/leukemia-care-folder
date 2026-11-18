import { useSyncExternalStore } from "react";

type Motion = "full" | "reduce";

const KEY = "marrow-factory:motion";
const query = window.matchMedia("(prefers-reduced-motion: reduce)");
const listeners = new Set<() => void>();

function saved(): Motion | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "full" || value === "reduce" ? value : null;
  } catch {
    return null;
  }
}

function resolve(): Motion {
  return saved() ?? (query.matches ? "reduce" : "full");
}

export function applyMotion() {
  document.documentElement.dataset.motion = resolve();
  listeners.forEach((listener) => listener());
}

query.addEventListener("change", applyMotion);

export function setMotion(next: Motion) {
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode: the choice lasts for this visit only.
  }
  document.documentElement.dataset.motion = next;
  listeners.forEach((listener) => listener());
}

export function useMotion(): Motion {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (document.documentElement.dataset.motion as Motion | undefined) ?? resolve(),
    () => "full",
  );
}
