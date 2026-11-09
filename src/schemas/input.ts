import { z } from "zod";
import { AppGenreSchema } from "./config.js";
import { countCharacters } from "../core/constraints/validator.js";

const charMax = (max: number, fieldName: string) =>
  z.string().refine((val) => countCharacters(val) <= max, {
    message: `${fieldName} exceeds maximum length of ${max} characters`,
  });

export const IosMetadataInputSchema = z.object({
  title: charMax(30, "iOS title"),
  subtitle: charMax(30, "iOS subtitle"),
  keywords: charMax(100, "iOS keywords"),
  description: charMax(4000, "iOS description"),
  promotionalText: charMax(170, "iOS promotional text").optional(),
});

export const AndroidMetadataInputSchema = z.object({
  title: charMax(30, "Android title"),
  shortDescription: charMax(80, "Android short description"),
  fullDescription: charMax(4000, "Android full description"),
});

export const BaseMetadataSchema = z.object({
  locale: z.string().default("en-US"),
  appName: z.string().optional(),
  genre: AppGenreSchema.optional(),
  ios: IosMetadataInputSchema.optional(),
  android: AndroidMetadataInputSchema.optional(),
}).refine((data) => data.ios || data.android, {
  message: "At least one platform (ios or android) must be defined in base metadata",
});

export type BaseMetadataParsed = z.infer<typeof BaseMetadataSchema>;
