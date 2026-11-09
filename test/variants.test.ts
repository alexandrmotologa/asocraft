import { describe, it, expect } from "vitest";
import { generateVariants } from "../src/core/engine/variants.js";
import { countCharacters } from "../src/core/constraints/validator.js";

describe("A/B Testing Variants Generator", () => {
  it("generates compliant variants across multiple angles", async () => {
    const res = await generateVariants({
      source: {
        locale: "en-US",
        appName: "Pixel Quest",
        genre: "casual-game",
      },
      targetLocales: ["en-US", "de-DE", "ja"],
      angles: ["gameplay", "social", "casual"],
    });

    expect(res.appName).toBe("Pixel Quest");
    expect(Object.keys(res.locales)).toEqual(["en-US", "de-DE", "ja"]);

    for (const loc of ["en-US", "de-DE", "ja"]) {
      const list = res.locales[loc];
      expect(list).toHaveLength(3);

      for (const item of list) {
        expect(countCharacters(item.ios?.title)).toBeLessThanOrEqual(30);
        expect(countCharacters(item.ios?.subtitle)).toBeLessThanOrEqual(30);
        expect(countCharacters(item.android?.shortDescription)).toBeLessThanOrEqual(80);
      }
    }
  });
});
