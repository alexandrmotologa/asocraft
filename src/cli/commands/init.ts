import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import type { AppGenre } from "../../types/index.js";

const DEFAULT_CONFIG = {
  $schema: "https://raw.githubusercontent.com/alexandrmotologa/asocraft/main/schema.json",
  appName: "Pixel Quest",
  appId: "com.example.pixelquest",
  genre: "casual-game" as AppGenre,
  defaultLocale: "en-US",
  locales: [
    "de-DE",
    "fr-FR",
    "es-ES",
    "ja",
    "ko",
    "pt-BR",
    "it",
    "ru",
    "zh-Hans",
  ],
  platforms: ["ios", "android"],
  provider: "offline",
  model: "gemini-2.5-flash",
  outDir: "fastlane/metadata",
  options: {
    stripKeywordSpaces: true,
    deduplicateKeywords: true,
    maxRetries: 3,
    verbose: false,
  },
};

const DEFAULT_METADATA = {
  locale: "en-US",
  appName: "Pixel Quest",
  genre: "casual-game",
  ios: {
    title: "Pixel Quest: Match 3 RPG",
    subtitle: "Casual Puzzle Adventure",
    keywords: "puzzle,match3,rpg,quest,hero,gems,adventure,offline",
    description: "Match gems, defeat powerful dungeon monsters, and collect epic loot in this casual puzzle RPG adventure!\n\nFeatures:\n- Over 500 handcrafted puzzle levels\n- Deep hero progression and loot crafting\n- Play offline anytime, anywhere",
    promotionalText: "Special event: claim your free legendary hero this week!",
  },
  android: {
    title: "Pixel Quest: Match 3 RPG",
    shortDescription: "Match gems and defeat epic monsters in this casual puzzle adventure.",
    fullDescription: "Embark on an unforgettable journey through magical realms in Pixel Quest, the premier casual match-3 puzzle RPG!\n\nGame Features:\n- Over 500 challenging match 3 puzzle stages\n- Hundreds of weapons, armors, and mystical artifacts\n- Compete in global leaderboards and weekly tournaments\n- No internet required for single-player campaign",
  },
};

export async function runInit(options: { force?: boolean; genre?: string }): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "aso.config.json");
  const metadataPath = path.join(cwd, "metadata.en.json");

  const configExists = await fs.access(configPath).then(() => true).catch(() => false);
  const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);

  if (!options.force && (configExists || metadataExists)) {
    console.log(pc.yellow("Initialization aborted: configuration files already exist. Use --force to overwrite."));
    return;
  }

  const config = { ...DEFAULT_CONFIG };
  if (options.genre) {
    config.genre = options.genre as AppGenre;
  }

  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  await fs.writeFile(metadataPath, JSON.stringify(DEFAULT_METADATA, null, 2), "utf8");

  console.log(pc.green("✔ Created aso.config.json"));
  console.log(pc.green("✔ Created metadata.en.json"));
  console.log("");
  console.log(pc.cyan("Next steps:"));
  console.log(`  1. Edit ${pc.bold("metadata.en.json")} with your app's copy.`);
  console.log(`  2. Configure target locales in ${pc.bold("aso.config.json")}.`);
  console.log(`  3. Run ${pc.bold("npx asocraft localize")} to generate store-compliant metadata.`);
}
