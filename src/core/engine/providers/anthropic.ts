import Anthropic from "@anthropic-ai/sdk";
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

export class AnthropicTranslationProvider extends BaseTranslationProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    super();
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is required to use the Anthropic provider. Alternatively, pass --provider offline to test without API keys."
      );
    }
    this.client = new Anthropic({ apiKey: key });
    this.model = model || "claude-3-5-haiku-latest";
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const systemInstruction = buildSystemPrompt();
    const userPrompt = buildUserPrompt(request);

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: request.attempt > 1 ? 0.1 : 0.2,
      system: systemInstruction,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = message.content[0];
    const rawText = block && block.type === "text" ? block.text : "";
    const cleaned = cleanJsonOutput(rawText);
    const parsed = JSON.parse(cleaned) as LocalizedStoreMetadata;

    return {
      rawOutput: cleaned,
      metadata: parsed,
      modelUsed: this.model,
    };
  }
}
