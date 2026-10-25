// "Publish…": the plugin checked as PaperPaw checks it, its version
// higher than the last one packed for the store, then published on GitHub
// (GitHub.tsx: its own repository, released there, taken by the store as a
// community plugin), or packed into one file for the store's upload form
// (`<id>-<version>-store.zip`), the form opened in the browser and the
// file shown in its folder: the person chooses that one file in the form's
// first field and sends it to the moderators.
//
// A plugin with code also needs its build for each reader, signed with
// the author's key (whose backup is saved first), and its source, both
// inside the store file: the X4's is made here (its part of Rust fetched
// once, its size said first); the X4 Pro's comes once a PaperPaw release
// brings what it needs.

import { useEffect, useState } from "preact/hooks";

import { MAX_SCREENSHOTS } from "../project/entry";
import { identity } from "../project/project";
import { moveShot, removeShot, storeShots } from "../publish/screenshots";
import { KeyGate } from "./AuthorKey";
import { GitHub } from "./GitHub";
import type { Publication } from "./releasing";
import type { AuthorStatus, Backend, DeviceBuilt, DeviceReadiness, StoreFile } from "./backend";
import { forModel, shown, type CheckState } from "./checks";
import type { Desk } from "./desk";
import { toBase64 } from "./folders";
import release from "../../paperpaw-release.txt?raw";
import {
  GROUPS,
  LICENCES,
  holds,
  raised,
  recordPublished,
  sdkOf,
  storeEntry,
  storeIniPath,
  uploadPackage,
  versionState,
  withCrateVersion,
  withStore,
  withVersion,
} from "./publishing";

/** The licence chosen last, for the next plugin: asked once. */
const LICENCE = "workshop.licence";

function rememberedLicence(): string | null {
  try {
    return localStorage.getItem(LICENCE);
  } catch {
    return null;
  }
}

function rememberLicence(licence: string): void {
  try {
    localStorage.setItem(LICENCE, licence);
  } catch {
    // Not kept: asked again next time.
  }
}

interface Props {
  desk: Desk;
  backend: Backend;
  onClose(): void;
}

type Step =
  | { at: "checking" }
  | { at: "ready" }
  | { at: "building" }
  | { at: "problems"; problems: string[] }
  | { at: "packed"; file: StoreFile };

/** Why a build failed, as the person and the AI read it. */
function whyFailed(built: DeviceBuilt): string[] {
  // Each error once: the same one from several places reads as one.
  const errors = [...new Set(built.diagnostics.filter((d) => d.level === "error").map((d) => d.rendered.split("\n")[0] ?? d.message))];
  const said = [...built.problems, ...errors];
  return said.length ? said : [built.log_tail || "The build failed."];
}

/** The store's screenshots: each small, to move or delete; the way to
 *  more (the camera, the AI). */
function Screenshots({ desk, onClose }: { desk: Desk; onClose(): void }) {
  const [, redraw] = useState(0);
  const [said, setSaid] = useState("");
  const files = desk.workshop?.files;
  if (!files) return null;
  const shots = storeShots(files);
  const all = files.all();
  const done = async (problem: string | null) => {
    setSaid(problem ?? "");
    if (!problem) await desk.workspace.save();
    redraw((n) => n + 1);
  };
  const picture = (path: string) => {
    const bytes = all[path];
    const type = /\.webp$/.test(path) ? "image/webp" : /\.jpe?g$/.test(path) ? "image/jpeg" : "image/png";
    return typeof bytes === "string" || !bytes ? "" : `data:${type};base64,${toBase64(bytes)}`;
  };
  const askAi = () => {
    onClose();
    void desk.send(
      `Take the store's screenshots with screenshot, 2 to ${MAX_SCREENSHOTS}, as the handbook says: set the scene first, the plugin's best screens, look at each and replace weak ones.` +
        (shots.length ? " Replace or delete the ones there where yours are better." : ""),
    );
  };
  return (
    <section class="way shots" aria-label="Screenshots">
      <h3>Screenshots</h3>
      {shots.length ? (
        <ol class="shot-list">
          {shots.map((shot, i) => (
            <li key={shot.file}>
              <img src={picture(shot.path)} alt={shot.alt || shot.file} />
              <div class="shot-actions">
                <button type="button" class="link quiet" aria-label={`Move ${shot.file} earlier`} disabled={i === 0} onClick={() => void done(moveShot(files, shot.file, -1))}>←</button>
                <button type="button" class="link quiet" aria-label={`Move ${shot.file} later`} disabled={i === shots.length - 1} onClick={() => void done(moveShot(files, shot.file, 1))}>→</button>
                <button type="button" class="link quiet" onClick={() => void done(removeShot(files, shot.file))}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p class="hint">None yet. Take them with the camera above the reader, or let the AI take them.</p>
      )}
      <p class="hint">
        {shots.length} of {MAX_SCREENSHOTS}, shown in this order. The first one is what people see first.
      </p>
      <button type="button" class="link" disabled={!!desk.workshop?.busy} onClick={askAi}>
        {shots.length ? "Let the AI improve them" : "Let the AI take them"}
      </button>
      {said && <p class="said" role="status">{said}</p>}
    </section>
  );
}

export function Publish({ desk, backend, onClose }: Props) {
  const project = desk.workspace.project;
  const [step, setStep] = useState<Step>({ at: "checking" });
  const [checks, setChecks] = useState<CheckState>({ state: "none" });
  const [anyway, setAnyway] = useState(false);
  const [again, setAgain] = useState(false);
  const [said, setSaid] = useState("");
  const [, redraw] = useState(0);
  const [key, setKey] = useState<AuthorStatus | null>(null);
  const [readiness, setReadiness] = useState<DeviceReadiness | null>(null);
  const [fetching, setFetching] = useState(false);
  const id = project ? identity(project).id : undefined;
  const code = project?.kind === "code";
  const entry = project ? storeEntry(project) : {};
  const remembered = rememberedLicence();
  const [licence, setLicence] = useState(entry.licence ?? remembered ?? LICENCES[0]!.id);
  const [choosingLicence, setChoosingLicence] = useState(!entry.licence && !remembered);
  const [group, setGroup] = useState(entry.group ?? "");

  // Checked afresh: what is sent is what was checked.
  useEffect(() => {
    if (!project || !id) return;
    void desk.checker.plugin(project).then((state) => {
      setChecks(state);
      setStep({ at: "ready" });
    });
    if (project.kind === "code") void backend.deviceReadiness().then(setReadiness, (e: unknown) => setSaid(String(e)));
  }, [project, id]);

  const close = (
    <button type="button" class="close" aria-label="Close" onClick={onClose}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  );
  const head = (
    <div class="drawer-head">
      <h2>Publish</h2>
      {close}
    </div>
  );

  if (!project || !id) {
    return (
      <aside class="drawer send-sheet publish-sheet" aria-label="Publish">
        {head}
        <p class="hint">There is no plugin yet. Say what your reader should do first.</p>
      </aside>
    );
  }

  const errors = checks.state === "done" ? shown(checks.found, project.ignoredChecks).filter((f) => f.level === "error") : [];
  const version = versionState(project);
  const held =
    (errors.length > 0 && !anyway) ||
    (!version.ok && !(version.why === "not-higher" && version.again && again)) ||
    (code && (!key || !readiness?.x4 || !readiness.sign)) ||
    !group;

  /** The store entry as the store needs it: the group, the licence and
   *  the SDK of the PaperPaw this workshop builds with, written into the
   *  project's store.ini where they are missing or were chosen here. */
  const completeEntry = async (): Promise<string | null> => {
    const ready = await backend.emulatorReady().catch(() => null);
    const values: Record<string, string> = {};
    if (group !== entry.group) values.group = group;
    if (licence !== entry.licence) values.licence = licence;
    if (!entry.sdk) values.sdk = sdkOf(ready?.paperpaw ?? release);
    rememberLicence(licence);
    if (!Object.keys(values).length) return null;
    const path = storeIniPath(project);
    const old = project.files[path];
    const text = withStore(typeof old === "string" ? old : "", values);
    const problem = desk.workshop ? desk.workshop.files.write(path, text) : ((project.files[path] = text), null);
    if (problem) return problem;
    await desk.workspace.save();
    return null;
  };

  /** The AI chooses the group from what the plugin is. */
  const askGroup = () => {
    onClose();
    void desk.send(
      `Choose this plugin's group in the store and write it as group in the [store] section of ${storeIniPath(project)} ` +
        `(make the file if there is none), one of: ${GROUPS.map((g) => `${g.id} (${g.what})`).join(", ")}. Change nothing else.`,
    );
  };

  /** Sets the plugin's version to `next`: why not, if it could not. */
  const setVersion = async (next: string): Promise<string | null> => {
    // A plugin with code says its version in its folder and in its crate.
    const where = code ? ["plugin/plugin.ini", "Cargo.toml"] : ["plugin.ini"];
    for (const path of where) {
      const old = project.files[path];
      if (typeof old !== "string") continue;
      const text = path === "Cargo.toml" ? withCrateVersion(old, next) : withVersion(old, next);
      const problem = desk.workshop ? desk.workshop.files.write(path, text) : ((project.files[path] = text), null);
      if (problem) return problem;
    }
    await desk.workspace.save();
    setAgain(false);
    redraw((n) => n + 1);
    return null;
  };

  const raise = async () => {
    if (version.ok || !version.version) return;
    const problem = await setVersion(raised(version.why === "not-higher" ? version.last : version.version));
    if (problem) setSaid(problem);
  };

  /** The plugin ready for GitHub: its store entry complete, checked as
   *  the form checks it, a plugin with code built for the readers. */
  const forGitHub = async (): Promise<Publication | string[]> => {
    const incomplete = await completeEntry();
    if (incomplete) return [incomplete];
    const packed = uploadPackage(project);
    if (!packed.ok) return packed.problems;
    let source: string | null = null;
    if (code) {
      const built = await backend.deviceBuild(project.key, packed.id, packed.version);
      if (built.state !== "done" || !built.source) return whyFailed(built);
      source = built.source;
    }
    const { name } = identity(project);
    return { project: project.key, id: packed.id, version: packed.version, description: `${name ?? packed.id}, a plugin for PaperPaw`, known: project.github ?? null, source };
  };

  /** The version after the one used up. */
  const raiseNext = async () => {
    const now = identity(project).version;
    if (!now) return;
    const problem = await setVersion(raised(now));
    if (problem) throw new Error(problem);
  };

  const rememberRepo = async (repo: string) => {
    if (project.github === repo) return;
    project.github = repo;
    await desk.workspace.save();
  };

  /** Published on GitHub: kept as published, marked in the history. */
  const publishedOnGitHub = async (published: string, repo: string) => {
    project.github = repo;
    recordPublished(project, published);
    await desk.workspace.save();
    await desk.markPublished(published);
  };

  const fetchRust = async () => {
    setFetching(true);
    setSaid("");
    try {
      await backend.deviceToolchainInstall();
      setReadiness(await backend.deviceReadiness());
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    } finally {
      setFetching(false);
    }
  };

  const pack = async () => {
    setSaid("");
    const incomplete = await completeEntry();
    if (incomplete) return setSaid(incomplete);
    const packed = uploadPackage(project);
    if (!packed.ok) return setStep({ at: "problems", problems: packed.problems });
    try {
      if (code) {
        setStep({ at: "building" });
        const built = await backend.deviceBuild(project.key, packed.id, packed.version);
        if (built.state !== "done" || !built.ppn || !built.source) return setStep({ at: "problems", problems: whyFailed(built) });
      }
      // One file for the store: the package, and the build and the source just made.
      const file = await backend.publishPack(project.key, packed.id, packed.version, toBase64(packed.zip), !!code);
      recordPublished(project, packed.version);
      await desk.workspace.save();
      // The state packed, marked in the history to go back to.
      await desk.markPublished(packed.version);
      setStep({ at: "packed", file });
      await backend.publishShow(file.path);
    } catch (e) {
      setStep({ at: "ready" });
      setSaid(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <aside class="drawer send-sheet publish-sheet" aria-label="Publish">
      {head}
      {step.at === "packed" ? (
        <>
          <section class="way packed">
            <h3>Upload this one file</h3>
            <p class="store-file">
              <span class="file-name">{step.file.name}</span>
              <small>It holds {holds(step.file.parts)}.</small>
            </p>
            <ol class="steps">
              <li>The store's form opened in your browser. Sign in there.</li>
              <li>Choose this file in the first field. Nothing else.</li>
              <li>Press Upload and check, then send it to the moderators.</li>
            </ol>
            <button type="button" class="link" onClick={() => void backend.publishShow(step.file.path).catch((e: unknown) => setSaid(String(e)))}>
              Open the form and the folder again
            </button>
          </section>
        </>
      ) : (
        <>
          {step.at === "checking" && <p class="hint" role="status">Checking it as PaperPaw checks plugins…</p>}
          {checks.state === "failed" && <div class="before"><p>PaperPaw's checks could not run: {checks.message}</p></div>}
          {errors.length > 0 && (
            <div class="before">
              <p>PaperPaw's checks found {errors.length} to fix. The store checks it too, and may refuse it.</p>
              <div class="choices-row">
                <button type="button" class="link" disabled={!!desk.workshop?.busy} onClick={() => { onClose(); void desk.send(forModel(errors)); }}>
                  Ask the AI to fix them
                </button>
                {!anyway && <button type="button" class="link quiet" onClick={() => setAnyway(true)}>Publish anyway</button>}
              </div>
            </div>
          )}
          {!version.ok && (
            <div class="before">
              {version.why === "missing" && <p>plugin.ini names no version. Ask the AI to give it one, such as 1.0.0.</p>}
              {version.why === "invalid" && <p>The version "{version.version}" is not three numbers, such as 1.0.0.</p>}
              {version.why === "not-higher" && (
                <p>
                  {version.again
                    ? `Version ${version.version} was packed for the store before. If you sent it, a new version needs a higher number.`
                    : `Version ${version.version} is not higher than ${version.last}, the last one packed for the store.`}
                </p>
              )}
              <div class="choices-row">
                {version.why !== "missing" && (
                  <button type="button" class="link" onClick={() => void raise()}>
                    Raise to {raised(version.why === "not-higher" ? version.last : version.version!)}
                  </button>
                )}
                {version.why === "not-higher" && version.again && !again && (
                  <button type="button" class="link quiet" onClick={() => setAgain(true)}>I did not send it: pack {version.version} again</button>
                )}
              </div>
            </div>
          )}
          {code && <KeyGate backend={backend} ready={setKey} />}
          {code && key && readiness && (
            <div class="before readers">
              <p>
                <b>X4</b>{" "}
                {readiness.x4
                  ? "is ready to build for."
                  : `needs its part of Rust first, about ${readiness.x4_mb} MB, fetched once.`}
              </p>
              {!readiness.x4 && (
                <button type="button" class="link" disabled={fetching} onClick={() => void fetchRust()}>
                  {fetching ? "Fetching…" : `Fetch it (${readiness.x4_mb} MB)`}
                </button>
              )}
              <p class="hint">
                <b>X4 Pro</b>: plugins with code for it come once a PaperPaw release brings what its builds need. Until then
                the store offers this plugin for the X4.
              </p>
              {!readiness.sign && <p>PaperPaw's paperpaw-sign is missing beside its emulator: it packs the file for the readers.</p>}
            </div>
          )}
          {step.at === "building" && <p class="hint" role="status">Building it for the X4, then signing it…</p>}
          {step.at === "problems" && (
            <div class="before">
              <p>The store's form would refuse it:</p>
              <ul class="problems">{step.problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
          {(!entry.group || !entry.licence) && (
            <div class="before store-entry">
              {!entry.group && (
                <>
                  <label for="store-group">Its group in the store</label>
                  <div class="choices-row">
                    <select id="store-group" class="mode" value={group} onChange={(e) => setGroup(e.currentTarget.value)}>
                      <option value="">Choose…</option>
                      {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    {!group && (
                      <button type="button" class="link" disabled={!!desk.workshop?.busy} onClick={askGroup}>
                        Let the AI choose
                      </button>
                    )}
                  </div>
                </>
              )}
              {!entry.licence &&
                (choosingLicence ? (
                  <>
                    <label for="store-licence">Licence</label>
                    <select id="store-licence" class="mode" value={licence} onChange={(e) => setLicence(e.currentTarget.value)}>
                      {LICENCES.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    <p class="hint">Kept for your next plugins.</p>
                  </>
                ) : (
                  <p>
                    Licence: {licence}{" "}
                    <button type="button" class="link quiet" onClick={() => setChoosingLicence(true)}>Change</button>
                  </p>
                ))}
            </div>
          )}
          <Screenshots desk={desk} onClose={onClose} />
          <GitHub
            desk={desk}
            backend={backend}
            held={step.at === "checking" || step.at === "building" || held}
            prepare={forGitHub}
            raise={raiseNext}
            done={publishedOnGitHub}
            remember={rememberRepo}
          />
          <section class="way">
            <h3>Or pack it for the store's form</h3>
            <p>
              {code
                ? "The workshop makes one file for the store: the plugin, its build for the X4 signed with your key, and its source. Then it opens the store's form in your browser. You upload the file there yourself."
                : "The workshop makes one file for the store, then opens the store's form in your browser. You upload the file there yourself."}
            </p>
            <button type="button" class="go" disabled={step.at === "checking" || step.at === "building" || held} onClick={() => void pack()}>
              Pack {version.ok || version.version ? `version ${version.ok ? version.version : version.version}` : "it"}
            </button>
          </section>
        </>
      )}
      {said && <p class="said" role="status">{said}</p>}
    </aside>
  );
}
