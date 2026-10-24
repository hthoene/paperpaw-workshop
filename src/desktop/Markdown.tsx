import type { ComponentChildren } from "preact";

/** A block of the AI's text: a paragraph, a list, a heading or code. */
export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "code"; text: string };

/** The AI's text in blocks, as the few kinds of Markdown it writes have
 *  them: paragraphs apart by an empty line, lists with "- ", "* " or
 *  "1. ", headings with "#", code between ``` lines. Anything else stays
 *  text as it is. */
export function blocks(text: string): Block[] {
  const out: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  const close = () => {
    if (paragraph.length) out.push({ kind: "p", text: paragraph.join("\n") });
    paragraph = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.trimStart().startsWith("```")) {
      close();
      const code: string[] = [];
      for (i++; i < lines.length && !(lines[i] ?? "").trimStart().startsWith("```"); i++) code.push(lines[i] ?? "");
      out.push({ kind: "code", text: code.join("\n") });
      continue;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const item = /^\s*(?:([-*•])|(\d+)[.)])\s+(.*)$/.exec(line);
    if (heading) {
      close();
      out.push({ kind: "h", text: heading[1] ?? "" });
    } else if (item) {
      close();
      const kind = item[1] ? "ul" : "ol";
      const last = out[out.length - 1];
      if (last && last.kind === kind) last.items.push(item[3] ?? "");
      else out.push({ kind, items: [item[3] ?? ""] });
    } else if (!line.trim()) {
      close();
    } else {
      // A line under a list item without a marker goes on with that item.
      const last = out[out.length - 1];
      if (!paragraph.length && last && (last.kind === "ul" || last.kind === "ol") && /^\s+\S/.test(line)) {
        last.items[last.items.length - 1] = `${last.items[last.items.length - 1] ?? ""} ${line.trim()}`;
      } else {
        paragraph.push(line);
      }
    }
  }
  close();
  return out;
}

/** A line's **bold**, *italic* and `code`, as elements; the rest as text. */
export function inline(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*)/g;
  let at = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > at) out.push(text.slice(at, start));
    const token = match[0];
    if (token.startsWith("`")) out.push(<code>{token.slice(1, -1)}</code>);
    else if (token.startsWith("**") || token.startsWith("__")) out.push(<strong>{token.slice(2, -2)}</strong>);
    else out.push(<em>{token.slice(1, -1)}</em>);
    at = start + token.length;
  }
  if (at < text.length) out.push(text.slice(at));
  return out;
}

/** The AI's text with its Markdown shown as it means it, never as HTML. */
export function Markdown({ text }: { text: string }) {
  return (
    <>
      {blocks(text).map((block) => {
        switch (block.kind) {
          case "h":
            return <p class="md-h">{inline(block.text)}</p>;
          case "ul":
            return <ul>{block.items.map((item) => <li>{inline(item)}</li>)}</ul>;
          case "ol":
            return <ol>{block.items.map((item) => <li>{inline(item)}</li>)}</ol>;
          case "code":
            return <pre class="md-code">{block.text}</pre>;
          default:
            return <p>{inline(block.text)}</p>;
        }
      })}
    </>
  );
}
