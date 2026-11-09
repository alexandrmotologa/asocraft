import type { ProviderType } from "../../../types/index.js";
import { BaseTranslationProvider } from "./base.js";
import { GeminiTranslationProvider } from "./gemini.js";
import { AnthropicTranslationProvider } from "./anthropic.js";
import { OpenAiTranslationProvider } from "./openai.js";
import { OfflineTranslationProvider } from "./offline.js";

export function createProvider(
  providerType: ProviderType,
  options?: { apiKey?: string; model?: string }
): BaseTranslationProvider {
  switch (providerType) {
    case "gemini":
      return new GeminiTranslationProvider(options?.apiKey, options?.model);
    case "anthropic":
      return new AnthropicTranslationProvider(options?.apiKey, options?.model);
    case "openai":
      return new OpenAiTranslationProvider(options?.apiKey, options?.model);
    case "offline":
      return new OfflineTranslationProvider();
    default:
      throw new Error(`Unsupported provider: "${providerType}". Supported: gemini, anthropic, openai, offline.`);
  }
}

export * from "./base.js";
export * from "./gemini.js";
export * from "./anthropic.js";
export * from "./openai.js";
export * from "./offline.js";
