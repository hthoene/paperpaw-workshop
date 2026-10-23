// The project's name in the bar, and under it the list of one's plugins:
// a new one first, then the others, the last changed first.

import { useEffect, useRef, useState } from "preact/hooks";

import type { Workspace } from "./workspace";

function ago(iso: string): string {
  if (!iso) return "";
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function Projects({ workspace }: { workspace: Workspace }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void workspace.refresh();
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open, workspace]);

  const current = workspace.project?.key;
  return (
    <div class="projects" ref={box}>
      <button type="button" class="project" aria-expanded={open} onClick={() => setOpen(!open)}>
        {workspace.name}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" /></svg>
      </button>
      {open && (
        <div class="project-list" role="menu">
          <button type="button" role="menuitem" class="new" onClick={() => { workspace.fresh(); setOpen(false); }}>
            New plugin
          </button>
          {workspace.listed.map((p) => (
            <button
              type="button"
              role="menuitem"
              class={p.folder === current ? "on" : ""}
              onClick={() => { void workspace.open(p.folder); setOpen(false); }}
            >
              <span>{p.name}</span>
              <small>{p.kind === "code" ? "with code" : "data"}, {ago(p.updated)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
