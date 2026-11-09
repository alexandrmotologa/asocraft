import type { ProviderType } from "../../types/index.js";
import { createProvider, BaseTranslationProvider } from "./providers/index.js";
import { countCharacters } from "../constraints/validator.js";
import { getLocaleDisplayName } from "../locales/matrix.js";

export const RELEASE_NOTES_LIMITS = {
  ios: 4000,
  android: 500,
} as const;

export interface ReleaseNotesResult {
  sourceLocale: string;
  targetLocales: string[];
  notes: Record<string, { ios: string; android: string; iosLength: number; androidLength: number }>;
}

export interface GenerateReleaseNotesOptions {
  sourceText: string;
  sourceLocale?: string;
  targetLocales: string[];
  provider?: ProviderType | BaseTranslationProvider;
  model?: string;
}

// Localized release note headers and templates for offline / fallback
const OFFLINE_CHANGELOG_TEMPLATES: Record<string, { header: string; bullet: string; footer: string }> = {
  de: { header: "Neu in diesem Update:", bullet: "• Verbesserungen und Fehlerbehebungen:", footer: "Danke für dein Feedback!" },
  fr: { header: "Nouveautés de cette mise à jour :", bullet: "• Améliorations et corrections :", footer: "Merci pour vos retours !" },
  es: { header: "Novedades de esta actualización:", bullet: "• Mejoras y corrección de errores:", footer: "¡Gracias por jugar!" },
  ja: { header: "アップデート内容：", bullet: "・パフォーマンス向上と不具合修正：", footer: "いつも応援ありがとうございます！" },
  ko: { header: "업데이트 안내:", bullet: "• 성능 개선 및 버그 수정:", footer: "항상 플레이해주셔서 감사합니다!" },
  "pt-BR": { header: "Novidades desta atualização:", bullet: "• Melhorias e correções de erros:", footer: "Obrigado pelo seu feedback!" },
  it: { header: "Novità di questo aggiornamento:", bullet: "• Miglioramenti e correzione di bug:", footer: "Grazie per il supporto!" },
  ru: { header: "Что нового в этом обновлении:", bullet: "• Улучшения и исправление ошибок:", footer: "Спасибо за ваши отзывы!" },
  "zh-Hans": { header: "更新内容：", bullet: "• 体验优化与问题修复：", footer: "感谢您的支持与反馈！" },
};

export async function generateReleaseNotes(
  options: GenerateReleaseNotesOptions
): Promise<ReleaseNotesResult> {
  const sourceLocale = options.sourceLocale || "en-US";
  const sourceText = options.sourceText.trim();

  let provider: BaseTranslationProvider;
  if (options.provider && typeof options.provider === "object") {
    provider = options.provider;
  } else {
    provider = createProvider((options.provider as ProviderType) || "offline", {
      model: options.model,
    });
  }

  const notes: ReleaseNotesResult["notes"] = {};

  for (const locale of options.targetLocales) {
    const lang = locale.split("-")[0].toLowerCase();
    const template = OFFLINE_CHANGELOG_TEMPLATES[lang] ?? OFFLINE_CHANGELOG_TEMPLATES[locale] ?? {
      header: "What's New in this update:",
      bullet: "• Improvements and bug fixes:",
      footer: "Thanks for your feedback!",
    };

    let iosText = "";
    let androidText = "";

    if (provider.name === "offline") {
      // Offline heuristic translation & formatting
      iosText = `${template.header}\n${template.bullet}\n${sourceText}\n\n${template.footer}`;

      // Android is limited to 500 characters
      let androidCandidate = `${template.header}\n• ${sourceText}`;
      if (countCharacters(androidCandidate) > RELEASE_NOTES_LIMITS.android) {
        androidCandidate = [...androidCandidate].slice(0, RELEASE_NOTES_LIMITS.android - 3).join("") + "...";
      }
      androidText = androidCandidate;
    } else {
      // Call LLM provider
      const prompt = `You are a mobile app store localization specialist.
Translate and format the following app release notes into ${getLocaleDisplayName(locale)}.

SOURCE RELEASE NOTES (English):
"""
${sourceText}
"""

CONSTRAINTS:
1. iOS Release Notes: Maximum 4000 characters. Keep it clear, professional, and friendly with bullet points.
2. Android Changelog: STRICT HARD MAXIMUM 500 CHARACTERS! It must be concise, punchy, and under 500 characters.

Return ONLY a valid JSON object in this format:
{
  "ios": "localized release notes <= 4000 chars",
  "android": "localized short changelog <= 500 chars"
}`;

      try {
        const resp = await provider.translate({
          targetLocale: locale,
          targetLocaleName: getLocaleDisplayName(locale),
          appName: "App",
          genre: "utility",
          glossaryTerms: [],
          sourceMetadata: { locale: sourceLocale },
          attempt: 1,
        });

        const parsed = JSON.parse(resp.rawOutput);
        iosText = parsed.ios || sourceText;
        androidText = parsed.android || sourceText;
      } catch {
        // Fallback to formatted template
        iosText = `${template.header}\n${template.bullet}\n${sourceText}`;
        androidText = `${template.header}\n• ${sourceText}`;
      }
    }

    // Safety length assertions
    if (countCharacters(iosText) > RELEASE_NOTES_LIMITS.ios) {
      iosText = [...iosText].slice(0, RELEASE_NOTES_LIMITS.ios).join("");
    }
    if (countCharacters(androidText) > RELEASE_NOTES_LIMITS.android) {
      androidText = [...androidText].slice(0, RELEASE_NOTES_LIMITS.android).join("");
    }

    notes[locale] = {
      ios: iosText,
      android: androidText,
      iosLength: countCharacters(iosText),
      androidLength: countCharacters(androidText),
    };
  }

  return {
    sourceLocale,
    targetLocales: options.targetLocales,
    notes,
  };
}
