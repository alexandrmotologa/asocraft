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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>ASOCraft — Store Listing Mockup & Multi-Device Preview</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
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
      padding: clamp(12px, 3vw, 28px);
      min-height: 100vh;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #00f5ff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      color: #0b0f19;
    }
    h1 {
      font-size: clamp(18px, 4vw, 24px);
      font-weight: 700;
      color: #fff;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: #1e293b;
      color: #93c5fd;
      border: 1px solid #334155;
    }

    /* Device mode switcher */
    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }
    .device-switcher {
      display: inline-flex;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
    }
    .device-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 7px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .device-btn:hover { color: #fff; }
    .device-btn.active {
      background: var(--primary);
      color: #fff;
    }

    /* Locale horizontal bar with smooth scroll */
    .locale-bar {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 24px;
      scrollbar-width: thin;
      scrollbar-color: var(--card-border) transparent;
      -webkit-overflow-scrolling: touch;
    }
    .locale-btn {
      background: var(--card-bg);
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .locale-btn:hover { background: #1f2937; color: #fff; }
    .locale-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }

    /* Layout wrapper supporting device simulation */
    .layout-wrapper {
      width: 100%;
      margin: 0 auto;
      transition: max-width 0.3s ease;
    }
    .layout-wrapper.mode-desktop { max-width: 100%; }
    .layout-wrapper.mode-tablet { max-width: 768px; }
    .layout-wrapper.mode-mobile { max-width: 410px; }

    .preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .preview-grid { grid-template-columns: 1fr; }
    }
    .layout-wrapper.mode-mobile .preview-grid,
    .layout-wrapper.mode-tablet .preview-grid {
      grid-template-columns: 1fr;
    }

    /* Device Card Frame */
    .device-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: clamp(16px, 3vw, 24px);
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
    }
    .platform-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .platform-ios { color: #38bdf8; }
    .platform-android { color: #34d399; }

    .store-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }
    .app-icon {
      width: 76px;
      height: 76px;
      border-radius: 18px;
      background: linear-gradient(135deg, #4f46e5, #9333ea);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    }
    .app-meta {
      flex: 1;
      min-width: 0;
    }
    .store-title {
      font-size: clamp(16px, 2vw, 19px);
      font-weight: 700;
      color: #fff;
      word-break: break-word;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .store-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      word-break: break-word;
      line-height: 1.35;
      margin-bottom: 6px;
    }
    .action-btn {
      padding: 7px 20px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      flex-shrink: 0;
    }
    .btn-ios { background: #1e293b; color: var(--apple-blue); }
    .btn-android { background: var(--google-green); color: #fff; }

    .field-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255,255,255,0.06);
      margin-top: 4px;
    }
    .tag-valid { color: var(--success); }
    .tag-invalid { color: var(--danger); font-weight: 700; }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin: 16px 0 6px 0;
    }
    .content-box {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 240px;
      overflow-y: auto;
      line-height: 1.6;
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
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 12px;
      border: 1px solid #334155;
    }

    /* Score meter badge */
    .score-card {
      margin-top: 24px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .score-circle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #1e293b;
      border: 3px solid var(--success);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      color: var(--success);
    }
    .score-info h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .score-info p { font-size: 13px; color: var(--text-muted); }
  </style>
</head>
<body>
  <header>
    <div class="header-brand">
      <div class="brand-logo">AC</div>
      <div>
        <h1>ASOCraft Store Mockup Preview</h1>
        <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
          <span class="badge" id="app-badge">${appName}</span>
          <span style="font-size: 12px; color: var(--text-muted);">${locales.length} Locales Loaded</span>
        </div>
      </div>
    </div>
    <div class="device-switcher">
      <button class="device-btn active" id="btn-desktop" onclick="setDeviceMode('desktop')">🖥️ Desktop</button>
      <button class="device-btn" id="btn-tablet" onclick="setDeviceMode('tablet')">📱 Tablet</button>
      <button class="device-btn" id="btn-mobile" onclick="setDeviceMode('mobile')">📱 iPhone</button>
    </div>
  </header>

  <!-- Horizontal Locale Switcher with Smooth Scroll -->
  <div class="locale-bar" id="locale-bar"></div>

  <div class="layout-wrapper mode-desktop" id="layout-wrapper">
    <div class="preview-grid">
      <!-- Apple App Store Mockup -->
      <div class="device-card" id="ios-card">
        <div class="platform-label platform-ios">
          <span> APPLE APP STORE (iOS)</span>
        </div>
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

        <div class="section-title">iOS Keywords (100 Chars Limit)</div>
        <span class="field-tag" id="ios-kw-tag"></span>
        <div class="keywords-cloud" id="ios-keywords"></div>

        <div class="section-title">App Store Description</div>
        <div class="content-box" id="ios-desc"></div>
      </div>

      <!-- Google Play Mockup -->
      <div class="device-card" id="android-card">
        <div class="platform-label platform-android">
          <span>▶ GOOGLE PLAY (ANDROID)</span>
        </div>
        <div class="store-header">
          <div class="app-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">🎮</div>
          <div class="app-meta">
            <div class="store-title" id="android-title">Title</div>
            <span class="field-tag" id="android-title-tag"></span>
            <div style="font-size: 12px; color: var(--google-green); font-weight: 600; margin-top: 4px;">Contains ads • In-app purchases</div>
          </div>
          <button class="action-btn btn-android">Install</button>
        </div>

        <div class="section-title">Short Description (Above the fold, 80 Chars Limit)</div>
        <div class="content-box" style="max-height: 85px;" id="android-short"></div>
        <span class="field-tag" id="android-short-tag"></span>

        <div class="section-title">Google Play Full Description</div>
        <div class="content-box" id="android-desc"></div>
      </div>
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

    function setDeviceMode(mode) {
      const wrapper = document.getElementById("layout-wrapper");
      wrapper.className = "layout-wrapper mode-" + mode;

      document.querySelectorAll(".device-btn").forEach(btn => btn.classList.remove("active"));
      document.getElementById("btn-" + mode).classList.add("active");
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

      // iOS Elements
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

      // Android Elements
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
