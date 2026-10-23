// The conversation: the person's words, the AI's, a quiet line for each
// thing it did (app/conversation.ts, from the messages alone), what it is
// writing now, and what the last turn cost. Enter sends; Shift+Enter is a
// new line.

import { useEffect, useRef, useState } from "preact/hooks";

import { lines, type Line } from "../app/conversation";
import { costText, type Desk } from "./desk";

export function Conversation({ desk }: { desk: Desk }) {
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const workshop = desk.workshop;
  const project = desk.workspace.project;
  const said = lines(project?.messages ?? []);
  const busy = !!workshop?.busy;

  // The newest at the bottom, in view.
  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [said.length, workshop?.live, busy]);

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    // Words that never reached the model come back to be sent again.
    void desk.send(text).then((heard) => {
      if (!heard) setDraft((now) => now || text);
    });
  };

  return (
    <section class="talk" aria-label="Conversation">
      <div class="log" aria-live="polite">
        {!said.length && !busy && <p class="empty">What should your reader do? A look, a home screen, a tool: say it in your own words.</p>}
        {(project?.earlier ?? []).map((earlier, n) => (
          <details class="earlier" key={`earlier-${n}`}>
            <summary>The conversation before</summary>
            {lines(earlier).map((line, i) => <Said key={i} line={line} />)}
          </details>
        ))}
        {said.map((line, i) => <Said key={i} line={line} />)}
        {workshop?.live && <div class="ai">{workshop.live}</div>}
        {busy && !workshop?.live && <div class="step busy">{desk.building || (workshop?.thinking ? lastLine(workshop.thinking) : "Working…")}</div>}
        {workshop?.error && <p class="problem" role="alert">{workshop.error}</p>}
        {workshop?.long && !busy && (
          <button type="button" class="go fresh" onClick={() => workshop.freshConversation()}>Go on in a fresh conversation</button>
        )}
        {desk.lastTurn && !busy && (
          <p class="cost">
            This turn: {costText(desk.lastTurn.dollars)} with {desk.lastTurn.model}. So far: {costText(project?.usage.dollars ?? 0)}.
          </p>
        )}
        <div ref={bottom} />
      </div>
      <form class="line ask" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea
          aria-label="Your message"
          placeholder="What should your reader do?"
          rows={1}
          value={draft}
          onInput={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        {busy ? (
          <button type="button" class="go" onClick={() => desk.stop()}>Stop</button>
        ) : (
          <button type="submit" class="go" disabled={!draft.trim()}>Send</button>
        )}
      </form>
    </section>
  );
}

function Said({ line }: { line: Line }) {
  if (line.kind === "step") return <div class={`step${line.failed ? " failed" : ""}`}>{line.text}</div>;
  if (line.kind === "added") return <div class="step">Added {line.text}</div>;
  return <div class={line.kind}>{line.text}</div>;
}

/** The newest line of the thinking's summary, short. */
function lastLine(text: string): string {
  const last = text.trim().split("\n").filter(Boolean).pop() ?? "";
  return last.length > 140 ? `${last.slice(0, 140)}…` : last;
}
