import { describe, expect, it } from "vitest";
import { PEER_THEMES, peerStories } from "@/src/data/peers/peers";
import { chapters } from "@/src/data/story/chapters";

describe("peer stories", () => {
  it("ships 6-8 published-report stories with source and verification dates", () => {
    expect(peerStories.length).toBeGreaterThanOrEqual(6);
    expect(peerStories.length).toBeLessThanOrEqual(8);
    expect(new Set(peerStories.map((story) => story.id)).size).toBe(peerStories.length);
    for (const story of peerStories) {
      expect(story.sourcePublisher.length).toBeGreaterThan(0);
      expect(story.sourceTitle.length).toBeGreaterThan(0);
      expect(story.sourceUrl).toMatch(/^https?:\/\//);
      expect(story.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(story.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(story.deidentifiedNote.length).toBeGreaterThan(0);
      expect(story.themes.length).toBeGreaterThan(0);
      for (const theme of story.themes) {
        expect(PEER_THEMES).toContain(theme);
      }
    }
  });

  it("links every story to existing chapters", () => {
    const chapterIds = new Set(chapters.map((chapter) => chapter.id));
    for (const story of peerStories) {
      expect(story.relatedChapterIds.filter((id) => !chapterIds.has(id))).toEqual([]);
    }
  });

  it("does not promise outcomes or copy reported amounts into advice", () => {
    for (const story of peerStories) {
      const text = [
        story.title,
        story.summary,
        ...story.feared,
        ...story.wanted,
        ...story.walked,
        story.message,
        ...story.support,
      ].join(" ");
      expect(text).not.toMatch(/治愈率|生存率|复发率|\d+\s*%|战胜癌症|奇迹/);
    }
  });
});
