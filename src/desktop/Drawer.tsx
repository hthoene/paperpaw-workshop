// The files drawer: what the author gives the workshop (pictures, fonts,
// word lists, texts), kept with the project in .workshop/uploads/. The AI
// sees their names and sizes only, until it opens one on purpose.

import { useEffect, useState } from "preact/hooks";

import { t } from "../i18n";
import { UploadRefused, type UploadInfo } from "../project/uploads";
import type { Workspace } from "./workspace";

interface Props {
  workspace: Workspace;
  onClose(): void;
}

/** A picture's size, as the webview decodes it. */
async function measure(bytes: Uint8Array, type: string): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type }));
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

function sizeText(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function about(upload: UploadInfo): string {
  if (upload.kind === "picture" && upload.width) return `${upload.width}×${upload.height}, ${sizeText(upload.bytes)}`;
  return `${upload.kind}, ${sizeText(upload.bytes)}`;
}

export function Drawer({ workspace, onClose }: Props) {
  const [list, setList] = useState<UploadInfo[]>(workspace.project?.uploads ?? []);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState("");

  useEffect(() => workspace.subscribe(() => setList([...(workspace.project?.uploads ?? [])])), [workspace]);

  const take = async (files: File[]) => {
    setProblem("");
    const uploads = await workspace.uploads();
    for (const file of files) {
      try {
        await uploads.add(file.name, new Uint8Array(await file.arrayBuffer()), measure);
      } catch (e) {
        setProblem(e instanceof UploadRefused ? t(e.key, e.vars) : String(e));
      }
    }
    await workspace.save();
  };

  const remove = async (name: string) => {
    await (await workspace.uploads()).remove(name);
    await workspace.save();
  };

  return (
    <aside class="drawer" aria-label="Files">
      <div class="drawer-head">
        <h2>Files</h2>
        <button type="button" class="close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <label
        class={`drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const dropped = Array.from(e.dataTransfer?.files ?? []); if (dropped.length) void take(dropped); }}
      >
        <input type="file" multiple class="hidden" onChange={(e) => {
          // Copied first: clearing the field empties the list it gave.
          const picked = Array.from(e.currentTarget.files ?? []);
          e.currentTarget.value = "";
          if (picked.length) void take(picked);
        }} />
        Drop pictures, fonts, word lists or texts here, or choose them.
      </label>
      {problem && <p class="problem" role="alert">{problem}</p>}
      <ul class="files">
        {list.map((u) => (
          <li key={u.name}>
            <span class="file-name">{u.name}</span>
            <small>{about(u)}</small>
            <button type="button" class="remove" aria-label={`Remove ${u.name}`} onClick={() => void remove(u.name)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
            </button>
          </li>
        ))}
      </ul>
      <p class="hint">The AI sees names and sizes only, until it opens one.</p>
    </aside>
  );
}
