import { Command } from "commander";
import dotenv from "dotenv";
import { runInit } from "./commands/init.js";
import { runLocalize } from "./commands/localize.js";
import { runValidate } from "./commands/validate.js";
import { runKeywords } from "./commands/keywords.js";
import { runDiff } from "./commands/diff.js";
import { runExport } from "./commands/export.js";
import { runAudit } from "./commands/audit.js";
import { runReleaseNotes } from "./commands/release-notes.js";
import { runPull } from "./commands/pull.js";
import { runVariants } from "./commands/variants.js";
import { runPreview } from "./commands/preview.js";
import { runCi } from "./commands/ci.js";

// Load environment variables from .env if present
dotenv.config();

const program = new Command();

program
  .name("asocraft")
  .description("Automated multi-language App Store and Google Play localization pipeline with character boundary enforcement and Fastlane export")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize aso.config.json and baseline metadata.en.json template")
  .option("-f, --force", "Overwrite existing configuration files")
  .option("-g, --genre <genre>", "Preselect mobile application genre")
  .action(async (opts) => {
    try {
      await runInit(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("localize")
  .description("Localize baseline metadata into target languages with character boundary enforcement")
  .option("-c, --config <path>", "Path to configuration file", "aso.config.json")
  .option("-m, --metadata <path>", "Path to base metadata file", "metadata.en.json")
  .option("-l, --locales <locales>", "Comma-separated target locales (e.g. de-DE,ja,fr-FR)")
  .option("-p, --platform <platforms>", "Target platforms: ios, android, or all", "all")
  .option("--provider <provider>", "LLM provider: gemini, openai, anthropic, or offline")
  .option("--model <model>", "Model name override")
  .option("-o, --outDir <path>", "Fastlane output directory", "fastlane/metadata")
  .option("--dry-run", "Validate and preview without writing to disk")
  .option("-v, --verbose", "Print verbose step-by-step diagnostic progress")
  .action(async (opts) => {
    try {
      await runLocalize(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Audit existing Fastlane metadata folders against store character limits and rules")
  .option("-d, --dir <path>", "Path to Fastlane metadata root directory", "fastlane/metadata")
  .option("--strict", "Fail with exit code 1 if any warnings exist")
  .action(async (opts) => {
    try {
      await runValidate(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("audit")
  .description("Calculate ASO Quality Score (0-100), capacity utilization, and optimization recommendations")
  .option("-d, --dir <path>", "Fastlane metadata directory", "fastlane/metadata")
  .option("-f, --file <path>", "Path to JSON metadata file")
  .option("-l, --locale <locale>", "Filter evaluation to a specific locale")
  .option("--min-score <score>", "Fail with exit code 1 if average score is below threshold", Number)
  .action(async (opts) => {
    try {
      await runAudit(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("release-notes")
  .description("Generate store-compliant multi-language release notes / What's New for iOS and Android changelogs")
  .option("-i, --input <text>", "Raw release notes text to localize")
  .option("-f, --file <path>", "Path to release notes text file")
  .option("-c, --config <path>", "Path to aso.config.json")
  .option("-l, --locales <locales>", "Comma-separated target locales")
  .option("--version-code <codeOrNumber>", "Android version code for changelog file", "default")
  .option("--provider <provider>", "LLM provider: gemini, openai, anthropic, or offline")
  .option("-o, --outDir <path>", "Output directory for Fastlane metadata", "fastlane/metadata")
  .option("--dry-run", "Preview without writing files to disk")
  .action(async (opts) => {
    try {
      await runReleaseNotes(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("pull")
  .description("Pull and ingest live store metadata from Apple App Store or Google Play")
  .option("-i, --ios <idOrBundle>", "App Store App ID or Bundle Identifier")
  .option("-a, --android <packageId>", "Google Play package name (e.g. com.example.app)")
  .option("-u, --url <url>", "Direct App Store or Google Play URL")
  .option("-o, --output <path>", "Output metadata JSON path", "metadata.en.json")
  .option("--save-config", "Also create or update aso.config.json with pulled app name and genre")
  .action(async (opts) => {
    try {
      await runPull(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("variants")
  .description("Generate A/B testing variants for Custom Product Pages (iOS) and Store Listing Experiments (Android)")
  .option("-m, --metadata <path>", "Path to baseline metadata", "metadata.en.json")
  .option("-c, --config <path>", "Path to aso.config.json")
  .option("-l, --locales <locales>", "Target locales (comma-separated)")
  .option("-a, --angles <angles>", "Target positioning angles: gameplay, social, casual, progression")
  .option("-o, --output <path>", "Output file path (JSON or CSV)")
  .option("-f, --format <format>", "Export format: json or csv")
  .action(async (opts) => {
    try {
      await runVariants(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Generate standalone interactive HTML preview with Apple App Store and Google Play mobile mockups")
  .option("-d, --dir <path>", "Fastlane metadata directory", "fastlane/metadata")
  .option("-m, --metadata <path>", "Direct metadata JSON file")
  .option("-o, --output <path>", "Output HTML file path", "asocraft-preview.html")
  .option("--open", "Open in default web browser")
  .action(async (opts) => {
    try {
      await runPreview(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("keywords")
  .description("Audit and optimize iOS keywords for comma spacing and Title/Subtitle duplication")
  .option("-f, --file <path>", "Path to metadata JSON or Fastlane keywords.txt")
  .option("-k, --keywords <string>", "Raw comma-separated keyword string to analyze")
  .option("-t, --title <string>", "App Title for duplicate cross-checking")
  .option("-s, --subtitle <string>", "App Subtitle for duplicate cross-checking")
  .option("-l, --locale <locale>", "Locale for stop word detection", "en")
  .option("--optimize", "Output optimized keyword string")
  .action(async (opts) => {
    try {
      await runKeywords(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("diff")
  .description("Compare baseline English metadata against localized files to inspect expansion")
  .option("-d, --dir <path>", "Path to Fastlane metadata directory", "fastlane/metadata")
  .option("-m, --metadata <path>", "Path to baseline metadata file", "metadata.en.json")
  .option("-l, --locale <locale>", "Filter to a specific locale")
  .action(async (opts) => {
    try {
      await runDiff(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("export")
  .description("Convert Fastlane metadata folders into consolidated JSON or CSV")
  .option("-d, --dir <path>", "Source Fastlane metadata directory", "fastlane/metadata")
  .option("-f, --format <format>", "Export format: json or csv", "json")
  .option("-o, --output <path>", "Output file path")
  .action(async (opts) => {
    try {
      await runExport(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program
  .command("ci")
  .description("Run strict CI store compliance checks and generate GitHub Actions step summary")
  .option("-d, --dir <path>", "Path to Fastlane metadata root directory", "fastlane/metadata")
  .option("--strict", "Fail build if any warnings or sub-optimal keywords are found")
  .option("--install", "Scaffold .github/workflows/aso-check.yml into the project")
  .action(async (opts) => {
    try {
      await runCi(opts);
    } catch (err: any) {
      console.error(err.message || err);
      process.exit(1);
    }
  });

program.parse(process.argv);
