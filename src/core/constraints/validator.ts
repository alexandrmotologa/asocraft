import {
  IOS_LIMITS,
  ANDROID_LIMITS,
  type IosFieldName,
  type AndroidFieldName,
} from "./limits.js";
import type {
  IosMetadata,
  AndroidMetadata,
  LocalizedStoreMetadata,
  ValidationReport,
  FieldValidationIssue,
} from "../../types/index.js";

/**
 * Counts characters considering Unicode grapheme clusters (emojis, accented characters).
 */
export function countCharacters(text: string | undefined | null): number {
  if (!text) return 0;
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].length;
  }
  return [...text].length;
}

/**
 * Counts UTF-8 byte length for network and storage diagnostics.
 */
export function countUtf8Bytes(text: string | undefined | null): number {
  if (!text) return 0;
  return Buffer.byteLength(text, "utf8");
}

export function validateIosField(
  field: IosFieldName,
  value: string,
  locale: string = "unknown",
  context?: { title?: string; subtitle?: string }
): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  const max = IOS_LIMITS[field];
  const charLength = countCharacters(value);

  if (charLength > max) {
    issues.push({
      platform: "ios",
      locale,
      field,
      currentLength: charLength,
      maxLength: max,
      severity: "error",
      message: `iOS ${field} exceeds limit (${charLength}/${max} chars, +${charLength - max} overflow).`,
      suggestion: `Trim ${charLength - max} character(s) from ${field}.`,
    });
  }

  // Whitespace check
  if (value !== value.trim()) {
    issues.push({
      platform: "ios",
      locale,
      field,
      currentLength: charLength,
      maxLength: max,
      severity: "warning",
      message: `iOS ${field} has leading or trailing whitespace.`,
      suggestion: "Trim whitespace to avoid wasted characters.",
    });
  }

  // iOS Keywords specific checks
  if (field === "keywords" && value) {
    if (value.includes(", ")) {
      issues.push({
        platform: "ios",
        locale,
        field: "keywords",
        currentLength: charLength,
        maxLength: max,
        severity: "warning",
        message: "Keywords field contains spaces after commas (e.g. 'a, b' instead of 'a,b').",
        suggestion: "Remove spaces after commas to recover character capacity.",
      });
    }

    const keywordList = value
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    // Duplicate keywords check
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const kw of keywordList) {
      if (seen.has(kw)) {
        duplicates.add(kw);
      }
      seen.add(kw);
    }

    if (duplicates.size > 0) {
      issues.push({
        platform: "ios",
        locale,
        field: "keywords",
        currentLength: charLength,
        maxLength: max,
        severity: "warning",
        message: `Keywords contain duplicate terms: ${[...duplicates].join(", ")}.`,
        suggestion: "Remove duplicates to save space for unique discovery keywords.",
      });
    }

    // Title / Subtitle overlap check
    if (context?.title || context?.subtitle) {
      const titleTokens = new Set(
        `${context.title ?? ""} ${context.subtitle ?? ""}`
          .toLowerCase()
          .split(/[\s,.:;!?'"()\-]+/)
          .filter((t) => t.length > 1)
      );

      const overlapping = keywordList.filter((kw) => titleTokens.has(kw));
      if (overlapping.length > 0) {
        issues.push({
          platform: "ios",
          locale,
          field: "keywords",
          currentLength: charLength,
          maxLength: max,
          severity: "warning",
          message: `Keywords duplicate words already in Title/Subtitle: ${overlapping.join(", ")}.`,
          suggestion:
            "Apple indexes Title and Subtitle automatically. Remove redundant keywords to fit new terms.",
        });
      }
    }
  }

  return issues;
}

export function validateAndroidField(
  field: AndroidFieldName,
  value: string,
  locale: string = "unknown"
): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  const max = ANDROID_LIMITS[field];
  const charLength = countCharacters(value);

  if (charLength > max) {
    issues.push({
      platform: "android",
      locale,
      field,
      currentLength: charLength,
      maxLength: max,
      severity: "error",
      message: `Google Play ${field} exceeds limit (${charLength}/${max} chars, +${charLength - max} overflow).`,
      suggestion: `Trim ${charLength - max} character(s) from ${field}.`,
    });
  }

  if (value !== value.trim()) {
    issues.push({
      platform: "android",
      locale,
      field,
      currentLength: charLength,
      maxLength: max,
      severity: "warning",
      message: `Google Play ${field} has leading or trailing whitespace.`,
      suggestion: "Trim outer whitespace.",
    });
  }

  // Exclamation spam check
  if ((value.match(/!{2,}/g) ?? []).length > 0) {
    issues.push({
      platform: "android",
      locale,
      field,
      currentLength: charLength,
      maxLength: max,
      severity: "warning",
      message: `Google Play ${field} contains consecutive exclamation marks ('!!'), which may trigger spam flags.`,
      suggestion: "Use single exclamation mark.",
    });
  }

  return issues;
}

export function validateIosMetadata(
  metadata: IosMetadata,
  locale: string = "unknown"
): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  const context = { title: metadata.title, subtitle: metadata.subtitle };

  issues.push(...validateIosField("title", metadata.title, locale, context));
  issues.push(...validateIosField("subtitle", metadata.subtitle, locale, context));
  issues.push(...validateIosField("keywords", metadata.keywords, locale, context));
  issues.push(...validateIosField("description", metadata.description, locale, context));

  if (metadata.promotionalText) {
    issues.push(...validateIosField("promotionalText", metadata.promotionalText, locale, context));
  }

  return issues;
}

export function validateAndroidMetadata(
  metadata: AndroidMetadata,
  locale: string = "unknown"
): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  issues.push(...validateAndroidField("title", metadata.title, locale));
  issues.push(...validateAndroidField("shortDescription", metadata.shortDescription, locale));
  issues.push(...validateAndroidField("fullDescription", metadata.fullDescription, locale));
  return issues;
}

export function validateMetadata(metadata: LocalizedStoreMetadata): ValidationReport {
  const issues: FieldValidationIssue[] = [];
  let totalChecked = 0;

  if (metadata.ios) {
    totalChecked += 4 + (metadata.ios.promotionalText ? 1 : 0);
    issues.push(...validateIosMetadata(metadata.ios, metadata.locale));
  }

  if (metadata.android) {
    totalChecked += 3;
    issues.push(...validateAndroidMetadata(metadata.android, metadata.locale));
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    valid: errorCount === 0,
    totalChecked,
    errorCount,
    warningCount,
    issues,
  };
}
