// The conversation: the person's words, the AI's, a quiet line for each
// thing it did (app/conversation.ts, from the messages alone), what it is
// writing now, what the last turn cost, and under an answer that changed
// the plugin "Back to this state" (GoBack.tsx). Enter sends; Shift+Enter
// is a new line.

import { Fragment } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { lines, type Line } from "../app/conversation";
import type { Project } from "../project/project";
import { about, details, unusual, type Turn } from "./costs";
import { Markdown } from "./Markdown";
import type { Desk } from "./desk";
import { afterAnswers } from "./history";
import { BackHere, PreviewBar } from "./GoBack";

export function Conversation({ desk }: { desk: Desk }) {
  const [draft, setDraft] = useState("");
  const log = useRef<HTMLDivElement>(null);
  // Whether the person is at the end (then what comes keeps in view), and
  // whether something came while they read further up.
  const stick = useRef(true);
  const [unseen, setUnseen] = useState(false);
  const workshop = desk.workshop;
  const project = desk.workspace.project;
  const said = lines(project?.messages ?? []);
  const busy = !!workshop?.busy;
  const states = afterAnswers(desk.history, project?.earlier?.length ?? 0);

  const down = (smooth: boolean) => {
    const l = log.current;
    if (!l) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    l.scrollTo({ top: l.scrollHeight, behavior: smooth && !still ? "smooth" : "auto" });
  };
  const scrolled = () => {
    const l = log.current;
    if (!l) return;
    stick.current = l.scrollHeight - l.scrollTop - l.clientHeight < 24;
    if (stick.current) setUnseen(false);
  };
  // What is shown changed: kept in view at the end, else said with "New".
  const shown = `${project?.key}|${said.length}|${workshop?.live.length ?? 0}|${workshop?.thinking.length ?? 0}|${busy}|${desk.building}|${desk.lastTurn?.dollars ?? 0}|${workshop?.error ?? ""}|${desk.history.current}|${desk.previewing?.ready ?? ""}|${workshop?.paused ?? ""}|${desk.asking?.host ?? ""}`;
  useEffect(() => {
    if (stick.current) down(false);
    else setUnseen(true);
  }, [shown]);

  const send = () => {
    const text = draft.trim();
    if (!text || busy || desk.previewing) return;
    setDraft("");
    stick.current = true;
    setUnseen(false);
    requestAnimationFrame(() => down(true));
    // Words that never reached the model come back to be sent again.
    void desk.send(text).then((heard) => {
      if (!heard) setDraft((now) => now || text);
    });
  };

  return (
    <section class="talk" aria-label="Conversation">
      <div class="log" aria-live="polite" ref={log} onScroll={scrolled}>
        {!said.length && !busy && <p class="empty">What should your reader do? A look, a home screen, a tool: say it in your own words.</p>}
        {(project?.earlier ?? []).map((earlier, n) => (
          <details class="earlier" key={`earlier-${n}`}>
            <summary>The conversation before</summary>
            {lines(earlier).map((line, i) => <Said key={i} line={line} />)}
          </details>
        ))}
        {said.length > 0 && <BackHere desk={desk} snapshot={states.get(0)} label="Back to how it began" />}
        {segments(project).map((segment, n) => (
          <Fragment key={n}>
            {segment.lines.map((line, i) => <Said key={i} line={line} />)}
            {segment.turn && <Cost turn={segment.turn} before={segment.before} />}
            {segment.turn && <BackHere desk={desk} snapshot={states.get(segment.turn.end)} />}
          </Fragment>
        ))}
        {workshop?.live && <div class="ai">{workshop.live}</div>}
        {busy && !workshop?.live && <div class="step busy">{desk.building || (workshop?.thinking ? lastLine(workshop.thinking) : "Working…")}</div>}
        {workshop?.error && <p class="problem" role="alert">{workshop.error}</p>}
        {workshop?.long && !busy && (
          <button type="button" class="go fresh" onClick={() => workshop.freshConversation()}>Go on in a fresh conversation</button>
        )}
        {desk.buildTools && <BuildTools desk={desk} />}
        {workshop && workshop.paused !== null && !busy && <Paused desk={desk} dollars={workshop.paused} />}
        {desk.asking && <Asking desk={desk} host={desk.asking.host} />}
        <PreviewBar desk={desk} />
      </div>
      {unseen && (
        <button type="button" class="to-new" onClick={() => { stick.current = true; setUnseen(false); down(true); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v13M6 12l6 6 6-6" /></svg>
          New
        </button>
      )}
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
          <button type="submit" class="go" disabled={!draft.trim() || !!desk.previewing}>Send</button>
        )}
      </form>
    </section>
  );
}

function Said({ line }: { line: Line }) {
  if (line.kind === "step") return <div class={`step${line.failed ? " failed" : ""}`}>{line.text}</div>;
  if (line.kind === "sample") {
    return (
      <details class={`step sample${line.failed ? " failed" : ""}`}>
        <summary>{line.text}</summary>
        <pre>{line.detail}</pre>
      </details>
    );
  }
  if (line.kind === "added") return <div class="step">Added {line.text}</div>;
  if (line.kind === "ai") return <div class="ai md"><Markdown text={line.text} /></div>;
  return <div class={line.kind}>{line.text}</div>;
}

/** The AI would fetch an example from a site the person named: asked
 *  once a site, plainly, what goes where. */
function Asking({ desk, host }: { desk: Desk; host: string }) {
  const answer = (choice: "once" | "always" | "no") => desk.asking?.answer(choice);
  return (
    <div class="offer" role="alertdialog" aria-label={`Fetch ${host}?`}>
      <p>
        Fetch an example from {host}? The AI wants to see what the address you gave answers, to read it right. Only that
        request goes out, from this computer; what comes back shows here.
      </p>
      <div class="offer-do">
        <button type="button" class="go" onClick={() => answer("once")}>Allow once</button>
        <button type="button" class="link" onClick={() => answer("always")}>Always for this project</button>
        <button type="button" class="link quiet" onClick={() => answer("no")}>No</button>
      </div>
    </div>
  );
}

/** A turn that cost more than it may without changing the plugin:
 *  said calmly, with what it cost, and the person decides. */
function Paused({ desk, dollars }: { desk: Desk; dollars: number }) {
  return (
    <div class="offer">
      <p>
        This has cost {about(dollars)} so far and has not changed the plugin yet: the AI is still reading PaperPaw's
        documentation and the files. Let it go on, or tell it what to do.
      </p>
      <button type="button" class="go" onClick={() => void desk.send("Go on.")}>Go on</button>
    </div>
  );
}

/** The newest line of the thinking's summary, short. */
function lastLine(text: string): string {
  const last = text.trim().split("\n").filter(Boolean).pop() ?? "";
  return last.length > 140 ? `${last.slice(0, 140)}…` : last;
}

/** Microsoft's C++ build tools, offered where a plugin with code needs
 *  them: said plainly, installed with one click, never by itself. */
function BuildTools({ desk }: { desk: Desk }) {
  if (desk.buildTools === "installed") {
    return <div class="offer"><p>The build tools are installed. Ask the AI to build the plugin again.</p></div>;
  }
  return (
    <div class="offer">
      <p>
        Plugins with code need Microsoft's C++ build tools on Windows. They take about 3 GB. Windows asks you to
        allow the installer, and Microsoft's licence applies.
      </p>
      {desk.buildTools === "failed" && <p class="problem">{desk.buildToolsSaid}</p>}
      <button type="button" class="go" disabled={desk.buildTools === "installing"} onClick={() => void desk.installBuildTools()}>
        {desk.buildTools === "installing" ? "Installing…" : "Install the build tools"}
      </button>
    </div>
  );
}

/** The conversation by the person's turns, each with what it cost; what
 *  follows the last one counted (a turn running) without. */
function segments(project: Project | null): { lines: Line[]; turn?: Turn; before: Turn[] }[] {
  const messages = project?.messages ?? [];
  const conversation = project?.earlier?.length ?? 0;
  const turns = (project?.turns ?? []).filter((t) => t.conversation === conversation && t.end <= messages.length);
  const out: { lines: Line[]; turn?: Turn; before: Turn[] }[] = [];
  let start = 0;
  for (const [i, turn] of turns.entries()) {
    if (turn.end <= start) continue;
    out.push({ lines: lines(messages.slice(start, turn.end)), turn, before: turns.slice(0, i) });
    start = turn.end;
  }
  out.push({ lines: lines(messages.slice(start)), before: turns });
  return out;
}

/** What a turn cost, roughly and quietly; the details on hover. */
function Cost({ turn, before }: { turn: Turn; before: Turn[] }) {
  return (
    <p class="cost" title={details(turn)}>
      {about(turn.dollars)}
      {unusual(turn, before) && <span> · more than usual, as a long answer or a plugin with code can be</span>}
    </p>
  );
}
