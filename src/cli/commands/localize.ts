import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { AsoConfigSchema } from "../../schemas/config.js";
import { BaseMetadataSchema } from "../../schemas/input.js";
import { localizeMetadata } from "../../core/engine/translator.js";
import { exportToFastlane } from "../../core/exporters/index.js";
import { countCharacters } from "../../core/constraints/validator.js";
import type { ProviderType, Platform } from "../../types/index.js";

export interface LocalizeCommandOptions {
  config?: string;
  metadata?: string;
  locales?: string;
  platform?: string;
  provider?: string;
  model?: string;
  outDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

export async function runLocalize(options: LocalizeCommandOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.resolve(cwd, options.config || "aso.config.json");
  const metadataPath = path.resolve(cwd, options.metadata || "metadata.en.json");

  // Load and validate config
  const rawConfig = JSON.parse(await fs.readFile(configPath, "utf8"));
  const config = AsoConfigSchema.parse(rawConfig);

  // Load and validate metadata
  const rawMetadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
  const baseMetadata = BaseMetadataSchema.parse(rawMetadata);

  // Determine target locales
  let targetLocales = config.locales;
  if (options.locales) {
    targetLocales = options.locales.split(",").map((l) => l.trim()).filter(Boolean);
  }

  // Determine provider
  const provider = (options.provider || config.provider) as ProviderType;
  const model = options.model || config.model;
  const outDir = path.resolve(cwd, options.outDir || config.outDir);

  // Filter platforms if specified
  let platforms: Platform[] = config.platforms;
  if (options.platform) {
    if (options.platform === "all") {
      platforms = ["ios", "android"];
    } else {
      platforms = options.platform.split(",").map((p) => p.trim()) as Platform[];
    }
  }

  // Prepare source metadata respecting filtered platforms
  const filteredSource = {
    ...baseMetadata,
    ios: platforms.includes("ios") ? baseMetadata.ios : undefined,
    android: platforms.includes("android") ? baseMetadata.android : undefined,
  };

  console.log(pc.bold(pc.cyan(`\nASOCraft Localization Pipeline`)));
  console.log(`${pc.dim("App:")} ${config.appName} (${config.genre})`);
  console.log(`${pc.dim("Source Locale:")} ${baseMetadata.locale}`);
  console.log(`${pc.dim("Target Locales (${targetLocales.length}):")} ${targetLocales.join(", ")}`);
  console.log(`${pc.dim("Platforms:")} ${platforms.join(", ")}`);
  console.log(`${pc.dim("Provider:")} ${provider} ${model ? `(${model})` : ""}`);
  console.log(`${pc.dim("Output:")} ${options.dryRun ? pc.yellow("[DRY-RUN]") : outDir}\n`);

  const result = await localizeMetadata({
    source: filteredSource,
    targetLocales,
    provider,
    model,
    genre: config.genre,
    appName: config.appName,
    stripKeywordSpaces: config.options.stripKeywordSpaces,
    deduplicateKeywords: config.options.deduplicateKeywords,
    maxRetries: config.options.maxRetries,
    onLocaleProgress: (locale, status, attempt) => {
      if (options.verbose || status === "retrying") {
        console.log(`  [${locale}] status: ${status} (attempt ${attempt})`);
      }
    },
  });

  // Display summary table
  const table = new Table({
    head: [
      pc.bold("Locale"),
      pc.bold("Platform"),
      pc.bold("Title"),
      pc.bold("Subtitle / Short Desc"),
      pc.bold("Keywords"),
      pc.bold("Status"),
    ],
    colWidths: [12, 10, 22, 28, 16, 12],
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const locale of targetLocales) {
    const meta = result.localizations[locale];
    const report = result.reports[locale];

    if (!meta) continue;

    if (report) {
      totalErrors += report.errorCount;
      totalWarnings += report.warningCount;
    }

    if (meta.ios) {
      const titleLen = countCharacters(meta.ios.title);
      const subLen = countCharacters(meta.ios.subtitle);
      const kwLen = countCharacters(meta.ios.keywords);
      const status = titleLen <= 30 && subLen <= 30 && kwLen <= 100 ? pc.green("✔ VALID") : pc.red("✖ OVERFLOW");

      table.push([
        locale,
        "iOS",
        `${titleLen}/30`,
        `${subLen}/30`,
        `${kwLen}/100`,
        status,
      ]);
    }

    if (meta.android) {
      const titleLen = countCharacters(meta.android.title);
      const shortLen = countCharacters(meta.android.shortDescription);
      const status = titleLen <= 30 && shortLen <= 80 ? pc.green("✔ VALID") : pc.red("✖ OVERFLOW");

      table.push([
        locale,
        "Android",
        `${titleLen}/30`,
        `${shortLen}/80`,
        pc.dim("N/A"),
        status,
      ]);
    }
  }

  console.log(table.toString());

  if (!options.dryRun) {
    const exportResult = await exportToFastlane(result, outDir);
    console.log(
      pc.green(
        `\n✔ Exported ${exportResult.writtenFiles.length} Fastlane metadata files across ${exportResult.totalLocales} locales into ${outDir}`
      )
    );
  } else {
    console.log(pc.yellow("\n[Dry-run] Metadata files were validated and not written to disk."));
  }

  console.log(pc.dim(`Completed in ${(result.durationMs / 1000).toFixed(2)}s with ${totalErrors} errors, ${totalWarnings} warnings.\n`));
}
