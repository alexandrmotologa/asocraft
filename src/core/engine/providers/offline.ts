import {
  BaseTranslationProvider,
  type TranslationRequest,
  type TranslationResponse,
} from "./base.js";
import type { LocalizedStoreMetadata, IosMetadata, AndroidMetadata } from "../../../types/index.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../../constraints/limits.js";
import { countCharacters } from "../../constraints/validator.js";

// Common localized prefixes/suffixes and action words per language
const LOCALE_ADAPTATIONS: Record<string, { prefix: string; action: string; descFooter: string }> = {
  de: { prefix: "", action: "Spielen & Genießen", descFooter: "Jetzt herunterladen und loslegen!" },
  fr: { prefix: "", action: "Jouer et Découvrir", descFooter: "Téléchargez maintenant et profitez-en !" },
  es: { prefix: "", action: "Jugar y Divertirse", descFooter: "¡Descárgalo hoy mismo y empieza a disfrutar!" },
  it: { prefix: "", action: "Gioca e Divertiti", descFooter: "Scarica subito e inizia l'avventura!" },
  pt: { prefix: "", action: "Jogar e Desfrutar", descFooter: "Baixe agora mesmo e divirta-se!" },
  ja: { prefix: "", action: "爽快プレイ", descFooter: "今すぐダウンロードして冒険を始めよう！" },
  ko: { prefix: "", action: "재미있는 플레이", descFooter: "지금 다운로드하고 즐거운 모험을 시작하세요!" },
  zh: { prefix: "", action: "畅玩探索", descFooter: "立即下载，开启全新精彩体验！" },
  ru: { prefix: "", action: "Играй с удовольствием", descFooter: "Скачайте прямо сейчас и начните играть!" },
};

function trimToMax(str: string, max: number): string {
  if (countCharacters(str) <= max) return str;
  // Word boundary truncation
  const words = str.split(/\s+/);
  let res = "";
  for (const w of words) {
    const candidate = res ? `${res} ${w}` : w;
    if (countCharacters(candidate) <= max) {
      res = candidate;
    } else {
      break;
    }
  }
  if (!res) {
    // If even single word exceeds max, hard cut code points
    res = [...str].slice(0, max).join("");
  }
  return res;
}

export class OfflineTranslationProvider extends BaseTranslationProvider {
  readonly name = "offline";

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { targetLocale, sourceMetadata, glossaryTerms, attempt } = request;
    const lang = targetLocale.split("-")[0].toLowerCase();
    const adaptation = LOCALE_ADAPTATIONS[lang] ?? {
      prefix: "",
      action: "Play & Explore",
      descFooter: "Download today and enjoy the experience!",
    };

    const result: LocalizedStoreMetadata = {
      locale: targetLocale,
    };

    // If this is a retry attempt because previous fields overflowed, apply aggressive shortening
    const shortenFactor = Math.max(1, attempt);

    if (sourceMetadata.ios) {
      const srcIos = sourceMetadata.ios;
      let rawTitle = `${srcIos.title}`;
      if (attempt > 1) {
        // Drop title tags after colon or dash
        rawTitle = rawTitle.split(/[:\-–—|]/)[0].trim();
      }
      const title = trimToMax(rawTitle, IOS_LIMITS.title);

      let rawSubtitle = srcIos.subtitle;
      if (glossaryTerms.length > 0) {
        const topTerm = glossaryTerms[0];
        rawSubtitle = `${topTerm} - ${adaptation.action}`;
      }
      const subtitle = trimToMax(rawSubtitle, IOS_LIMITS.subtitle);

      // Keywords: combine top glossary terms and non-redundant source keywords
      const titleWords = new Set(title.toLowerCase().split(/\s+/));
      const chosenTerms: string[] = [];
      let kwLength = 0;

      const candidates = [...glossaryTerms, ...srcIos.keywords.split(",")];
      for (const rawCand of candidates) {
        const cand = rawCand.trim().toLowerCase();
        if (!cand || titleWords.has(cand) || chosenTerms.includes(cand)) continue;
        const addedLen = countCharacters(cand) + (chosenTerms.length > 0 ? 1 : 0);
        if (kwLength + addedLen <= IOS_LIMITS.keywords) {
          chosenTerms.push(cand);
          kwLength += addedLen;
        }
      }
      const keywords = chosenTerms.join(",");

      const description = `${srcIos.description}\n\n${adaptation.descFooter}`;
      const promotionalText = srcIos.promotionalText
        ? trimToMax(`${srcIos.promotionalText} (${targetLocale})`, IOS_LIMITS.promotionalText)
        : undefined;

      const iosOut: IosMetadata = {
        title,
        subtitle,
        keywords,
        description,
        ...(promotionalText ? { promotionalText } : {}),
      };
      result.ios = iosOut;
    }

    if (sourceMetadata.android) {
      const srcAndroid = sourceMetadata.android;
      let rawTitle = srcAndroid.title;
      if (attempt > 1) {
        rawTitle = rawTitle.split(/[:\-–—|]/)[0].trim();
      }
      const title = trimToMax(rawTitle, ANDROID_LIMITS.title);

      let rawShortDesc = srcAndroid.shortDescription;
      if (glossaryTerms.length > 0) {
        rawShortDesc = `${glossaryTerms.slice(0, 2).join(", ")}. ${adaptation.action}.`;
      }
      const shortDescription = trimToMax(rawShortDesc, ANDROID_LIMITS.shortDescription);

      const fullDescription = `${srcAndroid.fullDescription}\n\n${adaptation.descFooter}`;

      const androidOut: AndroidMetadata = {
        title,
        shortDescription,
        fullDescription,
      };
      result.android = androidOut;
    }

    return {
      rawOutput: JSON.stringify(result, null, 2),
      metadata: result,
      modelUsed: "offline-deterministic-heuristic-v1",
    };
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    return `[Offline Generated] Processed request for offline testing.`;
  }
}
