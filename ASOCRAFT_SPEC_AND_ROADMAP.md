# ASOCraft Specification and Implementation Roadmap
Automated App Store and Google Play Multi-Language ASO Localization Pipeline

---

## 1. Problem space and overview

### 1.1 The ASO localization challenge
For mobile studios with global user bases, App Store Optimization (ASO) is a primary organic acquisition channel. Maximizing global search visibility requires localizing store metadata into 15 to 25 target languages (German, French, Spanish, Japanese, Korean, Brazilian Portuguese, etc.).

Mobile teams face operational hurdles:
1. Strict character limit violations:
   - iOS App Store: Title (30 characters max), Subtitle (30 characters max), Keywords field (100 characters max, comma-separated).
   - Google Play: Title (30 characters max), Short Description (80 characters max), Full Description (4000 characters max), Changelog (500 characters max).
   Standard translation tools often expand sentence lengths by 20% to 35% in languages like German or French, which leads to metadata rejections during store submission.
2. Loss of category terminology:
   Literal machine translations often distort gaming and app keywords (for example translating "match-3 puzzle solver" into unnatural literal equivalents rather than high-volume local search terms).
3. Formatting and release overhead:
   Copy-pasting across dozens of locale folders in Fastlane risks human error, while translating release notes for bi-weekly updates creates recurrent friction.

### 1.2 The solution
ASOCraft is a TypeScript CLI tool and automation library that converts base English metadata into 20+ store-compliant, keyword-optimized localizations.

- Constraint enforcement: Uses Zod schemas, Unicode grapheme cluster measurement, and structured prompt validation loops to ensure every title, subtitle, and keyword list remains within character limits.
- Category terminology maps: Uses local search intent and genre conventions (casual games, utility tools, productivity) instead of literal translations.
- Quality scorecard (`asocraft audit`): Computes a 0 to 100 ASO quality score, evaluating field capacity utilization, keyword density, and formatting.
- Release notes generator (`asocraft release-notes`): Localizes What's New notes into iOS (<=4000 chars) and Google Play (<=500 chars) changelogs.
- Live store ingestion (`asocraft pull`): Downloads live store copy directly from App Store ID or Google Play package name.
- A/B testing variants (`asocraft variants`): Generates distinct positioning variants (gameplay, social, casual, progression).
- Interactive HTML preview (`asocraft preview`): Generates a standalone HTML document with mobile device mockups.
- Native Fastlane integration: Writes output files directly into standard Fastlane directory structures:
  - `fastlane/metadata/ios/<locale>/title.txt`, `subtitle.txt`, `keywords.txt`, `description.txt`, `release_notes.txt`
  - `fastlane/metadata/android/<locale>/title.txt`, `short_description.txt`, `full_description.txt`, `changelogs/<version>.txt`
  Files are immediately ready for single-command deployment via `fastlane deliver` and `fastlane supply`.

---

## 2. Technical architecture and data flow

```
[ Ingestion: asocraft pull / metadata.en.json ] ---> [ ASOCraft CLI ]
                                                           │
                                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ASOCraft Core Pipeline Engine                     │
├────────────────────────────────────────────────────────────────────────┤
│  1. Input Ingestion & Locale Matrix                                    │
│     ├── Reads English baseline metadata or pulls from Store API        │
│     ├── Resolves platform locale codes (e.g. ja for iOS, ja-JP Android)│
│     └── Loads genre-specific keyword glossary                          │
├────────────────────────────────────────────────────────────────────────┤
│  2. LLM Orchestration with Strict Boundary Constraints                │
│     ├── Structured Output Prompts (Gemini, Claude, OpenAI, Offline)    │
│     ├── Exact Character Boundary Guardrails:                           │
│     │   - iOS Title <= 30 chars, Subtitle <= 30 chars                  │
│     │   - iOS Keywords <= 100 chars (comma-separated, no spaces)       │
│     │   - Android Short Desc <= 80 chars, Full Desc <= 4000 chars      │
│     │   - Android Changelog <= 500 chars                               │
│     └── Automated Regeneration Loop if limits are exceeded             │
├────────────────────────────────────────────────────────────────────────┤
│  3. Keyword Optimization Engine & ASO Scorecard                        │
│     ├── Deduplicates keywords against Title and Subtitle tokens        │
│     ├── Strips unnecessary spaces after commas                         │
│     ├── Removes non-indexed stop words                                 │
│     └── Calculates ASO Quality Score (0-100) and recommendations       │
├────────────────────────────────────────────────────────────────────────┤
│  4. Formatter & Fastlane Exporter                                      │
│     ├── Validates character counts with UTF-8 and grapheme awareness   │
│     ├── Generates standard Fastlane directory hierarchy                │
│     ├── Exports HTML device mockup preview                             │
│     └── Generates JSON / CSV data exports                              │
└────────────────────────────────────────────────────────────────────────┘
                                                           │
                                                           ▼
[ Output: fastlane/metadata/<platform>/<locale>/*.txt ] ---> [ Fastlane Deploy ]
```

---

## 3. Directory structure

```
asocraft/
├── .github/
│   └── workflows/
│       └── aso-check.yml           # CI store compliance workflow
├── bin/
│   └── asocraft.js                 # Executable CLI entry
├── src/
│   ├── index.ts                    # Public programmatic API
│   ├── cli/
│   │   ├── index.ts                # Commander program definition
│   │   └── commands/
│   │       ├── init.ts             # asocraft init
│   │       ├── localize.ts         # asocraft localize
│   │       ├── validate.ts         # asocraft validate
│   │       ├── audit.ts            # asocraft audit
│   │       ├── release-notes.ts    # asocraft release-notes
│   │       ├── pull.ts             # asocraft pull
│   │       ├── variants.ts         # asocraft variants
│   │       ├── preview.ts          # asocraft preview
│   │       ├── keywords.ts         # asocraft keywords
│   │       ├── diff.ts             # asocraft diff
│   │       ├── export.ts           # asocraft export
│   │       └── ci.ts               # asocraft ci
│   ├── core/
│   │   ├── constraints/
│   │   │   ├── limits.ts           # Store character limits and rules
│   │   │   └── validator.ts        # UTF-8, grapheme cluster assertions
│   │   ├── engine/
│   │   │   ├── prompt-builder.ts   # Structured prompt generation
│   │   │   ├── translator.ts       # LLM orchestrator with retry loops
│   │   │   ├── keyword-optimizer.ts# iOS keyword deduplication and compaction
│   │   │   ├── glossary.ts         # Genre and category terminology tables
│   │   │   ├── audit.ts            # ASO quality scorecard and grading engine
│   │   │   ├── release-notes.ts    # Multi-language release notes engine
│   │   │   ├── pull.ts             # App Store and Google Play ingestor
│   │   │   ├── variants.ts         # A/B testing variant generator
│   │   │   └── providers/
│   │   │       ├── base.ts         # Abstract provider interface
│   │   │       ├── gemini.ts       # Google Gemini provider
│   │   │       ├── anthropic.ts    # Anthropic Claude provider
│   │   │       ├── openai.ts       # OpenAI provider
│   │   │       └── offline.ts      # Offline heuristic test engine
│   │   ├── exporters/
│   │   │   ├── fastlane-ios.ts     # fastlane/metadata/ios writer
│   │   │   ├── fastlane-android.ts # fastlane/metadata/android writer
│   │   │   ├── html-preview.ts     # Standalone HTML device mockup generator
│   │   │   ├── json-exporter.ts    # Consolidated JSON exporter
│   │   │   └── csv-exporter.ts     # Tabular CSV exporter
│   │   └── locales/
│   │       ├── matrix.ts           # iOS vs Android locale mappings
│   │       └── supported.ts        # List of supported store locales
│   ├── schemas/
│   │   ├── config.ts               # Zod schema for aso.config.json
│   │   ├── input.ts                # Zod schema for input metadata
│   │   └── output.ts               # Zod schema for localized outputs
│   └── types/
│       └── index.ts                # Shared TypeScript definitions
├── test/
│   ├── constraints.test.ts
│   ├── keyword-optimizer.test.ts
│   ├── locales.test.ts
│   ├── translator.test.ts
│   ├── fastlane-exporter.test.ts
│   ├── audit.test.ts
│   ├── release-notes.test.ts
│   ├── pull.test.ts
│   ├── variants.test.ts
│   ├── preview.test.ts
│   └── cli.test.ts
├── examples/
│   ├── aso.config.json
│   └── metadata.en.json
├── docs/
│   ├── architecture.md
│   ├── character-limits.md
│   ├── cli-reference.md
│   ├── fastlane-integration.md
│   └── glossary-and-genre.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── schema.json
└── README.md
```

---

## 4. Implementation roadmap status

- [x] Phase 1: Repository initialization, topics, and portfolio sync.
- [x] Phase 2: Core constraints, validation, and Unicode measuring engine.
- [x] Phase 3: Keyword optimization, deduplication, and genre glossaries.
- [x] Phase 4: Multi-provider orchestration (Gemini, Claude, OpenAI, Offline heuristic) with auto-correction retry loops.
- [x] Phase 5: Fastlane exporters and converters (iOS, Android, JSON, CSV).
- [x] Phase 6: Core CLI commands (`init`, `localize`, `validate`, `keywords`, `diff`, `export`).
- [x] Phase 7: ASO Quality Audit & Scorecard Engine (`asocraft audit`).
- [x] Phase 8: Multi-language Release Notes / What's New Generator (`asocraft release-notes`).
- [x] Phase 9: Live App Store and Google Play Ingestor (`asocraft pull`).
- [x] Phase 10: A/B Testing Variant Generator for Store Listing Experiments and Custom Product Pages (`asocraft variants`).
- [x] Phase 11: Interactive HTML Mobile Mockup Preview (`asocraft preview`).
- [x] Phase 12: Continuous integration checks (`asocraft ci`) and GitHub Actions workflow (`.github/workflows/aso-check.yml`).
- [x] Phase 13: 100% automated test coverage (41 tests passing in Vitest).
