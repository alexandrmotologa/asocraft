import OpenAI from "openai";
import {
  BaseTranslationProvider,
  type TranslationRequest,
  type TranslationResponse,
} from "./base.js";
import { buildSystemPrompt, buildUserPrompt } from "../prompt-builder.js";
import type { LocalizedStoreMetadata } from "../../../types/index.js";

function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export class OpenAiTranslationProvider extends BaseTranslationProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    super();
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required to use the OpenAI provider. Alternatively, pass --provider offline to test without API keys."
      );
    }
    this.client = new OpenAI({ apiKey: key });
    this.model = model || "gpt-4o-mini";
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const systemInstruction = buildSystemPrompt();
    const userPrompt = buildUserPrompt(request);

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: request.attempt > 1 ? 0.1 : 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
    });

    const rawText = completion.choices[0]?.message?.content || "";
    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned) as LocalizedStoreMetadata;

    return {
      rawOutput: cleaned,
      metadata: parsed,
      modelUsed: this.model,
    };
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
    });
    return completion.choices[0]?.message?.content || "";
  }
}
