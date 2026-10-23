// "Send to reader": the plugin onto a real reader, over Wi-Fi through the
// reader's transfer page, over the USB cable, or onto its card in this
// computer. Over Wi-Fi and the cable the reader installs it in one step,
// after asking on its screen where it must (a plugin with code; anything
// over the cable). First what PaperPaw's checks found and pictures that
// could be smaller: said, never in the way; the person decides.

import { useEffect, useState } from "preact/hooks";

import { identity } from "../project/project";
import type { Backend, CableReader } from "./backend";
import { forModel, shown } from "./checks";
import type { Desk } from "./desk";
import { toBase64 } from "./folders";
import { makeSmaller, suggestions, WORKSHOP_SCREENS, type Suggestion } from "./pictures";
import { installedText, readerLabel, stepText } from "./sending";

interface Props {
  desk: Desk;
  backend: Backend;
  onClose(): void;
}

export function Send({ desk, backend, onClose }: Props) {
  const project = desk.workspace.project;
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  // How sending goes, from the app, while it goes.
  const [step, setStep] = useState("");
  // The readers on the cable, once looked for.
  const [readers, setReaders] = useState<CableReader[] | null>(null);
  const [smaller, setSmaller] = useState<Suggestion[]>([]);
  const checks = desk.checker.checks;
  const errors = checks.state === "done" ? shown(checks.found, project?.ignoredChecks).filter((f) => f.level === "error") : [];
  const id = project ? identity(project).id : undefined;

  useEffect(() => {
    if (project) void suggestions(project, WORKSHOP_SCREENS, backend).then(setSmaller, () => setSmaller([]));
  }, [project, backend]);

  useEffect(() => {
    let stop: (() => void) | undefined;
    void backend.onSendProgress(setStep).then((s) => { stop = s; });
    return () => stop?.();
  }, [backend]);

  const doing = async (what: () => Promise<string>) => {
    setBusy(true);
    setSaid("");
    setStep("");
    try {
      setSaid(await what());
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setStep("");
    }
  };

  const lookForReaders = () => void doing(async () => {
    const found = await backend.usbReaders();
    setReaders(found);
    return found.length ? "" : "No reader on the cable. Plug it in and switch it on.";
  });

  const shrink = async (s: Suggestion) => {
    if (!project) return;
    await makeSmaller(project, s, WORKSHOP_SCREENS, backend);
    await desk.workspace.save();
    setSmaller((now) => now.filter((x) => x.path !== s.path));
  };

  return (
    <aside class="drawer send-sheet" aria-label="Send to reader">
      <div class="drawer-head">
        <h2>Send to reader</h2>
        <button type="button" class="close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      {!id ? (
        <p class="hint">There is no plugin yet. Say what your reader should do first.</p>
      ) : (
        <>
          {errors.length > 0 && (
            <div class="before">
              <p>PaperPaw's checks found {errors.length} to fix. It may not work as meant on the reader.</p>
              <button type="button" class="link" disabled={!!desk.workshop?.busy} onClick={() => { onClose(); void desk.send(forModel(errors)); }}>
                Ask the AI to fix them
              </button>
            </div>
          )}
          {smaller.length > 0 && (
            <div class="before">
              <p>These pictures could be smaller, so the reader shows them faster:</p>
              <ul class="files">
                {smaller.map((s) => (
                  <li key={s.path}>
                    <span class="file-name">{s.path}</span>
                    <small>{s.why}</small>
                    <button type="button" class="link" onClick={() => void shrink(s)}>Make smaller</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <section class="way">
            <h3>Over Wi-Fi</h3>
            <p>On the reader, open Transfer. Type the address it shows.</p>
            <form class="line" onSubmit={(e) => { e.preventDefault(); void doing(async () => installedText(await backend.sendWifi(project!.key, address))); }}>
              <input aria-label="The reader's address" placeholder="http://192.168.…/?k=…" spellcheck={false} value={address} onInput={(e) => setAddress(e.currentTarget.value)} />
              <button type="submit" class="go" disabled={busy || !address.trim()}>Send</button>
            </form>
          </section>
          <section class="way">
            <h3>Over the cable</h3>
            <p>Plug the reader into this computer. It asks on its screen before it takes the plugin.</p>
            {readers && readers.length > 0 && (
              <ul class="files">
                {readers.map((r) => (
                  <li key={r.port}>
                    <span class="file-name">{readerLabel(r)}</span>
                    {!r.problem && (
                      <button type="button" class="go" disabled={busy} onClick={() => void doing(async () => installedText(await backend.sendUsb(project!.key, r.port)))}>
                        Send
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" class="link" disabled={busy} onClick={lookForReaders}>
              {readers ? "Look again" : "Look for readers"}
            </button>
          </section>
          <section class="way">
            <h3>Onto its card</h3>
            <p>Put the reader's card into this computer, then choose it.</p>
            <button
              type="button"
              class="go"
              disabled={busy}
              onClick={() => void doing(async () => {
                const card = await backend.askFolder();
                if (!card) return "";
                return `Done: ${await backend.sendCard(project!.key, card)}. Put the card back and start the reader.`;
              })}
            >
              Choose the card
            </button>
          </section>
          {busy && step && <p class={step === "asking" ? "said asking" : "said"} role="status">{stepText(step)}</p>}
          {said && <p class="said" role="status">{said}</p>}
        </>
      )}
    </aside>
  );
}

/** "Export zip": the plugin as a zip, where the person chooses. */
export async function exportZip(desk: Desk, backend: Backend): Promise<string> {
  const workshop = desk.workshop;
  const project = desk.workspace.project;
  if (!workshop || !project) return "There is no plugin yet.";
  const id = identity(project).id ?? "plugin";
  const path = await backend.askSave(`${id}.zip`);
  if (!path) return "";
  await backend.saveFile(path, toBase64(new Uint8Array(await workshop.zip().arrayBuffer())));
  return `Saved ${path}.`;
}
