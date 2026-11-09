import { describe, it, expect } from "vitest";
import { localizeMetadata } from "../src/core/engine/translator.js";
import { countCharacters } from "../src/core/constraints/validator.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../src/core/constraints/limits.js";

describe("Translator Engine", () => {
  it("translates base metadata across multiple locales with strict boundary compliance", async () => {
    const targetLocales = ["de-DE", "ja", "fr-FR", "es-ES", "ko"];

    const result = await localizeMetadata({
      source: {
        locale: "en-US",
        appName: "Pixel Quest",
        genre: "casual-game",
        ios: {
          title: "Pixel Quest: Match 3 RPG",
          subtitle: "Casual Puzzle Adventure",
          keywords: "puzzle,match3,rpg,quest,hero,gems,adventure,offline",
          description: "Match gems, defeat monsters, and build your kingdom.",
          promotionalText: "Claim your free hero today!",
        },
        android: {
          title: "Pixel Quest: Match 3 RPG",
          shortDescription: "Match gems and defeat epic monsters in this casual puzzle RPG.",
          fullDescription: "Detailed game description for Android players.",
        },
      },
      targetLocales,
      provider: "offline",
    });

    expect(result.targetLocales).toEqual(targetLocales);

    for (const locale of targetLocales) {
      const meta = result.localizations[locale];
      const report = result.reports[locale];

      expect(meta).toBeDefined();
      expect(report.valid).toBe(true);
      expect(report.errorCount).toBe(0);

      // Verify iOS limits
      if (meta.ios) {
        expect(countCharacters(meta.ios.title)).toBeLessThanOrEqual(IOS_LIMITS.title);
        expect(countCharacters(meta.ios.subtitle)).toBeLessThanOrEqual(IOS_LIMITS.subtitle);
        expect(countCharacters(meta.ios.keywords)).toBeLessThanOrEqual(IOS_LIMITS.keywords);
        expect(meta.ios.keywords).not.toContain(", "); // No spaces after commas
      }

      // Verify Android limits
      if (meta.android) {
        expect(countCharacters(meta.android.title)).toBeLessThanOrEqual(ANDROID_LIMITS.title);
        expect(countCharacters(meta.android.shortDescription)).toBeLessThanOrEqual(
          ANDROID_LIMITS.shortDescription
        );
      }
    }
  });

  it("handles retry auto-trimming when simulated provider returns overflow", async () => {
    // Custom mock provider returning intentional overflow on attempt 1, then fixed on attempt 2
    let callCount = 0;
    const mockProvider = {
      name: "mock-retry",
      async translate(req: any) {
        callCount++;
        if (req.attempt === 1) {
          return {
            rawOutput: "{}",
            metadata: {
              locale: req.targetLocale,
              ios: {
                title: "This Title Exceeds The Limit By A Large Margin", // >30 chars
                subtitle: "Short Subtitle",
                keywords: "a,b,c",
                description: "Test description",
              },
            },
            modelUsed: "mock",
          };
        }
        return {
          rawOutput: "{}",
          metadata: {
            locale: req.targetLocale,
            ios: {
              title: "Fixed Short Title", // <= 30 chars
              subtitle: "Short Subtitle",
              keywords: "a,b,c",
              description: "Test description",
            },
          },
          modelUsed: "mock",
        };
      },
    };

    const result = await localizeMetadata({
      source: {
        locale: "en-US",
        ios: {
          title: "Source Title",
          subtitle: "Source Sub",
          keywords: "a,b,c",
          description: "Desc",
        },
      },
      targetLocales: ["de-DE"],
      provider: mockProvider as any,
      maxRetries: 3,
    });

    expect(callCount).toBe(2);
    expect(result.localizations["de-DE"].ios?.title).toBe("Fixed Short Title");
    expect(result.reports["de-DE"].valid).toBe(true);
  });
});
