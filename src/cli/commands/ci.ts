import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { importFastlaneDirectory } from "../../core/exporters/importer.js";
import { validateMetadata } from "../../core/constraints/validator.js";

const DEFAULT_WORKFLOW = `name: ASO Store Metadata Quality & Constraint Check

on:
  pull_request:
    paths:
      - 'fastlane/metadata/**'
      - 'metadata.*.json'
      - 'aso.config.json'
  push:
    branches:
      - main

jobs:
  aso-validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run ASOCraft Strict Store Audit
        run: npx asocraft ci --strict
`;

export interface CiCommandOptions {
  dir?: string;
  strict?: boolean;
  install?: boolean;
}

export async function runCi(options: CiCommandOptions): Promise<void> {
  const cwd = process.cwd();

  // If user requested --install, scaffold GitHub Action workflow
  if (options.install) {
    const workflowDir = path.join(cwd, ".github", "workflows");
    await fs.mkdir(workflowDir, { recursive: true });
    const workflowPath = path.join(workflowDir, "aso-check.yml");
    await fs.writeFile(workflowPath, DEFAULT_WORKFLOW, "utf8");
    console.log(pc.green(`✔ Created GitHub Actions workflow at ${workflowPath}`));
    return;
  }

  const targetDir = path.resolve(cwd, options.dir || "fastlane/metadata");
  console.log(pc.bold(pc.cyan(`\nASOCraft CI Guardrail Check`)));
  console.log(`${pc.dim("Inspecting:")} ${targetDir}\n`);

  const imported = await importFastlaneDirectory(targetDir);
  const locales = Object.keys(imported);

  if (locales.length === 0) {
    console.log(pc.yellow(`No Fastlane metadata folders found in ${targetDir}. Skipping CI check.`));
    return;
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  const markdownRows: string[] = [];

  markdownRows.push("| Locale | Platform | Field | Length | Limit | Severity | Message |");
  markdownRows.push("|---|---|---|---|---|---|---|");

  for (const loc of locales) {
    const meta = imported[loc];
    const report = validateMetadata(meta);

    totalErrors += report.errorCount;
    totalWarnings += report.warningCount;

    for (const issue of report.issues) {
      markdownRows.push(
        `| ${loc} | ${issue.platform.toUpperCase()} | ${issue.field} | ${issue.currentLength} | ${issue.maxLength} | ${issue.severity.toUpperCase()} | ${issue.message} |`
      );
      if (issue.severity === "error") {
        console.log(pc.red(`✖ [${loc}] [${issue.platform.toUpperCase()} ${issue.field}]: ${issue.message}`));
      } else {
        console.log(pc.yellow(`⚠ [${loc}] [${issue.platform.toUpperCase()} ${issue.field}]: ${issue.message}`));
      }
    }
  }

  // If running inside GitHub Actions, write to step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    let summaryMd = `## 📱 ASOCraft Store Metadata Audit\n\n`;
    if (totalErrors === 0) {
      summaryMd += `✅ **All store metadata is 100% compliant with Apple and Google character limits!**\n\n`;
    } else {
      summaryMd += `❌ **Found ${totalErrors} character boundary violation(s). Rejection risk!**\n\n`;
    }
    if (markdownRows.length > 2) {
      summaryMd += markdownRows.join("\n") + "\n";
    }
    try {
      await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summaryMd, "utf8");
    } catch {
      // Ignore
    }
  }

  console.log(`\nAudit finished: ${locales.length} locales checked.`);
  if (totalErrors === 0 && (!options.strict || totalWarnings === 0)) {
    console.log(pc.green("✔ All metadata files passed CI store compliance checks!\n"));
  } else {
    if (totalErrors > 0) {
      console.log(pc.red(`✖ CI check failed with ${totalErrors} store limit violations.\n`));
      process.exitCode = 1;
    } else if (options.strict && totalWarnings > 0) {
      console.log(pc.yellow(`✖ CI strict check failed due to ${totalWarnings} optimization warnings.\n`));
      process.exitCode = 1;
    }
  }
}
