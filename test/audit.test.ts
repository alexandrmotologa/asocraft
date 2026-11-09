import { describe, it, expect } from "vitest";
import { auditIosMetadata, auditAndroidMetadata, auditMetadata } from "../src/core/engine/audit.js";

describe("ASO Audit Engine", () => {
  it("grades well-optimized iOS metadata with high scores (A or A+)", () => {
    const report = auditIosMetadata({
      title: "Pixel Quest: Match 3 RPG", // 24 chars
      subtitle: "Casual Gem Puzzle Adventure", // 27 chars
      keywords: "gems,magic,dungeons,monsters,dragons,loot,boss,arena,hero,level,offline,saga,crush", // 84 chars
      description: "Match gems and explore dungeons.\n\nFeatures:\n• 500 handcrafted levels\n• Loot crafting\n• Offline play\n\nDownload now!",
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(80);
    expect(["A+", "A"]).toContain(report.grade);
    expect(report.fieldScores).toHaveLength(4);
  });

  it("penalizes underutilized and unoptimized iOS fields", () => {
    const report = auditIosMetadata({
      title: "Pixel", // 5 chars -> wastes 25 chars
      subtitle: "Game", // 4 chars -> wastes 26 chars
      keywords: "pixel,game,pixel,fun", // duplicate + overlap with title
      description: "Just a game.",
    });

    expect(report.overallScore).toBeLessThan(60);
    expect(["C", "D"]).toContain(report.grade);
    expect(report.recommendations.some((r) => r.includes("wasting"))).toBe(true);
  });

  it("grades well-structured Android metadata", () => {
    const report = auditAndroidMetadata({
      title: "Pixel Quest: Match 3 RPG",
      shortDescription: "Match gems and defeat epic monsters in this casual puzzle adventure.", // 68 chars
      fullDescription:
        "Welcome to Pixel Quest!\n\nExciting Features:\n• Over 500 challenging puzzle levels\n• Collect epic weapons and armor\n• No WiFi needed for adventure\n\nDownload today and begin your quest!",
    });

    expect(report.overallScore).toBeGreaterThanOrEqual(75);
    expect(report.fieldScores.find((f) => f.field.includes("Short Description"))?.score).toBeGreaterThan(25);
  });

  it("handles combined audit", () => {
    const reports = auditMetadata({
      locale: "en-US",
      ios: {
        title: "Pixel Quest: Match 3 RPG",
        subtitle: "Casual Gem Puzzle Adventure",
        keywords: "gems,magic,hero,quest",
        description: "Great game.",
      },
      android: {
        title: "Pixel Quest",
        shortDescription: "Short description here.",
        fullDescription: "Full description here.",
      },
    });

    expect(reports).toHaveLength(2);
  });
});
