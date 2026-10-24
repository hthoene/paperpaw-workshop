// The person's own key, used from their browser: requests go straight to
// Anthropic and the key never leaves the browser for anywhere else.

import Anthropic from "@anthropic-ai/sdk";
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";

import { CONTEXT_MANAGEMENT_BETA, type Provider, type Request, type Stream } from "./provider";
import { toolInputChecked } from "./tool-input";

export class AnthropicDirect implements Provider {
  readonly eagerTools = true;
  private client: Anthropic;

  /** `baseURL`: PaperPaw's proxy for a PaperPaw key (it speaks Anthropic's
   *  API and passes on what its key allows), Anthropic's own if not given. */
  constructor(
    apiKey: string,
    baseURL?: string,
    readonly label = "provider.key",
  ) {
    // The key is the person's own, typed into this page: the SDK's
    // browser guard is for keys shipped inside a page, which this is not.
    this.client = new Anthropic({ apiKey, baseURL, dangerouslyAllowBrowser: true, maxRetries: 2 });
  }

  async send(request: Request, stream: Stream, signal?: AbortSignal): Promise<Anthropic.Message> {
    const headers = request.context_management ? { "anthropic-beta": CONTEXT_MANAGEMENT_BETA } : undefined;
    // The answer's events, each tool call's input checked before the SDK
    // puts the message together (see tool-input.ts).
    const events = await this.client.messages.create({ ...request, stream: true }, { signal, headers });
    const s = MessageStream.fromReadableStream(events.toReadableStream().pipeThrough(toolInputChecked()));
    if (stream.onText) s.on("text", stream.onText);
    if (stream.onThinking) s.on("thinking", stream.onThinking);
    return s.finalMessage();
  }
}
