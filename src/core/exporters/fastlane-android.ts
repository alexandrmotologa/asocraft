import fs from "node:fs/promises";
import path from "node:path";
import type { AndroidMetadata } from "../../types/index.js";
import { resolveAndroidLocale } from "../locales/matrix.js";
import { ANDROID_FASTLANE_FILES } from "../constraints/limits.js";

export async function writeAndroidFastlaneMetadata(
  locale: string,
  metadata: AndroidMetadata,
  outDir: string
): Promise<string[]> {
  const androidLocale = resolveAndroidLocale(locale);
  const targetDir = path.join(outDir, "android", androidLocale);

  await fs.mkdir(targetDir, { recursive: true });

  const writtenFiles: string[] = [];

  const filesToWrite: [string, string][] = [
    [ANDROID_FASTLANE_FILES.title, metadata.title],
    [ANDROID_FASTLANE_FILES.shortDescription, metadata.shortDescription],
    [ANDROID_FASTLANE_FILES.fullDescription, metadata.fullDescription],
  ];

  for (const [filename, content] of filesToWrite) {
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, content ?? "", "utf8");
    writtenFiles.push(filePath);
  }

  return writtenFiles;
}
