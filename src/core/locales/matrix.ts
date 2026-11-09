export interface LocaleInfo {
  code: string;
  name: string;
  iosCode: string;
  androidCode: string;
  isRtl?: boolean;
}

export const SUPPORTED_LOCALES: Record<string, LocaleInfo> = {
  "en-US": { code: "en-US", name: "English (US)", iosCode: "en-US", androidCode: "en-US" },
  "en-GB": { code: "en-GB", name: "English (UK)", iosCode: "en-GB", androidCode: "en-GB" },
  "de-DE": { code: "de-DE", name: "German", iosCode: "de-DE", androidCode: "de-DE" },
  "fr-FR": { code: "fr-FR", name: "French", iosCode: "fr-FR", androidCode: "fr-FR" },
  "es-ES": { code: "es-ES", name: "Spanish (Spain)", iosCode: "es-ES", androidCode: "es-ES" },
  "es-MX": { code: "es-MX", name: "Spanish (Latin America)", iosCode: "es-MX", androidCode: "es-US" },
  "pt-BR": { code: "pt-BR", name: "Portuguese (Brazil)", iosCode: "pt-BR", androidCode: "pt-BR" },
  "pt-PT": { code: "pt-PT", name: "Portuguese (Portugal)", iosCode: "pt-PT", androidCode: "pt-PT" },
  "it-IT": { code: "it-IT", name: "Italian", iosCode: "it", androidCode: "it-IT" },
  "it": { code: "it", name: "Italian", iosCode: "it", androidCode: "it-IT" },
  "ja": { code: "ja", name: "Japanese", iosCode: "ja", androidCode: "ja-JP" },
  "ja-JP": { code: "ja-JP", name: "Japanese", iosCode: "ja", androidCode: "ja-JP" },
  "ko": { code: "ko", name: "Korean", iosCode: "ko", androidCode: "ko-KR" },
  "ko-KR": { code: "ko-KR", name: "Korean", iosCode: "ko", androidCode: "ko-KR" },
  "zh-Hans": { code: "zh-Hans", name: "Chinese (Simplified)", iosCode: "zh-Hans", androidCode: "zh-CN" },
  "zh-CN": { code: "zh-CN", name: "Chinese (Simplified)", iosCode: "zh-Hans", androidCode: "zh-CN" },
  "zh-Hant": { code: "zh-Hant", name: "Chinese (Traditional)", iosCode: "zh-Hant", androidCode: "zh-TW" },
  "zh-TW": { code: "zh-TW", name: "Chinese (Traditional)", iosCode: "zh-Hant", androidCode: "zh-TW" },
  "ru": { code: "ru", name: "Russian", iosCode: "ru", androidCode: "ru-RU" },
  "ru-RU": { code: "ru-RU", name: "Russian", iosCode: "ru", androidCode: "ru-RU" },
  "tr-TR": { code: "tr-TR", name: "Turkish", iosCode: "tr", androidCode: "tr-TR" },
  "tr": { code: "tr", name: "Turkish", iosCode: "tr", androidCode: "tr-TR" },
  "nl-NL": { code: "nl-NL", name: "Dutch", iosCode: "nl-NL", androidCode: "nl-NL" },
  "pl-PL": { code: "pl-PL", name: "Polish", iosCode: "pl", androidCode: "pl-PL" },
  "id": { code: "id", name: "Indonesian", iosCode: "id", androidCode: "in-ID" },
  "vi": { code: "vi", name: "Vietnamese", iosCode: "vi", androidCode: "vi" },
  "th": { code: "th", name: "Thai", iosCode: "th", androidCode: "th" },
  "ar-SA": { code: "ar-SA", name: "Arabic", iosCode: "ar-SA", androidCode: "ar", isRtl: true },
};

export function resolveIosLocale(locale: string): string {
  const match = SUPPORTED_LOCALES[locale];
  return match ? match.iosCode : locale;
}

export function resolveAndroidLocale(locale: string): string {
  const match = SUPPORTED_LOCALES[locale];
  return match ? match.androidCode : locale;
}

export function getLocaleDisplayName(locale: string): string {
  const match = SUPPORTED_LOCALES[locale];
  return match ? `${match.name} (${locale})` : locale;
}
