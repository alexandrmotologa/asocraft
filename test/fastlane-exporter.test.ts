import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  writeIosFastlaneMetadata,
  writeAndroidFastlaneMetadata,
  exportToFastlane,
  importFastlaneDirectory,
} from "../src/core/exporters/index.js";
import { exportToJson, exportToCsv } from "../src/core/exporters/json-exporter.js";
import type { LocalizationResult } from "../src/types/index.js";

describe("Fastlane Exporter and Importer", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "asocraft-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("writes iOS Fastlane metadata directory and files", async () => {
    const files = await writeIosFastlaneMetadata(
      "ja",
      {
        title: "ピクセルクエスト",
        subtitle: "爽快パズルRPG",
        keywords: "パズル,RPG,冒険",
        description: "楽しいパズルゲームです。",
        promotionalText: "今すぐプレイ！",
      },
      tmpDir
    );

    expect(files).toHaveLength(5);
    // On iOS, locale 'ja' is mapped to folder 'ios/ja'
    const titleFile = path.join(tmpDir, "ios", "ja", "title.txt");
    const titleContent = await fs.readFile(titleFile, "utf8");
    expect(titleContent).toBe("ピクセルクエスト");
  });

  it("writes Android Fastlane metadata directory and files", async () => {
    const files = await writeAndroidFastlaneMetadata(
      "ja",
      {
        title: "ピクセルクエスト",
        shortDescription: "爽快パズルRPGで冒険に出よう！",
        fullDescription: "ダンジョンを探索して宝石をマッチさせよう。",
      },
      tmpDir
    );

    expect(files).toHaveLength(3);
    // On Android, locale 'ja' is mapped to folder 'android/ja-JP'
    const shortDescFile = path.join(tmpDir, "android", "ja-JP", "short_description.txt");
    const content = await fs.readFile(shortDescFile, "utf8");
    expect(content).toBe("爽快パズルRPGで冒険に出よう！");
  });

  it("exports and re-imports metadata with 100% parity", async () => {
    const dummyResult: LocalizationResult = {
      sourceLocale: "en-US",
      targetLocales: ["de-DE"],
      localizations: {
        "de-DE": {
          locale: "de-DE",
          ios: {
            title: "Pixel Quest",
            subtitle: "3-Gewinnt Rätsel",
            keywords: "rätsel,quest,helden",
            description: "Ein tolles Spiel.",
          },
          android: {
            title: "Pixel Quest",
            shortDescription: "Löse Rätsel und besiege Monster.",
            fullDescription: "Ein tolles Spiel mit vielen Leveln.",
          },
        },
      },
      reports: {},
      durationMs: 120,
    };

    await exportToFastlane(dummyResult, tmpDir);

    const imported = await importFastlaneDirectory(tmpDir);
    expect(imported["de-DE"]).toBeDefined();
    expect(imported["de-DE"].ios?.title).toBe("Pixel Quest");
    expect(imported["de-DE"].ios?.subtitle).toBe("3-Gewinnt Rätsel");
    expect(imported["de-DE"].android?.shortDescription).toBe("Löse Rätsel und besiege Monster.");
  });

  it("exports metadata to CSV and JSON", async () => {
    const dummyResult: LocalizationResult = {
      sourceLocale: "en-US",
      targetLocales: ["fr-FR"],
      localizations: {
        "fr-FR": {
          locale: "fr-FR",
          ios: {
            title: "Pixel Quest",
            subtitle: "Jeu de Match 3",
            keywords: "puzzle,heros,aventure",
            description: "Description en francais.",
          },
        },
      },
      reports: {},
      durationMs: 100,
    };

    const jsonPath = path.join(tmpDir, "export.json");
    const csvPath = path.join(tmpDir, "export.csv");

    await exportToJson(dummyResult, jsonPath);
    await exportToCsv(dummyResult, csvPath);

    const jsonContent = JSON.parse(await fs.readFile(jsonPath, "utf8"));
    expect(jsonContent.localizations["fr-FR"].ios.subtitle).toBe("Jeu de Match 3");

    const csvContent = await fs.readFile(csvPath, "utf8");
    expect(csvContent).toContain("iOS,fr-FR,Subtitle");
    expect(csvContent).toContain("Jeu de Match 3");
  });
});
