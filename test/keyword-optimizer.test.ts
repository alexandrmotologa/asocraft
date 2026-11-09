import { describe, it, expect } from "vitest";
import {
  compactKeywords,
  optimizeIosKeywords,
  calculateKeywordDensity,
} from "../src/core/engine/keyword-optimizer.js";

describe("Keyword Optimizer", () => {
  it("compacts spaces around commas", () => {
    const input = "  puzzle , match 3 ,  rpg  , quest  ";
    expect(compactKeywords(input)).toBe("puzzle,match 3,rpg,quest");
  });

  it("removes internal duplicate keywords", () => {
    const input = "puzzle,rpg,gems,puzzle,hero,gems";
    const res = optimizeIosKeywords(input);
    expect(res.optimized).toBe("puzzle,rpg,gems,hero");
    expect(res.removedDuplicates).toEqual(["puzzle", "gems"]);
  });

  it("removes keywords already indexed in Title and Subtitle", () => {
    const title = "Pixel Quest: Match 3 RPG";
    const subtitle = "Casual Puzzle Adventure";
    const keywords = "pixel,quest,puzzle,gems,magic,hero,rpg";

    const res = optimizeIosKeywords(keywords, {
      title,
      subtitle,
      deduplicateWithTitle: true,
    });

    // "pixel", "quest", "puzzle", "rpg" should be removed because they are in Title/Subtitle
    expect(res.removedOverlapWithTitle).toContain("pixel");
    expect(res.removedOverlapWithTitle).toContain("quest");
    expect(res.removedOverlapWithTitle).toContain("puzzle");
    expect(res.removedOverlapWithTitle).toContain("rpg");
    expect(res.optimized).toBe("gems,magic,hero");
    expect(res.charactersSaved).toBeGreaterThan(15);
  });

  it("removes language-specific stop words", () => {
    const keywords = "the,game,of,thrones,and,dragons";
    const res = optimizeIosKeywords(keywords, {
      locale: "en-US",
      removeStopWords: true,
    });

    expect(res.removedStopWords).toContain("the");
    expect(res.removedStopWords).toContain("of");
    expect(res.removedStopWords).toContain("and");
    expect(res.optimized).toBe("game,thrones,dragons");
  });

  it("calculates accurate keyword density for descriptions", () => {
    const text = "Pixel Quest is a match 3 puzzle RPG. In this match 3 puzzle, you solve match 3 stages.";
    const targetKeywords = ["match 3", "puzzle", "rpg", "arcade"];

    const density = calculateKeywordDensity(text, targetKeywords);
    expect(density["match 3"].count).toBe(3);
    expect(density["puzzle"].count).toBe(2);
    expect(density["rpg"].count).toBe(1);
    expect(density["arcade"].count).toBe(0);
    expect(density["match 3"].densityPercent).toBeGreaterThan(0);
  });
});
