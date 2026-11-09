# asocraft

ASOCraft is a command-line tool and TypeScript library that automates multi-language App Store and Google Play metadata localization. It validates character counts against strict store limits, applies genre-aware terminology, and exports structured files directly into standard Fastlane directories.

## Why this exists

Publishing mobile apps globally requires localized metadata across 15 to 25 languages. Translation tools often expand sentence lengths:
- German and French frequently expand by 20% to 35% compared to English.
- Apple App Store limits titles to 30 characters, subtitles to 30 characters, and keywords to 100 characters.
- Google Play limits titles to 30 characters and short descriptions to 80 characters.

When a translation exceeds these boundaries by a single character, store submission fails. Standard machine translation also misses gaming and app conventions, translating terms literally instead of using high-volume search phrases. ASOCraft solves both problems by running structured output prompts with automated character validation and retries.

## Features

- Character limit enforcement: Validates every title, subtitle, short description, and keyword list against iOS and Google Play constraints.
- Automated correction loop: If a generated string exceeds limits, the engine requests a shorter variation until all fields pass.
- Fastlane export: Writes metadata directly to `fastlane/metadata/ios/<locale>/` and `fastlane/metadata/android/<locale>/`.
- Keyword optimization: Deduplicates iOS keywords against title and subtitle tokens, strips unnecessary spaces around commas, and flags stop words.
- Multi-provider support: Runs with Anthropic Claude, OpenAI, Google Gemini, or an offline heuristic engine for local development and CI runs without API keys.
- Directory validation: Audits existing Fastlane metadata folders and prints diagnostics with character overflows.
- Reversible workflow: Imports existing Fastlane directory trees back into single configuration files.

## Installation

```bash
npm install -g asocraft
# or run directly with npx
npx asocraft --help
```

For use as a project dependency:

```bash
npm install --save-dev asocraft
```

## Quick start

### 1. Initialize configuration

Generate a starter configuration and English metadata template:

```bash
npx asocraft init
```

This creates:
- `aso.config.json`: Target locales, platforms, genre, and provider settings.
- `metadata.en.json`: Base English metadata for iOS and Android.

### 2. Run localization

Localize metadata across all configured locales:

```bash
npx asocraft localize
```

Specify target locales or run in dry-run mode:

```bash
# Run for specific locales
npx asocraft localize --locales de-DE,fr-FR,ja,es-ES

# Test offline without API keys
npx asocraft localize --provider offline --dry-run
```

### 3. Validate existing metadata

Check existing Fastlane directories for character limit violations:

```bash
npx asocraft validate --dir fastlane/metadata
```

### 4. Audit keyword efficiency

Analyze keyword space utilization and duplicate terms:

```bash
npx asocraft keywords --file metadata.en.json
```

## Configuration

Example `aso.config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/alexandrmotologa/asocraft/main/schema.json",
  "appId": "com.example.app",
  "appName": "Pixel Quest",
  "genre": "casual-game",
  "defaultLocale": "en-US",
  "locales": [
    "de-DE",
    "fr-FR",
    "es-ES",
    "ja",
    "ko",
    "pt-BR",
    "it",
    "zh-Hans"
  ],
  "platforms": ["ios", "android"],
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "outDir": "fastlane/metadata",
  "options": {
    "stripKeywordSpaces": true,
    "deduplicateKeywords": true,
    "maxRetries": 3
  }
}
```

## Store constraints reference

### iOS App Store

| Field | Character limit | Notes |
|---|---|---|
| Title | 30 | Indexed by search algorithm |
| Subtitle | 30 | Indexed by search algorithm |
| Keywords | 100 | Comma-separated, no spaces needed |
| Description | 4000 | Not indexed for App Store search ranking |
| Promotional text | 170 | Can be updated without a new app version |

### Google Play Store

| Field | Character limit | Notes |
|---|---|---|
| Title | 30 | Heavy keyword indexing weight |
| Short description | 80 | Displayed above fold on store listing |
| Full description | 4000 | Full text indexed by Google search crawler |

## Fastlane export layout

```
fastlane/
└── metadata/
    ├── android/
    │   ├── de-DE/
    │   │   ├── full_description.txt
    │   │   ├── short_description.txt
    │   │   └── title.txt
    │   └── fr-FR/
    │       └── ...
    └── ios/
        ├── de-DE/
        │   ├── description.txt
        │   ├── keywords.txt
        │   ├── promotional_text.txt
        │   ├── subtitle.txt
        │   └── title.txt
        └── fr-FR/
            └── ...
```

Files are ready for deployment via `fastlane deliver` (iOS) and `fastlane supply` (Android).

## Programmatic API

You can import and run the pipeline inside custom build scripts:

```typescript
import { localizeMetadata, validateMetadata, exportToFastlane } from "asocraft";

const result = await localizeMetadata({
  source: {
    locale: "en-US",
    ios: {
      title: "Pixel Quest: Match 3 RPG",
      subtitle: "Casual Puzzle Adventure",
      keywords: "puzzle,match3,rpg,quest,hero",
      description: "Match gems, defeat bosses, and build your kingdom.",
    },
    android: {
      title: "Pixel Quest: Match 3 RPG",
      shortDescription: "Match gems and defeat epic bosses in this casual puzzle RPG.",
      fullDescription: "Detailed description here...",
    },
  },
  targetLocales: ["de-DE", "ja"],
  provider: "offline",
});

await exportToFastlane(result, "./fastlane/metadata");
```

## Development and testing

```bash
# Clone the repository
git clone https://github.com/alexandrmotologa/asocraft.git
cd asocraft

# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build
```

## License

MIT
