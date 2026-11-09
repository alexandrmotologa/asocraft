import type { BaseMetadata, AppGenre } from "../../types/index.js";

export interface PullOptions {
  appStoreId?: string | number;
  bundleId?: string;
  googlePlayId?: string;
  url?: string;
  country?: string;
}

export interface ExtractedStoreMetadata {
  platform: "ios" | "android" | "both";
  appId?: string;
  appName: string;
  genre: AppGenre;
  ios?: {
    title: string;
    subtitle?: string;
    description: string;
    releaseNotes?: string;
  };
  android?: {
    title: string;
    shortDescription: string;
    fullDescription: string;
  };
}

function mapGenreToAppGenre(rawGenre: string | undefined): AppGenre {
  if (!rawGenre) return "casual-game";
  const g = rawGenre.toLowerCase();
  if (g.includes("puzzle")) return "puzzle";
  if (g.includes("rpg") || g.includes("role playing")) return "rpg";
  if (g.includes("action")) return "action-game";
  if (g.includes("strategy")) return "strategy-game";
  if (g.includes("productiv")) return "productivity";
  if (g.includes("utilit") || g.includes("tool")) return "utility";
  if (g.includes("fit") || g.includes("health")) return "fitness";
  if (g.includes("financ") || g.includes("money") || g.includes("bank")) return "finance";
  if (g.includes("educat")) return "education";
  if (g.includes("entertain")) return "entertainment";
  return "casual-game";
}

/**
 * Pulls metadata from Apple App Store via public iTunes Lookup API.
 */
export async function pullFromAppStore(
  identifier: string | number,
  country: string = "us"
): Promise<ExtractedStoreMetadata> {
  const isNumeric = /^\d+$/.test(identifier.toString());
  const param = isNumeric ? `id=${identifier}` : `bundleId=${encodeURIComponent(identifier.toString())}`;
  const url = `https://itunes.apple.com/lookup?${param}&country=${country}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "ASOCraft-Pipeline/1.0" },
  });

  if (!response.ok) {
    throw new Error(`iTunes Lookup API returned HTTP ${response.status} for ${identifier}`);
  }

  const data = (await response.json()) as any;
  if (!data.results || data.results.length === 0) {
    throw new Error(`No App Store listing found for identifier: ${identifier}`);
  }

  const item = data.results[0];
  const appName = item.trackName || item.bundleId;
  const genre = mapGenreToAppGenre(item.primaryGenreName);

  return {
    platform: "ios",
    appId: item.bundleId || identifier.toString(),
    appName,
    genre,
    ios: {
      title: item.trackName || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      releaseNotes: item.releaseNotes,
    },
  };
}

/**
 * Pulls metadata from Google Play Store web listing.
 */
export async function pullFromGooglePlay(
  packageId: string,
  country: string = "us",
  language: string = "en"
): Promise<ExtractedStoreMetadata> {
  const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(packageId)}&hl=${language}&gl=${country}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Google Play returned HTTP ${response.status} for package: ${packageId}`);
  }

  const html = await response.text();

  // Extract OpenGraph tags
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
  let rawTitle = titleMatch ? titleMatch[1] : packageId;
  rawTitle = rawTitle.replace(/ - Apps on Google Play$/i, "").trim();

  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
  const shortDesc = descMatch ? descMatch[1] : "";

  // Attempt to extract full description from itemprop="description" or JSON-LD
  let fullDesc = "";
  const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  let rawCategory = "";

  if (jsonLdMatch) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      if (parsed.description) fullDesc = parsed.description;
      if (parsed.applicationCategory) rawCategory = parsed.applicationCategory;
    } catch {
      // Ignore JSON parse error, fallback to regex
    }
  }

  if (!fullDesc) {
    const fullDescMatch = html.match(/data-g-id="description"[^>]*>([\s\S]*?)<\/div>/i);
    fullDesc = fullDescMatch ? fullDescMatch[1].replace(/<[^>]+>/g, "").trim() : shortDesc;
  }

  const genre = mapGenreToAppGenre(rawCategory);

  return {
    platform: "android",
    appId: packageId,
    appName: rawTitle,
    genre,
    android: {
      title: rawTitle,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
    },
  };
}

/**
 * Converts extracted metadata into a standard BaseMetadata object.
 */
export function convertToCandidateBaseMetadata(
  extracted: ExtractedStoreMetadata
): BaseMetadata {
  const base: BaseMetadata = {
    locale: "en-US",
    appName: extracted.appName,
    genre: extracted.genre,
  };

  if (extracted.ios) {
    base.ios = {
      title: [...extracted.ios.title].slice(0, 30).join(""),
      subtitle: extracted.ios.subtitle ? [...extracted.ios.subtitle].slice(0, 30).join("") : "Mobile App",
      keywords: "app,mobile,game",
      description: extracted.ios.description,
    };
  }

  if (extracted.android) {
    base.android = {
      title: [...extracted.android.title].slice(0, 30).join(""),
      shortDescription: extracted.android.shortDescription
        ? [...extracted.android.shortDescription].slice(0, 80).join("")
        : "Exciting new app on Google Play.",
      fullDescription: extracted.android.fullDescription || extracted.android.shortDescription,
    };
  }

  return base;
}
