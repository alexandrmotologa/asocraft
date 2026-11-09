import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { auditMetadata } from "../../core/engine/audit.js";
import type { LocalizedStoreMetadata } from "../../types/index.js";

export interface AuditCommandOptions {
  dir?: string;
  file?: string;
  locale?: string;
  minScore?: number;
}

export async function runAudit(options: AuditCommandOptions): Promise<void> {
  const cwd = process.cwd();
  let metadataMap: Record<string, LocalizedStoreMetadata> = {};

  if (options.file) {
    const filePath = path.resolve(cwd, options.file);
    const content = JSON.parse(await fs.readFile(filePath, "utf8"));
    const loc = content.locale || "en-US";
    metadataMap[loc] = content;
  } else {
    const dirPath = path.resolve(cwd, options.dir || "fastlane/metadata");
    metadataMap = await importFastlaneDirectory(dirPath);
  }

  const locales = options.locale
    ? [options.locale]
    : Object.keys(metadataMap);

  if (locales.length === 0) {
    console.log(pc.yellow("No metadata found to audit. Provide --file <path> or ensure Fastlane folders exist in --dir."));
    return;
  }

  console.log(pc.bold(pc.cyan(`\nASOCraft Quality Scorecard & ASO Audit`)));
  console.log(`${pc.dim("Locales evaluated:")} ${locales.join(", ")}\n`);

  let totalScoreSum = 0;
  let totalPlatforms = 0;

  for (const loc of locales) {
    const meta = metadataMap[loc];
    if (!meta) continue;

    const reports = auditMetadata(meta);

    for (const rep of reports) {
      totalScoreSum += rep.overallScore;
      totalPlatforms++;

      const gradeColor =
        rep.grade === "A+" || rep.grade === "A"
          ? pc.green(rep.grade)
          : rep.grade === "B"
          ? pc.cyan(rep.grade)
          : rep.grade === "C"
          ? pc.yellow(rep.grade)
          : pc.red(rep.grade);

      console.log(
        `${pc.bold(loc)} [${pc.bold(rep.platform.toUpperCase())}] — Score: ${pc.bold(rep.overallScore.toString())}/100 (Grade: ${gradeColor})`
      );

      const table = new Table({
        head: [
          pc.bold("Field"),
          pc.bold("Length / Max"),
          pc.bold("Utilization"),
          pc.bold("Field Score"),
        ],
        colWidths: [26, 18, 16, 16],
      });

      for (const fs of rep.fieldScores) {
        table.push([
          fs.field,
          `${fs.length}/${fs.maxLength}`,
          `${fs.utilizationPercent}%`,
          `${fs.score}/${fs.maxScore}`,
        ]);
      }

      console.log(table.toString());

      if (rep.recommendations.length > 0) {
        console.log(pc.dim("  Recommendations:"));
        for (const rec of rep.recommendations) {
          console.log(`   ${pc.yellow("•")} ${rec}`);
        }
      }
      console.log("");
    }
  }

  const averageScore = totalPlatforms > 0 ? Math.round(totalScoreSum / totalPlatforms) : 0;
  console.log(pc.bold(`Composite ASO Quality Index: ${pc.cyan(`${averageScore}/100`)}\n`));

  if (options.minScore && averageScore < options.minScore) {
    console.log(pc.red(`Audit failed: Average score ${averageScore} is below minimum threshold ${options.minScore}`));
    process.exitCode = 1;
  }
}
