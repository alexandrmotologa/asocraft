import fs from "node:fs/promises";
import path from "node:path";
import type { LocalizedStoreMetadata } from "../../types/index.js";
import { countCharacters } from "../constraints/validator.js";
import { auditMetadata } from "../engine/audit.js";

export function generateHtmlPreview(
  metadataMap: Record<string, LocalizedStoreMetadata>,
  appName: string = "Mobile Application"
): string {
  const locales = Object.keys(metadataMap);
  const dataJson = JSON.stringify(metadataMap);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASOCraft — Store Listing Mockup & ASO Preview</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --apple-blue: #0071e3;
      --google-green: #01875f;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    h1 { font-size: 24px; font-weight: 700; color: #fff; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: #1e293b;
      color: #93c5fd;
      border: 1px solid #334155;
    }
    .locale-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .locale-btn {
      background: var(--card-bg);
      color: var(--text-muted);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .locale-btn:hover { background: #1f2937; color: #fff; }
    .locale-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }
    .preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .preview-grid { grid-template-columns: 1fr; }
    }
    .device-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .store-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .app-icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .app-meta { flex: 1; min-width: 0; }
    .store-title {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .store-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .action-btn {
      align-self: flex-start;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .btn-ios { background: #1e293b; color: var(--apple-blue); }
    .btn-android { background: var(--google-green); color: #fff; }
    .field-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-family: monospace;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
      margin-top: 4px;
    }
    .tag-valid { color: var(--success); }
    .tag-invalid { color: var(--danger); }
    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin: 16px 0 8px 0;
    }
    .content-box {
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 12px;
      font-size: 13px;
      white-space: pre-wrap;
      max-height: 220px;
      overflow-y: auto;
    }
    .keywords-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .kw-pill {
      background: #1e293b;
      color: #cbd5e1;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
    }
    .audit-box {
      margin-top: 24px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
    }
    .score-meter {
      font-size: 32px;
      font-weight: 800;
      color: var(--success);
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>ASOCraft Store Listing Mockup</h1>
      <span class="badge" id="app-badge">${appName}</span>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; color: var(--text-muted);">Available Locales: ${locales.length}</div>
    </div>
  </header>

  <div class="locale-bar" id="locale-bar"></div>

  <div class="preview-grid">
    <!-- Apple App Store Mockup -->
    <div class="device-card" id="ios-card">
      <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">APPLE APP STORE (iOS)</div>
      <div class="store-header">
        <div class="app-icon">🎮</div>
        <div class="app-meta">
          <div class="store-title" id="ios-title">Title</div>
          <span class="field-tag" id="ios-title-tag"></span>
          <div class="store-subtitle" id="ios-subtitle">Subtitle</div>
          <span class="field-tag" id="ios-subtitle-tag"></span>
        </div>
        <button class="action-btn btn-ios">GET</button>
      </div>

      <div class="section-title">Keywords (100 Chars Limit)</div>
      <span class="field-tag" id="ios-kw-tag"></span>
      <div class="keywords-cloud" id="ios-keywords"></div>

      <div class="section-title">Description</div>
      <div class="content-box" id="ios-desc"></div>
    </div>

    <!-- Google Play Mockup -->
    <div class="device-card" id="android-card">
      <div style="font-size: 12px; font-weight: 700; color: var(--google-green); margin-bottom: 12px;">GOOGLE PLAY (ANDROID)</div>
      <div class="store-header">
        <div class="app-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">🎮</div>
        <div class="app-meta">
          <div class="store-title" id="android-title">Title</div>
          <span class="field-tag" id="android-title-tag"></span>
          <div style="font-size: 12px; color: var(--google-green); font-weight: 600;">Contains ads • In-app purchases</div>
        </div>
        <button class="action-btn btn-android">Install</button>
      </div>

      <div class="section-title">Short Description (Above The Fold, 80 Chars Limit)</div>
      <div class="content-box" style="max-height: 80px;" id="android-short"></div>
      <span class="field-tag" id="android-short-tag"></span>

      <div class="section-title">Full Description</div>
      <div class="content-box" id="android-desc"></div>
    </div>
  </div>

  <script>
    const metadata = ${dataJson};
    const locales = Object.keys(metadata);
    let currentLocale = locales[0] || "en-US";

    function countChars(str) {
      if (!str) return 0;
      return [...str].length;
    }

    function renderLocaleButtons() {
      const bar = document.getElementById("locale-bar");
      bar.innerHTML = "";
      locales.forEach(loc => {
        const btn = document.createElement("button");
        btn.className = "locale-btn " + (loc === currentLocale ? "active" : "");
        btn.textContent = loc;
        btn.onclick = () => {
          currentLocale = loc;
          renderLocaleButtons();
          updatePreview();
        };
        bar.appendChild(btn);
      });
    }

    function updatePreview() {
      const data = metadata[currentLocale] || {};
      const ios = data.ios || {};
      const android = data.android || {};

      // Update iOS
      document.getElementById("ios-title").textContent = ios.title || "No iOS Title";
      const iosTitleLen = countChars(ios.title);
      const iosTitleTag = document.getElementById("ios-title-tag");
      iosTitleTag.textContent = iosTitleLen + " / 30 chars";
      iosTitleTag.className = "field-tag " + (iosTitleLen <= 30 ? "tag-valid" : "tag-invalid");

      document.getElementById("ios-subtitle").textContent = ios.subtitle || "";
      const iosSubLen = countChars(ios.subtitle);
      const iosSubTag = document.getElementById("ios-subtitle-tag");
      iosSubTag.textContent = iosSubLen + " / 30 chars";
      iosSubTag.className = "field-tag " + (iosSubLen <= 30 ? "tag-valid" : "tag-invalid");

      const kwBox = document.getElementById("ios-keywords");
      kwBox.innerHTML = "";
      const kwList = (ios.keywords || "").split(",").filter(Boolean);
      kwList.forEach(k => {
        const span = document.createElement("span");
        span.className = "kw-pill";
        span.textContent = k.trim();
        kwBox.appendChild(span);
      });
      const kwLen = countChars(ios.keywords);
      const kwTag = document.getElementById("ios-kw-tag");
      kwTag.textContent = kwLen + " / 100 chars (" + kwList.length + " keywords)";
      kwTag.className = "field-tag " + (kwLen <= 100 ? "tag-valid" : "tag-invalid");

      document.getElementById("ios-desc").textContent = ios.description || "";

      // Update Android
      document.getElementById("android-title").textContent = android.title || "No Android Title";
      const androidTitleLen = countChars(android.title);
      const androidTitleTag = document.getElementById("android-title-tag");
      androidTitleTag.textContent = androidTitleLen + " / 30 chars";
      androidTitleTag.className = "field-tag " + (androidTitleLen <= 30 ? "tag-valid" : "tag-invalid");

      document.getElementById("android-short").textContent = android.shortDescription || "";
      const androidShortLen = countChars(android.shortDescription);
      const androidShortTag = document.getElementById("android-short-tag");
      androidShortTag.textContent = androidShortLen + " / 80 chars";
      androidShortTag.className = "field-tag " + (androidShortLen <= 80 ? "tag-valid" : "tag-invalid");

      document.getElementById("android-desc").textContent = android.fullDescription || "";
    }

    renderLocaleButtons();
    updatePreview();
  </script>
</body>
</html>`;
}

export async function writeHtmlPreviewFile(
  metadataMap: Record<string, LocalizedStoreMetadata>,
  outputPath: string,
  appName?: string
): Promise<string> {
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });
  const html = generateHtmlPreview(metadataMap, appName);
  await fs.writeFile(outputPath, html, "utf8");
  return outputPath;
}
