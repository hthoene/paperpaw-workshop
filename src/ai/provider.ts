// Who answers the AI's requests. The loop knows only this interface:
// `AnthropicDirect` (the person's own key, straight from the browser),
// later the site's quota proxy, and in tests a replay of a recorded
// conversation.

import type Anthropic from "@anthropic-ai/sdk";

/** A request, and the server-side clearing of old tool results (a beta
 *  the SDK types only in its beta namespace; providers send its header). */
export type Request = Anthropic.MessageCreateParamsNonStreaming & { context_management?: ContextManagement };

export interface ContextManagement {
  edits: {
    type: "clear_tool_uses_20250919";
    trigger: { type: "input_tokens"; value: number };
    keep: { type: "tool_uses"; value: number };
    clear_at_least: { type: "input_tokens"; value: number };
    /** Tools whose results are never cleared. */
    exclude_tools?: string[];
  }[];
}

/** The beta header `context_management` needs. */
export const CONTEXT_MANAGEMENT_BETA = "context-management-2025-06-27";

export interface Stream {
  /** Text as it is written, for the conversation to grow while it comes. */
  onText?: (delta: string) => void;
  /** The summary of the model's thinking as it is written: progress to show. */
  onThinking?: (delta: string) => void;
}

export interface Provider {
  /** Who pays, as a catalog key: "with your key". */
  readonly label: string;
  /** Whether tools may stream their input as it is written. */
  readonly eagerTools: boolean;
  send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message>;
}
