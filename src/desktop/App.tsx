// The workshop app: at the first start one field for the key, then one
// window, the conversation on the left, the reader on the right, a thin
// bar above with the project, its files, sending it to a reader and a menu.

import { useEffect, useMemo, useState } from "preact/hooks";

import { AnthropicDirect } from "../ai/anthropic";
import { ReplayProvider, type Recording } from "../ai/replay";
import { Handbook } from "../handbook/handbook";
import type { Backend } from "./backend";
import { Checker } from "./checks";
import { about } from "./costs";
import { Findings } from "./Findings";
import { Conversation } from "./Conversation";
import { Desk } from "./desk";
import { CHOICES, saveChoice, savedChoice, usable, type ModelChoice } from "./models";
import { Drawer } from "./Drawer";
import { Projects } from "./Projects";
import { Reader } from "./Reader";
import { Publish } from "./Publish";
import { exportZip, Send } from "./Send";
import { Workspace } from "./workspace";

interface Props {
  backend: Backend;
}

/** What a key looks like: Anthropic's (`sk-ant-...`) or a PaperPaw key for
 *  the free quota (`ppw-...`). Tried against the service when the
 *  conversation starts; this only catches what is plainly not one. */
export function keyKind(key: string): "claude" | "paperpaw" | null {
  const k = key.trim();
  if (/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(k)) return "claude";
  if (/^ppw-[A-Za-z0-9_-]{16,}$/.test(k)) return "paperpaw";
  return null;
}

export function App({ backend }: Props) {
  const [key, setKey] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    backend.keyGet().then(setKey, () => setKey(null));
  }, [backend]);

  if (key === undefined) return null;
  if (key === null) {
    return <FirstStart onKey={async (k) => { await backend.keySet(k); setKey(k); }} />;
  }
  return <Window backend={backend} apiKey={key} keyKind={keyKind(key)} onForgetKey={async () => { await backend.keyClear(); setKey(null); }} />;
}

function FirstStart({ onKey }: { onKey(key: string): Promise<void> }) {
  const [value, setValue] = useState("");
  const [problem, setProblem] = useState("");
  const submit = async (event: Event) => {
    event.preventDefault();
    if (!keyKind(value)) {
      setProblem("That does not look like a Claude key (sk-ant-…) or a PaperPaw key (ppw-…).");
      return;
    }
    try {
      await onKey(value.trim());
    } catch (e) {
      setProblem(`The key could not be kept: ${String(e)}`);
    }
  };
  return (
    <main class="first">
      <form class="first-card" onSubmit={submit}>
        <img class="cat" src="art/cat-tinker.png" alt="" width="900" height="672" />
        <h1>PaperPaw Workshop</h1>
        <p>Say what your reader should do. The workshop writes the plugin and shows it on a reader right here.</p>
        <div class="line">
          <input
            type="password"
            aria-label="Claude key or PaperPaw key"
            placeholder="Claude key or PaperPaw key"
            autoComplete="off"
            spellcheck={false}
            value={value}
            onInput={(e) => { setValue(e.currentTarget.value); setProblem(""); }}
          />
          <button type="submit" class="go">Start</button>
        </div>
        <p class="note" role="status">{problem || "The key stays in this computer's keychain."}</p>
      </form>
    </main>
  );
}

/** While the workshop is worked on (`npm run dev` only): `?example=<name>`
 *  plays a recorded conversation (src/ai/examples) in place of the model,
 *  its tools run for real; for trying the window and its screenshots
 *  without a key's cost. */
const EXAMPLES = import.meta.glob<Recording>("../ai/examples/*.json", { eager: true, import: "default" });

function example(): ReplayProvider | undefined {
  if (!import.meta.env.DEV) return undefined;
  const name = new URLSearchParams(location.search).get("example");
  const recording = name ? EXAMPLES[`../ai/examples/${name}.json`] : undefined;
  return recording ? new ReplayProvider(recording, 600) : undefined;
}

/** Where a PaperPaw key's requests go: PaperPaw's proxy, which speaks
 *  Anthropic's API and passes on what the key allows. */
export const PROXY = "https://workshop.paperpaw.org";

interface WindowProps {
  backend: Backend;
  apiKey: string;
  keyKind: "claude" | "paperpaw" | null;
  onForgetKey(): void;
}

/** The handbook first (the AI's prompt and docs, with the readers'
 *  profiles), then the window. */
function Window(props: WindowProps) {
  const [handbook, setHandbook] = useState<Handbook | null>(null);
  const [failed, setFailed] = useState("");
  useEffect(() => {
    Handbook.load(new URL("handbook/", document.baseURI).href).then(setHandbook, (e: unknown) => setFailed(String(e)));
  }, []);
  if (failed) return <p class="problem" role="alert">The handbook could not be read: {failed}</p>;
  if (!handbook) return null;
  return <Bench {...props} handbook={handbook} />;
}

function Bench({ backend, apiKey, keyKind, onForgetKey, handbook }: WindowProps & { handbook: Handbook }) {
  const workspace = useMemo(() => new Workspace(backend), [backend]);
  const checker = useMemo(() => new Checker(backend), [backend]);
  const desk = useMemo(() => {
    const provider = example() ?? (keyKind === "paperpaw" ? new AnthropicDirect(apiKey, PROXY, "provider.paperpaw") : new AnthropicDirect(apiKey));
    const made = new Desk(workspace, backend, checker, handbook, provider, keyKind);
    // While the workshop is worked on: its test runs drive the desk.
    if (import.meta.env.DEV) (window as unknown as { workshop?: unknown }).workshop = { desk: made };
    return made;
  }, [workspace, backend, checker, handbook, apiKey, keyKind]);
  const [, redraw] = useState(0);
  const [menu, setMenu] = useState(false);
  const [files, setFiles] = useState(false);
  const [settings, setSettings] = useState(false);
  const [sending, setSending] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState("");
  // One panel at a time over the reader's side.
  const only = (which: "files" | "settings" | "send" | "publish", on: boolean) => {
    setFiles(which === "files" && on);
    setSettings(which === "settings" && on);
    setSending(which === "send" && on);
    setPublishing(which === "publish" && on);
  };

  useEffect(() => {
    const stops = [
      workspace.subscribe(() => redraw((n) => n + 1)),
      checker.subscribe(() => redraw((n) => n + 1)),
      desk.subscribe(() => redraw((n) => n + 1)),
      // After every change PaperPaw's checks (see checks.ts); the reader
      // got the plugin already (the workshop puts it there).
      workspace.afterSave((project) => void checker.plugin(project)),
    ];
    void workspace.refresh();
    void desk.askProxy(PROXY, apiKey);
    // The reader, before any project.
    void desk.choose(desk.profile).catch(() => {});
    return () => stops.forEach((stop) => stop());
  }, [workspace, checker, desk]);

  // Another project: its own results, checked once it is open.
  const open = workspace.project?.key;
  useEffect(() => {
    checker.reset();
    if (workspace.project) void checker.plugin(workspace.project);
  }, [open, checker]);

  return (
    <div class="window">
      <header class="bar">
        <Projects workspace={workspace} />
        <Findings desk={desk} />
        <Spent desk={desk} />
        <button type="button" class="link" aria-expanded={files} onClick={() => only("files", !files)}>Files</button>
        <button type="button" class="send" aria-expanded={sending} onClick={() => only("send", !sending)}>Send to reader</button>
        <div class="menu">
          <button type="button" class="dots" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
          </button>
          {menu && (
            <div class="menu-list" role="menu">
              <button type="button" role="menuitem" onClick={() => { setMenu(false); only("publish", true); }}>Publish…</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); void exportZip(desk, backend).then(setNotice, (e: unknown) => setNotice(String(e))); }}>Export zip</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); only("settings", true); }}>Settings</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); onForgetKey(); }}>Remove key</button>
            </div>
          )}
        </div>
      </header>
      <div class="main">
        <Conversation desk={desk} />
        <Reader backend={backend} shown={desk.shown} onChoose={(id) => void desk.choose(id)} />
        {notice && (
          <p class="notice" role="status">
            {notice}
            <button type="button" class="close" aria-label="Close" onClick={() => setNotice("")}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </p>
        )}
        {sending && <Send desk={desk} backend={backend} onClose={() => setSending(false)} />}
        {publishing && <Publish desk={desk} backend={backend} onClose={() => setPublishing(false)} />}
        {settings && <Settings workspace={workspace} keyKind={keyKind} may={desk.may} onClose={() => setSettings(false)} />}
        {files && <Drawer workspace={workspace} pictures={backend} onClose={() => setFiles(false)} />}
      </div>
    </div>
  );
}

/** The app's settings: which model, for all plugins and for this one. */
function Settings({ workspace, keyKind, may, onClose }: { workspace: Workspace; keyKind: "claude" | "paperpaw" | null; may: ModelChoice[]; onClose(): void }) {
  const [choice, setChoice] = useState<ModelChoice>(usable(savedChoice(), may));
  const project = workspace.project;
  const own = usable(project?.model as ModelChoice | undefined, may);
  const pick = (c: ModelChoice) => { setChoice(c); saveChoice(c); };
  const pickOwn = async (c: ModelChoice) => {
    if (!project) return;
    if (c === "auto") delete project.model;
    else project.model = c;
    await workspace.save();
  };
  const shown = CHOICES.filter((c) => may.includes(c.choice));
  return (
    <aside class="drawer settings" aria-label="Settings">
      <div class="drawer-head">
        <h2>Settings</h2>
        <button type="button" class="close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <fieldset class="choices">
        <legend>Model</legend>
        {shown.map((c) => (
          <label class="choice">
            <input type="radio" name="model" checked={choice === c.choice} onChange={() => pick(c.choice)} />
            <span>
              {c.label}
              <small>{c.hint}</small>
            </span>
          </label>
        ))}
        {keyKind === "paperpaw" && <p class="hint">Your PaperPaw key decides which models you can pick.</p>}
      </fieldset>
      {project && shown.length > 1 && (
        <label class="own">
          <span>For {workspace.name}</span>
          <select class="mode" value={own} onChange={(e) => void pickOwn(e.currentTarget.value as ModelChoice)}>
            <option value="auto">Same as above</option>
            {shown.filter((c) => c.choice !== "auto").map((c) => <option value={c.choice}>{c.label}</option>)}
          </select>
        </label>
      )}
      <p class="hint">What each turn cost shows in the conversation.</p>
    </aside>
  );
}

/** What this plugin and this month came to, quietly; with a PaperPaw key,
 *  what is left on it. */
function Spent({ desk }: { desk: Desk }) {
  if (desk.keyBudget) {
    const left = Math.max(0, desk.keyBudget.budget - desk.keyBudget.spent);
    return (
      <span class="spent" title="What is left on your PaperPaw key, roughly">
        {about(left)} of {about(desk.keyBudget.budget).replace(/^about /, "")} left
      </span>
    );
  }
  const { plugin, month } = desk.spent;
  if (plugin <= 0 && month <= 0) return null;
  const monthly = `${about(month).replace(/^about /, "")} this month`;
  return (
    <span class="spent" title="What Anthropic charges your key, roughly, in US dollars as Anthropic counts them">
      {plugin > 0 ? `${about(plugin)} for this plugin · ${monthly}` : `about ${monthly}`}
    </span>
  );
}
