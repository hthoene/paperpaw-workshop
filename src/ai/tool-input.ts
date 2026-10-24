// A tool's input as the model streams it. With eager input streaming the
// model's JSON is not checked before it is sent, and now and then it is not
// valid (a property name without its value, say). The SDK parses the input
// when the block ends and throws on such JSON, which lost the whole answer
// ("Something went wrong: Expected ':' after property name in JSON").
// Here each call's input is put together first and checked: valid, it goes
// on as one piece; not valid, it goes on as `{ "INVALID_JSON": "<what came>" }`
// (Anthropic's own advice for this case), and the loop answers that call
// with an error the model can act on, without running it.

/** The one property of a tool input that was not valid JSON. */
export const INVALID_JSON = "INVALID_JSON";

/** Whether `input` is a call's input that was not valid JSON. */
export function invalidJson(input: unknown): input is { [INVALID_JSON]: string } {
  return typeof input === "object" && input !== null && Object.keys(input).length === 1 && typeof (input as Record<string, unknown>)[INVALID_JSON] === "string";
}

interface Event {
  type?: string;
  index?: number;
  delta?: { type?: string; partial_json?: string };
}

/** Anthropic's stream as JSON lines (as the SDK's MessageStream reads
 *  them), with each tool call's input checked when its block ends. */
export function toolInputChecked(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  // The input of each block still open, by its index.
  const inputs = new Map<number, string>();
  const send = (controller: TransformStreamDefaultController<Uint8Array>, event: unknown) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
  const line = (controller: TransformStreamDefaultController<Uint8Array>, text: string) => {
    if (!text.trim()) return;
    const event = JSON.parse(text) as Event;
    const index = event.index ?? -1;
    if (event.type === "content_block_delta" && event.delta?.type === "input_json_delta") {
      inputs.set(index, (inputs.get(index) ?? "") + (event.delta.partial_json ?? ""));
      return;
    }
    if (event.type === "content_block_stop" && inputs.has(index)) {
      const json = inputs.get(index)!;
      inputs.delete(index);
      send(controller, { type: "content_block_delta", index, delta: { type: "input_json_delta", partial_json: checked(json) } });
    }
    send(controller, event);
  };
  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop()!;
      for (const text of lines) line(controller, text);
    },
    flush(controller) {
      buffer += decoder.decode();
      line(controller, buffer);
      buffer = "";
      // A stream that ends inside a block is not a whole answer: the SDK
      // says so itself.
      inputs.clear();
    },
  });
}

/** `json` if it is a valid object, else what says it was not. */
function checked(json: string): string {
  if (!json.trim()) return json;
  try {
    const value: unknown = JSON.parse(json);
    if (typeof value === "object" && value !== null && !Array.isArray(value)) return json;
  } catch {
    // Not valid: said below.
  }
  return JSON.stringify({ [INVALID_JSON]: json });
}
