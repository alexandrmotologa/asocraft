import type {
  AppGenre,
  BaseMetadata,
  LocalizedStoreMetadata,
  FieldValidationIssue,
} from "../../../types/index.js";

export interface TranslationRequest {
  targetLocale: string;
  targetLocaleName: string;
  appName: string;
  genre: AppGenre;
  glossaryTerms: string[];
  sourceMetadata: BaseMetadata;
  previousViolations?: FieldValidationIssue[];
  attempt: number;
}

export interface TranslationResponse {
  rawOutput: string;
  metadata: LocalizedStoreMetadata;
  modelUsed: string;
}

export abstract class BaseTranslationProvider {
  abstract readonly name: string;
  abstract translate(request: TranslationRequest): Promise<TranslationResponse>;
}
