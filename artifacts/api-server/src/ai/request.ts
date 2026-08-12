import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CANONICAL_SYSTEM_PROMPT,
  CANONICAL_SYSTEM_PROMPT_VERSION,
} from "./systemPrompt";
import {
  buildCanonicalMessages,
  type RequestMessage,
} from "./messages";

export { buildCanonicalMessages };
export type { RequestMessage };

type CompletionRequest = {
  model: string;
  messages: readonly RequestMessage[];
  path: string;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stream_options?: { include_usage?: boolean };
  signal?: AbortSignal;
};

/**
 * The only text-model request entry point used by the API server.
 * `messages` is intentionally not accepted from the browser directly; routes
 * construct it from validated request data and server-side conversation state.
 */
export async function createCanonicalChatCompletion(
  request: CompletionRequest,
): Promise<any> {
  const { path, signal, messages, ...providerRequest } = request;
  const finalMessages = buildCanonicalMessages(messages);

  if (process.env.NODE_ENV !== "production") {
    console.info("[ai] request", {
      path,
      provider: "openai-compatible",
      model: request.model,
      promptPolicy: "canonical",
      promptVersion: CANONICAL_SYSTEM_PROMPT_VERSION,
      canonicalAttached: finalMessages[0]?.content === CANONICAL_SYSTEM_PROMPT,
    });
  }

  const createCompletion = openai.chat.completions.create as unknown as (
    body: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ) => Promise<any>;

  return createCompletion(
    { ...providerRequest, messages: finalMessages } as Record<string, unknown>,
    signal ? { signal } : undefined,
  );
}