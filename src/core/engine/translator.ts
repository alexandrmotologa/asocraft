import type {
  BaseMetadata,
  LocalizedStoreMetadata,
  LocalizationResult,
  ValidationReport,
  FieldValidationIssue,
  AsoConfig,
  ProviderType,
} from "../../types/index.js";
import { createProvider, BaseTranslationProvider } from "./providers/index.js";
import { getGlossaryForLocale } from "./glossary.js";
import { validateMetadata, countCharacters } from "../constraints/validator.js";
import { optimizeIosKeywords, compactKeywords } from "./keyword-optimizer.js";
import { getLocaleDisplayName } from "../locales/matrix.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../constraints/limits.js";

function hardFallbackTrim(
  metadata: LocalizedStoreMetadata
): LocalizedStoreMetadata {
  const result: LocalizedStoreMetadata = {
    locale: metadata.locale,
  };

  if (metadata.ios) {
    const ios = { ...metadata.ios };
    if (countCharacters(ios.title) > IOS_LIMITS.title) {
      ios.title = [...ios.title].slice(0, IOS_LIMITS.title).join("");
    }
    if (countCharacters(ios.subtitle) > IOS_LIMITS.subtitle) {
      ios.subtitle = [...ios.subtitle].slice(0, IOS_LIMITS.subtitle).join("");
    }
    if (countCharacters(ios.keywords) > IOS_LIMITS.keywords) {
      // Split by comma, fit as many as possible
      const parts = ios.keywords.split(",");
      const fitted: string[] = [];
      let len = 0;
      for (const p of parts) {
        const added = countCharacters(p) + (fitted.length > 0 ? 1 : 0);
        if (len + added <= IOS_LIMITS.keywords) {
          fitted.push(p);
          len += added;
        } else break;
      }
      ios.keywords = fitted.join(",");
    }
    result.ios = ios;
  }

  if (metadata.android) {
    const android = { ...metadata.android };
    if (countCharacters(android.title) > ANDROID_LIMITS.title) {
      android.title = [...android.title].slice(0, ANDROID_LIMITS.title).join("");
    }
    if (countCharacters(android.shortDescription) > ANDROID_LIMITS.shortDescription) {
      android.shortDescription = [...android.shortDescription].slice(0, ANDROID_LIMITS.shortDescription).join("");
    }
    result.android = android;
  }

  return result;
}

export interface LocalizeOptions {
  source: BaseMetadata;
  targetLocales: string[];
  provider?: ProviderType | BaseTranslationProvider;
  apiKey?: string;
  model?: string;
  maxRetries?: number;
  genre?: AsoConfig["genre"];
  appName?: string;
  stripKeywordSpaces?: boolean;
  deduplicateKeywords?: boolean;
  onLocaleProgress?: (locale: string, status: "translating" | "validating" | "retrying" | "done" | "failed", attempt: number) => void;
}

export async function localizeMetadata(
  options: LocalizeOptions
): Promise<LocalizationResult> {
  const startTime = Date.now();
  const sourceLocale = options.source.locale || "en-US";
  const appName = options.appName || options.source.appName || "App";
  const genre = options.genre || options.source.genre || "casual-game";
  const maxRetries = options.maxRetries ?? 3;
  const stripKeywordSpaces = options.stripKeywordSpaces !== false;
  const deduplicateKeywords = options.deduplicateKeywords !== false;

  let provider: BaseTranslationProvider;
  if (options.provider && typeof options.provider === "object") {
    provider = options.provider;
  } else {
    provider = createProvider((options.provider as ProviderType) || "gemini", {
      apiKey: options.apiKey,
      model: options.model,
    });
  }

  const localizations: Record<string, LocalizedStoreMetadata> = {};
  const reports: Record<string, ValidationReport> = {};

  for (const locale of options.targetLocales) {
    const localeName = getLocaleDisplayName(locale);
    const glossaryTerms = getGlossaryForLocale(genre, locale);

    let currentMetadata: LocalizedStoreMetadata | null = null;
    let currentReport: ValidationReport | null = null;
    let previousViolations: FieldValidationIssue[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      options.onLocaleProgress?.(locale, attempt > 1 ? "retrying" : "translating", attempt);

      const response = await provider.translate({
        targetLocale: locale,
        targetLocaleName: localeName,
        appName,
        genre,
        glossaryTerms,
        sourceMetadata: options.source,
        previousViolations,
        attempt,
      });

      let candidate = response.metadata;

      // Apply keyword optimization rules
      if (candidate.ios?.keywords) {
        let kw = candidate.ios.keywords;
        if (stripKeywordSpaces) {
          kw = compactKeywords(kw);
        }
        if (deduplicateKeywords) {
          const opt = optimizeIosKeywords(kw, {
            title: candidate.ios.title,
            subtitle: candidate.ios.subtitle,
            locale,
          });
          kw = opt.optimized;
        }
        candidate.ios.keywords = kw;
      }

      options.onLocaleProgress?.(locale, "validating", attempt);
      const report = validateMetadata(candidate);

      currentMetadata = candidate;
      currentReport = report;

      if (report.valid) {
        // Passed with 0 errors!
        break;
      }

      // Collect violations for the next prompt iteration
      previousViolations = report.issues.filter((i) => i.severity === "error");
    }

    // If still invalid after max retries, apply safe fallback trimming to ensure compliance
    if (currentReport && !currentReport.valid && currentMetadata) {
      currentMetadata = hardFallbackTrim(currentMetadata);
      currentReport = validateMetadata(currentMetadata);
    }

    if (currentMetadata && currentReport) {
      localizations[locale] = currentMetadata;
      reports[locale] = currentReport;
      options.onLocaleProgress?.(locale, currentReport.valid ? "done" : "failed", maxRetries);
    }
  }

  return {
    sourceLocale,
    targetLocales: options.targetLocales,
    localizations,
    reports,
    durationMs: Date.now() - startTime,
  };
}
