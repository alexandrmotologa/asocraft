import { Command } from "commander";
import dotenv from "dotenv";
import { runInit } from "./commands/init.js";
import { runLocalize } from "./commands/localize.js";
import { runValidate } from "./commands/validate.js";
import { runKeywords } from "./commands/keywords.js";
import { runDiff } from "./commands/diff.js";
import { runExport } from "./commands/export.js";

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

program.parse(process.argv);
