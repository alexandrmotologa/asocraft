import type { LocalizationResult } from "../../types/index.js";
import { writeIosFastlaneMetadata } from "./fastlane-ios.js";
import { writeAndroidFastlaneMetadata } from "./fastlane-android.js";

export async function exportToFastlane(
  result: LocalizationResult,
  outDir: string
): Promise<{ writtenFiles: string[]; totalLocales: number }> {
  const writtenFiles: string[] = [];
  let totalLocales = 0;

  for (const [locale, metadata] of Object.entries(result.localizations)) {
    totalLocales++;
    if (metadata.ios) {
      const iosFiles = await writeIosFastlaneMetadata(locale, metadata.ios, outDir);
      writtenFiles.push(...iosFiles);
    }
    if (metadata.android) {
      const androidFiles = await writeAndroidFastlaneMetadata(locale, metadata.android, outDir);
      writtenFiles.push(...androidFiles);
    }
  }

  return { writtenFiles, totalLocales };
}

export * from "./fastlane-ios.js";
export * from "./fastlane-android.js";
export * from "./json-exporter.js";
export * from "./importer.js";
