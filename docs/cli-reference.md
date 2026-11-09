# CLI Reference

The `asocraft` executable provides commands to initialize projects, localize metadata, validate existing store directories, analyze keywords, and export metadata files.

## Global options

- `-V, --version`: Output the current version.
- `-h, --help`: Display help for commands.

---

## `asocraft init`

Initializes a new ASOCraft workspace with a starter configuration and English template.

```bash
asocraft init [options]
```

### Options

- `-f, --force`: Overwrite existing configuration files if present.
- `--genre <genre>`: Preselect application genre (e.g. `casual-game`, `rpg`, `productivity`, `fitness`).

### Files created

- `aso.config.json`: Project configuration.
- `metadata.en.json`: Master English metadata file.

---

## `asocraft localize`

Runs the localization pipeline on base metadata files.

```bash
asocraft localize [options]
```

### Options

- `-c, --config <path>`: Path to configuration file (default: `aso.config.json`).
- `-m, --metadata <path>`: Path to base metadata file (default: `metadata.en.json`).
- `-l, --locales <locales>`: Comma-separated list of target locales (e.g. `de-DE,ja,es-ES`).
- `-p, --platform <platforms>`: Comma-separated target platforms: `ios`, `android`, or `all` (default: `all`).
- `--provider <name>`: LLM provider: `gemini`, `openai`, `anthropic`, or `offline` (default: provider in config).
- `--model <name>`: Custom model name for the provider.
- `-o, --outDir <path>`: Output directory for Fastlane metadata (default: `fastlane/metadata`).
- `--dry-run`: Run translation and validation without writing files to disk.
- `--verbose`: Print detailed logs including prompt tokens and character measurements.

---

## `asocraft validate`

Audits existing Fastlane metadata folders or JSON files against store constraints.

```bash
asocraft validate [options]
```

### Options

- `-d, --dir <path>`: Root directory containing Fastlane metadata (default: `fastlane/metadata`).
- `-p, --platform <platforms>`: Platforms to validate: `ios`, `android`, or `all`.
- `-l, --locales <locales>`: Validate specific locales.
- `--strict`: Fail with exit code 1 if any warnings (like keyword spacing or duplicates) are detected.

---

## `asocraft keywords`

Analyzes iOS keywords for space efficiency, duplicate indexing against Title and Subtitle, and stop words.

```bash
asocraft keywords [options]
```

### Options

- `-f, --file <path>`: Path to JSON metadata file or Fastlane `keywords.txt` file.
- `-t, --title <string>`: App title for duplicate cross-checking.
- `-s, --subtitle <string>`: App subtitle for duplicate cross-checking.
- `--optimize`: Output an optimized keyword string with spaces stripped and duplicates removed.

---

## `asocraft diff`

Compares base metadata against localized files to inspect character changes and field completeness.

```bash
asocraft diff [options]
```

### Options

- `-c, --config <path>`: Path to configuration file.
- `-d, --dir <path>`: Fastlane metadata directory (default: `fastlane/metadata`).
- `-l, --locales <locales>`: Locales to compare.

---

## `asocraft export`

Converts metadata between Fastlane format and unified JSON or CSV files.

```bash
asocraft export [options]
```

### Options

- `-d, --dir <path>`: Source directory (default: `fastlane/metadata`).
- `-f, --format <format>`: Target format: `json` or `csv` (default: `json`).
- `-o, --output <path>`: Output file path.
