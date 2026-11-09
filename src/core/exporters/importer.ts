import fs from "node:fs/promises";
import path from "node:path";
import type { LocalizedStoreMetadata, IosMetadata, AndroidMetadata } from "../../types/index.js";
import { IOS_FASTLANE_FILES, ANDROID_FASTLANE_FILES } from "../constraints/limits.js";

async function readFileSafe(filePath: string): Promise<string | undefined> {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data.trim();
  } catch {
    return undefined;
  }
}

export async function importFastlaneDirectory(
  rootDir: string
): Promise<Record<string, LocalizedStoreMetadata>> {
  const result: Record<string, LocalizedStoreMetadata> = {};

  // Inspect iOS
  const iosRoot = path.join(rootDir, "ios");
  try {
    const iosLocales = await fs.readdir(iosRoot);
    for (const locale of iosLocales) {
      const locPath = path.join(iosRoot, locale);
      const stat = await fs.stat(locPath);
      if (!stat.isDirectory()) continue;

      const title = (await readFileSafe(path.join(locPath, IOS_FASTLANE_FILES.title))) || "";
      const subtitle = (await readFileSafe(path.join(locPath, IOS_FASTLANE_FILES.subtitle))) || "";
      const keywords = (await readFileSafe(path.join(locPath, IOS_FASTLANE_FILES.keywords))) || "";
      const description = (await readFileSafe(path.join(locPath, IOS_FASTLANE_FILES.description))) || "";
      const promotionalText = await readFileSafe(path.join(locPath, IOS_FASTLANE_FILES.promotionalText));

      const iosData: IosMetadata = {
        title,
        subtitle,
        keywords,
        description,
        ...(promotionalText ? { promotionalText } : {}),
      };

      if (!result[locale]) {
        result[locale] = { locale };
      }
      result[locale].ios = iosData;
    }
  } catch {
    // No iOS folder present
  }

  // Inspect Android
  const androidRoot = path.join(rootDir, "android");
  try {
    const androidLocales = await fs.readdir(androidRoot);
    for (const locale of androidLocales) {
      const locPath = path.join(androidRoot, locale);
      const stat = await fs.stat(locPath);
      if (!stat.isDirectory()) continue;

      const title = (await readFileSafe(path.join(locPath, ANDROID_FASTLANE_FILES.title))) || "";
      const shortDescription = (await readFileSafe(path.join(locPath, ANDROID_FASTLANE_FILES.shortDescription))) || "";
      const fullDescription = (await readFileSafe(path.join(locPath, ANDROID_FASTLANE_FILES.fullDescription))) || "";

      const androidData: AndroidMetadata = {
        title,
        shortDescription,
        fullDescription,
      };

      if (!result[locale]) {
        result[locale] = { locale };
      }
      result[locale].android = androidData;
    }
  } catch {
    // No Android folder present
  }

  return result;
}
