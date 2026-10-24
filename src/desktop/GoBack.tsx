// Going back in the project's history (history.ts): "Back to this state"
// under an answer, the reader showing that state first, and the versions
// packed for the store. Quiet until wanted; nothing is lost by going back.

import type { Snapshot } from "./history";
import { packedVersions, shownDate } from "./history";
import type { Desk } from "./desk";

/** Whether state `id` is the plugin as it is now: the newest, or the one
 *  the newest went back to. */
function isNow(desk: Desk, id: string): boolean {
  const now = desk.history.snapshots[0];
  return id === desk.history.current || (now?.kind === "restore" && now.from === id);
}

/** "Back to this state" under an answer, unless it is the state now. */
export function BackHere({ desk, snapshot, label = "Back to this state" }: { desk: Desk; snapshot: Snapshot | undefined; label?: string }) {
  if (!snapshot || isNow(desk, snapshot.id) || desk.workshop?.busy) return null;
  const on = desk.previewing?.id === snapshot.id;
  return (
    <p class="back-here">
      <button type="button" class="link quiet" aria-pressed={on} disabled={!!desk.previewing && !on} onClick={() => void desk.preview(snapshot.id)}>
        {label}
      </button>
    </p>
  );
}

/** While the reader shows an earlier state: go back to it, or keep the
 *  plugin as it is. */
export function PreviewBar({ desk }: { desk: Desk }) {
  const previewing = desk.previewing;
  if (!previewing) return null;
  const said = previewing.problem
    ? previewing.problem
    : previewing.ready
      ? "The reader shows the plugin as it was then. Go back to it? The plugin as it is now stays in its history, so you can come back to it the same way."
      : desk.building || "Getting the earlier state ready…";
  return (
    <div class="offer preview" role="status">
      <p>{said}</p>
      <div class="offer-do">
        <button type="button" class="go" disabled={!previewing.ready && !previewing.problem} onClick={() => void desk.restore(previewing.id)}>
          Back to this state
        </button>
        <button type="button" class="link quiet" onClick={() => void desk.endPreview()}>Keep it as it is</button>
      </div>
    </div>
  );
}

/** The versions packed for the store, each with the state it was. */
export function Versions({ desk, onLook }: { desk: Desk; onLook(): void }) {
  const versions = packedVersions(desk.history);
  if (!versions.length) return null;
  return (
    <section class="versions" aria-label="Packed for the store">
      <h3>Packed for the store</h3>
      <ul>
        {versions.map((v) => (
          <li key={`${v.version}-${v.id}`}>
            <span>
              {v.version}, packed {shownDate(v.date)}
            </span>
            {!isNow(desk, v.id) && (
              <button type="button" class="link quiet" disabled={!!desk.workshop?.busy} onClick={() => { onLook(); void desk.preview(v.id); }}>
                Back to this state
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
