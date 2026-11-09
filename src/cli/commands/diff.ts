import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { countCharacters } from "../../core/constraints/validator.js";

export interface DiffCommandOptions {
  dir?: string;
  metadata?: string;
  locale?: string;
}

export async function runDiff(options: DiffCommandOptions): Promise<void> {
  const cwd = process.cwd();
  const metadataPath = path.resolve(cwd, options.metadata || "metadata.en.json");
  const targetDir = path.resolve(cwd, options.dir || "fastlane/metadata");

  const baseContent = JSON.parse(await fs.readFile(metadataPath, "utf8"));
  const imported = await importFastlaneDirectory(targetDir);

  const locales = options.locale
    ? [options.locale]
    : Object.keys(imported);

  if (locales.length === 0) {
    console.log(pc.yellow(`No localized metadata found in ${targetDir}`));
    return;
  }

  console.log(pc.bold(pc.cyan(`\nASOCraft Metadata Diff & Expansion Inspector`)));
  console.log(`${pc.dim("Baseline:")} ${metadataPath} (${baseContent.locale})`);
  console.log(`${pc.dim("Target Locales:")} ${locales.join(", ")}\n`);

  const table = new Table({
    head: [
      pc.bold("Locale"),
      pc.bold("Field"),
      pc.bold("Base Length"),
      pc.bold("Localized Length"),
      pc.bold("Delta / Expansion"),
    ],
    colWidths: [12, 18, 14, 18, 20],
  });

  for (const loc of locales) {
    const locData = imported[loc];
    if (!locData) continue;

    if (baseContent.ios && locData.ios) {
      const baseTitleLen = countCharacters(baseContent.ios.title);
      const locTitleLen = countCharacters(locData.ios.title);
      const deltaTitle = locTitleLen - baseTitleLen;
      const pctTitle = ((deltaTitle / Math.max(1, baseTitleLen)) * 100).toFixed(0);

      table.push([
        loc,
        "iOS Title",
        `${baseTitleLen}`,
        `${locTitleLen}/30`,
        `${deltaTitle >= 0 ? `+${deltaTitle}` : deltaTitle} (${pctTitle}%)`,
      ]);

      const baseSubLen = countCharacters(baseContent.ios.subtitle);
      const locSubLen = countCharacters(locData.ios.subtitle);
      const deltaSub = locSubLen - baseSubLen;
      const pctSub = ((deltaSub / Math.max(1, baseSubLen)) * 100).toFixed(0);

      table.push([
        loc,
        "iOS Subtitle",
        `${baseSubLen}`,
        `${locSubLen}/30`,
        `${deltaSub >= 0 ? `+${deltaSub}` : deltaSub} (${pctSub}%)`,
      ]);
    }

    if (baseContent.android && locData.android) {
      const baseShortLen = countCharacters(baseContent.android.shortDescription);
      const locShortLen = countCharacters(locData.android.shortDescription);
      const deltaShort = locShortLen - baseShortLen;
      const pctShort = ((deltaShort / Math.max(1, baseShortLen)) * 100).toFixed(0);

      table.push([
        loc,
        "Android Short Desc",
        `${baseShortLen}`,
        `${locShortLen}/80`,
        `${deltaShort >= 0 ? `+${deltaShort}` : deltaShort} (${pctShort}%)`,
      ]);
    }
  }

  console.log(table.toString());
  console.log("");
}
