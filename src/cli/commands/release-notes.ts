import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { generateReleaseNotes, RELEASE_NOTES_LIMITS } from "../../core/engine/release-notes.js";
import { writeIosReleaseNotes } from "../../core/exporters/fastlane-ios.js";
import { writeAndroidChangelog } from "../../core/exporters/fastlane-android.js";
import type { ProviderType } from "../../types/index.js";

export interface ReleaseNotesCommandOptions {
  input?: string;
  file?: string;
  config?: string;
  locales?: string;
  versionCode?: string;
  provider?: string;
  outDir?: string;
  dryRun?: boolean;
}

export async function runReleaseNotes(options: ReleaseNotesCommandOptions): Promise<void> {
  const cwd = process.cwd();
  let text = options.input || "";

  if (options.file) {
    const filePath = path.resolve(cwd, options.file);
    text = await fs.readFile(filePath, "utf8");
  }

  if (!text.trim()) {
    console.log(pc.yellow("No release notes text provided. Use --input \"...\" or --file <path>."));
    return;
  }

  let locales = ["de-DE", "fr-FR", "es-ES", "ja", "ko", "pt-BR", "it", "ru", "zh-Hans"];
  let outDir = path.resolve(cwd, options.outDir || "fastlane/metadata");
  let provider = (options.provider || "offline") as ProviderType;

  // Try loading from aso.config.json if available
  const configPath = path.resolve(cwd, options.config || "aso.config.json");
  try {
    const raw = JSON.parse(await fs.readFile(configPath, "utf8"));
    if (raw.locales && raw.locales.length > 0) locales = raw.locales;
    if (raw.outDir && !options.outDir) outDir = path.resolve(cwd, raw.outDir);
    if (raw.provider && !options.provider) provider = raw.provider;
  } catch {
    // Config not required
  }

  if (options.locales) {
    locales = options.locales.split(",").map((l) => l.trim()).filter(Boolean);
  }

  const versionCode = options.versionCode || "default";

  console.log(pc.bold(pc.cyan(`\nASOCraft Multi-Language Release Notes Generator`)));
  console.log(`${pc.dim("Target Locales (${locales.length}):")} ${locales.join(", ")}`);
  console.log(`${pc.dim("Android Version Code:")} ${versionCode}`);
  console.log(`${pc.dim("Provider:")} ${provider}`);
  console.log(`${pc.dim("Output:")} ${options.dryRun ? pc.yellow("[DRY-RUN]") : outDir}\n`);

  const result = await generateReleaseNotes({
    sourceText: text,
    targetLocales: locales,
    provider,
  });

  const table = new Table({
    head: [
      pc.bold("Locale"),
      pc.bold("iOS Length"),
      pc.bold("Android Length"),
      pc.bold("Preview (Android <= 500)"),
      pc.bold("Status"),
    ],
    colWidths: [12, 14, 16, 36, 12],
  });

  for (const loc of locales) {
    const note = result.notes[loc];
    if (!note) continue;

    const iosStatus = note.iosLength <= RELEASE_NOTES_LIMITS.ios;
    const androidStatus = note.androidLength <= RELEASE_NOTES_LIMITS.android;
    const allValid = iosStatus && androidStatus;

    const preview = note.android.replace(/\n+/g, " ").slice(0, 32) + "...";

    table.push([
      loc,
      `${note.iosLength}/${RELEASE_NOTES_LIMITS.ios}`,
      `${note.androidLength}/${RELEASE_NOTES_LIMITS.android}`,
      preview,
      allValid ? pc.green("✔ VALID") : pc.red("✖ OVERFLOW"),
    ]);

    if (!options.dryRun) {
      await writeIosReleaseNotes(loc, note.ios, outDir);
      await writeAndroidChangelog(loc, note.android, outDir, versionCode);
    }
  }

  console.log(table.toString());

  if (!options.dryRun) {
    console.log(pc.green(`\n✔ Successfully written release notes across ${locales.length} locales to ${outDir}\n`));
  } else {
    console.log(pc.yellow("\n[Dry-run] Release notes validated without writing to disk.\n"));
  }
}
