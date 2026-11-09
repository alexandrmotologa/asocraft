import { z } from "zod";
import { countCharacters } from "../core/constraints/validator.js";

const charLimit = (max: number, label: string) =>
  z.string().refine((val) => countCharacters(val) <= max, {
    message: `${label} exceeds ${max} characters limit`,
  });

export const LocalizedIosOutputSchema = z.object({
  title: charLimit(30, "iOS Title"),
  subtitle: charLimit(30, "iOS Subtitle"),
  keywords: charLimit(100, "iOS Keywords"),
  description: charLimit(4000, "iOS Description"),
  promotionalText: charLimit(170, "iOS Promotional Text").optional(),
});

export const LocalizedAndroidOutputSchema = z.object({
  title: charLimit(30, "Android Title"),
  shortDescription: charLimit(80, "Android Short Description"),
  fullDescription: charLimit(4000, "Android Full Description"),
});

export const LocalizedLocaleOutputSchema = z.object({
  locale: z.string(),
  ios: LocalizedIosOutputSchema.optional(),
  android: LocalizedAndroidOutputSchema.optional(),
});

export type LocalizedIosOutput = z.infer<typeof LocalizedIosOutputSchema>;
export type LocalizedAndroidOutput = z.infer<typeof LocalizedAndroidOutputSchema>;
export type LocalizedLocaleOutput = z.infer<typeof LocalizedLocaleOutputSchema>;
