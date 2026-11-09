import { z } from "zod";

export const AppGenreSchema = z.enum([
  "casual-game",
  "puzzle",
  "rpg",
  "action-game",
  "strategy-game",
  "productivity",
  "utility",
  "fitness",
  "finance",
  "education",
  "entertainment",
]);

export const PlatformSchema = z.enum(["ios", "android"]);

export const ProviderTypeSchema = z.enum(["gemini", "anthropic", "openai", "offline"]);

export const AsoConfigSchema = z.object({
  $schema: z.string().optional(),
  appId: z.string().optional(),
  appName: z.string().min(1, "appName must not be empty"),
  genre: AppGenreSchema,
  defaultLocale: z.string().default("en-US"),
  locales: z.array(z.string()).min(1, "At least one target locale is required"),
  platforms: z.array(PlatformSchema).min(1, "At least one platform is required"),
  provider: ProviderTypeSchema.default("gemini"),
  model: z.string().optional(),
  outDir: z.string().default("fastlane/metadata"),
  options: z
    .object({
      stripKeywordSpaces: z.boolean().default(true),
      deduplicateKeywords: z.boolean().default(true),
      maxRetries: z.number().int().min(1).max(5).default(3),
      temperature: z.number().min(0).max(1).default(0.2),
      verbose: z.boolean().default(false),
    })
    .default({}),
});

export type AsoConfigParsed = z.infer<typeof AsoConfigSchema>;
