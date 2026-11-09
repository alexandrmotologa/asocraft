import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { generateReleaseNotes, RELEASE_NOTES_LIMITS } from "../src/core/engine/release-notes.js";
import { writeIosReleaseNotes } from "../src/core/exporters/fastlane-ios.js";
import { writeAndroidChangelog } from "../src/core/exporters/fastlane-android.js";

describe("Release Notes Generator", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "asocraft-notes-test-"));
  });

  afterEach(async () => {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("generates store-compliant release notes across locales", async () => {
    const res = await generateReleaseNotes({
      sourceText: "Fixed crash on launch, added 20 new levels, improved performance.",
      targetLocales: ["de-DE", "ja", "fr-FR"],
      provider: "offline",
    });

    expect(res.targetLocales).toEqual(["de-DE", "ja", "fr-FR"]);

    for (const loc of res.targetLocales) {
      const note = res.notes[loc];
      expect(note).toBeDefined();
      expect(note.iosLength).toBeLessThanOrEqual(RELEASE_NOTES_LIMITS.ios);
      expect(note.androidLength).toBeLessThanOrEqual(RELEASE_NOTES_LIMITS.android);
      expect(note.android.length).toBeGreaterThan(10);
    }
  });

  it("writes release notes into Fastlane iOS and Android structures", async () => {
    const iosFile = await writeIosReleaseNotes("de-DE", "Bug fixes and improvements.", tmpDir);
    const androidFile = await writeAndroidChangelog("de-DE", "Bug fixes.", tmpDir, 105);

    expect(await fs.access(iosFile).then(() => true)).toBe(true);
    expect(await fs.access(androidFile).then(() => true)).toBe(true);

    const iosContent = await fs.readFile(iosFile, "utf8");
    const androidContent = await fs.readFile(androidFile, "utf8");

    expect(iosContent).toBe("Bug fixes and improvements.");
    expect(androidContent).toBe("Bug fixes.");
    expect(androidFile).toContain(path.join("changelogs", "105.txt"));
  });
});
