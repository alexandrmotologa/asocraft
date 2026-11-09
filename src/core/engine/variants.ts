import type { BaseMetadata, ProviderType } from "../../types/index.js";
import { createProvider, BaseTranslationProvider } from "./providers/index.js";
import { countCharacters } from "../constraints/validator.js";
import { IOS_LIMITS, ANDROID_LIMITS } from "../constraints/limits.js";

export type VariantAngle = "gameplay" | "social" | "casual" | "progression";

export interface MetadataVariant {
  angle: VariantAngle;
  angleLabel: string;
  ios?: {
    title: string;
    subtitle: string;
    titleLength: number;
    subtitleLength: number;
  };
  android?: {
    title: string;
    shortDescription: string;
    titleLength: number;
    shortDescLength: number;
  };
}

export interface GenerateVariantsResult {
  appName: string;
  locales: Record<string, MetadataVariant[]>;
}

export interface GenerateVariantsOptions {
  source: BaseMetadata;
  targetLocales: string[];
  angles?: VariantAngle[];
  provider?: ProviderType | BaseTranslationProvider;
  model?: string;
}

const ANGLE_TEMPLATES: Record<VariantAngle, Record<string, { iosSub: string; androidShort: string }>> = {
  gameplay: {
    en: { iosSub: "Epic Match 3 Puzzle Action", androidShort: "Solve 500+ match 3 puzzle challenges and defeat epic dungeon bosses." },
    de: { iosSub: "Spannende 3-Gewinnt Rätsel", androidShort: "Meistere über 500 knifflige Rätsel und besiege mächtige Bosse." },
    fr: { iosSub: "Casse-tête Match 3 Épique", androidShort: "Résolvez plus de 500 niveaux et battez des monstres légendaires." },
    es: { iosSub: "Puzzles Match 3 Desafiantes", androidShort: "Supera más de 500 niveles de acertijos y derrota jefes legendarios." },
    ja: { iosSub: "爽快3マッチパズルバトル", androidShort: "500以上のパズルステージをクリアして強大なボスを倒そう！" },
  },
  social: {
    en: { iosSub: "Play & Compete With Friends", androidShort: "Join guilds, challenge friends, and climb seasonal global leaderboards." },
    de: { iosSub: "Mit Freunden zusammen spielen", androidShort: "Tritt Gilden bei und kämpfe mit Freunden in globalen Ranglisten." },
    fr: { iosSub: "Jouez avec vos amis", androidShort: "Rejoignez des guildes et défiez vos amis dans les classements." },
    es: { iosSub: "Compite con tus amigos", androidShort: "Únete a clanes y escala en las clasificaciones globales con amigos." },
    ja: { iosSub: "仲間と競い合うオンライン対戦", androidShort: "ギルドに参加し、世界中のプレイヤーとランキングを競おう！" },
  },
  casual: {
    en: { iosSub: "Relaxing Offline Puzzle Fun", androidShort: "Unwind anytime with relaxing puzzle levels. 100% offline, zero internet needed." },
    de: { iosSub: "Entspannter Rätselspaß", androidShort: "Entspanne dich jederzeit mit bunten Rätseln. Komplett ohne Internet spielbar." },
    fr: { iosSub: "Détente & Réflexion Zen", androidShort: "Détendez-vous avec des puzzles colorés. Jouez hors ligne où vous voulez." },
    es: { iosSub: "Puzzles Relajantes sin WiFi", androidShort: "Relájate con divertidos rompecabezas. Juega sin conexión donde quieras." },
    ja: { iosSub: "癒やしのオフラインパズル", androidShort: "いつでもどこでも気軽に遊べる爽快パズル。オフライン対応！" },
  },
  progression: {
    en: { iosSub: "Level Up & Craft Epic Gear", androidShort: "Collect rare weapons, customize your heroes, and upgrade magical skills." },
    de: { iosSub: "Helden leveln & Beute sammeln", androidShort: "Sammle seltene Waffen, verbessere Helden und schalte Zauber frei." },
    fr: { iosSub: "Équipez vos héros de légende", androidShort: "Améliorez vos héros, forgez des armes et maîtrisez des sorts magiques." },
    es: { iosSub: "Mejora héroes y armas", androidShort: "Consigue armas legendarias, personaliza héroes y domina la magia." },
    ja: { iosSub: "英雄育成＆装備カスタマイズ", androidShort: "強力な装備を集めてヒーローを育成し、究極の魔法を習得しよう。" },
  },
};

function trimSafe(text: string, max: number): string {
  if (countCharacters(text) <= max) return text;
  return [...text].slice(0, max).join("");
}

export async function generateVariants(
  options: GenerateVariantsOptions
): Promise<GenerateVariantsResult> {
  const appName = options.source.appName || "App";
  const angles: VariantAngle[] = options.angles || ["gameplay", "social", "casual", "progression"];
  const localesMap: Record<string, MetadataVariant[]> = {};

  let provider: BaseTranslationProvider | undefined;
  if (options.provider) {
    if (typeof options.provider === "object") {
      provider = options.provider;
    } else {
      provider = createProvider(options.provider as ProviderType, { model: options.model });
    }
  }

  for (const locale of options.targetLocales) {
    const lang = locale.split("-")[0].toLowerCase();
    const list: MetadataVariant[] = [];

    if (provider && provider.name !== "offline") {
      // Real LLM call for bespoke variants
      const prompt = `You are a mobile App Store Optimization (ASO) and conversion rate optimization (CRO) expert.
Generate distinct marketing positioning variants for the app "${appName}" in locale "${locale}".
Base English subtitle: "${options.source.ios?.subtitle || "Mobile App"}"
Base English description: "${options.source.android?.shortDescription || "Exciting mobile app"}"

Requested positioning angles: ${angles.join(", ")}

CONSTRAINTS (CRITICAL):
- iOS Subtitle: strictly <= 30 characters.
- Android Short Description: strictly <= 80 characters.
- Must be punchy, culturally native, and distinct for each angle.

Return ONLY a JSON array in this format:
[
  {
    "angle": "gameplay",
    "iosSubtitle": "localized subtitle <= 30 chars",
    "androidShortDescription": "localized short description <= 80 chars"
  }
]`;

      try {
        const raw = await provider.generateText(prompt);
        let cleaned = raw.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const parsed = JSON.parse(cleaned) as Array<{
          angle: VariantAngle;
          iosSubtitle: string;
          androidShortDescription: string;
        }>;

        for (const item of parsed) {
          const baseTitle = trimSafe(appName, IOS_LIMITS.title);
          const sub = trimSafe(item.iosSubtitle, IOS_LIMITS.subtitle);
          const shortDesc = trimSafe(item.androidShortDescription, ANDROID_LIMITS.shortDescription);

          list.push({
            angle: item.angle,
            angleLabel: item.angle.toUpperCase(),
            ios: {
              title: baseTitle,
              subtitle: sub,
              titleLength: countCharacters(baseTitle),
              subtitleLength: countCharacters(sub),
            },
            android: {
              title: baseTitle,
              shortDescription: shortDesc,
              titleLength: countCharacters(baseTitle),
              shortDescLength: countCharacters(shortDesc),
            },
          });
        }
      } catch {
        // Fallback to offline templates if LLM output fails to parse
      }
    }

    // Fallback or offline path
    if (list.length === 0) {
      for (const angle of angles) {
        const angleDictionary = ANGLE_TEMPLATES[angle];
        const localizedTemplate = angleDictionary[lang] || angleDictionary.en;

        const baseTitle = trimSafe(appName, IOS_LIMITS.title);
        const sub = trimSafe(localizedTemplate.iosSub, IOS_LIMITS.subtitle);
        const androidShort = trimSafe(localizedTemplate.androidShort, ANDROID_LIMITS.shortDescription);

        list.push({
          angle,
          angleLabel: angle.toUpperCase(),
          ios: {
            title: baseTitle,
            subtitle: sub,
            titleLength: countCharacters(baseTitle),
            subtitleLength: countCharacters(sub),
          },
          android: {
            title: baseTitle,
            shortDescription: androidShort,
            titleLength: countCharacters(baseTitle),
            shortDescLength: countCharacters(androidShort),
          },
        });
      }
    }

    localesMap[locale] = list;
  }

  return {
    appName,
    locales: localesMap,
  };
}
