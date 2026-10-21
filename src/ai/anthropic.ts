// The person's own key, used from their browser: requests go straight to
// Anthropic and the key never leaves the browser for anywhere else.

import Anthropic from "@anthropic-ai/sdk";

import type { Provider, Request, Stream } from "./provider";

export class AnthropicDirect implements Provider {
  readonly label = "provider.key";
  readonly eagerTools = true;
  private client: Anthropic;

  constructor(apiKey: string) {
    // The key is the person's own, typed into this page: the SDK's
    // browser guard is for keys shipped inside a page, which this is not.
    this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
  }

  async send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message> {
    const s = this.client.messages.stream(request, { signal });
    if (stream.onText) s.on("text", stream.onText);
    return s.finalMessage();
  }
}
