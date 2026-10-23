// The workshop's own updates, in Settings only: a calm line when a newer
// version is there, never a popup. It is fetched and installed only when
// the person says so, and only when signed with the workshop's update key
// (the updater checks that); then the workshop starts again.

import { useEffect, useState } from "preact/hooks";

import type { AppUpdate, Backend } from "./backend";

export function AppUpdates({ backend }: { backend: Backend }) {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");

  useEffect(() => {
    void backend.updateCheck().then(setUpdate);
  }, [backend]);

  if (!update) return null;
  const install = async () => {
    setBusy(true);
    setSaid("Fetching it…");
    try {
      await backend.updateInstall();
    } catch (e) {
      setSaid(`It could not be installed: ${e instanceof Error ? e.message : String(e)}`);
      setBusy(false);
    }
  };
  return (
    <section class="app-update" aria-label="Update">
      <h3>Update available</h3>
      <p>Version {update.version} of the workshop is there. Your projects stay as they are.</p>
      <button type="button" class="link" disabled={busy} onClick={() => void install()}>
        Update and restart
      </button>
      {said && <p class="hint" role="status">{said}</p>}
    </section>
  );
}
