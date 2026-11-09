import path from "node:path";
import pc from "picocolors";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { exportToJson, exportToCsv } from "../../core/exporters/json-exporter.js";
import type { LocalizationResult } from "../../types/index.js";

export interface ExportCommandOptions {
  dir?: string;
  format?: "json" | "csv";
  output?: string;
}

export async function runExport(options: ExportCommandOptions): Promise<void> {
  const cwd = process.cwd();
  const sourceDir = path.resolve(cwd, options.dir || "fastlane/metadata");
  const format = options.format || "json";
  const defaultOutputFile = format === "csv" ? "asocraft-export.csv" : "asocraft-export.json";
  const outputPath = path.resolve(cwd, options.output || defaultOutputFile);

  console.log(pc.bold(pc.cyan(`\nASOCraft Metadata Exporter`)));
  console.log(`${pc.dim("Source Directory:")} ${sourceDir}`);
  console.log(`${pc.dim("Format:")} ${format}`);
  console.log(`${pc.dim("Target File:")} ${outputPath}\n`);

  const imported = await importFastlaneDirectory(sourceDir);
  const locales = Object.keys(imported);

  if (locales.length === 0) {
    console.log(pc.yellow(`No metadata found in ${sourceDir}`));
    return;
  }

  const result: LocalizationResult = {
    sourceLocale: "en-US",
    targetLocales: locales,
    localizations: imported,
    reports: {},
    durationMs: 0,
  };

  if (format === "csv") {
    await exportToCsv(result, outputPath);
  } else {
    await exportToJson(result, outputPath);
  }

  console.log(pc.green(`✔ Successfully exported ${locales.length} locales to ${outputPath}\n`));
}
