// Sharing it in the store: its page (drafted by the AI, the author
// changes what they like), the screenshots (taken on the reader), and
// sending it, as three short parts of one page. The reader stays beside
// it, so the author sees what they describe.

import { useEffect, useMemo, useState } from "preact/hooks";

import { t } from "../i18n";
import { GROUPS, LICENCES, MAX_SUMMARY, tagsFrom } from "../project/entry";
import type { StoreApi } from "../publish/store";
import type { Workshop } from "./controller";
import { Share } from "./share";

interface Props {
  workshop: Workshop;
  store: StoreApi;
  /** This page's address, for the sign-in to lead back to. */
  back: string;
  /** Whether the store is pretend (the example, `npm run dev`). */
  pretend: boolean;
  onDownload(): void;
}

export function SharePanel({ workshop, store, back, pretend, onDownload }: Props) {
  const share = useMemo(() => new Share(workshop, store, back), [workshop, store, back]);
  const [, setTick] = useState(0);
  useEffect(() => share.subscribe(() => setTick((n) => n + 1)), [share]);
  useEffect(() => {
    void share.open();
  }, [share]);

  const { entry } = share;
  const busy = share.stage.kind === "uploading" || share.stage.kind === "sending";
  const done = share.stage.kind === "sent";
  const locked = busy || done || share.stage.kind === "uploaded";
  const files = workshop.project.files;

  return (
    <section class="box share" aria-labelledby="share-head">
      <h2 id="share-head">{t("share.title")}</h2>
      <p class="small">{t("share.lede")}</p>

      <fieldset disabled={locked}>
        <legend>{t("share.page")}</legend>
        <div class="field">
          <label for="share-name">{t("share.name")}</label>
          <input id="share-name" value={share.name} maxLength={60} onChange={(e) => share.rename((e.target as HTMLInputElement).value)} />
        </div>
        <div class="field">
          <label for="share-summary">{t("share.summary")}</label>
          <input
            id="share-summary"
            value={entry.summary}
            maxLength={MAX_SUMMARY}
            onInput={(e) => share.update({ summary: (e.target as HTMLInputElement).value })}
          />
          <span class="small">{t("share.count", { n: [...entry.summary].length, max: MAX_SUMMARY })}</span>
        </div>
        <div class="field">
          <label for="share-description">{t("share.description")}</label>
          <textarea
            id="share-description"
            rows={5}
            value={entry.description}
            onInput={(e) => share.update({ description: (e.target as HTMLTextAreaElement).value })}
          />
        </div>
        <p class="row">
          <button type="button" class="btn quiet" onClick={() => void share.draft()} disabled={share.drafting}>
            {share.drafting ? t("share.drafting") : t("share.redraft")}
          </button>
          <span class="small">{t("share.redraft.hint")}</span>
        </p>
        <div class="field">
          <label for="share-group">{t("share.group")}</label>
          <select id="share-group" value={entry.group} onChange={(e) => share.update({ group: (e.target as HTMLSelectElement).value as never })}>
            <option value="">{t("share.group.choose")}</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {t(`share.group.${g}`)}
              </option>
            ))}
          </select>
        </div>
        <div class="field">
          <label for="share-tags">{t("share.tags")}</label>
          <input
            id="share-tags"
            value={entry.tags.join(", ")}
            onChange={(e) => share.update({ tags: tagsFrom((e.target as HTMLInputElement).value) })}
          />
          <span class="small">{t("share.tags.hint")}</span>
        </div>
        <div class="field" role="radiogroup" aria-labelledby="share-licence">
          <span id="share-licence" class="label">
            {t("share.licence")}
          </span>
          <div class="licences">
            {LICENCES.map((l) => (
              <label key={l} class={`licence${entry.licence === l ? " on" : ""}`}>
                <input type="radio" name="licence" checked={entry.licence === l} onChange={() => share.update({ licence: l })} />
                <b>{t(`share.licence.${l}`)}</b>
                <span class="small">{t(`share.licence.${l}.text`)}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset disabled={locked}>
        <legend>{t("share.shots")}</legend>
        <p class="small">{workshop.stub ? t("share.shots.stub") : t("share.shots.lede")}</p>
        <ul class="shots">
          {share.shots.map((file) => (
            <li key={file}>
              <Picture bytes={files[`store/${file}`]} alt={entry.alts[file] ?? ""} />
              <label class="visually-hidden" for={`alt-${file}`}>
                {t("share.alt")}
              </label>
              <input
                id={`alt-${file}`}
                value={entry.alts[file] ?? ""}
                maxLength={200}
                onChange={(e) => share.update({ alts: { ...entry.alts, [file]: (e.target as HTMLInputElement).value } })}
              />
              <button type="button" class="btn quiet" onClick={() => share.drop(file)}>
                {t("share.shots.drop")}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" class="btn quiet" onClick={() => void share.retake()} disabled={share.shooting}>
          {share.shooting ? t("share.shots.taking") : t("share.shots.retake")}
        </button>
      </fieldset>

      <div class="send" aria-live="polite">
        <h3>{t("share.send")}</h3>
        {pretend && <p class="small">{t("share.pretend")}</p>}
        {share.missing.length > 0 && !done && (
          <div class="missing">
            <p>{t("share.missing")}</p>
            <ul>
              {share.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        <SendPart share={share} pretend={pretend} onDownload={onDownload} />
        {share.error && <p class="error">{share.error}</p>}
      </div>
    </section>
  );
}

function SendPart({ share, pretend, onDownload }: { share: Share; pretend: boolean; onDownload(): void }) {
  const store = share.store;
  const stage = share.stage;
  const ready = share.missing.length === 0;
  const download = (
    <button type="button" class="btn quiet" onClick={onDownload}>
      {t("share.download")}
    </button>
  );
  if (!store) return <p class="small">{t("share.store.asking")}</p>;
  if (store.kind === "none" || store.kind === "closed") {
    return (
      <>
        <p>{t(store.kind === "none" ? "share.store.none" : "share.store.closed")}</p>
        <p class="row">{download}</p>
      </>
    );
  }
  if (store.kind === "signed-out") {
    return (
      <>
        <p>{t("share.store.signed-out")}</p>
        <p class="row">
          <a class="btn main" href={store.signIn}>
            {t("share.sign-in")}
          </a>
          <button type="button" class="btn quiet" onClick={() => void share.refreshStore()}>
            {t("share.signed-in-now")}
          </button>
        </p>
      </>
    );
  }
  if (stage.kind === "editing" || stage.kind === "uploading") {
    return (
      <>
        <p>{t("share.store.signed-in", { name: store.name })}</p>
        <p class="row">
          <button type="button" class="btn main" disabled={!ready || stage.kind === "uploading"} onClick={() => void share.upload()}>
            {stage.kind === "uploading" ? t("share.uploading") : t("share.upload")}
          </button>
          <span class="small">{t("share.upload.hint")}</span>
        </p>
      </>
    );
  }
  const { draft } = stage;
  const failing = draft.checks.filter((c) => c.status !== "pass");
  if (stage.kind === "sent") {
    return (
      <div class="sent">
        <p>
          <b>{t("share.sent")}</b> {t("share.sent.text")}
        </p>
        {!pretend && (
          <p class="row">
            <a class="btn quiet" href={draft.draftUrl} target="_blank" rel="noopener">
              {t("share.draft-page")}
            </a>
          </p>
        )}
      </div>
    );
  }
  return (
    <>
      <p>{draft.passed ? t("share.checked") : t("share.checked.not")}</p>
      {failing.length > 0 && (
        <ul class="checks">
          {failing.map((c, i) => (
            <li key={i} class={c.status}>
              <b>{t(`share.check.${c.status}`)}</b> {c.message}
            </li>
          ))}
        </ul>
      )}
      <p class="row">
        {draft.passed ? (
          <button type="button" class="btn main" disabled={stage.kind === "sending"} onClick={() => void share.send()}>
            {stage.kind === "sending" ? t("share.sending") : t("share.send.now")}
          </button>
        ) : (
          <a class="btn main" href={draft.draftUrl} target="_blank" rel="noopener">
            {t("share.draft-page")}
          </a>
        )}
        {!pretend && (
          <a class="btn quiet" href={draft.pageUrl} target="_blank" rel="noopener">
            {t("share.preview")}
          </a>
        )}
        <button type="button" class="btn quiet" disabled={stage.kind === "sending"} onClick={() => share.edit()}>
          {t("share.change")}
        </button>
      </p>
    </>
  );
}

/** A picture from the project's bytes. */
function Picture({ bytes, alt }: { bytes: string | Uint8Array | undefined; alt: string }) {
  const url = useMemo(() => (bytes instanceof Uint8Array ? URL.createObjectURL(new Blob([bytes as BlobPart], { type: "image/png" })) : ""), [bytes]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return url ? <img src={url} alt={alt} /> : null;
}
