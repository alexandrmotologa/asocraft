import fs from "node:fs/promises";
import path from "node:path";
import type { IosMetadata } from "../../types/index.js";
import { resolveIosLocale } from "../locales/matrix.js";
import { IOS_FASTLANE_FILES } from "../constraints/limits.js";

export async function writeIosFastlaneMetadata(
  locale: string,
  metadata: IosMetadata,
  outDir: string
): Promise<string[]> {
  const iosLocale = resolveIosLocale(locale);
  const targetDir = path.join(outDir, "ios", iosLocale);

  await fs.mkdir(targetDir, { recursive: true });

  const writtenFiles: string[] = [];

  const filesToWrite: [string, string][] = [
    [IOS_FASTLANE_FILES.title, metadata.title],
    [IOS_FASTLANE_FILES.subtitle, metadata.subtitle],
    [IOS_FASTLANE_FILES.keywords, metadata.keywords],
    [IOS_FASTLANE_FILES.description, metadata.description],
  ];

  if (metadata.promotionalText) {
    filesToWrite.push([IOS_FASTLANE_FILES.promotionalText, metadata.promotionalText]);
  }

  for (const [filename, content] of filesToWrite) {
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, content ?? "", "utf8");
    writtenFiles.push(filePath);
  }

  return writtenFiles;
}

export async function writeIosReleaseNotes(
  locale: string,
  releaseNotes: string,
  outDir: string
): Promise<string> {
  const iosLocale = resolveIosLocale(locale);
  const targetDir = path.join(outDir, "ios", iosLocale);
  await fs.mkdir(targetDir, { recursive: true });

  const filePath = path.join(targetDir, "release_notes.txt");
  await fs.writeFile(filePath, releaseNotes, "utf8");
  return filePath;
}
