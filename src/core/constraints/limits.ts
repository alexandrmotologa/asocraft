export const IOS_LIMITS = {
  title: 30,
  subtitle: 30,
  keywords: 100,
  description: 4000,
  promotionalText: 170,
} as const;

export const ANDROID_LIMITS = {
  title: 30,
  shortDescription: 80,
  fullDescription: 4000,
} as const;

export const IOS_FASTLANE_FILES = {
  title: "title.txt",
  subtitle: "subtitle.txt",
  keywords: "keywords.txt",
  description: "description.txt",
  promotionalText: "promotional_text.txt",
} as const;

export const ANDROID_FASTLANE_FILES = {
  title: "title.txt",
  shortDescription: "short_description.txt",
  fullDescription: "full_description.txt",
} as const;

export type IosFieldName = keyof typeof IOS_LIMITS;
export type AndroidFieldName = keyof typeof ANDROID_LIMITS;
