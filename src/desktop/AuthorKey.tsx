// The author key, as the person sees it: in Settings whether and when it
// was backed up (and to back it up again, or to take it from a backup on a
// new computer), and before the first plugin with code is packed, the one
// backup that must be saved first. No reminders after that.

import { useEffect, useState } from "preact/hooks";

import type { AuthorStatus, Backend } from "./backend";

/** Why the backup matters, in one sentence. */
export const WHY_BACKUP =
  "Your author key signs your plugins with code; without it, they cannot be updated any more, so keep the backup somewhere safe and private, such as a USB stick.";

function when(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Saves the backup where the person chooses; the new status, or null
 *  when they chose nowhere. */
async function backUp(backend: Backend): Promise<AuthorStatus | null> {
  const path = await backend.askSaveKey();
  return path ? backend.authorBackup(path) : null;
}

/** The author key in Settings. */
export function KeySettings({ backend }: { backend: Backend }) {
  const [status, setStatus] = useState<AuthorStatus | null>(null);
  const [said, setSaid] = useState("");
  useEffect(() => {
    void backend.authorStatus().then(setStatus, (e: unknown) => setSaid(String(e)));
  }, [backend]);

  const doing = async (what: () => Promise<AuthorStatus | null>, done: string) => {
    setSaid("");
    try {
      const next = await what();
      if (next) {
        setStatus(next);
        setSaid(done);
      }
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    }
  };

  const importing = async () => {
    const path = await backend.askOpenKey();
    return path ? backend.authorImport(path) : null;
  };

  return (
    <section class="author-key" aria-label="Author key">
      <h3>Author key</h3>
      {!status ? null : !status.public ? (
        <>
          <p class="hint">No author key yet. It is made the first time you publish a plugin with code.</p>
          <button type="button" class="link" onClick={() => void doing(importing, "The author key is here, from your backup.")}>
            Import key from backup
          </button>
        </>
      ) : (
        <>
          <p>
            {/* Named, so that no one copies it as the key: the key itself is only in the backup. */}
            <small>Public fingerprint, safe to share. Not your key: that is only in the backup.</small>
            <br />
            <span class="fingerprint">{status.fingerprint}</span>
            <br />
            <small>{status.backed_up ? `Backed up on ${when(status.backed_up)}.` : "Not backed up yet."}</small>
          </p>
          <button type="button" class="link" onClick={() => void doing(() => backUp(backend), "Backup saved. Keep it private.")}>
            {status.backed_up ? "Back up again" : "Back up now"}
          </button>
        </>
      )}
      {said && <p class="said" role="status">{said}</p>}
    </section>
  );
}

/** Before the first plugin with code is packed: the key made, and its
 *  backup saved. Calls `ready` with the status once it is backed up. */
export function KeyGate({ backend, ready }: { backend: Backend; ready(status: AuthorStatus): void }) {
  const [status, setStatus] = useState<AuthorStatus | null>(null);
  const [said, setSaid] = useState("");
  useEffect(() => {
    void backend.authorStatus().then((s) => {
      if (s.public && s.backed_up) ready(s);
      else setStatus(s);
    });
  }, [backend]);
  if (!status) return null;

  const save = async () => {
    setSaid("");
    try {
      if (!status.public) setStatus(await backend.authorCreate());
      const next = await backUp(backend);
      if (next?.backed_up) ready(next);
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    }
  };
  const importing = async () => {
    setSaid("");
    try {
      const path = await backend.askOpenKey();
      if (path) ready(await backend.authorImport(path));
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div class="before key-gate">
      <p><b>First, save a backup of your author key.</b> {WHY_BACKUP}</p>
      <div class="choices-row">
        <button type="button" class="go" onClick={() => void save()}>Save the backup…</button>
        {!status.public && <button type="button" class="link quiet" onClick={() => void importing()}>Import key from backup</button>}
      </div>
      {said && <p class="said" role="status">{said}</p>}
    </div>
  );
}
