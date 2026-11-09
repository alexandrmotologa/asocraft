import { countCharacters } from "../constraints/validator.js";

const COMMON_STOP_WORDS: Record<string, Set<string>> = {
  en: new Set(["a", "an", "the", "and", "or", "for", "with", "in", "on", "at", "by", "to", "of"]),
  de: new Set(["der", "die", "das", "und", "oder", "für", "mit", "in", "an", "auf", "von", "zu"]),
  fr: new Set(["le", "la", "les", "un", "une", "des", "et", "ou", "pour", "avec", "dans", "sur", "de"]),
  es: new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "para", "con", "en", "de"]),
  it: new Set(["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "e", "o", "per", "con", "in", "di"]),
  pt: new Set(["o", "a", "os", "as", "um", "uma", "e", "ou", "para", "com", "em", "de"]),
};

export interface KeywordOptimizationResult {
  original: string;
  optimized: string;
  originalLength: number;
  optimizedLength: number;
  charactersSaved: number;
  removedDuplicates: string[];
  removedOverlapWithTitle: string[];
  removedStopWords: string[];
}

/**
 * Strips whitespace around commas. E.g. "puzzle, match 3, rpg" -> "puzzle,match 3,rpg".
 */
export function compactKeywords(keywords: string): string {
  if (!keywords) return "";
  return keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .join(",");
}

/**
 * Extracts searchable lowercase tokens from a text string.
 */
export function extractTokens(text: string | undefined): Set<string> {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .split(/[\s,.:;!?'"()\-–—\/#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
  return new Set(tokens);
}

/**
 * Optimizes an iOS keyword field by removing spaces, duplicates, and title/subtitle overlaps.
 */
export function optimizeIosKeywords(
  keywords: string,
  options?: {
    title?: string;
    subtitle?: string;
    locale?: string;
    removeStopWords?: boolean;
    deduplicateWithTitle?: boolean;
  }
): KeywordOptimizationResult {
  const original = keywords ?? "";
  const originalLength = countCharacters(original);

  const titleTokens = extractTokens(options?.title);
  const subtitleTokens = extractTokens(options?.subtitle);
  const combinedTitleTokens = new Set([...titleTokens, ...subtitleTokens]);

  const langCode = (options?.locale ?? "en").split("-")[0].toLowerCase();
  const stopWords = COMMON_STOP_WORDS[langCode] ?? COMMON_STOP_WORDS.en;

  const rawList = original
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const removedDuplicates: string[] = [];
  const removedOverlapWithTitle: string[] = [];
  const removedStopWords: string[] = [];
  const filteredList: string[] = [];

  for (const rawKw of rawList) {
    const lower = rawKw.toLowerCase();

    // Check duplicate within keyword list
    if (seen.has(lower)) {
      removedDuplicates.push(rawKw);
      continue;
    }

    // Check overlap with Title / Subtitle
    if (options?.deduplicateWithTitle !== false && combinedTitleTokens.has(lower)) {
      removedOverlapWithTitle.push(rawKw);
      continue;
    }

    // Check stop words
    if (options?.removeStopWords && stopWords.has(lower)) {
      removedStopWords.push(rawKw);
      continue;
    }

    seen.add(lower);
    filteredList.push(rawKw);
  }

  const optimized = filteredList.join(",");
  const optimizedLength = countCharacters(optimized);
  const charactersSaved = originalLength - optimizedLength;

  return {
    original,
    optimized,
    originalLength,
    optimizedLength,
    charactersSaved,
    removedDuplicates,
    removedOverlapWithTitle,
    removedStopWords,
  };
}

/**
 * Calculates keyword density for a text (useful for Google Play descriptions).
 */
export function calculateKeywordDensity(
  text: string,
  targetKeywords: string[]
): Record<string, { count: number; densityPercent: number }> {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).filter(Boolean);
  const totalWords = Math.max(words.length, 1);

  const result: Record<string, { count: number; densityPercent: number }> = {};

  for (const kw of targetKeywords) {
    const kwLower = kw.toLowerCase().trim();
    if (!kwLower) continue;

    // Word boundary regex
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    const densityPercent = parseFloat(((count / totalWords) * 100).toFixed(2));

    result[kw] = { count, densityPercent };
  }

  return result;
}
