import { describe, expect, it } from "vitest";
import { knowledgeCards } from "@/src/data/knowledge/cards";
import { stories } from "@/src/data/stories";
import { buildRoute } from "@/src/domain/route";
import { assistantEntries } from "@/src/features/assistant/knowledge";

const pages = new Set([
  "/",
  "/learn",
  "/route",
  "/receipts",
  "/ledger",
  "/check",
  "/prepare",
  "/stories",
  "/fundraising",
  "/about",
]);

const routeAnchors = new Set(
  buildRoute({ province: "浙江省", city: "丽水市", county: "景宁畲族自治县" }, "省外医院").map(
    (step) => `step-${step.id}`,
  ),
);

const links = [
  ...knowledgeCards.flatMap((card) => (card.action.kind === "link" && card.action.to ? [card.action.to] : [])),
  ...stories.flatMap((story) => story.tools.map((tool) => tool.to)),
  ...assistantEntries.flatMap((entry) => entry.actions?.map((action) => action.to) ?? []),
];

describe("站内链接", () => {
  it("科普、同路人和小助手的链接都指向现有页面", () => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const path = link.split(/[?#]/)[0];
      expect(pages.has(path), link).toBe(true);
    }
  });

  it("路线页锚点对应真实步骤", () => {
    for (const link of links.filter((item) => item.startsWith("/route#"))) {
      expect(routeAnchors.has(link.split("#")[1]), link).toBe(true);
    }
  });
});
