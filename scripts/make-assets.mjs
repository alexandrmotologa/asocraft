import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderTerminalSvg(title, lines, width = 1200, height = 760) {
  const lineElements = lines
    .map((line, idx) => {
      const y = 80 + idx * 24;
      return `<text x="32" y="${y}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="14" fill="${line.color || "#e2e8f0"}">${escapeXml(line.text)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="win-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#0b0f19" />

  <g transform="translate(40, 30)" filter="url(#win-shadow)">
    <!-- Terminal Window Container -->
    <rect width="${width - 80}" height="${height - 60}" rx="14" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />

    <!-- Terminal Window Title Bar -->
    <rect width="${width - 80}" height="42" rx="14" fill="#1e293b" />
    <rect y="24" width="${width - 80}" height="18" fill="#1e293b" />
    <line x1="0" y1="42" x2="${width - 80}" y2="42" stroke="#334155" stroke-width="1" />

    <!-- Traffic Lights -->
    <circle cx="24" cy="21" r="6" fill="#ef4444" />
    <circle cx="44" cy="21" r="6" fill="#f59e0b" />
    <circle cx="64" cy="21" r="6" fill="#10b981" />

    <text x="${(width - 80) / 2}" y="26" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="12" font-weight="600" fill="#94a3b8">${escapeXml(title)}</text>

    <!-- Terminal Body Content -->
    ${lineElements}
  </g>
</svg>`;
}

async function buildTerminalImages() {
  const imagesDir = path.resolve("docs/images");
  fs.mkdirSync(imagesDir, { recursive: true });

  // 1. Terminal Localize Output
  const localizeLines = [
    { text: "$ npx asocraft localize --locales de-DE,fr-FR,es-ES,ja,ko,pt-BR", color: "#38bdf8" },
    { text: "", color: "#e2e8f0" },
    { text: "ASOCraft Localization Pipeline", color: "#00f5ff" },
    { text: "App: Pixel Quest: Match 3 RPG (casual-game)", color: "#94a3b8" },
    { text: "Source Locale: en-US", color: "#94a3b8" },
    { text: "Target Locales (6): de-DE, fr-FR, es-ES, ja, ko, pt-BR", color: "#94a3b8" },
    { text: "Provider: gemini-2.5-flash | Platforms: ios, android", color: "#94a3b8" },
    { text: "", color: "#e2e8f0" },
    { text: "┌──────────┬──────────┬──────────────────┬──────────────────────────┬──────────────┬────────────┐", color: "#64748b" },
    { text: "│ Locale   │ Platform │ Title            │ Subtitle / Short Desc    │ Keywords     │ Status     │", color: "#f8fafc" },
    { text: "├──────────┼──────────┼──────────────────┼──────────────────────────┼──────────────┼────────────┤", color: "#64748b" },
    { text: "│ de-DE    │ iOS      │ 24/30 chars      │ 23/30 chars              │ 88/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ de-DE    │ Android  │ 24/30 chars      │ 43/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "│ fr-FR    │ iOS      │ 24/30 chars      │ 21/30 chars              │ 89/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ fr-FR    │ Android  │ 24/30 chars      │ 43/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "│ es-ES    │ iOS      │ 24/30 chars      │ 22/30 chars              │ 92/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ es-ES    │ Android  │ 24/30 chars      │ 47/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "│ ja       │ iOS      │ 24/30 chars      │ 15/30 chars              │ 66/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ ja       │ Android  │ 24/30 chars      │ 20/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "│ ko       │ iOS      │ 24/30 chars      │ 17/30 chars              │ 72/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ ko       │ Android  │ 24/30 chars      │ 21/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "│ pt-BR    │ iOS      │ 24/30 chars      │ 21/30 chars              │ 94/100 chars │ ✔ VALID    │", color: "#34d399" },
    { text: "│ pt-BR    │ Android  │ 24/30 chars      │ 46/80 chars              │ N/A          │ ✔ VALID    │", color: "#34d399" },
    { text: "└──────────┴──────────┴──────────────────┴──────────────────────────┴──────────────┴────────────┘", color: "#64748b" },
    { text: "", color: "#e2e8f0" },
    { text: "✔ Exported 48 Fastlane metadata files into fastlane/metadata", color: "#34d399" },
    { text: "Completed in 0.82s with 0 errors, 0 warnings.", color: "#94a3b8" },
  ];

  const svg1 = renderTerminalSvg("asocraft localize — zsh", localizeLines, 1200, 760);
  const resvg1 = new Resvg(svg1, { fitTo: { mode: "width", value: 1200 } });
  fs.writeFileSync(path.join(imagesDir, "asocraft_terminal.png"), resvg1.render().asPng());
  console.log("✔ Created asocraft_terminal.png");

  // 2. Terminal Audit & Scorecard Output
  const auditLines = [
    { text: "$ npx asocraft audit --file metadata.en.json", color: "#38bdf8" },
    { text: "", color: "#e2e8f0" },
    { text: "ASOCraft Quality Scorecard & ASO Audit", color: "#00f5ff" },
    { text: "Locales evaluated: en-US", color: "#94a3b8" },
    { text: "", color: "#e2e8f0" },
    { text: "en-US [IOS] — Score: 92/100 (Grade: A+)", color: "#34d399" },
    { text: "┌──────────────────────────┬──────────────────┬────────────────┬────────────────┐", color: "#64748b" },
    { text: "│ Field                    │ Length / Max     │ Utilization    │ Field Score    │", color: "#f8fafc" },
    { text: "├──────────────────────────┼──────────────────┼────────────────┼────────────────┤", color: "#64748b" },
    { text: "│ iOS Title                │ 24/30 chars      │ 80%            │ 30/30          │", color: "#34d399" },
    { text: "│ iOS Subtitle             │ 27/30 chars      │ 90%            │ 25/25          │", color: "#34d399" },
    { text: "│ iOS Keywords             │ 88/100 chars     │ 88%            │ 28/35          │", color: "#34d399" },
    { text: "│ iOS Description          │ 620/4000 chars   │ 16%            │ 10/10          │", color: "#34d399" },
    { text: "└──────────────────────────┴──────────────────┴────────────────┴────────────────┘", color: "#64748b" },
    { text: "  Recommendations:", color: "#94a3b8" },
    { text: "   • Keywords field has 12 unused characters available.", color: "#fbbf24" },
    { text: "", color: "#e2e8f0" },
    { text: "en-US [ANDROID] — Score: 95/100 (Grade: A+)", color: "#34d399" },
    { text: "┌──────────────────────────┬──────────────────┬────────────────┬────────────────┐", color: "#64748b" },
    { text: "│ Field                    │ Length / Max     │ Utilization    │ Field Score    │", color: "#f8fafc" },
    { text: "├──────────────────────────┼──────────────────┼────────────────┼────────────────┤", color: "#64748b" },
    { text: "│ Android Title            │ 24/30 chars      │ 80%            │ 30/30          │", color: "#34d399" },
    { text: "│ Android Short Desc       │ 72/80 chars      │ 90%            │ 35/35          │", color: "#34d399" },
    { text: "│ Android Full Desc        │ 620/4000 chars   │ 16%            │ 30/35          │", color: "#34d399" },
    { text: "└──────────────────────────┴──────────────────┴────────────────┴────────────────┘", color: "#64748b" },
    { text: "", color: "#e2e8f0" },
    { text: "Composite ASO Quality Index: 94/100 (Grade A+)", color: "#00f5ff" },
  ];

  const svg2 = renderTerminalSvg("asocraft audit — zsh", auditLines, 1200, 760);
  const resvg2 = new Resvg(svg2, { fitTo: { mode: "width", value: 1200 } });
  fs.writeFileSync(path.join(imagesDir, "asocraft_audit.png"), resvg2.render().asPng());
  console.log("✔ Created asocraft_audit.png");
}

buildTerminalImages().catch(console.error);
