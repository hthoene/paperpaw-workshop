// Sharing a plugin in the store, as the share page uses it: the entry
// (drafted by the AI, changed by the author), the screenshots (taken on
// the emulator), signing in, and the upload and sending as the store's
// own form does them. The page only shows this and calls it.

import { t } from "../i18n";
import { entryProblems, readEntry, writeEntry, type Entry } from "../project/entry";
import { setIniValue } from "../project/ini";
import { identity } from "../project/project";
import { saveProject } from "../project/storage";
import { draftEntry } from "../publish/draft";
import { plannedShots, shotsIn, takeShots } from "../publish/screenshots";
import { StoreError, type Draft, type StoreApi, type StoreState } from "../publish/store";
import type { Workshop } from "./controller";

/** Where the sharing stands: what the page shows at the bottom. */
export type Stage =
  | { kind: "editing" }
  | { kind: "uploading" }
  | { kind: "uploaded"; draft: Draft }
  | { kind: "sending"; draft: Draft }
  | { kind: "sent"; draft: Draft };

export class Share {
  entry: Entry;
  store: StoreState | null = null;
  stage: Stage = { kind: "editing" };
  drafting = false;
  shooting = false;
  error = "";
  private listeners = new Set<() => void>();

  constructor(
    readonly workshop: Workshop,
    private api: StoreApi,
    /** Where the sign-in leads back to: this page. */
    private back: string,
  ) {
    this.entry = readEntry(workshop.files);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed(): void {
    for (const l of this.listeners) l();
  }

  get name(): string {
    return identity(this.workshop.project).name ?? "";
  }

  get shots(): string[] {
    return shotsIn(this.workshop.files);
  }

  /** What still keeps it from the store, in the person's words: the
   *  entry's gaps and the checker's errors. */
  get missing(): string[] {
    const problems = entryProblems(this.entry, this.name).map((p) => t(p.key, p.vars));
    if (this.workshop.findings.some((f) => f.level === "error")) problems.push(t("share.problem.checker"));
    if (this.shots.length === 0) problems.push(t("share.problem.shots"));
    return problems;
  }

  /** On opening: where the store stands, and what is not there yet made
   *  for the author (the entry drafted, the screenshots taken). */
  async open(): Promise<void> {
    void this.refreshStore();
    if (!this.entry.summary) await this.draft();
    if (this.shots.length === 0) await this.retake();
  }

  async refreshStore(): Promise<void> {
    this.store = await this.api.state(this.back);
    this.changed();
  }

  /** The AI writes the entry from the conversation. */
  async draft(): Promise<void> {
    if (this.drafting || !this.workshop.ready) return;
    this.drafting = true;
    this.error = "";
    this.changed();
    try {
      await draftEntry(this.workshop.ai, this.workshop.model, this.workshop.project, this.workshop.toolContext());
      this.entry = readEntry(this.workshop.files);
      await saveProject(this.workshop.project);
    } catch (e) {
      this.error = t("share.error.draft", { message: e instanceof Error ? e.message : String(e) });
    } finally {
      this.drafting = false;
      this.changed();
    }
  }

  /** The screenshots taken again, on every device shown. */
  async retake(): Promise<void> {
    if (this.shooting || !this.workshop.ready) return;
    this.shooting = true;
    this.changed();
    try {
      const shots = plannedShots(this.workshop.profiles, (device, dark) =>
        t(dark ? "share.alt.night" : "share.alt.day", { name: this.name || t("share.alt.plugin"), device }),
      );
      const { kept, tooLarge } = await takeShots(this.workshop.toolContext().emulator, this.workshop.files, shots);
      // Each new picture says what it shows; words the author changed for
      // a picture of the same name stay.
      const alts: Record<string, string> = {};
      for (const shot of shots) if (kept.includes(shot.file)) alts[shot.file] = this.entry.alts[shot.file] || shot.alt;
      this.entry = { ...this.entry, alts };
      this.write();
      if (tooLarge.length) this.error = t("share.error.large", { files: tooLarge.join(", ") });
      await this.workshop.restart();
    } catch (e) {
      this.error = t("share.error.shots", { message: e instanceof Error ? e.message : String(e) });
    } finally {
      this.shooting = false;
      this.changed();
    }
  }

  /** A change of the author's to the entry. */
  update(change: Partial<Entry>): void {
    this.entry = { ...this.entry, ...change };
    this.write();
    this.changed();
  }

  /** The plugin's name, which lives in plugin.ini. */
  rename(name: string): void {
    const ini = this.workshop.files.read("plugin.ini") ?? "";
    this.workshop.files.write("plugin.ini", setIniValue(ini, "plugin", "name", name.replace(/\s+/g, " ")));
    void saveProject(this.workshop.project);
    this.changed();
  }

  /** A screenshot left out of the store. */
  drop(file: string): void {
    this.workshop.files.remove(`store/${file}`);
    const alts = { ...this.entry.alts };
    delete alts[file];
    this.update({ alts });
  }

  private write(): void {
    const problem = writeEntry(this.workshop.files, this.entry);
    if (problem) this.error = problem;
    void saveProject(this.workshop.project);
  }

  /** Uploads it as the store's form does: the store checks it and keeps
   *  a draft, which the author may look at before sending. */
  async upload(): Promise<void> {
    if (this.store?.kind !== "signed-in" || this.missing.length) return;
    const { csrf } = this.store;
    this.stage = { kind: "uploading" };
    this.error = "";
    this.changed();
    try {
      const draft = await this.api.upload({ package: this.workshop.storePackage() }, csrf);
      this.stage = { kind: "uploaded", draft };
    } catch (e) {
      this.stage = { kind: "editing" };
      this.fail(e);
    }
    this.changed();
  }

  /** Back to changing it, after an upload: the next upload makes a new
   *  draft in the store. */
  edit(): void {
    if (this.stage.kind !== "uploaded") return;
    this.stage = { kind: "editing" };
    this.changed();
  }

  /** Sends the draft to the moderators. */
  async send(): Promise<void> {
    if (this.stage.kind !== "uploaded" || this.store?.kind !== "signed-in") return;
    const { draft } = this.stage;
    this.stage = { kind: "sending", draft };
    this.error = "";
    this.changed();
    try {
      await this.api.send(draft.submission, this.store.csrf);
      this.stage = { kind: "sent", draft };
    } catch (e) {
      this.stage = { kind: "uploaded", draft };
      this.fail(e);
    }
    this.changed();
  }

  private fail(e: unknown): void {
    if (e instanceof StoreError) {
      this.error = t(`store.error.${e.code}`, { message: e.message });
      // Signed out meanwhile, or the session ended: ask again.
      if (e.code === "signed-out" || e.code === "expired") void this.refreshStore();
    } else {
      this.error = t("store.error.other", { message: e instanceof Error ? e.message : String(e) });
    }
  }
}
