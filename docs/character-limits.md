# Store Character Limits

Both Apple and Google enforce strict character length ceilings for store listings. Violating these constraints results in rejection at upload or build distribution time.

## Apple App Store constraints

| Field | Max characters | Fastlane filename | Search indexed | Notes |
|---|---|---|---|---|
| Title | 30 | `title.txt` | Yes | Highest keyword ranking weight |
| Subtitle | 30 | `subtitle.txt` | Yes | High keyword ranking weight |
| Keywords | 100 | `keywords.txt` | Yes | Comma-separated without spaces |
| Description | 4000 | `description.txt` | No | Visible to users, not indexed for search |
| Promotional text | 170 | `promotional_text.txt` | No | Can be updated without a new binary submission |

### iOS keyword rules

- The 100-character limit counts all characters including commas.
- Spaces after commas count against the 100-character limit. Removing spaces increases keyword capacity by roughly 15% to 20%.
- Words already included in the Title or Subtitle do not need to be repeated in the Keywords field. The App Store search algorithm indexes Title, Subtitle, and Keywords simultaneously.
- Special characters such as quotation marks, hashtags, or excessive punctuation are stripped or flagged.

## Google Play Store constraints

| Field | Max characters | Fastlane filename | Search indexed | Notes |
|---|---|---|---|---|
| Title | 30 | `title.txt` | Yes | Strongest ranking factor |
| Short description | 80 | `short_description.txt` | Yes | High ranking factor and conversion driver |
| Full description | 4000 | `full_description.txt` | Yes | Scanned by Google NLP indexer |

### Google Play keyword rules

- Google Play does not have a dedicated keywords field.
- Keyword relevance depends on keyword density in the Short Description and Full Description (typically 2% to 3% natural keyword density).
- Repetitive or keyword-stuffed descriptions violate Google Play spam guidelines and can cause app suspension.

## Multi-language expansion factors

Translation from English into other languages frequently causes character count expansion:

| Language | Typical expansion | Watch items |
|---|---|---|
| German (de-DE) | +25% to +35% | Compound words often exceed 30 character limits on titles |
| French (fr-FR) | +20% to +30% | Prepositions and articles expand phrase length |
| Spanish (es-ES) | +15% to +25% | Verb conjugation and modifiers add character length |
| Russian (ru) | +15% to +25% | Cyrllic character length and noun declensions |
| Japanese (ja) | -30% to -10% | Character count shrinks, but byte count increases |
| Korean (ko) | -25% to -10% | Compact character representation |
| Chinese (zh-Hans) | -40% to -20% | Highest information density per character |

When translating into expanding languages like German, the ASOCraft engine asks the LLM to rephrase or select concise synonyms rather than generating truncated strings.
