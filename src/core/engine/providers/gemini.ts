import { GoogleGenAI } from "@google/genai";
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

export class GeminiTranslationProvider extends BaseTranslationProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    super();
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required to use the Gemini provider. Alternatively, pass --provider offline to test without API keys."
      );
    }
    this.client = new GoogleGenAI({ apiKey: key });
    this.model = model || "gemini-2.5-flash";
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const systemInstruction = buildSystemPrompt();
    const userPrompt = buildUserPrompt(request);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: request.attempt > 1 ? 0.1 : 0.2,
      },
    });

    const rawText = response.text || "";
    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned) as LocalizedStoreMetadata;

    return {
      rawOutput: cleaned,
      metadata: parsed,
      modelUsed: this.model,
    };
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const contents: any[] = [];
    if (systemPrompt) {
      contents.push({ role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] });
    } else {
      contents.push({ role: "user", parts: [{ text: prompt }] });
    }
    const response = await this.client.models.generateContent({
      model: this.model,
      contents,
    });
    return response.text || "";
  }
}
