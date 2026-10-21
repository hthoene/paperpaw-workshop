// The author's uploads on the page: the button and the drop that add them
// to a message, the small pictures that show them, and their list in the
// Files panel apart from the plugin's own files.

import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import { t } from "../i18n";
import type { Uploads } from "../project/uploads";
import type { Workshop } from "./controller";

/** What the file chooser offers: pictures, fonts and texts. */
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg,.ttf,.otf,.txt,.md,.ini,.css";

/** "Add a picture": the browser's file chooser, several at once. */
export function AddButton({ workshop }: { workshop: Workshop }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        class="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const chosen = [...((e.target as HTMLInputElement).files ?? [])];
          (e.target as HTMLInputElement).value = "";
          void workshop.addFiles(chosen);
        }}
      />
      <button type="button" class="btn quiet add" onClick={() => input.current?.click()} disabled={workshop.busy}>
        {t("upload.add")}
      </button>
    </>
  );
}

/** Takes files dropped on its children, and says so while they hover. */
export function DropZone({ workshop, children, class: className }: { workshop: Workshop; children: ComponentChildren; class: string }) {
  const [over, setOver] = useState(false);
  return (
    <section
      class={`${className}${over ? " dropping" : ""}`}
      aria-label={t("workshop.conversation")}
      onDragOver={(e) => {
        if (!e.dataTransfer?.types.includes("Files")) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const dropped = [...(e.dataTransfer?.files ?? [])];
        if (dropped.length === 0) return;
        e.preventDefault();
        void workshop.addFiles(dropped);
      }}
    >
      {children}
      {over && <div class="drop-note">{t("upload.drop")}</div>}
    </section>
  );
}

/** The uploads added to the message being written, each to leave out. */
export function Attached({ workshop }: { workshop: Workshop }) {
  if (workshop.attached.length === 0) return null;
  return (
    <ul class="attached" aria-label={t("upload.attached")}>
      {workshop.attached.map((name) => (
        <li key={name}>
          <Thumb uploads={workshop.uploads} name={name} />
          <span>{name}</span>
          <button type="button" aria-label={t("upload.leave-out", { name })} onClick={() => workshop.leaveOut(name)}>
            x
          </button>
        </li>
      ))}
    </ul>
  );
}

/** An upload in the conversation: its small picture and name. */
export function AddedLine({ uploads, name }: { uploads: Uploads; name: string }) {
  return (
    <div class="added">
      <Thumb uploads={uploads} name={name} />
      <span>{name}</span>
    </div>
  );
}

/** A small picture of an upload (a mark for fonts and texts). */
export function Thumb({ uploads, name }: { uploads: Uploads; name: string }) {
  const info = uploads.info(name);
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (info?.kind !== "picture") return;
    let made = "";
    void uploads.read(name).then((bytes) => {
      if (!bytes) return;
      made = URL.createObjectURL(new Blob([bytes as BlobPart], { type: info.type }));
      setUrl(made);
    });
    return () => made && URL.revokeObjectURL(made);
  }, [uploads, name, info?.type]);
  if (info?.kind !== "picture") return <span class="thumb file" aria-hidden="true">{t(info?.kind === "font" ? "upload.mark.font" : "upload.mark.text")}</span>;
  return url ? <img class="thumb" src={url} alt="" /> : <span class="thumb" aria-hidden="true" />;
}

/** The uploads in the Files panel: what they are, and a way to remove them. */
export function UploadList({ uploads }: { uploads: Uploads }) {
  const list = uploads.list();
  return (
    <section>
      <h3>{t("files.uploads")}</h3>
      <p class="small">{t("files.uploads.text")}</p>
      {list.length === 0 ? (
        <p class="small">{t("files.uploads.none")}</p>
      ) : (
        <ul class="uploads">
          {list.map((u) => (
            <li key={u.name}>
              <Thumb uploads={uploads} name={u.name} />
              <span>
                <b>{u.name}</b>
                <span class="small">
                  {" "}
                  {u.width ? t("files.uploads.picture", { width: u.width, height: u.height ?? 0, kb: kb(u.bytes) }) : t("files.uploads.file", { kb: kb(u.bytes) })}
                </span>
              </span>
              <button type="button" class="btn quiet" onClick={() => void uploads.remove(u.name)}>
                {t("files.uploads.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** A file of the plugin as the Files panel shows it: text as text,
 *  pictures as pictures, the rest by its size. */
export function PluginFile({ path, content }: { path: string; content: string | Uint8Array }) {
  const url = useMemo(
    () => (typeof content !== "string" && path.endsWith(".png") ? URL.createObjectURL(new Blob([content as BlobPart], { type: "image/png" })) : ""),
    [path, content],
  );
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return (
    <section>
      <h3>{path}</h3>
      {typeof content === "string" ? (
        <pre>{content}</pre>
      ) : url ? (
        <img class="file-picture" src={url} alt={path} />
      ) : (
        <p class="small">{t("files.bytes", { kb: kb(content.length) })}</p>
      )}
    </section>
  );
}

function kb(bytes: number): string {
  return bytes < 1024 ? "1" : String(Math.round(bytes / 1024));
}
