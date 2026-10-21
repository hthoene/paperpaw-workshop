// A recorded conversation played back: the model's answers come from a
// file, the tools run for real. Tests use it to check the loop and the
// tools without a key and without cost, and the start page offers one as
// an example to watch (src/ai/examples/*.json).

import type Anthropic from "@anthropic-ai/sdk";

import type { Provider, Request, Stream } from "./provider";

/** A recording: the model's answers in order, each its content blocks
 *  and stop reason. */
export interface Recording {
  title: string;
  /** What the person wrote, turn by turn. */
  user: string[];
  answers: Answer[];
  /** The answer to the share page's request for a store entry (the one
   *  request that offers `set_entry` alone), if the recording goes that
   *  far. */
  entry?: Answer;
}

export interface Answer {
  content: Anthropic.ContentBlock[];
  stop_reason: Anthropic.Message["stop_reason"];
}

export class ReplayProvider implements Provider {
  readonly label = "provider.example";
  readonly eagerTools = false;
  /** Every request the loop sent, for tests to look at. */
  readonly requests: Request[] = [];
  private next = 0;

  /** `pause`: milliseconds before each answer, for an example to watch. */
  constructor(
    private recording: Recording,
    private pause = 0,
  ) {}

  async send(request: Request, stream: Stream): Promise<Anthropic.Message> {
    this.requests.push(structuredClone(request));
    if (this.pause) await new Promise((r) => setTimeout(r, this.pause));
    const only = request.tools?.length === 1 ? request.tools[0] : undefined;
    const entry = !!only && "name" in only && only.name === "set_entry";
    const answer = entry ? this.recording.entry : this.recording.answers[this.next++];
    if (!answer) throw new Error(`the recording "${this.recording.title}" has no ${entry ? "entry" : `answer ${this.next}`}`);
    for (const block of answer.content) {
      if (block.type === "text") stream.onText?.(block.text);
    }
    return {
      id: `msg_replay_${this.next}`,
      type: "message",
      role: "assistant",
      model: request.model,
      content: answer.content,
      stop_reason: answer.stop_reason,
      stop_sequence: null,
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: this.next === 1 ? 10_000 : 0,
        cache_read_input_tokens: this.next === 1 ? 0 : 10_000,
      },
    } as unknown as Anthropic.Message;
  }

  /** Whether every recorded answer was used. */
  get done(): boolean {
    return this.next === this.recording.answers.length;
  }
}
