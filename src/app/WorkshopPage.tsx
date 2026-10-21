// The workshop: the conversation on the left, the reader on the right,
// what the checker says below it. Nobody has to open the files.

import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import type { Provider } from "../ai/provider";
import type { Handbook } from "../handbook/handbook";
import { t } from "../i18n";
import { identity, type Project } from "../project/project";
import type { StoreApi } from "../publish/store";
import { lines } from "./conversation";
import { canSleep } from "../emulator/protocol";
import { Workshop } from "./controller";
import { Steps } from "./Header";
import { SharePanel } from "./SharePanel";
import { AddButton, AddedLine, Attached, DropZone, PluginFile, UploadList } from "./Uploads";

interface Props {
  project: Project;
  handbook: Handbook;
  provider: Provider;
  /** The idea from the start page, sent once the reader is ready. */
  first: string;
  /** Files added to it (an example's, from `public/examples/`). */
  firstFiles: string[];
  onFirstSent(): void;
  /** The share page instead of the conversation, the reader beside it. */
  sharing: boolean;
  store: StoreApi;
  pretend: boolean;
}

const BUTTONS = ["page-back", "up", "down", "left", "right", "confirm", "back", "page-forward"];

export function WorkshopPage({ project, handbook, provider, first, firstFiles, onFirstSent, sharing, store, pretend }: Props) {
  const workshop = useMemo(() => new Workshop(project, handbook, provider), [project, handbook, provider]);
  const [, setTick] = useState(0);
  const redraw = () => setTick((n) => n + 1);
  const [draft, setDraft] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => workshop.subscribe(redraw), [workshop]);
  useEffect(() => {
    if (!frame.current) return;
    void workshop.attach(frame.current).then(async () => {
      if (!first) return;
      onFirstSent();
      const files = await Promise.all(
        firstFiles.map(async (name) => new File([await (await fetch(new URL(`examples/${name}`, document.baseURI))).blob()], name)),
      );
      if (files.length) await workshop.addFiles(files);
      await workshop.send(first);
    });
  }, [workshop]);
  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [workshop.project.messages.length, workshop.live]);

  const send = () => {
    const text = draft;
    setDraft("");
    void workshop.send(text);
  };

  const save = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const id = identity(project).id ?? "plugin";
  const download = () => save(workshop.zip(), `${id}.zip`);
  const downloadForStore = () =>
    save(new Blob([workshop.storePackage() as BlobPart], { type: "application/zip" }), `${id}-for-the-store.zip`);
  // This page's address with and without the share page.
  const here = location.hash.replace(/\/share$/, "");
  const back = `${location.pathname}${here}/share`;

  const conversation = lines(project.messages);
  const cost = costText(project.usage.dollars);
  const profile = workshop.profile;
  const ratio = `${profile.width} / ${profile.height}`;

  return (
    <>
      <Steps now={sharing ? 3 : 1} />
      <div class="title">
        <h1>{workshop.name || "..."}</h1>
        <span class="small">{t("workshop.saved")}</span>
        <a class="btn quiet" href="#/">
          {t("workshop.home")}
        </a>
        <button class="btn quiet" onClick={() => setShowFiles(true)}>
          {t("workshop.files")}
        </button>
        <button class={`btn ${sharing ? "quiet" : "main"}`} onClick={download} disabled={!identity(project).id}>
          {t("workshop.download")}
        </button>
        {sharing ? (
          <a class="btn main" href={here}>
            {t("workshop.back")}
          </a>
        ) : (
          <a
            class={`btn${identity(project).id ? "" : " quiet disabled"}`}
            href={identity(project).id ? `${here}/share` : undefined}
            aria-disabled={!identity(project).id}
          >
            {t("workshop.share")}
          </a>
        )}
      </div>

      <div class="bench">
        {sharing ? (
          <SharePanel workshop={workshop} store={store} back={back} pretend={pretend} onDownload={downloadForStore} />
        ) : (
          <DropZone workshop={workshop} class="box chat">
            <div class="messages" aria-live="polite">
              {conversation.map((line, i) =>
                line.kind === "step" ? (
                  <div key={i} class={`step${line.failed ? " failed" : ""}`}>
                    {line.text}
                  </div>
                ) : line.kind === "added" ? (
                  <AddedLine key={i} uploads={workshop.uploads} name={line.text} />
                ) : (
                  <div key={i} class={line.kind}>
                    {line.text}
                  </div>
                ),
              )}
              {workshop.live && <div class="ai">{workshop.live}</div>}
              {workshop.busy && !workshop.live && <div class="step busy">{t("workshop.thinking")}</div>}
              {workshop.error && <p class="error">{workshop.error}</p>}
              <div ref={bottom} />
            </div>
            <Attached workshop={workshop} />
            <div class="composer">
              <label class="visually-hidden" for="say">
                {t("workshop.input")}
              </label>
              <textarea
                id="say"
                rows={2}
                value={draft}
                placeholder={t("workshop.input")}
                onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!workshop.busy) send();
                  }
                }}
              />
              <AddButton workshop={workshop} />
              {workshop.busy ? (
                <button class="btn quiet" onClick={() => workshop.stop()}>
                  {t("workshop.stop")}
                </button>
              ) : (
                <button class="btn main" onClick={send} disabled={!draft.trim()}>
                  {t("workshop.send")}
                </button>
              )}
            </div>
            <p class="small cost">{t("workshop.cost", { model: workshop.modelLabel, who: workshop.who, cost })}</p>
            {workshop.example && <p class="small">{t("workshop.example")}</p>}
          </DropZone>
        )}

        <section class="device" aria-label="The reader">
          <div class="tabs" role="group" aria-label="Device">
            {workshop.profiles.map((p) => (
              <button key={p.id} aria-pressed={p.id === profile.id} onClick={() => void workshop.show(p)}>
                {p.name.replace(/^Xteink /, "")}
              </button>
            ))}
            <span class="gap" />
            <button aria-pressed={workshop.dark} onClick={() => void workshop.show(profile, true)}>
              {t("reader.dark")}
            </button>
            <button aria-pressed={!workshop.dark} onClick={() => void workshop.show(profile, false)}>
              {t("reader.light")}
            </button>
            <button
              disabled={!canSleep(profile)}
              title={canSleep(profile) ? undefined : t("reader.asleep.none")}
              aria-pressed={workshop.screen === "sleep"}
              onClick={() => void workshop.show(profile, workshop.dark, workshop.screen === "sleep" ? "home" : "sleep")}
            >
              {t("reader.asleep")}
            </button>
          </div>
          <div class="bezel">
            <iframe
              ref={frame}
              src="frame.html"
              // Its own opaque origin: no access to this page's storage or
              // key. The dev server cannot serve modules to an opaque origin
              // (CORS), so in development only the frame keeps the page's.
              sandbox={import.meta.env.DEV ? "allow-scripts allow-same-origin" : "allow-scripts"}
              title="Emulated reader"
              style={{ aspectRatio: ratio }}
            />
          </div>
          <div class="buttons" role="group" aria-label={t("reader.buttons")}>
            {BUTTONS.map((b) => (
              <button key={b} onClick={() => void workshop.press(b)}>
                {t(`reader.button.${b}`)}
              </button>
            ))}
          </div>
          {workshop.stub && <p class="small">{t("reader.stub")}</p>}
          <div class="box findings">
            <h2>{t("findings.title")}</h2>
            {workshop.findings.filter((f) => f.level !== "info").length === 0 ? (
              <p class="small">{t("findings.none")}</p>
            ) : (
              <ul>
                {workshop.findings
                  .filter((f) => f.level !== "info")
                  .map((f, i) => (
                    <li key={i} class={f.level}>
                      <b>{t(`findings.level.${f.level}`)}</b> {f.place}: {f.message}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {showFiles && (
        <div class="panel" role="dialog" aria-modal="true" aria-labelledby="files-head" onClick={() => setShowFiles(false)}>
          <div class="box" onClick={(e) => e.stopPropagation()}>
            <div class="head">
              <h2 id="files-head">{t("files.title")}</h2>
              <button class="btn quiet" onClick={() => setShowFiles(false)}>
                {t("files.close")}
              </button>
            </div>
            <UploadList uploads={workshop.uploads} />
            <h3 class="part">{t("files.plugin")}</h3>
            {workshop.files.list().length === 0 && <p class="small">{t("files.none")}</p>}
            {workshop.files.list().map((f) => (
              <PluginFile key={f.path} path={f.path} content={project.files[f.path]!} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function costText(dollars: number): string {
  const cents = dollars * 100;
  if (cents < 1) return t("units.under-cent");
  if (cents < 1.5) return t("units.cent");
  if (cents < 100) return t("units.cents", { n: Math.round(cents) });
  return t("units.dollars", { n: dollars.toFixed(2) });
}
