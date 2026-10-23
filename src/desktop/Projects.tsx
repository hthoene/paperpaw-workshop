// The project's name in the bar, and under it one's plugins: a new one
// first (with code or without), then the last changed few, and "All
// projects…" for the rest: a list of its own with a search, an order,
// and what one does with a project (open, rename, put away in the
// archive, move to the bin). Calm with three plugins or three hundred.

import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import type { Listed } from "./folders";
import type { Workspace } from "./workspace";

/** How many plugins the menu shows before "All projects…". */
export const IN_MENU = 8;

function ago(iso: string): string {
  if (!iso) return "";
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  // In the window's language, as all its words are.
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: Date.now() - Date.parse(iso) > 300 * 86_400_000 ? "numeric" : undefined });
}

const about = (p: Listed) => `${p.kind === "code" ? "with code" : "without code"}, ${ago(p.updated)}`;

export function Projects({ workspace }: { workspace: Workspace }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void workspace.refresh();
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open, workspace]);

  const current = workspace.project?.key;
  const recent = workspace.listed.slice(0, IN_MENU);
  return (
    <div class="projects" ref={box}>
      <button type="button" class="project" aria-expanded={open} onClick={() => setOpen(!open)}>
        {workspace.name}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
      </button>
      {open && (
        <div class="project-list" role="menu">
          <div class="news">
            <button type="button" role="menuitem" class="new" onClick={() => { workspace.fresh(); setOpen(false); }}>New plugin</button>
            <button type="button" role="menuitem" class="new" onClick={() => { workspace.fresh("code"); setOpen(false); }}>New plugin with code</button>
          </div>
          <div class="recent">
            {recent.map((p) => (
              <button type="button" role="menuitem" key={p.folder} class={p.folder === current ? "on" : ""} onClick={() => { void workspace.open(p.folder); setOpen(false); }}>
                <span>{p.name}</span>
                <small>{about(p)}</small>
              </button>
            ))}
          </div>
          <button type="button" role="menuitem" class="all" onClick={() => { setOpen(false); setAll(true); }}>
            All projects{workspace.listed.length > IN_MENU ? ` (${workspace.listed.length})` : ""}…
          </button>
        </div>
      )}
      {all && <AllProjects workspace={workspace} onClose={() => setAll(false)} />}
    </div>
  );
}

type Order = "recent" | "name";

/** Every plugin, to find one and to tidy them up. */
function AllProjects({ workspace, onClose }: { workspace: Workspace; onClose(): void }) {
  const [words, setWords] = useState("");
  const [order, setOrder] = useState<Order>("recent");
  const [shelf, setShelf] = useState<"projects" | "archive">("projects");
  const [archived, setArchived] = useState<Listed[]>([]);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [binning, setBinning] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const field = useRef<HTMLInputElement>(null);

  const reload = async () => {
    await workspace.refresh();
    setArchived(await workspace.folders.archived());
  };
  useEffect(() => {
    void reload();
    field.current?.focus();
  }, []);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape" && !renaming && !binning) onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [renaming, binning]);

  const list = shelf === "projects" ? workspace.listed : archived;
  const shown = useMemo(() => {
    const w = words.trim().toLowerCase();
    const found = list.filter((p) => !w || p.name.toLowerCase().includes(w) || p.folder.toLowerCase().includes(w));
    return order === "name" ? [...found].sort((a, b) => a.name.localeCompare(b.name)) : found;
  }, [list, words, order]);

  const act = async (what: () => Promise<void>, done: string) => {
    try {
      await what();
      setSaid(done);
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    }
    setRenaming(null);
    setBinning(null);
    await reload();
  };

  return (
    <div class="sheet-shade" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section class="all-projects" role="dialog" aria-label="All projects">
        <div class="drawer-head">
          <h2>Your plugins</h2>
          <button type="button" class="close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div class="all-tools">
          <input ref={field} type="search" aria-label="Find a plugin" placeholder="Find a plugin" value={words} onInput={(e) => setWords(e.currentTarget.value)} />
          <div class="which" role="radiogroup" aria-label="Order">
            {(["recent", "name"] as Order[]).map((o) => (
              <button type="button" role="radio" aria-checked={order === o} class={order === o ? "on" : ""} onClick={() => setOrder(o)}>
                {o === "recent" ? "Recent" : "Name"}
              </button>
            ))}
          </div>
        </div>
        <div class="shelves" role="tablist">
          <button type="button" role="tab" aria-selected={shelf === "projects"} class={shelf === "projects" ? "on" : ""} onClick={() => setShelf("projects")}>
            Plugins ({workspace.listed.length})
          </button>
          <button type="button" role="tab" aria-selected={shelf === "archive"} class={shelf === "archive" ? "on" : ""} onClick={() => setShelf("archive")}>
            Archive ({archived.length})
          </button>
        </div>
        {said && <p class="said" role="status">{said}</p>}
        <ul class="all-list">
          {shown.map((p) => (
            <li key={p.folder} class={p.folder === workspace.project?.key ? "on" : ""}>
              {renaming === p.folder ? (
                <form class="rename" onSubmit={(e) => { e.preventDefault(); const name = String(new FormData(e.currentTarget).get("name") ?? ""); void act(() => workspace.rename(p.folder, name), `Renamed to "${name}".`); }}>
                  <input name="name" aria-label={`New name for ${p.name}`} defaultValue={p.folder} autoFocus onKeyDown={(e) => { if (e.key === "Escape") setRenaming(null); }} />
                  <button type="submit" class="link">Save</button>
                  <button type="button" class="link quiet" onClick={() => setRenaming(null)}>Cancel</button>
                </form>
              ) : binning === p.folder ? (
                <div class="confirm">
                  <span>Move "{p.name}" to the bin? You can get it back from there.</span>
                  <button type="button" class="link" onClick={() => void act(() => workspace.trash(p.folder, shelf === "archive"), `"${p.name}" is in the bin.`)}>Move to bin</button>
                  <button type="button" class="link quiet" onClick={() => setBinning(null)}>Keep it</button>
                </div>
              ) : (
                <>
                  {shelf === "projects" ? (
                    <button type="button" class="open" onClick={() => { void workspace.open(p.folder); onClose(); }}>
                      <span>{p.name}</span>
                      <small>{about(p)}</small>
                    </button>
                  ) : (
                    <div class="open"><span>{p.name}</span><small>{about(p)}</small></div>
                  )}
                  <span class="row-do">
                    {shelf === "projects" ? (
                      <>
                        <button type="button" class="link quiet" onClick={() => setRenaming(p.folder)}>Rename</button>
                        <button type="button" class="link quiet" onClick={() => void act(() => workspace.archive(p.folder), `"${p.name}" is in the archive. Its folder stays on this computer.`)}>Archive</button>
                      </>
                    ) : (
                      <button type="button" class="link quiet" onClick={() => void act(() => workspace.restore(p.folder), `"${p.name}" is back.`)}>Bring back</button>
                    )}
                    <button type="button" class="link quiet" onClick={() => setBinning(p.folder)}>Bin</button>
                  </span>
                </>
              )}
            </li>
          ))}
          {!shown.length && <li class="none">{words ? "No plugin is called so." : shelf === "archive" ? "Nothing in the archive." : "No plugins yet."}</li>}
        </ul>
      </section>
    </div>
  );
}
