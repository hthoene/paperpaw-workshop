// "Publish…": the plugin checked as PaperPaw checks it, its version
// higher than the last one packed for the store, packed as the store's
// upload form takes it, then the form opened in the browser and the
// package shown in its folder. The person uploads it and sends it to the
// moderators; nothing is uploaded from here.

import { useEffect, useState } from "preact/hooks";

import { identity } from "../project/project";
import type { Backend } from "./backend";
import { forModel, shown, type CheckState } from "./checks";
import type { Desk } from "./desk";
import { toBase64 } from "./folders";
import { raised, recordPublished, uploadPackage, versionState, withVersion } from "./publishing";

interface Props {
  desk: Desk;
  backend: Backend;
  onClose(): void;
}

type Step = { at: "checking" } | { at: "ready" } | { at: "problems"; problems: string[] } | { at: "packed"; path: string; name: string };

export function Publish({ desk, backend, onClose }: Props) {
  const project = desk.workspace.project;
  const [step, setStep] = useState<Step>({ at: "checking" });
  const [checks, setChecks] = useState<CheckState>({ state: "none" });
  const [anyway, setAnyway] = useState(false);
  const [again, setAgain] = useState(false);
  const [said, setSaid] = useState("");
  const [, redraw] = useState(0);
  const id = project ? identity(project).id : undefined;

  // Checked afresh: what is sent is what was checked.
  useEffect(() => {
    if (!project || !id || project.kind === "code") return;
    void desk.checker.plugin(project).then((state) => {
      setChecks(state);
      setStep({ at: "ready" });
    });
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
  if (project.kind === "code") {
    return (
      <aside class="drawer send-sheet publish-sheet" aria-label="Publish">
        {head}
        <p class="hint">Publishing a plugin with code is not here yet: the store needs it built and signed for each reader. Send it to your own reader for now.</p>
      </aside>
    );
  }

  const errors = checks.state === "done" ? shown(checks.found, project.ignoredChecks).filter((f) => f.level === "error") : [];
  const version = versionState(project);
  const held = (errors.length > 0 && !anyway) || (!version.ok && !(version.why === "not-higher" && version.again && again));

  const raise = async () => {
    if (version.ok || !version.version) return;
    const next = raised(version.why === "not-higher" ? version.last : version.version);
    const ini = project.files["plugin.ini"];
    if (typeof ini !== "string") return;
    const text = withVersion(ini, next);
    const problem = desk.workshop ? desk.workshop.files.write("plugin.ini", text) : ((project.files["plugin.ini"] = text), null);
    if (problem) return setSaid(problem);
    await desk.workspace.save();
    setAgain(false);
    redraw((n) => n + 1);
  };

  const pack = async () => {
    setSaid("");
    const packed = uploadPackage(project);
    if (!packed.ok) return setStep({ at: "problems", problems: packed.problems });
    try {
      const path = await backend.publishSave(project.key, packed.name, toBase64(packed.zip));
      recordPublished(project, packed.version);
      await desk.workspace.save();
      setStep({ at: "packed", path, name: packed.name });
      await backend.publishShow(path);
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <aside class="drawer send-sheet publish-sheet" aria-label="Publish">
      {head}
      {step.at === "packed" ? (
        <>
          <section class="way">
            <h3>Upload this file</h3>
            <p class="file-name">{step.name}</p>
            <p>
              The store's upload form opened in your browser, and the file's folder beside it. Sign in, choose this file
              as the package, read the checks, and send it to the moderators.
            </p>
            <button type="button" class="link" onClick={() => void backend.publishShow(step.path).catch((e: unknown) => setSaid(String(e)))}>
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
          {step.at === "problems" && (
            <div class="before">
              <p>The store's form would refuse it:</p>
              <ul class="problems">{step.problems.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
          <section class="way">
            <h3>Pack it for the store</h3>
            <p>
              The workshop makes the file the store's upload form takes, then opens the form in your browser. You upload it
              there yourself.
            </p>
            <button type="button" class="go" disabled={step.at === "checking" || held} onClick={() => void pack()}>
              Pack {version.ok || version.version ? `version ${version.ok ? version.version : version.version}` : "it"}
            </button>
          </section>
        </>
      )}
      {said && <p class="said" role="status">{said}</p>}
    </aside>
  );
}
