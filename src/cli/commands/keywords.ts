import fs from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import { optimizeIosKeywords } from "../../core/engine/keyword-optimizer.js";
import { countCharacters } from "../../core/constraints/validator.js";

export interface KeywordsCommandOptions {
  file?: string;
  keywords?: string;
  title?: string;
  subtitle?: string;
  locale?: string;
  optimize?: boolean;
}

export async function runKeywords(options: KeywordsCommandOptions): Promise<void> {
  let keywordsStr = options.keywords || "";
  let title = options.title || "";
  let subtitle = options.subtitle || "";

  if (options.file) {
    const cwd = process.cwd();
    const filePath = path.resolve(cwd, options.file);
    const content = await fs.readFile(filePath, "utf8");

    if (filePath.endsWith(".json")) {
      const parsed = JSON.parse(content);
      keywordsStr = parsed.ios?.keywords || parsed.keywords || "";
      title = title || parsed.ios?.title || parsed.title || "";
      subtitle = subtitle || parsed.ios?.subtitle || parsed.subtitle || "";
    } else {
      keywordsStr = content.trim();
    }
  }

  if (!keywordsStr) {
    console.log(pc.yellow("No keywords provided. Use --keywords <string> or --file <path>."));
    return;
  }

  console.log(pc.bold(pc.cyan(`\nASOCraft iOS Keyword Analyzer`)));
  if (title) console.log(`${pc.dim("Title:")} ${title}`);
  if (subtitle) console.log(`${pc.dim("Subtitle:")} ${subtitle}`);
  console.log(`${pc.dim("Original Keywords:")} ${keywordsStr}\n`);

  const opt = optimizeIosKeywords(keywordsStr, {
    title,
    subtitle,
    locale: options.locale || "en",
    removeStopWords: true,
    deduplicateWithTitle: true,
  });

  console.log(`Original character count:  ${opt.originalLength}/100 ${opt.originalLength > 100 ? pc.red("(OVERFLOW)") : pc.green("(OK)")}`);
  console.log(`Optimized character count: ${opt.optimizedLength}/100 ${opt.optimizedLength <= 100 ? pc.green("(OK)") : pc.red("(OVERFLOW)")}`);
  console.log(`Capacity recovered:        ${pc.bold(pc.green(`+${opt.charactersSaved} characters`))}\n`);

  if (opt.removedDuplicates.length > 0) {
    console.log(pc.yellow(`Removed redundant duplicate keywords: ${opt.removedDuplicates.join(", ")}`));
  }
  if (opt.removedOverlapWithTitle.length > 0) {
    console.log(pc.yellow(`Removed terms already indexed in Title/Subtitle: ${opt.removedOverlapWithTitle.join(", ")}`));
  }
  if (opt.removedStopWords.length > 0) {
    console.log(pc.yellow(`Removed non-indexed stop words: ${opt.removedStopWords.join(", ")}`));
  }

  console.log(`\n${pc.bold("Optimized Keyword String:")}`);
  console.log(pc.cyan(opt.optimized));
  console.log("");
}
