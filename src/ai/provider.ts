// Who answers the AI's requests. The loop knows only this interface:
// `AnthropicDirect` (the person's own key, straight from the browser),
// later the site's quota proxy, and in tests a replay of a recorded
// conversation.

import type Anthropic from "@anthropic-ai/sdk";

export type Request = Anthropic.MessageCreateParamsNonStreaming;

export interface Stream {
  /** Text as it is written, for the conversation to grow while it comes. */
  onText?: (delta: string) => void;
}

export interface Provider {
  /** Shown to the person: "Claude Haiku 5.5 with your key". */
  readonly label: string;
  /** Whether tools may stream their input as it is written. */
  readonly eagerTools: boolean;
  send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message>;
}
