import { useSyncExternalStore } from "react";

const KEY = "marrow-factory:checkup";
const MAX_QUESTIONS = 3;
const MAX_OBSERVATIONS = 500;

export type CheckupDraft = {
  questions: string[];
  observations: string;
};

export const EMPTY_CHECKUP: CheckupDraft = { questions: [], observations: "" };

const listeners = new Set<() => void>();
let cached: CheckupDraft = EMPTY_CHECKUP;
let cachedRaw: string | null = null;
let cachedStorage: Storage | null = null;

function getStorage(): Storage | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage;
  } catch {
    return null;
  }
}

export function sanitizeQuestions(values: readonly string[]): string[] {
  return values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, MAX_QUESTIONS);
}

function normalize(input: CheckupDraft): CheckupDraft {
  return {
    questions: sanitizeQuestions(input.questions),
    observations: input.observations.trim().slice(0, MAX_OBSERVATIONS),
  };
}

export function readCheckupDraft(): CheckupDraft {
  const storage = getStorage();
  if (!storage) return EMPTY_CHECKUP;
  let raw: string | null;
  try {
    raw = storage.getItem(KEY);
  } catch {
    return EMPTY_CHECKUP;
  }
  if (raw === cachedRaw && storage === cachedStorage) return cached;
  cachedStorage = storage;
  cachedRaw = raw;
  if (!raw) {
    cached = EMPTY_CHECKUP;
    return cached;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      cached = EMPTY_CHECKUP;
      return cached;
    }
    const record = parsed as { questions?: unknown; observations?: unknown };
    cached = normalize({
      questions: Array.isArray(record.questions)
        ? record.questions.filter((item): item is string => typeof item === "string")
        : [],
      observations: typeof record.observations === "string" ? record.observations : "",
    });
  } catch {
    cached = EMPTY_CHECKUP;
  }
  return cached;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function saveCheckupDraft(input: CheckupDraft): CheckupDraft {
  const next = normalize(input);
  const storage = getStorage();
  if (storage) {
    try {
      const raw = JSON.stringify(next);
      storage.setItem(KEY, raw);
      cached = next;
      cachedRaw = raw;
      cachedStorage = storage;
    } catch {
      // Private mode: the draft lasts for this page only.
    }
  }
  notify();
  return next;
}

export function clearCheckupDraft() {
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(KEY);
    } catch {
      // Private mode: nothing persisted.
    }
  }
  cached = EMPTY_CHECKUP;
  cachedRaw = null;
  cachedStorage = storage;
  notify();
}

export function useCheckupDraft(): CheckupDraft {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    readCheckupDraft,
    () => EMPTY_CHECKUP,
  );
}