import { useSyncExternalStore } from "react";

const DB_NAME = "leukemia-care-folder";
const DB_VERSION = 1;
const KV_STORE = "kv";
const DOC_STORE = "docs";

export type LocalStoreStatus = "pending" | "ok" | "unavailable";

let status: LocalStoreStatus = "pending";
const listeners = new Set<() => void>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function setStatus(next: LocalStoreStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      setStatus("unavailable");
      resolve(null);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      setStatus("unavailable");
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        db.createObjectStore(DOC_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      setStatus("ok");
      void navigator.storage?.persist?.().catch(() => undefined);
      resolve(request.result);
    };
    request.onerror = () => {
      setStatus("unavailable");
      resolve(null);
    };
    request.onblocked = () => {
      setStatus("unavailable");
      resolve(null);
    };
  });
  return dbPromise;
}

export async function loadValue<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  if (!db) return undefined;
  try {
    const tx = db.transaction(KV_STORE, "readonly");
    return (await requestToPromise(tx.objectStore(KV_STORE).get(key))) as T | undefined;
  } catch {
    setStatus("unavailable");
    return undefined;
  }
}

export async function saveValue(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(KV_STORE, "readwrite");
    tx.objectStore(KV_STORE).put(value, key);
    await transactionDone(tx);
  } catch {
    setStatus("unavailable");
  }
}

export async function loadRecords<T>(): Promise<T[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    const tx = db.transaction(DOC_STORE, "readonly");
    return (await requestToPromise(tx.objectStore(DOC_STORE).getAll())) as T[];
  } catch {
    setStatus("unavailable");
    return [];
  }
}

export async function writeRecords(put: { id: string }[], remove: string[]): Promise<void> {
  if (!put.length && !remove.length) return;
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(DOC_STORE, "readwrite");
    const store = tx.objectStore(DOC_STORE);
    put.forEach((record) => store.put(record));
    remove.forEach((id) => store.delete(id));
    await transactionDone(tx);
  } catch {
    setStatus("unavailable");
  }
}

export function localStoreNote(current: LocalStoreStatus, isDemo: boolean): string {
  if (isDemo) return "演示工作区不保存到本机，退出或刷新后恢复为初始示例。";
  if (current === "unavailable") {
    return "这个浏览器不允许本机保存（可能是无痕窗口），刷新后资料不保留，请及时导出 CSV 或备份账本。";
  }
  if (current === "pending") return "正在检查本机保存…";
  return "已自动保存在这台设备的浏览器里，刷新后仍在；不会上传。";
}

export function useLocalStoreStatus(): LocalStoreStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      void openDb();
      return () => listeners.delete(listener);
    },
    () => status,
    () => status,
  );
}
