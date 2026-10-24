// The workshop's own updates: a calm line in Settings when a newer
// version is there, and once at start a small note about it that, once
// closed, does not come again for that version. It is fetched and installed only when
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

const DISMISSED = "workshop.update.dismissed";

/** The version whose note was closed, if any (lost: shown once more). */
function dismissed(): string | null {
  try {
    return localStorage.getItem(DISMISSED);
  } catch {
    return null;
  }
}

/** Once at start: that a newer workshop is there, until closed for it. */
export function UpdateNotice({ backend }: { backend: Backend }) {
  const [update, setUpdate] = useState<AppUpdate | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void backend.updateCheck().then((found) => {
      if (found && found.version !== dismissed()) setUpdate(found);
    });
  }, [backend]);

  if (!update) return null;
  const close = () => {
    try {
      localStorage.setItem(DISMISSED, update.version);
    } catch {
      // Not kept: the note comes once more next start.
    }
    setUpdate(null);
  };
  const install = async () => {
    setBusy(true);
    try {
      await backend.updateInstall();
    } catch {
      // Settings has the update too, and says why it failed there.
      setBusy(false);
    }
  };
  return (
    <p class="notice" role="status">
      Version {update.version} of the workshop is there.
      <button type="button" class="link" disabled={busy} onClick={() => void install()}>
        {busy ? "Fetching it…" : "Update and restart"}
      </button>
      <button type="button" class="close" aria-label="Close" onClick={close}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </p>
  );
}
