import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "node:child_process";
import pc from "picocolors";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { writeHtmlPreviewFile } from "../../core/exporters/html-preview.js";
import type { LocalizedStoreMetadata } from "../../types/index.js";

export interface PreviewCommandOptions {
  dir?: string;
  metadata?: string;
  output?: string;
  open?: boolean;
}

export async function runPreview(options: PreviewCommandOptions): Promise<void> {
  const cwd = process.cwd();
  let metadataMap: Record<string, LocalizedStoreMetadata> = {};
  let appName = "Mobile Application";

  if (options.metadata) {
    const metaPath = path.resolve(cwd, options.metadata);
    const content = JSON.parse(await fs.readFile(metaPath, "utf8"));
    const loc = content.locale || "en-US";
    metadataMap[loc] = content;
    appName = content.appName || appName;
  } else {
    const dirPath = path.resolve(cwd, options.dir || "fastlane/metadata");
    metadataMap = await importFastlaneDirectory(dirPath);

    // Try reading appName from aso.config.json
    try {
      const cfg = JSON.parse(await fs.readFile(path.join(cwd, "aso.config.json"), "utf8"));
      if (cfg.appName) appName = cfg.appName;
    } catch {
      // Ignore
    }
  }

  const locales = Object.keys(metadataMap);
  if (locales.length === 0) {
    console.log(pc.yellow("No metadata found to preview. Provide --metadata <file> or run 'asocraft localize' first."));
    return;
  }

  const outPath = path.resolve(cwd, options.output || "asocraft-preview.html");
  await writeHtmlPreviewFile(metadataMap, outPath, appName);

  console.log(pc.green(`\n✔ Generated interactive HTML store preview with ${locales.length} locales:`));
  console.log(pc.cyan(`  ${outPath}\n`));

  if (options.open) {
    const startCmd =
      process.platform === "win32"
        ? `start "" "${outPath}"`
        : process.platform === "darwin"
        ? `open "${outPath}"`
        : `xdg-open "${outPath}"`;
    exec(startCmd);
    console.log(pc.dim("Opened preview in your default web browser."));
  }
}
