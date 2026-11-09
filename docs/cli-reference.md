# CLI Reference

The `asocraft` executable provides commands to initialize projects, pull live store data, localize metadata, audit ASO quality, generate release notes and variants, preview listings, and validate store directories.

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
- `-g, --genre <genre>`: Preselect application genre (e.g. `casual-game`, `puzzle`, `rpg`, `productivity`, `fitness`).

---

## `asocraft pull`

Pulls live store metadata directly from the Apple App Store or Google Play Store.

```bash
asocraft pull [options]
```

### Options

- `-i, --ios <idOrBundle>`: App Store App ID or Bundle Identifier.
- `-a, --android <packageId>`: Google Play package name (e.g. `com.example.app`).
- `-u, --url <url>`: Direct store URL.
- `-o, --output <path>`: Output JSON file path (default: `metadata.en.json`).
- `--save-config`: Also create or update `aso.config.json` with pulled app name and genre.

---

## `asocraft audit`

Calculates an ASO Quality Score (0 to 100), evaluating field capacity utilization, keyword density, and formatting.

```bash
asocraft audit [options]
```

### Options

- `-d, --dir <path>`: Path to Fastlane metadata root directory (default: `fastlane/metadata`).
- `-f, --file <path>`: Path to a specific metadata JSON file.
- `-l, --locale <locale>`: Filter evaluation to a specific locale.
- `--min-score <score>`: Exit with code 1 if composite score falls below this threshold.

---

## `asocraft release-notes`

Generates store-compliant multi-language release notes / What's New for iOS and Android changelogs.

```bash
asocraft release-notes [options]
```

### Options

- `-i, --input <text>`: Raw release notes text to localize.
- `-f, --file <path>`: Path to release notes draft file.
- `-c, --config <path>`: Path to `aso.config.json`.
- `-l, --locales <locales>`: Comma-separated target locales.
- `--version-code <codeOrNumber>`: Android version code for the changelog file (default: `default`).
- `--provider <provider>`: LLM provider: `gemini`, `openai`, `anthropic`, or `offline`.
- `-o, --outDir <path>`: Output directory for Fastlane metadata (default: `fastlane/metadata`).
- `--dry-run`: Preview without writing files to disk.

---

## `asocraft variants`

Generates positioning variants (gameplay, social, casual, progression) for A/B testing in Custom Product Pages (iOS) and Store Listing Experiments (Android).

```bash
asocraft variants [options]
```

### Options

- `-m, --metadata <path>`: Path to baseline metadata file (default: `metadata.en.json`).
- `-c, --config <path>`: Path to `aso.config.json`.
- `-l, --locales <locales>`: Comma-separated target locales.
- `-a, --angles <angles>`: Target angles: `gameplay`, `social`, `casual`, `progression`.
- `-o, --output <path>`: Output file path.
- `-f, --format <format>`: Export format: `json` or `csv`.

---

## `asocraft preview`

Generates a standalone interactive HTML preview with Apple App Store and Google Play mobile mockups.

```bash
asocraft preview [options]
```

### Options

- `-d, --dir <path>`: Fastlane metadata directory (default: `fastlane/metadata`).
- `-m, --metadata <path>`: Direct metadata JSON file.
- `-o, --output <path>`: Output HTML file path (default: `asocraft-preview.html`).
- `--open`: Automatically open in default web browser.

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
- `-p, --platform <platforms>`: Target platforms: `ios`, `android`, or `all` (default: `all`).
- `--provider <name>`: LLM provider: `gemini`, `openai`, `anthropic`, or `offline`.
- `--model <name>`: Custom model name for the provider.
- `-o, --outDir <path>`: Output directory for Fastlane metadata (default: `fastlane/metadata`).
- `--dry-run`: Run translation and validation without writing files to disk.
- `-v, --verbose`: Print detailed logs including prompt tokens and character measurements.

---

## `asocraft validate`

Audits existing Fastlane metadata folders or JSON files against store constraints.

```bash
asocraft validate [options]
```

### Options

- `-d, --dir <path>`: Root directory containing Fastlane metadata (default: `fastlane/metadata`).
- `--strict`: Fail with exit code 1 if any warnings (like keyword spacing or duplicates) are detected.

---

## `asocraft keywords`

Analyzes iOS keywords for space efficiency, duplicate indexing against Title and Subtitle, and stop words.

```bash
asocraft keywords [options]
```

### Options

- `-f, --file <path>`: Path to JSON metadata file or Fastlane `keywords.txt` file.
- `-k, --keywords <string>`: Raw comma-separated keyword string to analyze.
- `-t, --title <string>`: App title for duplicate cross-checking.
- `-s, --subtitle <string>`: App subtitle for duplicate cross-checking.
- `-l, --locale <locale>`: Locale code for stop word filtering (default: `en`).
- `--optimize`: Output an optimized keyword string with spaces stripped and duplicates removed.

---

## `asocraft diff`

Compares base metadata against localized files to inspect character changes and field completeness.

```bash
asocraft diff [options]
```

### Options

- `-d, --dir <path>`: Fastlane metadata directory (default: `fastlane/metadata`).
- `-m, --metadata <path>`: Path to baseline metadata file (default: `metadata.en.json`).
- `-l, --locale <locale>`: Filter comparison to a specific locale.

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

---

## `asocraft ci`

Runs continuous integration store compliance checks, and generates a markdown summary table for GitHub Actions step summary (`$GITHUB_STEP_SUMMARY`).

```bash
asocraft ci [options]
```

### Options

- `-d, --dir <path>`: Path to Fastlane metadata root directory (default: `fastlane/metadata`).
- `--strict`: Fail build if any warnings or sub-optimal keywords are found.
- `--install`: Scaffold `.github/workflows/aso-check.yml` into the repository.
