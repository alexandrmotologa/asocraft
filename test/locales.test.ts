import { describe, it, expect } from "vitest";
import {
  resolveIosLocale,
  resolveAndroidLocale,
  getLocaleDisplayName,
  SUPPORTED_LOCALES,
} from "../src/core/locales/matrix.js";

describe("Locale Matrix", () => {
  it("maps iOS and Android specific locale codes", () => {
    // Japanese: iOS uses 'ja', Google Play uses 'ja-JP'
    expect(resolveIosLocale("ja")).toBe("ja");
    expect(resolveAndroidLocale("ja")).toBe("ja-JP");

    // Korean: iOS uses 'ko', Google Play uses 'ko-KR'
    expect(resolveIosLocale("ko")).toBe("ko");
    expect(resolveAndroidLocale("ko")).toBe("ko-KR");

    // Chinese Simplified: iOS uses 'zh-Hans', Google Play uses 'zh-CN'
    expect(resolveIosLocale("zh-Hans")).toBe("zh-Hans");
    expect(resolveAndroidLocale("zh-Hans")).toBe("zh-CN");

    // Russian: iOS uses 'ru', Google Play uses 'ru-RU'
    expect(resolveIosLocale("ru")).toBe("ru");
    expect(resolveAndroidLocale("ru")).toBe("ru-RU");

    // German: Both use 'de-DE'
    expect(resolveIosLocale("de-DE")).toBe("de-DE");
    expect(resolveAndroidLocale("de-DE")).toBe("de-DE");
  });

  it("returns human friendly locale display name", () => {
    expect(getLocaleDisplayName("ja")).toContain("Japanese");
    expect(getLocaleDisplayName("de-DE")).toContain("German");
  });

  it("contains more than 20 supported store locales", () => {
    expect(Object.keys(SUPPORTED_LOCALES).length).toBeGreaterThanOrEqual(20);
  });
});
