// The workshop app: at the first start one field for the key, then one
// window, the conversation on the left, the reader on the right, a thin
// bar above with the project, its files, sending it to a reader and a menu.

import { useEffect, useState } from "preact/hooks";

import type { Backend } from "./backend";
import { Reader } from "./Reader";

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
  return <Window backend={backend} onForgetKey={async () => { await backend.keyClear(); setKey(null); }} />;
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

function Window({ backend, onForgetKey }: { backend: Backend; onForgetKey(): void }) {
  const [menu, setMenu] = useState(false);
  const [draft, setDraft] = useState("");
  return (
    <div class="window">
      <header class="bar">
        <button type="button" class="project">New plugin</button>
        <button type="button" class="link">Files</button>
        <button type="button" class="send">Send to reader</button>
        <div class="menu">
          <button type="button" class="dots" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
          </button>
          {menu && (
            <div class="menu-list" role="menu">
              <button type="button" role="menuitem">Export zip</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); onForgetKey(); }}>Remove key</button>
            </div>
          )}
        </div>
      </header>
      <div class="main">
        <section class="talk" aria-label="Conversation">
          <div class="log">
            <p class="empty">What should your reader do? A look, a home screen, a tool: say it in your own words.</p>
          </div>
          <form class="line ask" onSubmit={(e) => { e.preventDefault(); setDraft(""); }}>
            <input
              aria-label="Your message"
              placeholder="What should your reader do?"
              value={draft}
              onInput={(e) => setDraft(e.currentTarget.value)}
            />
            <button type="submit" class="go" disabled={!draft.trim()}>Send</button>
          </form>
        </section>
        <Reader backend={backend} />
      </div>
    </div>
  );
}
