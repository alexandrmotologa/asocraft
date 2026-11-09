import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateHtmlPreview, writeHtmlPreviewFile } from "../src/core/exporters/html-preview.js";

describe("HTML Store Preview Exporter", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "asocraft-preview-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("generates self-contained HTML preview with mockups and locale switcher", async () => {
    const html = generateHtmlPreview(
      {
        "en-US": {
          locale: "en-US",
          ios: {
            title: "Pixel Quest",
            subtitle: "Casual Match 3 RPG",
            keywords: "gems,rpg,puzzle",
            description: "Match gems and level up heroes.",
          },
          android: {
            title: "Pixel Quest",
            shortDescription: "Exciting match 3 RPG adventure.",
            fullDescription: "Detailed description here.",
          },
        },
      },
      "Pixel Quest"
    );

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Pixel Quest");
    expect(html).toContain("APPLE APP STORE (iOS)");
    expect(html).toContain("GOOGLE PLAY (ANDROID)");
    expect(html).toContain("Casual Match 3 RPG");
  });

  it("writes preview file to disk", async () => {
    const filePath = path.join(tmpDir, "preview.html");
    await writeHtmlPreviewFile(
      {
        "de-DE": {
          locale: "de-DE",
          ios: { title: "Pixel Quest", subtitle: "3-Gewinnt Rätsel", keywords: "a,b", description: "Desc" },
        },
      },
      filePath,
      "Pixel Quest"
    );

    expect(await fs.access(filePath).then(() => true)).toBe(true);
    const content = await fs.readFile(filePath, "utf8");
    expect(content).toContain("3-Gewinnt Rätsel");
  });
});
