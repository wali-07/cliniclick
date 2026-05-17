import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill in the key."
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

/**
 * Per-agent model selection. Drafter gets the most capable model; reviewers
 * use a faster/cheaper model since their job is short, focused review.
 * Edit these in one place to retune cost/quality without touching the worker.
 */
export const MODEL_FOR = {
  drafter: "claude-sonnet-4-6",
  editor: "claude-sonnet-4-6",
  brand: "claude-sonnet-4-6",
  legal: "claude-sonnet-4-6",
  compliance: "claude-sonnet-4-6",
  "seo-qa": "claude-sonnet-4-6",
  // Image pipeline. `visuals` is text-only (reads the article, writes the
  // Recraft brief). `image-brand` and `image-safety` are multimodal - they
  // look at the actual generated illustration.
  visuals: "claude-sonnet-4-6",
  "image-brand": "claude-sonnet-4-6",
  "image-safety": "claude-sonnet-4-6",
} as const;

export type AgentName = keyof typeof MODEL_FOR;

/**
 * Single-turn agent call. Caches prompts at the system-level by default so
 * iterative review loops on the same draft amortise the system-prompt cost.
 */
export async function callAgent(args: {
  agent: AgentName;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const response = await client().messages.create({
    model: MODEL_FOR[args.agent],
    max_tokens: args.maxTokens ?? 8000,
    system: [
      {
        type: "text",
        text: args.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: args.userMessage }],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text.trim();
}

/**
 * Multimodal agent call - the model sees an actual generated image plus a
 * text instruction. Used by the Image-Brand and Image-Safety gates so they
 * judge the real illustration that will ship, not a description of it.
 */
export async function callVisionAgent(args: {
  agent: AgentName;
  systemPrompt: string;
  userMessage: string;
  image: { base64: string; mediaType: "image/webp" | "image/png" | "image/jpeg" };
  maxTokens?: number;
}): Promise<string> {
  const response = await client().messages.create({
    model: MODEL_FOR[args.agent],
    max_tokens: args.maxTokens ?? 1500,
    system: [
      {
        type: "text",
        text: args.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: args.image.mediaType,
              data: args.image.base64,
            },
          },
          { type: "text", text: args.userMessage },
        ],
      },
    ],
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text.trim();
}
