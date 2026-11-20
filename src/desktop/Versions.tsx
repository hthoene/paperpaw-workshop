// Which PaperPaw the plugins are made for, in Settings: the newest release
// (the default, followed by itself) or one the person picks. A plugin built
// for a minor of plugin interface 7 runs on every PaperPaw with that minor
// or a newer one, so an older choice runs on newer readers too. A release
// is fetched when it is chosen, not before; the workshop needs no update.

import { useEffect, useState } from "preact/hooks";

import type { Backend, ReleasePick, Versions } from "./backend";

/** A choice as the select's value. */
export function valueOf(pick: ReleasePick): string {
  return pick.mode === "pinned" ? `v:${pick.version}` : pick.mode;
}

export function pickOf(value: string): ReleasePick {
  return value.startsWith("v:") ? { mode: "pinned", version: value.slice(2) } : { mode: "latest" };
}

export function PaperPawVersion({ backend }: { backend: Backend }) {
  const [versions, setVersions] = useState<Versions | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");

  useEffect(() => {
    void backend.versionsState(false, false).then(setVersions, () => {});
  }, [backend]);

  if (!versions || !versions.releases.length) return null;
  const choose = async (value: string) => {
    setBusy(true);
    setSaid("Fetching it…");
    try {
      const next = await backend.versionsChoose(pickOf(value));
      if (next) setVersions(next);
      setSaid(next?.problem ?? "");
    } catch (e) {
      setSaid(`It could not be chosen: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  };
  const target = versions.target;
  return (
    <section class="versions" aria-label="PaperPaw version">
      <h3>PaperPaw version</h3>
      <select aria-label="PaperPaw version" disabled={busy} value={valueOf(versions.pick)} onChange={(e) => void choose(e.currentTarget.value)}>
        <option value="latest">Newest ({versions.releases[0]!.version})</option>
        {versions.releases.map((r) => (
          <option value={`v:${r.version}`}>
            PaperPaw {r.version} (interface {r.interface}, minor {r.minor})
          </option>
        ))}
      </select>
      {target && (
        <p class="hint">
          Plugins are made for PaperPaw {target.version}: interface {target.interface}, minor {target.minor}. They run on every PaperPaw with that minor or a newer one.
          {versions.emulator && versions.emulator !== target.version && ` It has no emulator for this computer: the reader here is PaperPaw ${versions.emulator}.`}
        </p>
      )}
      {(said || versions.problem) && <p class="hint" role="status">{said || versions.problem}</p>}
    </section>
  );
}
