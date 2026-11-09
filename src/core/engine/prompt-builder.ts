import type { TranslationRequest } from "./providers/base.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../constraints/limits.js";

export function buildSystemPrompt(): string {
  return `You are an expert mobile App Store Optimization (ASO) and localization engineer.
Your task is to localize mobile application store metadata from English into the specified target language.

STRICT CONSTRAINTS (HARD CEILINGS - DO NOT EXCEED UNDER ANY CIRCUMSTANCES):
1. iOS App Store:
   - Title: Maximum ${IOS_LIMITS.title} characters. High search ranking weight.
   - Subtitle: Maximum ${IOS_LIMITS.subtitle} characters. High search ranking weight.
   - Keywords: Maximum ${IOS_LIMITS.keywords} characters. Comma-separated with NO SPACES after commas (e.g. "puzzle,rpg,quest").
     DO NOT repeat words that are already in the Title or Subtitle in the Keywords field, because Apple automatically indexes Title and Subtitle.
   - Description: Maximum ${IOS_LIMITS.description} characters.
   - Promotional Text (if present): Maximum ${IOS_LIMITS.promotionalText} characters.

2. Google Play Store:
   - Title: Maximum ${ANDROID_LIMITS.title} characters.
   - Short Description: Maximum ${ANDROID_LIMITS.shortDescription} characters.
   - Full Description: Maximum ${ANDROID_LIMITS.fullDescription} characters.

CRITICAL LOCALIZATION RULES:
- Never translate literally when natural gaming/app terminology exists in the target culture.
- Use the provided category glossary search terms where appropriate.
- Every character counts! When writing expanding languages like German, French, or Spanish, choose concise, impactful wording rather than wordy literal translations.
- Do not add ellipses or cut sentences midway. The copy must read cleanly and naturally.
- Output ONLY a valid JSON object adhering strictly to the requested schema.`;
}

export function buildUserPrompt(request: TranslationRequest): string {
  const {
    targetLocale,
    targetLocaleName,
    appName,
    genre,
    glossaryTerms,
    sourceMetadata,
    previousViolations,
    attempt,
  } = request;

  let prompt = `Localize the metadata for "${appName}" (${genre}) into ${targetLocaleName} (locale code: ${targetLocale}).

SOURCE METADATA (English baseline):
`;

  if (sourceMetadata.ios) {
    prompt += `\n[iOS Source]
Title: "${sourceMetadata.ios.title}"
Subtitle: "${sourceMetadata.ios.subtitle}"
Keywords: "${sourceMetadata.ios.keywords}"
Description: """${sourceMetadata.ios.description}"""
${sourceMetadata.ios.promotionalText ? `Promotional Text: "${sourceMetadata.ios.promotionalText}"` : ""}
`;
  }

  if (sourceMetadata.android) {
    prompt += `\n[Google Play Source]
Title: "${sourceMetadata.android.title}"
Short Description: "${sourceMetadata.android.shortDescription}"
Full Description: """${sourceMetadata.android.fullDescription}"""
`;
  }

  if (glossaryTerms.length > 0) {
    prompt += `\nRECOMMENDED SEARCH TERMS & GLOSSARY FOR ${targetLocaleName.toUpperCase()}:
${glossaryTerms.map((t) => `- "${t}"`).join("\n")}
`;
  }

  if (previousViolations && previousViolations.length > 0) {
    prompt += `\n⚠️ PREVIOUS ATTEMPT FAILED WITH CHARACTER LIMIT VIOLATIONS (Attempt ${attempt}):
`;
    for (const v of previousViolations) {
      prompt += `- [${v.platform.toUpperCase()} ${v.field}]: Produced ${v.currentLength} characters, which exceeds the max of ${v.maxLength} characters (+${v.currentLength - v.maxLength} characters overflow). ${v.suggestion ?? "Must be made shorter."}\n`;
    }
    prompt += `\nYOU MUST MAKE THE VIOLATING FIELDS SUBSTANTIALLY SHORTER TO GUARANTEE COMPLIANCE!\n`;
  }

  prompt += `\nReturn the localized metadata in the following JSON format:
{
  "locale": "${targetLocale}",
  "ios": {
    "title": "localized title <= 30 chars",
    "subtitle": "localized subtitle <= 30 chars",
    "keywords": "comma,separated,keywords,no,spaces <= 100 chars",
    "description": "localized full description <= 4000 chars"
  },
  "android": {
    "title": "localized title <= 30 chars",
    "shortDescription": "localized short description <= 80 chars",
    "fullDescription": "localized full description <= 4000 chars"
  }
}

Do not include markdown code fence formatting or explanations. Output pure JSON only.`;

  return prompt;
}
