import { describe, it, expect, vi } from "vitest";
import { convertToCandidateBaseMetadata, type ExtractedStoreMetadata } from "../src/core/engine/pull.js";

describe("Store Pull and Ingest Engine", () => {
  it("converts extracted store metadata to BaseMetadata respecting limits", () => {
    const mockExtracted: ExtractedStoreMetadata = {
      platform: "ios",
      appName: "Super Long Title That Might Exceed Standard Character Limits On The Store",
      genre: "puzzle",
      ios: {
        title: "Super Long Title That Might Exceed Standard Character Limits On The Store",
        subtitle: "A Great Game With A Very Long Subtitle That Crosses The Maximum Thirty Character Limit",
        description: "Full description here.",
      },
    };

    const base = convertToCandidateBaseMetadata(mockExtracted);
    expect(base.appName).toBe(mockExtracted.appName);
    expect(base.genre).toBe("puzzle");
    expect(base.ios).toBeDefined();
    expect(base.ios?.title.length).toBeLessThanOrEqual(30);
    expect(base.ios?.subtitle.length).toBeLessThanOrEqual(30);
    expect(base.ios?.keywords).toBe("app,mobile,game");
  });
});
