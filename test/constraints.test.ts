import { describe, it, expect } from "vitest";
import {
  countCharacters,
  countUtf8Bytes,
  validateIosField,
  validateAndroidField,
  validateMetadata,
} from "../src/core/constraints/validator.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../src/core/constraints/limits.js";

describe("Character counting and Unicode awareness", () => {
  it("counts standard ASCII characters", () => {
    expect(countCharacters("Pixel Quest")).toBe(11);
  });

  it("accurately counts multi-byte and accented characters", () => {
    // German umlauts
    expect(countCharacters("3-Gewinnt Rätsel")).toBe(16);
    // Japanese kanji and katakana
    expect(countCharacters("爽快パズル冒険")).toBe(7);
  });

  it("handles complex emojis as single grapheme clusters", () => {
    // 🎮 (1 grapheme) + " Play Now" (9 chars) = 10
    expect(countCharacters("🎮 Play Now")).toBe(10);
  });

  it("calculates UTF-8 byte length correctly", () => {
    expect(countUtf8Bytes("abc")).toBe(3);
    // Japanese characters are 3 bytes each in UTF-8
    expect(countUtf8Bytes("パズル")).toBe(9);
  });
});

describe("iOS constraint validations", () => {
  it("passes when title is exactly 30 characters", () => {
    const title30 = "123456789012345678901234567890";
    const issues = validateIosField("title", title30);
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("flags error when title exceeds 30 characters", () => {
    const title31 = "1234567890123456789012345678901";
    const issues = validateIosField("title", title31);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0].currentLength).toBe(31);
    expect(errors[0].maxLength).toBe(IOS_LIMITS.title);
  });

  it("flags warning for spaces after commas in keywords", () => {
    const issues = validateIosField("keywords", "puzzle, match 3, rpg");
    const warnings = issues.filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.includes("spaces after commas"))).toBe(true);
  });

  it("flags warning for duplicate keywords", () => {
    const issues = validateIosField("keywords", "puzzle,rpg,puzzle");
    const warnings = issues.filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.includes("duplicate terms"))).toBe(true);
  });

  it("flags warning when keywords duplicate Title or Subtitle words", () => {
    const issues = validateIosField(
      "keywords",
      "puzzle,quest,magic",
      "en",
      { title: "Pixel Quest", subtitle: "Casual Adventure" }
    );
    const warnings = issues.filter((i) => i.severity === "warning");
    expect(warnings.some((w) => w.message.includes("Title/Subtitle"))).toBe(true);
  });
});

describe("Google Play constraint validations", () => {
  it("passes when short description is under 80 characters", () => {
    const shortDesc = "Match gems and explore magical dungeons in this casual puzzle RPG!";
    const issues = validateAndroidField("shortDescription", shortDesc);
    expect(issues.filter((i) => i.severity === "error")).toHaveLength(0);
  });

  it("flags error when short description exceeds 80 characters", () => {
    const over80 = "This short description is intentionally made too long by writing many words that will easily cross the eighty character limit.";
    const issues = validateAndroidField("shortDescription", over80);
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(1);
    expect(errors[0].maxLength).toBe(ANDROID_LIMITS.shortDescription);
  });

  it("flags consecutive exclamation marks in Google Play fields", () => {
    const issues = validateAndroidField("shortDescription", "Play now!!");
    expect(issues.some((i) => i.message.includes("exclamation marks"))).toBe(true);
  });
});

describe("Combined store validation", () => {
  it("returns valid report for compliant metadata", () => {
    const report = validateMetadata({
      locale: "en-US",
      ios: {
        title: "Pixel Quest",
        subtitle: "Match 3 Adventure",
        keywords: "gems,magic,dungeon,offline",
        description: "Great game description here.",
      },
      android: {
        title: "Pixel Quest",
        shortDescription: "Match gems and solve puzzles in this RPG.",
        fullDescription: "Detailed full description here.",
      },
    });

    expect(report.valid).toBe(true);
    expect(report.errorCount).toBe(0);
  });
});
