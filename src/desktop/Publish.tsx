// "Publish…": the plugin checked as PaperPaw checks it, its version
// higher than the last one packed for the store, packed as the store's
// upload form takes it, then the form opened in the browser and the
// package shown in its folder. The person uploads it and sends it to the
// moderators; nothing is uploaded from here.
//
// A plugin with code also needs its build for each reader, signed with
// the author's key (whose backup is saved first), and its source: the
// X4's is made here (its part of Rust fetched once, its size said first);
// the X4 Pro's comes once a PaperPaw release brings what it needs.

import { useEffect, useState } from "preact/hooks";

import { identity } from "../project/project";
import { KeyGate } from "./AuthorKey";
import type { AuthorStatus, Backend, DeviceBuilt, DeviceReadiness } from "./backend";
import { forModel, shown, type CheckState } from "./checks";
import type { Desk } from "./desk";
import { toBase64 } from "./folders";
import { raised, recordPublished, uploadPackage, versionState, withCrateVersion, withVersion } from "./publishing";

interface Props {
  desk: Desk;
  backend: Backend;
  onClose(): void;
}

/** A file made for the store's form: which field takes it. */
interface Made {
  path: string;
  name: string;
  field: string;
}

type Step =
  | { at: "checking" }
  | { at: "ready" }
  | { at: "building" }
  | { at: "problems"; problems: string[] }
  | { at: "packed"; made: Made[] };

/** The file's name in `path` (either separator). */
const nameOf = (path: string) => path.split(/[\\/]/).pop() ?? path;

/** Why a build failed, as the person and the AI read it. */
function whyFailed(built: DeviceBuilt): string[] {
  const errors = built.diagnostics.filter((d) => d.level === "error").map((d) => d.rendered.split("\n")[0] ?? d.message);
  const said = [...built.problems, ...errors];
  return said.length ? said : [built.log_tail || "The build failed."];
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
    (code && (!key || !readiness?.x4 || !readiness.sign));

  const raise = async () => {
    if (version.ok || !version.version) return;
    const next = raised(version.why === "not-higher" ? version.last : version.version);
    // A plugin with code says its version in its folder and in its crate.
    const where = code ? ["plugin/plugin.ini", "Cargo.toml"] : ["plugin.ini"];
    for (const path of where) {
      const old = project.files[path];
      if (typeof old !== "string") continue;
      const text = path === "Cargo.toml" ? withCrateVersion(old, next) : withVersion(old, next);
      const problem = desk.workshop ? desk.workshop.files.write(path, text) : ((project.files[path] = text), null);
      if (problem) return setSaid(problem);
    }
    await desk.workspace.save();
    setAgain(false);
    redraw((n) => n + 1);
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
    const packed = uploadPackage(project);
    if (!packed.ok) return setStep({ at: "problems", problems: packed.problems });
    try {
      const made: Made[] = [];
      if (code) {
        setStep({ at: "building" });
        const built = await backend.deviceBuild(project.key, packed.id, packed.version);
        if (built.state !== "done" || !built.ppn || !built.source) return setStep({ at: "problems", problems: whyFailed(built) });
        made.push({ path: built.ppn, name: nameOf(built.ppn), field: "the X4's build" });
        made.push({ path: built.source, name: nameOf(built.source), field: "the source (as a ZIP)" });
      }
      const path = await backend.publishSave(project.key, packed.name, toBase64(packed.zip));
      made.unshift({ path, name: packed.name, field: "the package" });
      recordPublished(project, packed.version);
      await desk.workspace.save();
      // The state packed, marked in the history to go back to.
      await desk.markPublished(packed.version);
      setStep({ at: "packed", made });
      await backend.publishShow(path);
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
          <section class="way">
            <h3>{step.made.length > 1 ? "Upload these files" : "Upload this file"}</h3>
            <ul class="made">
              {step.made.map((m) => (
                <li key={m.path}>
                  <span class="file-name">{m.name}</span>
                  {step.made.length > 1 && <small>as {m.field}</small>}
                </li>
              ))}
            </ul>
            <p>
              The store's upload form opened in your browser, and the folder beside it. Sign in, choose{" "}
              {step.made.length > 1 ? "each file in its field" : "this file as the package"}, read the checks, and send it
              to the moderators.
            </p>
            <button type="button" class="link" onClick={() => void backend.publishShow(step.made[0]!.path).catch((e: unknown) => setSaid(String(e)))}>
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
          <section class="way">
            <h3>Pack it for the store</h3>
            <p>
              {code
                ? "The workshop makes what the store's upload form takes: the plugin's folder, its build for the X4 signed with your key, and its source. Then it opens the form in your browser. You upload them there yourself."
                : "The workshop makes the file the store's upload form takes, then opens the form in your browser. You upload it there yourself."}
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
