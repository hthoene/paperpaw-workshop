// PaperPaw's checks of the plugin (paperpaw-dev, see src-tauri's
// checks.rs), run after every change and before it is sent or exported:
// its files, texts and settings, and what it draws on every reader the
// workshop shows in each of its languages. The model gets the short
// findings and fixes them without screenshots; the person sees a calm
// "Checks: ok" or "2 to fix".

import { CHECKED } from "../project/project";

/** One thing to fix, as the Rust side says it. */
export interface Found {
  check: string;
  level: "error" | "warning";
  place: string;
  message: string;
  /** Where it was seen: `xteink-x4 de`, ... */
  seen: string[];
}

/** The Rust side's call (or a stand-in's). */
export interface CheckApi {
  pluginCheck(project: string): Promise<Found[]>;
}

export type CheckState =
  | { state: "none" }
  | { state: "running" }
  | { state: "done"; found: Found[] }
  | { state: "failed"; message: string };

/** What the bar says. */
export function summary(checks: CheckState): string {
  switch (checks.state) {
    case "none": return "";
    case "running": return "Checking…";
    case "failed": return "Checks: not run";
    case "done": return checks.found.length ? `Checks: ${checks.found.length} to fix` : "Checks: ok";
  }
}

/** The findings for the model, short: one line each, no pictures. */
export function forModel(found: Found[]): string {
  if (!found.length) return `${CHECKED} nothing to fix.`;
  const line = (f: Found) => `- ${f.level} ${f.check} at ${f.place}${f.seen.length ? ` (${f.seen.join(", ")})` : ""}: ${f.message}`;
  return `${CHECKED} ${found.length} to fix:\n${found.map(line).join("\n")}`;
}

/** Runs the checks of one project, one run at a time: a change while one
 *  runs checks again after it, once. */
export class Checker {
  checks: CheckState = { state: "none" };
  private listeners = new Set<() => void>();
  private running: Promise<void> | null = null;
  private again = false;

  constructor(private api: CheckApi) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(checks: CheckState): void {
    this.checks = checks;
    this.listeners.forEach((l) => l());
  }

  /** Forgets the last results (another project). */
  reset(): void {
    this.set({ state: "none" });
  }

  /** Checks `project`; resolves with the findings once a run that saw
   *  the latest change is done. */
  async run(project: string): Promise<CheckState> {
    if (this.running) {
      this.again = true;
      await this.running;
      return this.checks;
    }
    this.running = (async () => {
      do {
        this.again = false;
        this.set({ state: "running" });
        try {
          this.set({ state: "done", found: await this.api.pluginCheck(project) });
        } catch (e) {
          this.set({ state: "failed", message: String(e) });
        }
      } while (this.again);
    })();
    await this.running;
    this.running = null;
    return this.checks;
  }
}
