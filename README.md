# asocraft

ASOCraft is a command-line tool and TypeScript library that automates multi-language App Store and Google Play metadata localization. It validates character counts against strict store limits, applies genre-aware terminology, grades ASO quality, generates multi-language release notes, creates A/B testing variants, and exports structured files directly into standard Fastlane directories.

## Why this exists

Publishing mobile apps globally requires localized metadata across 15 to 25 languages. Translation tools often expand sentence lengths:
- German and French frequently expand by 20% to 35% compared to English.
- Apple App Store limits titles to 30 characters, subtitles to 30 characters, and keywords to 100 characters.
- Google Play limits titles to 30 characters, short descriptions to 80 characters, and changelogs to 500 characters.

When a translation exceeds these boundaries by a single character, store submission fails. Standard machine translation also misses gaming and app conventions, translating terms literally instead of using high-volume search phrases. ASOCraft solves both problems by running structured output prompts with automated character validation, retries, and quality auditing.

## Features

- Character limit enforcement: Validates every title, subtitle, short description, and keyword list against iOS and Google Play constraints.
- Automated correction loop: If a generated string exceeds limits, the engine requests a shorter variation until all fields pass.
- Fastlane export: Writes metadata directly to `fastlane/metadata/ios/<locale>/` and `fastlane/metadata/android/<locale>/`.
- ASO quality scorecard (`asocraft audit`): Computes a 0 to 100 ASO quality score, measuring field capacity utilization, keyword density, and formatting.
- Multi-language release notes (`asocraft release-notes`): Translates and formats release notes for iOS (<=4000 chars) and Google Play changelogs (<=500 chars).
- Live store ingestion (`asocraft pull`): Downloads live store copy directly from an App Store ID, bundle ID, or Google Play package name.
- A/B testing variants (`asocraft variants`): Generates distinct positioning variants (gameplay, social, casual, progression) for store experiments and Custom Product Pages.
- Interactive HTML preview (`asocraft preview`): Generates a standalone HTML document with mobile device mockups for Apple App Store and Google Play listings.
- Keyword optimization: Deduplicates iOS keywords against title and subtitle tokens, strips unnecessary spaces around commas, and flags stop words.
- Multi-provider support: Runs with Anthropic Claude, OpenAI, Google Gemini, or an offline heuristic engine for local development and CI runs without API keys.
- CI/CD guardrail (`asocraft ci`): Verifies metadata in continuous integration pipelines and outputs step summaries for GitHub Actions.

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

### 1. Initialize or pull metadata

Generate a starter configuration and English template:

```bash
npx asocraft init
```

Or pull metadata from an existing live app:

```bash
npx asocraft pull --ios 1234567890 --save-config
# or from Google Play
npx asocraft pull --android com.example.app --save-config
```

### 2. Audit ASO quality

Audit your baseline copy for character utilization and keyword overlap:

```bash
npx asocraft audit --file metadata.en.json
```

### 3. Run localization

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

### 4. Generate multi-language release notes

Translate and format release notes into all target languages for both stores:

```bash
npx asocraft release-notes --input "Fixed launch crash on iOS 18, added Halloween event with 20 levels, improved loading speed."
```

### 5. Generate A/B testing variants

Generate positioning angles for store listing experiments:

```bash
npx asocraft variants --angles gameplay,social,casual --output variants.json
```

### 6. Preview store listings in your browser

Generate an interactive HTML preview with iPhone and Android mockups:

```bash
npx asocraft preview --open
```

### 7. Validate existing metadata

Check existing Fastlane directories for character limit violations:

```bash
npx asocraft validate --dir fastlane/metadata
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

| Field | Character limit | Fastlane path | Notes |
|---|---|---|---|
| Title | 30 | `title.txt` | Indexed by search algorithm |
| Subtitle | 30 | `subtitle.txt` | Indexed by search algorithm |
| Keywords | 100 | `keywords.txt` | Comma-separated, no spaces needed |
| Description | 4000 | `description.txt` | Visible to users |
| Promotional text | 170 | `promotional_text.txt` | Editable without new binary |
| Release notes | 4000 | `release_notes.txt` | What is new in this version |

### Google Play Store

| Field | Character limit | Fastlane path | Notes |
|---|---|---|---|
| Title | 30 | `title.txt` | Strong keyword indexing weight |
| Short description | 80 | `short_description.txt` | Displayed above fold on store listing |
| Full description | 4000 | `full_description.txt` | Indexed by Google search crawler |
| Changelog | 500 | `changelogs/<version>.txt` | Short summary of what is new |

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
