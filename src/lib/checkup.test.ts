import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMPTY_CHECKUP,
  clearCheckupDraft,
  readCheckupDraft,
  sanitizeQuestions,
  saveCheckupDraft,
} from "@/src/lib/checkup";

class MemoryStorage {
  private map = new Map<string, string>();

  get length() {
    return this.map.size;
  }

  clear() {
    this.map.clear();
  }

  getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  key(index: number) {
    return [...this.map.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.map.delete(key);
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

beforeEach(() => {
  vi.stubGlobal("sessionStorage", new MemoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("checkup draft", () => {
  it("trims questions, drops blanks and keeps at most three", () => {
    expect(sanitizeQuestions([" 抽血要空腹吗 ", "", "  ", "骨穿多久", "腰穿疼不疼", "第四个"])).toEqual([
      "抽血要空腹吗",
      "骨穿多久",
      "腰穿疼不疼",
    ]);
  });

  it("starts empty in a fresh session", () => {
    expect(readCheckupDraft()).toEqual(EMPTY_CHECKUP);
  });

  it("saves and reads the draft within the same session", () => {
    saveCheckupDraft({ questions: [" 想问什么 ", ""], observations: "  最近容易累  " });
    expect(readCheckupDraft()).toEqual({
      questions: ["想问什么"],
      observations: "最近容易累",
    });
  });

  it("caps observations at 500 characters", () => {
    const draft = saveCheckupDraft({ questions: [], observations: "观".repeat(600) });
    expect(draft.observations).toHaveLength(500);
    expect(readCheckupDraft().observations).toHaveLength(500);
  });

  it("clears the draft", () => {
    saveCheckupDraft({ questions: ["问题"], observations: "观察" });
    clearCheckupDraft();
    expect(readCheckupDraft()).toEqual(EMPTY_CHECKUP);
  });

  it("falls back to empty when stored JSON is broken", () => {
    sessionStorage.setItem("marrow-factory:checkup", "{oops");
    expect(readCheckupDraft()).toEqual(EMPTY_CHECKUP);
  });

  it("does not throw when storage is unavailable", () => {
    vi.stubGlobal("sessionStorage", undefined);
    expect(() => saveCheckupDraft({ questions: ["问题"], observations: "" })).not.toThrow();
    expect(readCheckupDraft()).toEqual(EMPTY_CHECKUP);
    expect(() => clearCheckupDraft()).not.toThrow();
  });
});