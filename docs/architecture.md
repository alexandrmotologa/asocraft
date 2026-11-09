# Architecture

ASOCraft translates and validates mobile store metadata through a multi-stage pipeline designed around store character constraints and Fastlane export conventions.

## Core pipeline flow

```
[ Input Metadata (metadata.en.json) ]
             │
             ▼
[ Configuration Parser (aso.config.json) ]
             │
             ▼
[ Locale Matrix Resolver ]
             │
             ├── Resolve iOS locale codes (e.g. de-DE, ja, zh-Hans)
             └── Resolve Google Play locale codes (e.g. de-DE, ja-JP, zh-CN)
             │
             ▼
[ Translation Engine ]
             │
             ├── Provider Selection (Gemini, Claude, OpenAI, Offline)
             ├── Genre Glossary Injection (Casual, RPG, Utility, etc.)
             └── Structured Output Generation
             │
             ▼
[ Validation and Correction Loop ]
             │
             ├── Character and Byte Length Inspection
             ├── Keyword Deduplication against Title and Subtitle
             ├── Comma Compaction (zero spaces after commas)
             └── Automated Retry Prompt if limits exceeded
             │
             ▼
[ Exporter Engine ]
             │
             ├── Fastlane iOS Exporter (fastlane/metadata/ios/<locale>/*.txt)
             ├── Fastlane Android Exporter (fastlane/metadata/android/<locale>/*.txt)
             ├── JSON / CSV Exporter
             └── Diagnostics Reporter
```

## Module breakdown

### 1. Constraints module (`src/core/constraints/`)
Stores platform specific character boundaries and validates strings:
- `limits.ts`: Contains constant limits for iOS App Store and Google Play fields.
- `validator.ts`: Measures lengths using proper Unicode grapheme clusters and character code points, catching multibyte character discrepancies.

### 2. Engine module (`src/core/engine/`)
Handles prompt formulation and model interactions:
- `prompt-builder.ts`: Generates structured system instructions enforcing character ceilings and genre-specific terminology.
- `translator.ts`: Dispatches prompts to the active provider (Gemini, Claude, OpenAI, Offline) and executes regeneration loops when violations occur.
- `glossary.ts`: Contains genre keyword dictionaries for games and apps in target languages.
- `keyword-optimizer.ts`: Removes stop words, removes keywords duplicated in Title or Subtitle, and compresses comma separators.

### 3. Exporters module (`src/core/exporters/`)
Formats validated outputs into disk structures:
- `fastlane-ios.ts`: Writes individual `.txt` files per field into `fastlane/metadata/ios/<locale>/`.
- `fastlane-android.ts`: Writes individual `.txt` files per field into `fastlane/metadata/android/<locale>/`.
- `json-exporter.ts`: Exports multi-locale metadata into consolidated JSON for external tools.
- `csv-exporter.ts`: Exports rows for human review in spreadsheets.

### 4. CLI module (`src/cli/`)
Command-line interface built with Commander:
- `localize`: Localizes base metadata into all or specified target languages.
- `validate`: Audits an existing metadata folder against store constraints.
- `init`: Generates initial project files.
- `keywords`: Runs keyword density and optimization checks.
- `diff`: Displays character delta between base and localized versions.
- `export`: Converts between Fastlane and JSON formats.
