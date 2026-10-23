// The files drawer: what the author gives the workshop (pictures, fonts,
// word lists, texts), kept with the project in .workshop/uploads/. The AI
// sees their names and sizes only, until it opens one on purpose. A
// picture's choice says what the plugin gets of it (see pictures.ts).

import { useEffect, useState } from "preact/hooks";

import { t } from "../i18n";
import { UploadRefused, type PictureMode, type UploadInfo } from "../project/uploads";
import type { Desk } from "./desk";
import { Versions } from "./GoBack";
import { MODES, WORKSHOP_SCREENS, modeFor, optimising, remake, type PictureApi } from "./pictures";
import type { Workspace } from "./workspace";

interface Props {
  workspace: Workspace;
  pictures: PictureApi;
  /** For the versions packed for the store, with their states. */
  desk?: Desk;
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

export function Drawer({ workspace, pictures, desk, onClose }: Props) {
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

  // A changed choice makes again what the plugin has of the picture.
  const choose = async (upload: UploadInfo, mode: PictureMode) => {
    const project = workspace.project;
    if (!project) return;
    upload.mode = mode;
    await remake(project, await workspace.uploads(), upload, WORKSHOP_SCREENS, pictures);
    await workspace.save();
  };

  const setOptimise = async (on: boolean) => {
    const project = await workspace.ensure();
    project.optimisePictures = on;
    const uploads = await workspace.uploads();
    for (const upload of uploads.list().filter((u) => u.kind === "picture" && !u.mode)) {
      await remake(project, uploads, upload, WORKSHOP_SCREENS, pictures);
    }
    await workspace.save();
  };

  const project = workspace.project;
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
            {u.kind === "picture" && project && (
              <select
                class="mode"
                aria-label={`What the plugin gets of ${u.name}`}
                value={modeFor(project, u, WORKSHOP_SCREENS)}
                onChange={(e) => void choose(u, e.currentTarget.value as PictureMode)}
              >
                {MODES.map((m) => <option value={m.mode}>{m.label}</option>)}
              </select>
            )}
          </li>
        ))}
      </ul>
      <label class="setting">
        <input type="checkbox" checked={!project || optimising(project)} onChange={(e) => void setOptimise(e.currentTarget.checked)} />
        <span>
          Optimise images for e-ink
          <small>Pictures go into the plugin smaller. The files here stay as they are.</small>
        </span>
      </label>
      <p class="hint">The AI sees names and sizes only, until it opens one.</p>
      {desk && <Versions desk={desk} onLook={onClose} />}
    </aside>
  );
}
