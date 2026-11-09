# ASOCraft Specification and Implementation Roadmap
Automated App Store and Google Play Multi-Language ASO Localization Pipeline

---

## 1. Problem space and overview

### 1.1 The ASO localization challenge
For mobile studios with global user bases, App Store Optimization (ASO) is a primary organic acquisition channel. Maximizing global search visibility requires localizing store metadata into 15 to 25 target languages (German, French, Spanish, Japanese, Korean, Brazilian Portuguese, etc.).

Mobile teams face three main operational hurdles:
1. Strict character limit violations:
   - iOS App Store: Title (30 characters max), Subtitle (30 characters max), Keywords field (100 characters max, comma-separated).
   - Google Play: Title (30 characters max), Short Description (80 characters max), Full Description (4000 characters max).
   Standard translation tools often expand sentence lengths by 20% to 35% in languages like German or French, which leads to metadata rejections during store submission.
2. Loss of category terminology:
   Literal machine translations often distort gaming and app keywords (for example translating "match-3 puzzle solver" into unnatural literal equivalents rather than high-volume local search terms).
3. Manual formatting overhead:
   Third-party localization agencies often take 3 to 5 business days per update and charge $300 to $500 per release. Manual copy-pasting across dozens of locale folders in Fastlane risks human error.

### 1.2 The solution
ASOCraft is a TypeScript CLI tool and automation library that converts base English metadata into 20+ store-compliant, keyword-optimized localizations.

- Constraint enforcement: Uses Zod schemas, Unicode grapheme cluster measurement, and structured prompt validation loops to ensure every title, subtitle, and keyword list remains within character limits.
- Category terminology maps: Uses local search intent and genre conventions (casual games, utility tools, productivity) instead of literal translations.
- Native Fastlane integration: Writes output files directly into standard Fastlane directory structures:
  - `fastlane/metadata/ios/<locale>/title.txt`, `subtitle.txt`, `keywords.txt`, `description.txt`
  - `fastlane/metadata/android/<locale>/title.txt`, `short_description.txt`, `full_description.txt`
  Files are immediately ready for single-command deployment via `fastlane deliver` and `fastlane supply`.

---

## 2. Technical architecture and data flow

```
[ Source: metadata.en.json ] ---> [ ASOCraft CLI: asocraft localize ]
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ASOCraft Core Pipeline Engine                     │
├────────────────────────────────────────────────────────────────────────┤
│  1. Input Ingestion & Locale Matrix                                    │
│     ├── Reads English baseline metadata and target locales list        │
│     ├── Resolves platform locale codes (e.g. ja for iOS, ja-JP Android)│
│     └── Loads genre-specific keyword glossary                          │
├────────────────────────────────────────────────────────────────────────┤
│  2. LLM Orchestration with Strict Boundary Constraints                │
│     ├── Structured Output Prompts (Gemini, Claude, OpenAI, Offline)    │
│     ├── Exact Character Boundary Guardrails:                           │
│     │   - iOS Title <= 30 chars, Subtitle <= 30 chars                  │
│     │   - iOS Keywords <= 100 chars (comma-separated, no spaces)       │
│     │   - Android Short Desc <= 80 chars, Full Desc <= 4000 chars      │
│     └── Automated Regeneration Loop if limits are exceeded             │
├────────────────────────────────────────────────────────────────────────┤
│  3. Keyword Optimization Engine                                        │
│     ├── Deduplicates keywords against Title and Subtitle tokens        │
│     ├── Strips unnecessary spaces after commas                         │
│     └── Removes non-indexed stop words                                 │
├────────────────────────────────────────────────────────────────────────┤
│  4. Formatter & Fastlane Exporter                                      │
│     ├── Validates character counts with UTF-8 and grapheme awareness   │
│     └── Generates standard Fastlane directory hierarchy               │
└────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
[ Output: fastlane/metadata/<platform>/<locale>/*.txt ] ---> [ Fastlane Deploy ]
```

---

## 3. Directory structure

```
asocraft/
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
│   │       ├── keywords.ts         # asocraft keywords
│   │       ├── diff.ts             # asocraft diff
│   │       └── export.ts           # asocraft export
│   ├── core/
│   │   ├── constraints/
│   │   │   ├── limits.ts           # Store character limits and rules
│   │   │   └── validator.ts        # UTF-8, grapheme cluster assertions
│   │   ├── engine/
│   │   │   ├── prompt-builder.ts   # Structured prompt generation
│   │   │   ├── translator.ts       # LLM orchestrator with retry loops
│   │   │   ├── keyword-optimizer.ts# iOS keyword deduplication and compaction
│   │   │   ├── glossary.ts         # Genre and category terminology tables
│   │   │   └── providers/
│   │   │       ├── base.ts         # Abstract provider interface
│   │   │       ├── gemini.ts       # Google Gemini provider
│   │   │       ├── anthropic.ts    # Anthropic Claude provider
│   │   │       ├── openai.ts       # OpenAI provider
│   │   │       └── offline.ts      # Offline heuristic test engine
│   │   ├── exporters/
│   │   │   ├── fastlane-ios.ts     # fastlane/metadata/ios writer
│   │   │   ├── fastlane-android.ts # fastlane/metadata/android writer
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
│   ├── prompt-builder.test.ts
│   ├── translator.test.ts
│   ├── fastlane-exporter.test.ts
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
└── README.md
```

---

## 4. Implementation roadmap and execution plan

### Phase 1: Repository initialization and portfolio registry
- [x] Create project files (`package.json`, `tsconfig.json`, `tsup.config.ts`, `.gitignore`, `bin/asocraft.js`).
- [x] Write factual `README.md` and documentation files adhering to humanizer guidelines.
- [ ] Initialize git repository and create public GitHub repo (`alexandrmotologa/asocraft`).
- [ ] Configure repository metadata: description and 8 to 15 targeted topics.
- [ ] Complete Portfolio Phase 1 synchronization in `mtlg-site` and `mtlglabs-space`.

### Phase 2: Core constraints, validation, and type system
- [ ] Implement `src/core/constraints/limits.ts` (iOS and Google Play boundary constants).
- [ ] Implement `src/core/constraints/validator.ts` (character counting, grapheme cluster segmentation, field rule checks).
- [ ] Define Zod schemas in `src/schemas/config.ts`, `src/schemas/input.ts`, `src/schemas/output.ts`.
- [ ] Implement locale code mapping matrix in `src/core/locales/matrix.ts` and `supported.ts`.

### Phase 3: Keyword optimization and genre glossaries
- [ ] Implement `src/core/engine/keyword-optimizer.ts`:
  - Strips spaces after commas for iOS keyword lists.
  - Cross-checks and removes keywords already present in Title and Subtitle.
  - Cleans stop words and special characters.
- [ ] Implement `src/core/engine/glossary.ts`:
  - Terminology tables for casual games, match-3, RPG, utility, productivity across 15+ locales.

### Phase 4: Provider orchestration and auto-correction engine
- [ ] Implement `src/core/engine/providers/base.ts`: Abstract provider contract.
- [ ] Implement `src/core/engine/providers/offline.ts`: Deterministic heuristic localization engine for zero-API-key testing and offline builds.
- [ ] Implement `src/core/engine/providers/gemini.ts`, `anthropic.ts`, `openai.ts`.
- [ ] Implement `src/core/engine/prompt-builder.ts`: Formulates boundary-enforced structured prompts.
- [ ] Implement `src/core/engine/translator.ts`: Orchestrates calls with automatic regeneration loops upon boundary overflow.

### Phase 5: Fastlane exporters and converters
- [ ] Implement `src/core/exporters/fastlane-ios.ts`: Generates iOS Fastlane metadata.
- [ ] Implement `src/core/exporters/fastlane-android.ts`: Generates Android Fastlane metadata.
- [ ] Implement `src/core/exporters/json-exporter.ts` and `csv-exporter.ts`.
- [ ] Implement Fastlane directory importer for reverse migration.

### Phase 6: CLI commands implementation
- [ ] Implement `asocraft init` command.
- [ ] Implement `asocraft localize` command.
- [ ] Implement `asocraft validate` command.
- [ ] Implement `asocraft keywords` command.
- [ ] Implement `asocraft diff` command.
- [ ] Implement `asocraft export` command.

### Phase 7: Automated test suite and verification
- [ ] Write unit tests for constraints, validators, and keyword optimizer.
- [ ] Write integration tests for translator retry loop and offline provider.
- [ ] Write exporter tests verifying Fastlane folder outputs.
- [ ] Run full test suite with Vitest and confirm 100% pass rate.
- [ ] Build production distribution with `npm run build`.
