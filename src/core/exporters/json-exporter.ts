import fs from "node:fs/promises";
import path from "node:path";
import type { LocalizationResult } from "../../types/index.js";
import { countCharacters } from "../constraints/validator.js";

export async function exportToJson(
  result: LocalizationResult,
  outputPath: string
): Promise<string> {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");
  return outputPath;
}

export async function exportToCsv(
  result: LocalizationResult,
  outputPath: string
): Promise<string> {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  const escapeCsv = (str: string | undefined): string => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows: string[] = [
    "Platform,Locale,Field,Length,Status,Content",
  ];

  for (const [locale, meta] of Object.entries(result.localizations)) {
    if (meta.ios) {
      rows.push(
        `iOS,${locale},Title,${countCharacters(meta.ios.title)},${countCharacters(meta.ios.title) <= 30 ? "OK" : "OVERFLOW"},${escapeCsv(meta.ios.title)}`
      );
      rows.push(
        `iOS,${locale},Subtitle,${countCharacters(meta.ios.subtitle)},${countCharacters(meta.ios.subtitle) <= 30 ? "OK" : "OVERFLOW"},${escapeCsv(meta.ios.subtitle)}`
      );
      rows.push(
        `iOS,${locale},Keywords,${countCharacters(meta.ios.keywords)},${countCharacters(meta.ios.keywords) <= 100 ? "OK" : "OVERFLOW"},${escapeCsv(meta.ios.keywords)}`
      );
      rows.push(
        `iOS,${locale},Description,${countCharacters(meta.ios.description)},${countCharacters(meta.ios.description) <= 4000 ? "OK" : "OVERFLOW"},${escapeCsv(meta.ios.description)}`
      );
      if (meta.ios.promotionalText) {
        rows.push(
          `iOS,${locale},PromotionalText,${countCharacters(meta.ios.promotionalText)},${countCharacters(meta.ios.promotionalText) <= 170 ? "OK" : "OVERFLOW"},${escapeCsv(meta.ios.promotionalText)}`
        );
      }
    }

    if (meta.android) {
      rows.push(
        `Android,${locale},Title,${countCharacters(meta.android.title)},${countCharacters(meta.android.title) <= 30 ? "OK" : "OVERFLOW"},${escapeCsv(meta.android.title)}`
      );
      rows.push(
        `Android,${locale},ShortDescription,${countCharacters(meta.android.shortDescription)},${countCharacters(meta.android.shortDescription) <= 80 ? "OK" : "OVERFLOW"},${escapeCsv(meta.android.shortDescription)}`
      );
      rows.push(
        `Android,${locale},FullDescription,${countCharacters(meta.android.fullDescription)},${countCharacters(meta.android.fullDescription) <= 4000 ? "OK" : "OVERFLOW"},${escapeCsv(meta.android.fullDescription)}`
      );
    }
  }

  await fs.writeFile(outputPath, rows.join("\n"), "utf8");
  return outputPath;
}
