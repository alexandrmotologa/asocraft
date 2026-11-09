import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import {
  pullFromAppStore,
  pullFromGooglePlay,
  convertToCandidateBaseMetadata,
  type ExtractedStoreMetadata,
} from "../../core/engine/pull.js";

export interface PullCommandOptions {
  ios?: string;
  android?: string;
  url?: string;
  output?: string;
  saveConfig?: boolean;
}

export async function runPull(options: PullCommandOptions): Promise<void> {
  const cwd = process.cwd();
  let iosId = options.ios;
  let androidId = options.android;

  if (options.url) {
    if (options.url.includes("apple.com") || options.url.includes("itunes")) {
      const match = options.url.match(/id(\d+)/i);
      if (match) iosId = match[1];
    } else if (options.url.includes("play.google.com")) {
      const match = options.url.match(/id=([a-zA-Z0-9_.]+)/i);
      if (match) androidId = match[1];
    }
  }

  if (!iosId && !androidId) {
    console.log(pc.yellow("Please provide a store identifier: --ios <idOrBundle>, --android <packageId>, or --url <storeUrl>."));
    return;
  }

  console.log(pc.bold(pc.cyan(`\nASOCraft Store Ingestion`)));
  if (iosId) console.log(`${pc.dim("App Store Target:")} ${iosId}`);
  if (androidId) console.log(`${pc.dim("Google Play Target:")} ${androidId}`);
  console.log("");

  let extractedIos: ExtractedStoreMetadata | undefined;
  let extractedAndroid: ExtractedStoreMetadata | undefined;

  if (iosId) {
    try {
      console.log(`Fetching App Store metadata for ${pc.bold(iosId)}...`);
      extractedIos = await pullFromAppStore(iosId);
      console.log(pc.green(`✔ Successfully pulled: "${extractedIos.appName}" (${extractedIos.genre})`));
    } catch (err: any) {
      console.log(pc.red(`✖ Failed to fetch App Store listing: ${err.message}`));
    }
  }

  if (androidId) {
    try {
      console.log(`Fetching Google Play metadata for ${pc.bold(androidId)}...`);
      extractedAndroid = await pullFromGooglePlay(androidId);
      console.log(pc.green(`✔ Successfully pulled: "${extractedAndroid.appName}" (${extractedAndroid.genre})`));
    } catch (err: any) {
      console.log(pc.red(`✖ Failed to fetch Google Play listing: ${err.message}`));
    }
  }

  if (!extractedIos && !extractedAndroid) {
    console.log(pc.red("\nCould not pull metadata from the specified stores."));
    process.exitCode = 1;
    return;
  }

  const primary = extractedIos || extractedAndroid!;
  const mergedCandidate = convertToCandidateBaseMetadata(primary);

  if (extractedIos && extractedAndroid) {
    mergedCandidate.ios = convertToCandidateBaseMetadata(extractedIos).ios;
    mergedCandidate.android = convertToCandidateBaseMetadata(extractedAndroid).android;
  }

  const outPath = path.resolve(cwd, options.output || "metadata.en.json");
  await fs.writeFile(outPath, JSON.stringify(mergedCandidate, null, 2), "utf8");
  console.log(pc.green(`\n✔ Saved base metadata to ${outPath}`));

  if (options.saveConfig) {
    const configPath = path.resolve(cwd, "aso.config.json");
    let currentConfig: any = {};
    try {
      currentConfig = JSON.parse(await fs.readFile(configPath, "utf8"));
    } catch {
      // Empty
    }

    const updatedConfig = {
      $schema: "https://raw.githubusercontent.com/alexandrmotologa/asocraft/main/schema.json",
      appName: mergedCandidate.appName || "App",
      appId: primary.appId || "com.example.app",
      genre: mergedCandidate.genre || "casual-game",
      defaultLocale: "en-US",
      locales: currentConfig.locales || ["de-DE", "fr-FR", "es-ES", "ja", "ko", "pt-BR", "it", "ru", "zh-Hans"],
      platforms: currentConfig.platforms || (extractedIos && extractedAndroid ? ["ios", "android"] : extractedIos ? ["ios"] : ["android"]),
      provider: currentConfig.provider || "offline",
      outDir: currentConfig.outDir || "fastlane/metadata",
      options: currentConfig.options || {
        stripKeywordSpaces: true,
        deduplicateKeywords: true,
        maxRetries: 3,
      },
    };

    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf8");
    console.log(pc.green(`✔ Updated ${configPath} with app name and genre.`));
  }

  console.log(pc.dim("\nYou can now run 'npx asocraft audit --file metadata.en.json' or 'npx asocraft localize'.\n"));
}
