import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { runInit } from "../src/cli/commands/init.js";
import { runLocalize } from "../src/cli/commands/localize.js";
import { runValidate } from "../src/cli/commands/validate.js";
import { runKeywords } from "../src/cli/commands/keywords.js";
import { runExport } from "../src/cli/commands/export.js";
import { runDiff } from "../src/cli/commands/diff.js";

describe("CLI Commands Integration", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "asocraft-cli-test-"));
    originalCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("runs init and generates valid config and metadata files", async () => {
    await runInit({ force: true, genre: "puzzle" });

    const configContent = JSON.parse(await fs.readFile(path.join(tmpDir, "aso.config.json"), "utf8"));
    const metaContent = JSON.parse(await fs.readFile(path.join(tmpDir, "metadata.en.json"), "utf8"));

    expect(configContent.appName).toBe("Pixel Quest");
    expect(configContent.genre).toBe("puzzle");
    expect(metaContent.ios.title).toBe("Pixel Quest: Match 3 RPG");
  });

  it("runs full localization, validation, and export workflow", async () => {
    // 1. Initialize project
    await runInit({ force: true });

    // 2. Localize to German and Japanese using offline provider
    await runLocalize({
      locales: "de-DE,ja",
      provider: "offline",
      outDir: "fastlane/metadata",
    });

    // Check that Fastlane files were created
    const deTitlePath = path.join(tmpDir, "fastlane", "metadata", "ios", "de-DE", "title.txt");
    const deShortDescPath = path.join(tmpDir, "fastlane", "metadata", "android", "de-DE", "short_description.txt");
    const jaTitlePath = path.join(tmpDir, "fastlane", "metadata", "ios", "ja", "title.txt");
    const jaAndroidShortDesc = path.join(tmpDir, "fastlane", "metadata", "android", "ja-JP", "short_description.txt");

    expect(await fs.access(deTitlePath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(deShortDescPath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(jaTitlePath).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(jaAndroidShortDesc).then(() => true).catch(() => false)).toBe(true);

    // 3. Validate generated metadata
    process.exitCode = 0;
    await runValidate({ dir: "fastlane/metadata" });
    expect(process.exitCode).toBe(0);

    // 4. Run Diff
    await runDiff({ dir: "fastlane/metadata", metadata: "metadata.en.json" });

    // 5. Export to CSV and JSON
    await runExport({ dir: "fastlane/metadata", format: "json", output: "exported.json" });
    await runExport({ dir: "fastlane/metadata", format: "csv", output: "exported.csv" });

    expect(await fs.access(path.join(tmpDir, "exported.json")).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(path.join(tmpDir, "exported.csv")).then(() => true).catch(() => false)).toBe(true);
  });

  it("runs keyword optimization command", async () => {
    await runKeywords({
      keywords: "puzzle, match 3, rpg, puzzle, hero",
      title: "Puzzle Game",
      optimize: true,
    });
    // Checks that it completes without throwing
  });
});
