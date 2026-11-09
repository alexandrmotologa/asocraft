import path from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { validateMetadata } from "../../core/constraints/validator.js";

export interface ValidateCommandOptions {
  dir?: string;
  strict?: boolean;
}

export async function runValidate(options: ValidateCommandOptions): Promise<void> {
  const cwd = process.cwd();
  const targetDir = path.resolve(cwd, options.dir || "fastlane/metadata");

  console.log(pc.bold(pc.cyan(`\nASOCraft Metadata Validator`)));
  console.log(`${pc.dim("Inspecting directory:")} ${targetDir}\n`);

  const imported = await importFastlaneDirectory(targetDir);
  const locales = Object.keys(imported);

  if (locales.length === 0) {
    console.log(pc.yellow(`No metadata found in ${targetDir}. Make sure "ios" or "android" subfolders exist.`));
    return;
  }

  const table = new Table({
    head: [
      pc.bold("Locale"),
      pc.bold("Platform"),
      pc.bold("Field"),
      pc.bold("Length"),
      pc.bold("Severity"),
      pc.bold("Diagnostic Message"),
    ],
    colWidths: [12, 10, 16, 12, 12, 40],
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const locale of locales) {
    const metadata = imported[locale];
    const report = validateMetadata(metadata);

    totalErrors += report.errorCount;
    totalWarnings += report.warningCount;

    for (const issue of report.issues) {
      const severityFormatted =
        issue.severity === "error" ? pc.red("ERROR") : pc.yellow("WARNING");

      table.push([
        locale,
        issue.platform.toUpperCase(),
        issue.field,
        `${issue.currentLength}/${issue.maxLength}`,
        severityFormatted,
        issue.message,
      ]);
    }
  }

  if (table.length > 0) {
    console.log(table.toString());
  }

  console.log(`\nAudit complete: ${pc.bold(locales.length.toString())} locales scanned.`);
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(pc.green("✔ All store metadata files are 100% compliant with character limits and formatting rules!\n"));
  } else {
    if (totalErrors > 0) {
      console.log(pc.red(`✖ Found ${totalErrors} character limit violation(s). Store rejection risk!`));
    }
    if (totalWarnings > 0) {
      console.log(pc.yellow(`⚠ Found ${totalWarnings} optimization warning(s).`));
    }
    console.log("");
  }

  if (totalErrors > 0 || (options.strict && totalWarnings > 0)) {
    process.exitCode = 1;
  }
}
