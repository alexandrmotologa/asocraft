import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { generateVariants, type VariantAngle } from "../../core/engine/variants.js";
import { BaseMetadataSchema } from "../../schemas/input.js";

export interface VariantsCommandOptions {
  config?: string;
  metadata?: string;
  locales?: string;
  angles?: string;
  output?: string;
  format?: "json" | "csv";
}

export async function runVariants(options: VariantsCommandOptions): Promise<void> {
  const cwd = process.cwd();
  const metadataPath = path.resolve(cwd, options.metadata || "metadata.en.json");
  const baseMetadata = BaseMetadataSchema.parse(JSON.parse(await fs.readFile(metadataPath, "utf8")));

  let targetLocales = ["en-US", "de-DE", "ja", "fr-FR", "es-ES"];
  if (options.locales) {
    targetLocales = options.locales.split(",").map((l) => l.trim()).filter(Boolean);
  }

  const angles: VariantAngle[] = options.angles
    ? (options.angles.split(",").map((a) => a.trim()) as VariantAngle[])
    : ["gameplay", "social", "casual", "progression"];

  console.log(pc.bold(pc.cyan(`\nASOCraft Store Listing A/B Test Variant Generator`)));
  console.log(`${pc.dim("App:")} ${baseMetadata.appName}`);
  console.log(`${pc.dim("Target Locales:")} ${targetLocales.join(", ")}`);
  console.log(`${pc.dim("Angles:")} ${angles.join(", ")}\n`);

  const result = await generateVariants({
    source: baseMetadata,
    targetLocales,
    angles,
  });

  const table = new Table({
    head: [
      pc.bold("Locale"),
      pc.bold("Angle"),
      pc.bold("iOS Subtitle (<=30)"),
      pc.bold("Android Short Desc (<=80)"),
    ],
    colWidths: [10, 14, 32, 45],
  });

  for (const loc of targetLocales) {
    const list = result.locales[loc] || [];
    for (const v of list) {
      table.push([
        loc,
        pc.cyan(v.angleLabel),
        `${v.ios?.subtitle} ${pc.dim(`(${v.ios?.subtitleLength}/30)`)}`,
        `${v.android?.shortDescription} ${pc.dim(`(${v.android?.shortDescLength}/80)`)}`,
      ]);
    }
  }

  console.log(table.toString());

  if (options.output) {
    const outPath = path.resolve(cwd, options.output);
    const format = options.format || (options.output.endsWith(".csv") ? "csv" : "json");

    if (format === "csv") {
      const rows = [
        "Locale,Angle,Platform,Field,Length,Content",
      ];
      for (const loc of targetLocales) {
        for (const v of result.locales[loc] || []) {
          rows.push(`${loc},${v.angle},iOS,Subtitle,${v.ios?.subtitleLength},"${v.ios?.subtitle.replace(/"/g, '""')}"`);
          rows.push(`${loc},${v.angle},Android,ShortDescription,${v.android?.shortDescLength},"${v.android?.shortDescription.replace(/"/g, '""')}"`);
        }
      }
      await fs.writeFile(outPath, rows.join("\n"), "utf8");
    } else {
      await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
    }
    console.log(pc.green(`\n✔ Saved variants to ${outPath}\n`));
  } else {
    console.log(pc.dim("\nTip: add --output variants.json (or variants.csv) to export these variants for store experiments.\n"));
  }
}
