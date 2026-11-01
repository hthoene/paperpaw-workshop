// The start: what should the reader do differently, who pays for the AI,
// and the plugins already made in this browser.

import { useEffect, useState } from "preact/hooks";

import { STRONGER } from "../ai/pricing";
import { t } from "../i18n";
import { folderEntries, ImportProblem, MAX_IMPORT } from "../project/import";
import { identity, type Kind, type Project } from "../project/project";
import { listProjects } from "../project/storage";
import { Steps } from "./Header";

/** The ideas to start from; `tool` needs code. */
const IDEAS = ["look", "home", "keys", "text", "tool"];
const CODE_IDEAS = ["tool"];

/** What an import made: the new project and what it took and left out,
 *  or why it took nothing. */
export type ImportResult =
  | { key: string; name: string; kind: Kind; taken: string[]; skipped: { path: string; why: string }[] }
  | { error: string };

interface Props {
  apiKey: string;
  remembered: boolean;
  needsKey: boolean;
  onKey(key: string, remember: boolean): void;
  /** `model` instead of the kind's: Opus, with one's own key. */
  onStart(idea: string, kind: Kind, model?: string): void;
  imported: ImportResult | null;
  /** A folder's files, by their paths in it. */
  onImport(entries: Record<string, Uint8Array>): void;
  onImportZip(bytes: Uint8Array): void;
}

export function Start({ apiKey, remembered, needsKey, onKey, onStart, imported, onImport, onImportZip }: Props) {
  const [idea, setIdea] = useState("");
  const [key, setKey] = useState(apiKey);
  const [remember, setRemember] = useState(remembered);
  const [projects, setProjects] = useState<Project[]>([]);
  const [warn, setWarn] = useState(needsKey);
  const [code, setCode] = useState(false);
  const [stronger, setStronger] = useState(false);

  useEffect(() => {
    listProjects().then(setProjects, () => setProjects([]));
  }, []);

  const go = () => {
    const kind = code ? "code" : "data";
    if (!key.trim()) {
      setWarn(true);
      document.getElementById("key")?.focus();
      return;
    }
    onKey(key.trim(), remember);
    if (idea.trim()) onStart(idea.trim(), kind, stronger ? STRONGER : undefined);
  };

  return (
    <>
      <Steps now={0} />
      <section class="hero">
        <h1>{t("start.title")}</h1>
        <p>{t("start.lede")}</p>
      </section>

      <div class="box ask">
        <label class="visually-hidden" for="idea">
          {t("start.title")}
        </label>
        <textarea
          id="idea"
          value={idea}
          placeholder={t("start.placeholder")}
          onInput={(e) => setIdea((e.target as HTMLTextAreaElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) go();
          }}
        />
        <label class="check code-choice">
          <input type="checkbox" checked={code} onChange={(e) => setCode((e.target as HTMLInputElement).checked)} />
          <span>
            <b>{t("start.code")}</b> {t("start.code.text")}
          </span>
        </label>
        <div class="row">
          <span class="small">
            {t("start.hint")} <a href="#/example">{t("start.example")}</a>{" "}
            <a href="#/example/sleep-picture">{t("start.example.picture")}</a>{" "}
            <a href="#/example/quote-a-day">{t("start.example.code")}</a>
          </span>
          <button class="btn main" onClick={go} disabled={!idea.trim()}>
            {t("start.go")}
          </button>
        </div>
      </div>

      <ul class="ideas">
        {IDEAS.map((id) => (
          <li key={id}>
            <button
              class="box idea"
              onClick={() => {
                setIdea(t(`start.ideas.${id}.prompt`));
                setCode(CODE_IDEAS.includes(id));
              }}
            >
              <b>{t(`start.ideas.${id}`)}</b>
              <span>{t(`start.ideas.${id}.text`)}</span>
              <em>{t(`start.ideas.${id}.kind`)}</em>
            </button>
          </li>
        ))}
      </ul>

      <section class="pay" aria-labelledby="pay-head">
        <h2 id="pay-head">{t("start.pay.title")}</h2>
        <div class="ways">
          <div class="box way on">
            <b>{t("start.pay.key")}</b>
            <p>{t("start.pay.key.text")}</p>
            <div class="key">
              <label for="key">{t("start.pay.key.label")}</label>
              <input
                id="key"
                type="password"
                autocomplete="off"
                spellcheck={false}
                placeholder="sk-ant-..."
                value={key}
                onInput={(e) => {
                  setKey((e.target as HTMLInputElement).value);
                  setWarn(false);
                }}
              />
              <label class="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember((e.target as HTMLInputElement).checked)} />
                <span>{t("start.pay.key.remember")}</span>
              </label>
              <span class="small">{t("start.pay.key.remember.help")}</span>
              <label class="check">
                <input type="checkbox" checked={stronger} onChange={(e) => setStronger((e.target as HTMLInputElement).checked)} />
                <span>{t("start.pay.key.stronger")}</span>
              </label>
              {warn && <span class="error">{t("start.needs-key")}</span>}
            </div>
          </div>
          <div class="box way">
            <b>{t("start.pay.local")}</b>
            <p>
              {t("start.pay.local.text")}{" "}
              <a href="https://github.com/hthoene/paperpaw-workshop#readme">{t("start.pay.local.link")}</a>
            </p>
          </div>
        </div>
      </section>

      <ImportSection imported={imported} onImport={onImport} onImportZip={onImportZip} />

      <section class="projects" aria-labelledby="projects-head">
        <h2 id="projects-head">{t("start.projects")}</h2>
        {projects.length === 0 ? (
          <p class="small">{t("start.projects.none")}</p>
        ) : (
          <ul>
            {projects.map((p) => (
              <li key={p.key}>
                <span>{identity(p).name ?? p.key}</span>
                <span class="small">{p.updated.slice(0, 10)}</span>
                <a
                  class="btn quiet"
                  href={`#/p/${p.key}`}
                  onClick={() => {
                    if (key.trim()) onKey(key.trim(), remember);
                  }}
                >
                  {t("start.projects.open")}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Importing a plugin: a ZIP or a folder (what the workshop gives, or a
 *  plugin's source), and what the last import took. */
function ImportSection({
  imported,
  onImport,
  onImportZip,
}: {
  imported: ImportResult | null;
  onImport(entries: Record<string, Uint8Array>): void;
  onImportZip(bytes: Uint8Array): void;
}) {
  const [problem, setProblem] = useState("");
  const zip = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT) return setProblem(t("import.large", { mb: String(MAX_IMPORT / 1024 / 1024) }));
    setProblem("");
    onImportZip(new Uint8Array(await file.arrayBuffer()));
  };
  const folder = async (input: HTMLInputElement) => {
    const files = input.files ? [...input.files] : [];
    input.value = "";
    if (!files.length) return;
    setProblem("");
    try {
      onImport(await folderEntries(files));
    } catch (e) {
      setProblem(e instanceof ImportProblem ? e.message : String(e));
    }
  };
  const shown = problem || (imported && "error" in imported ? imported.error : "");
  return (
    <section class="import" aria-labelledby="import-head">
      <h2 id="import-head">{t("import.title")}</h2>
      <p class="small">{t("import.text")}</p>
      <div class="row">
        <label class="btn quiet">
          {t("import.zip")}
          <input class="visually-hidden" type="file" accept=".zip,application/zip" onChange={(e) => void zip(e.target as HTMLInputElement)} />
        </label>
        <label class="btn quiet">
          {t("import.folder")}
          <input
            class="visually-hidden"
            type="file"
            {...{ webkitdirectory: "" }}
            onChange={(e) => void folder(e.target as HTMLInputElement)}
          />
        </label>
      </div>
      {shown && (
        <p class="error" role="alert">
          {shown}
        </p>
      )}
      {imported && "key" in imported && (
        <div class="box imported" role="status">
          <p>
            {t(imported.kind === "code" ? "import.done.code" : "import.done", {
              name: imported.name,
              n: String(imported.taken.length),
            })}{" "}
            <a class="btn main" href={`#/p/${imported.key}`}>
              {t("start.projects.open")}
            </a>
          </p>
          {imported.skipped.length > 0 && (
            <details>
              <summary>{t("import.skipped", { n: String(imported.skipped.length) })}</summary>
              <ul class="small">
                {imported.skipped.map((s) => (
                  <li key={s.path}>
                    <code>{s.path}</code>: {s.why}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
