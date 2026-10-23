// A project's history as the window shows it (src-tauri's history.rs):
// a state after every answer of the AI that changed the plugin, and one
// before the first, each with "Back to this state"; the versions packed
// for the store marked with their number and date. The person never sees
// it as Git: only states, answers and versions.

/** One state of the project. */
export interface Snapshot {
  id: string;
  /** Seconds since 1970. */
  time: number;
  kind: "start" | "answer" | "restore" | "import" | "publish" | string;
  /** For an answer: how many messages the conversation had after it. */
  at: number | null;
  /** Which conversation, by how many came before it. */
  conversation: number | null;
  /** For a restore: the state it went back to. */
  from: string | null;
  versions: { version: string; date: string }[];
}

/** The newest first, and which is the state now. */
export interface History {
  current: string | null;
  snapshots: Snapshot[];
}

export const NO_HISTORY: History = { current: null, snapshots: [] };

/** The Rust side's history calls (or a stand-in's). */
export interface HistoryApi {
  /** The state before the first change, if there is none yet. */
  historyBegin(project: string, at: number, conversation: number): Promise<History>;
  /** The project as it is now, if it changed since the newest state. */
  historySnapshot(project: string, kind: string, at?: number, conversation?: number): Promise<History>;
  historyList(project: string): Promise<History>;
  /** The project's files back as state `id` has them, kept as a new state. */
  historyRestore(project: string, id: string): Promise<History>;
  /** The project as it is now marked as `version`, packed on `date`. */
  historyMark(project: string, version: string, date: string): Promise<History>;
  /** State `id` on the reader shown, the project left as it is. */
  historyPreview(project: string, id: string): Promise<void>;
}

/** The states after the answers of conversation `conversation`, by the
 *  number of messages after each (the newest of each, if several). */
export function afterAnswers(history: History, conversation: number): Map<number, Snapshot> {
  const out = new Map<number, Snapshot>();
  for (const s of history.snapshots) {
    if ((s.kind === "answer" || s.kind === "start") && s.at !== null && (s.conversation ?? 0) === conversation && !out.has(s.at)) out.set(s.at, s);
  }
  return out;
}

/** The versions packed for the store, the newest first, with their state. */
export function packedVersions(history: History): { version: string; date: string; id: string }[] {
  return history.snapshots.flatMap((s) => s.versions.map((v) => ({ ...v, id: s.id })));
}

/** Today as a version is marked with (`2026-10-23`). */
export function today(at = new Date()): string {
  return at.toISOString().slice(0, 10);
}

/** "23 Oct 2026", as the window says dates. */
export function shownDate(date: string): string {
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? date : new Date(parsed).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** A history in memory, for the stand-in of a plain browser and tests:
 *  `files` reads and writes a project's files (paths to base64). */
export function memoryHistory(files: (project: string) => Map<string, string>): HistoryApi {
  const kept = new Map<string, { history: History; states: Map<string, Map<string, string>> }>();
  let made = 0;
  const of = (project: string) => {
    let found = kept.get(project);
    if (!found) kept.set(project, (found = { history: { current: null, snapshots: [] }, states: new Map() }));
    return found;
  };
  const same = (a: Map<string, string> | undefined, b: Map<string, string>) => !!a && a.size === b.size && [...b].every(([p, c]) => a.get(p) === c);
  const snapshot = (project: string, kind: string, at?: number, conversation?: number, from?: string): History => {
    const h = of(project);
    const now = new Map(files(project));
    if (h.history.current && same(h.states.get(h.history.current), now)) return h.history;
    const id = `state-${(made += 1)}`;
    h.states.set(id, now);
    h.history = {
      current: id,
      snapshots: [{ id, time: Math.floor(Date.now() / 1000), kind, at: at ?? null, conversation: conversation ?? null, from: from ?? null, versions: [] }, ...h.history.snapshots],
    };
    return h.history;
  };
  return {
    historyBegin: async (project, at, conversation) => (of(project).history.current ? of(project).history : snapshot(project, "start", at, conversation)),
    historySnapshot: async (project, kind, at, conversation) => snapshot(project, kind, at, conversation),
    historyList: async (project) => of(project).history,
    historyRestore: async (project, id) => {
      const state = of(project).states.get(id);
      if (!state) throw new Error(`no state ${id}`);
      const now = files(project);
      now.clear();
      for (const [p, c] of state) now.set(p, c);
      return snapshot(project, "restore", undefined, undefined, id);
    },
    historyMark: async (project, version, date) => {
      snapshot(project, "publish");
      const h = of(project).history;
      h.snapshots[0]!.versions.push({ version, date });
      return h;
    },
    historyPreview: async () => {},
  };
}
