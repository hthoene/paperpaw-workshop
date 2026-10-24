// "Publish…": the plugin checked as PaperPaw checks it, its version
// higher than the last one packed for the store, packed into one file for
// the store's upload form (`<id>-<version>-store.zip`), then the form
// opened in the browser and the file shown in its folder. The person
// chooses that one file in the form's first field and sends it to the
// moderators; nothing is uploaded from here.
//
// A plugin with code also needs its build for each reader, signed with
// the author's key (whose backup is saved first), and its source, both
// inside the store file: the X4's is made here (its part of Rust fetched
// once, its size said first); the X4 Pro's comes once a PaperPaw release
// brings what it needs.

import { useEffect, useState } from "preact/hooks";

import { identity } from "../project/project";
import { KeyGate } from "./AuthorKey";
import type { AuthorStatus, Backend, DeviceBuilt, DeviceReadiness, StoreFile } from "./backend";
import { forModel, shown, type CheckState } from "./checks";
import type { Desk } from "./desk";
import { toBase64 } from "./folders";
import { holds, raised, recordPublished, uploadPackage, versionState, withCrateVersion, withVersion } from "./publishing";

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
          <section class="way">
            <h3>Pack it for the store</h3>
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
