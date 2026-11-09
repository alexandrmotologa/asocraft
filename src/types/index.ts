export type Platform = "ios" | "android";

export type AppGenre =
  | "casual-game"
  | "puzzle"
  | "rpg"
  | "action-game"
  | "strategy-game"
  | "productivity"
  | "utility"
  | "fitness"
  | "finance"
  | "education"
  | "entertainment";

export type ProviderType = "gemini" | "anthropic" | "openai" | "offline";

export interface IosMetadata {
  title: string;
  subtitle: string;
  keywords: string;
  description: string;
  promotionalText?: string;
}

export interface AndroidMetadata {
  title: string;
  shortDescription: string;
  fullDescription: string;
}

export interface BaseMetadata {
  locale: string;
  appName?: string;
  genre?: AppGenre;
  ios?: IosMetadata;
  android?: AndroidMetadata;
}

export interface LocalizedStoreMetadata {
  locale: string;
  ios?: IosMetadata;
  android?: AndroidMetadata;
}

export interface AsoConfig {
  $schema?: string;
  appId?: string;
  appName: string;
  genre: AppGenre;
  defaultLocale: string;
  locales: string[];
  platforms: Platform[];
  provider: ProviderType;
  model?: string;
  outDir: string;
  options?: {
    stripKeywordSpaces?: boolean;
    deduplicateKeywords?: boolean;
    maxRetries?: number;
    temperature?: number;
    verbose?: boolean;
  };
}

export interface FieldValidationIssue {
  platform: Platform;
  locale: string;
  field: string;
  currentLength: number;
  maxLength: number;
  message: string;
  severity: "error" | "warning";
  suggestion?: string;
}

export interface ValidationReport {
  valid: boolean;
  totalChecked: number;
  errorCount: number;
  warningCount: number;
  issues: FieldValidationIssue[];
}

export interface LocalizationResult {
  sourceLocale: string;
  targetLocales: string[];
  localizations: Record<string, LocalizedStoreMetadata>;
  reports: Record<string, ValidationReport>;
  durationMs: number;
}
