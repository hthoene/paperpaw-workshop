// What the window works with: the project (workspace.ts), the reader
// shown, PaperPaw's checks, and for a project the workshop that runs the
// AI's turns (app/controller.ts, the same as on the web) with PaperPaw's
// own emulator (native.ts). A project is made at the first message; the
// reader runs before, on its own. After every answer that changed the
// plugin, its state is kept in the project's history (history.ts).

import type { Provider } from "../ai/provider";
import { MODELS, modelName } from "../ai/pricing";
import { Workshop } from "../app/controller";
import type { Handbook } from "../handbook/handbook";
import { browserKit } from "../pictures/kit";
import { importPlugin, zipEntries } from "../project/import";
import { identity, shownName, type Project } from "../project/project";
import type { Backend } from "./backend";
import { forModel, shown, type Checker } from "./checks";
import { modelFor, offered, savedChoice, type ModelChoice } from "./models";
import { LocalBuilder } from "./builder";
import { thisMonth, turnOf } from "./costs";
import { fromBase64 } from "./folders";
import { NO_HISTORY, today, type History } from "./history";
import { decideKind } from "./kind";
import { savedLength } from "./length";
import { lookRules, savedLooks } from "./looks";
import { NativeEmulator } from "./native";
import { base64Bytes, keepShot } from "../publish/screenshots";
import { pictureOf, WORKSHOP_SCREENS } from "./pictures";
import type { Workspace } from "./workspace";

/** How often one message of the person gives the AI the checks'
 *  findings by itself: the second time with more thought. */
export const AUTO_FIXES = 2;

/** The plugin's files as they are, to see whether a turn changed them. */
function filesNow(project: Project): string {
  return Object.entries(project.files)
    .map(([path, content]) => `${path}=${typeof content === "string" ? content : content.length}`)
    .sort()
    .join("\n");
}

/** What the last turn cost, and with which model. */
export interface TurnCost {
  dollars: number;
  model: string;
}

export class Desk {
  workshop: Workshop | null = null;
  /** The reader shown, by profile id: the X4 Pro first, which takes
   *  touches as well as buttons. */
  profile = "xteink-x4-pro";
  lastTurn: TurnCost | null = null;
  /** What a build of a plugin with code is doing, while it runs. */
  building = "";
  /** Microsoft's C++ build tools: missing (offered), being installed, or
   *  there (nothing to say). */
  buildTools: "missing" | "installing" | "installed" | "failed" | "" = "";
  buildToolsSaid = "";
  /** The open project's history. */
  history: History = NO_HISTORY;
  /** A state of the history the reader shows in place of the project,
   *  while the person looks at it before going back to it. */
  previewing: { id: string; ready: boolean; problem: string } | null = null;
  /** The person is asked whether the AI may fetch from a site. */
  asking: { host: string; answer(choice: "once" | "always" | "no"): void } | null = null;
  private listeners = new Set<() => void>();
  private stopWorkshop: (() => void) | undefined;

  constructor(
    readonly workspace: Workspace,
    private backend: Backend,
    readonly checker: Checker,
    private handbook: Handbook,
    private provider: Provider,
    /** Which key: Claude's own, or PaperPaw's (its proxy decides the models). */
    private key: "claude" | "paperpaw" | null,
    /** The models a PaperPaw key may use, as its proxy says. */
    public allowed: string[] = [],
  ) {
    workspace.subscribe(() => void this.follow());
    workspace.codeSample = handbook.codeSample;
    void backend.onBuildProgress((text) => {
      this.building = text;
      this.changed();
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed(): void {
    this.listeners.forEach((l) => l());
  }

  /** A PaperPaw key's budget and what it spent, as its proxy says. */
  keyBudget: { budget: number; spent: number } | null = null;

  /** What this plugin and this month came to, for the bar. */
  get spent(): { plugin: number; month: number } {
    const project = this.workspace.project;
    const others = this.workspace.listed.filter((l) => l.folder !== project?.key).reduce((n, l) => n + (l.month ?? 0), 0);
    return { plugin: project?.usage.dollars ?? 0, month: others + thisMonth(project?.turns ?? []) };
  }

  /** What a PaperPaw key allows, as its proxy says (GET /v1/key). */
  async askProxy(base: string, apiKey: string): Promise<void> {
    if (this.key !== "paperpaw") return;
    try {
      const answer = await fetch(`${base}/v1/key`, { headers: { "x-api-key": apiKey } });
      if (!answer.ok) return;
      const info = (await answer.json()) as { models?: unknown; budget?: unknown; spent?: unknown };
      if (Array.isArray(info.models)) this.allowed = info.models.filter((m): m is string => typeof m === "string");
      if (typeof info.budget === "number" && typeof info.spent === "number") this.keyBudget = { budget: info.budget, spent: info.spent };
      this.changed();
    } catch {
      // Not reached: Automatic, as before.
    }
  }

  /** The models one may pick with this key. */
  get may(): ModelChoice[] {
    return offered(this.key, this.allowed);
  }

  /** The reader shown: the workshop's while it has one. */
  get shown(): string {
    return this.workshop?.profile.id ?? this.profile;
  }

  /** Shows the reader `id`. */
  async choose(id: string): Promise<void> {
    this.profile = id;
    const profile = this.handbook.profile(id);
    if (this.workshop && profile) await this.workshop.show(profile);
    else await this.backend.emulatorStart(id);
    this.changed();
  }

  /** The workshop for the project open, made when it changes. */
  private async follow(): Promise<void> {
    const project = this.workspace.project;
    if (this.workshop?.project === project) return;
    this.detach();
    if (project) await this.attach(project);
    this.changed();
  }

  private async attach(project: Project): Promise<Workshop> {
    const builder = new LocalBuilder(this.backend, () => this.workspace.project?.key, () => this.workspace.save(), () => {
      this.buildTools = "missing";
      this.changed();
    });
    const workshop = new Workshop(project, this.handbook, this.provider, browserKit, this.workspace.folders.uploads(), builder, () => this.workspace.save());
    workshop.chooseModel = (p) => modelFor(savedChoice(), p, p.kind, this.may);
    // PaperPaw's emulator here fetches from the internet as a reader does.
    workshop.withoutTools = ["set_fixtures"];
    workshop.samples = { consent: (host) => this.consent(project, host), fetch: (url) => this.backend.sampleFetch(url) };
    workshop.optimise = (upload, to, shape) => pictureOf(project, workshop.uploads, upload, to, WORKSHOP_SCREENS, this.backend, { shape });
    const shown = this.handbook.profile(this.profile);
    if (shown) workshop.profile = shown;
    this.workshop = workshop;
    this.stopWorkshop = workshop.subscribe(() => this.changed());
    void this.keep(() => this.backend.historyList(project.key));
    await workshop.attachEmulator(new NativeEmulator(this.backend, () => this.workspace.project, this.checker, () => this.workspace.save()));
    return workshop;
  }

  private detach(): void {
    this.workshop?.detach();
    this.stopWorkshop?.();
    this.workshop = null;
    this.lastTurn = null;
    this.history = NO_HISTORY;
    this.previewing = null;
  }

  /** The history as `asked` gives it; never in the way of the work. */
  private async keep(asked: () => Promise<History>): Promise<void> {
    try {
      this.history = await asked();
    } catch {
      // Kept as before: the next state is kept again.
    }
    this.changed();
  }

  /** The person's words: the project made if there is none, then one
   *  turn. Whether they reached the model (if not, they are not kept). */
  async send(text: string): Promise<boolean> {
    if (!text.trim() || this.workshop?.busy || this.previewing) return false;
    // A new plugin of no kind yet: its first words say which.
    const kind = !this.workspace.project && this.workspace.freshKind === "auto" ? await decideKind(this.provider, text, MODELS.data) : undefined;
    const project = await this.workspace.ensure(undefined, kind);
    const workshop = this.workshop?.project === project ? this.workshop : await this.attach(project);
    const before = project.usage.dollars;
    const usage = { ...project.usage };
    const model = workshop.model;
    let files = filesNow(project);
    const started = files;
    const conversation = project.earlier?.length ?? 0;
    // The state before the first change, if the history has none yet.
    await this.keep(() => this.backend.historyBegin(project.key, project.messages.length, conversation));
    const said = project.messages.length;
    // How much it may look at the screen, as the person chose.
    const looks = lookRules(savedLooks());
    workshop.withoutTools = ["set_fixtures", ...looks.without];
    workshop.perTurn = looks.perTurn;
    workshop.notes = looks.notes;
    workshop.length = savedLength();
    await workshop.send(text);
    this.building = "";
    // Heard: the conversation grew, or went on in a fresh one.
    const heard = project.messages.length > said || ((project.earlier?.length ?? 0) > conversation && project.messages.length > 0);
    // A turn that changed the plugin: PaperPaw's checks, and what they
    // find to fix back to the AI, short and without pictures.
    for (let fix = 0; fix < AUTO_FIXES && !workshop.error && filesNow(project) !== files; fix++) {
      // The workshop checked at the end of its turn; else check now.
      const checked = this.checker.checks.state === "done" ? this.checker.checks : await this.checker.plugin(project);
      const found = checked.state === "done" ? shown(checked.found, project.ignoredChecks) : [];
      if (!found.some((f) => f.level === "error")) break;
      files = filesNow(project);
      workshop.escalated = fix > 0;
      await workshop.send(forModel(found));
    }
    workshop.escalated = false;
    const dollars = project.usage.dollars - before;
    this.lastTurn = dollars > 0 ? { dollars, model: modelName(model) } : null;
    if (heard) {
      (project.turns ??= []).push(turnOf(usage, project.usage, project.messages.length, project.earlier?.length ?? 0, modelName(model)));
      if (this.keyBudget) this.keyBudget.spent += dollars;
      void this.workspace.save();
    }
    // The plugin as this answer left it, to go back to.
    if (filesNow(project) !== started) {
      await this.workspace.save();
      await this.keep(() => this.backend.historySnapshot(project.key, "answer", project.messages.length, project.earlier?.length ?? 0));
    }
    this.changed();
    return heard;
  }

  /** Whether the person lets the AI fetch an example from `host`: always
   *  for this project if they said so, else asked in the conversation. */
  private consent(project: Project, host: string): Promise<boolean> {
    if (project.fetchAllowed?.includes(host)) return Promise.resolve(true);
    return new Promise((resolve) => {
      this.asking = {
        host,
        answer: (choice) => {
          this.asking = null;
          if (choice === "always") {
            (project.fetchAllowed ??= []).push(host);
            void this.workspace.save();
          }
          resolve(choice !== "no");
          this.changed();
        },
      };
      this.changed();
    });
  }

  /** Shows state `id` of the history on the reader, the project left as
   *  it is (a plugin with code built as it was first). */
  async preview(id: string): Promise<void> {
    const project = this.workspace.project;
    if (!project || this.workshop?.busy) return;
    this.previewing = { id, ready: false, problem: "" };
    this.changed();
    try {
      await this.backend.historyPreview(project.key, id);
      if (this.previewing?.id === id) this.previewing.ready = true;
    } catch (e) {
      if (this.previewing?.id === id) this.previewing.problem = e instanceof Error ? e.message : String(e);
    }
    this.building = "";
    this.changed();
  }

  /** The reader shows the project again. */
  async endPreview(): Promise<void> {
    const project = this.workspace.project;
    this.previewing = null;
    this.changed();
    if (project) await this.backend.emulatorSync(project.key).catch(() => {});
  }

  /** The project's files back as state `id` has them; that is kept as a
   *  state of its own, so going forward again is the same step. */
  async restore(id: string): Promise<void> {
    const project = this.workspace.project;
    if (!project || this.workshop?.busy) return;
    await this.workspace.save();
    this.history = await this.backend.historyRestore(project.key, id);
    this.previewing = null;
    // Opened again from its folder: the files as they are now.
    await this.workspace.open(project.key);
    await this.backend.emulatorSync(project.key).catch(() => {});
    this.changed();
  }

  /** Keeps what reader `id` shows now (`dark`: in night mode) as one of
   *  the store's screenshots, after the others; what to say. */
  async storeShot(id: string, dark: boolean): Promise<string> {
    const project = this.workspace.project;
    const profile = this.handbook.profile(id);
    if (!project || !this.workshop || !profile) return "There is no plugin yet.";
    const context = this.workshop.toolContext();
    await context.sync();
    const shot = await context.emulator.screenshot(profile, dark);
    const device = profile.name.replace(/^Xteink\s+/, "");
    const alt = `${shownName(project) ?? "The plugin"} on the ${device}${dark ? " in night mode" : ""}`;
    const kept = keepShot(this.workshop.files, base64Bytes(shot.png), profile, dark, alt);
    if (!kept.ok) return `Not kept: ${kept.why}.`;
    await this.workspace.save();
    this.changed();
    return `Kept as ${kept.file}. Publish shows the store's screenshots.`;
  }

  /** Marks the project's state now as `version`, packed for the store. */
  async markPublished(version: string): Promise<void> {
    const project = this.workspace.project;
    if (project) await this.keep(() => this.backend.historyMark(project.key, version, today()));
  }

  /** Exports the open project, or all of them, into one file the person
   *  chooses; what to say (nothing if they chose no file). */
  async exportProjects(which: "this" | "all"): Promise<string> {
    const project = this.workspace.project;
    if (which === "this" && !project) return "Open a plugin to export it.";
    await this.workspace.save();
    const path = await this.backend.askSaveExport(which === "this" ? `${project!.key} (PaperPaw Workshop).zip` : `PaperPaw Workshop ${today()}.zip`);
    if (!path) return "";
    const count = await this.backend.projectsExport(which === "this" ? [project!.key] : [], path);
    const what = which === "this" ? `"${this.workspace.name}"` : count === 1 ? "1 plugin" : `${count} plugins`;
    return `Exported ${what} with ${which === "this" ? "its" : "their"} history and conversation. Your author key is not in it: keep its backup apart.`;
  }

  /** Brings in a file the person chose: an export of the workshop (its
   *  projects come back beside these, under new names if taken) or a
   *  plugin's ZIP (a new project, its history starting there); what to say. */
  async importFile(path: string): Promise<string> {
    const moved = await this.backend.projectsImport(path);
    if (moved) {
      await this.workspace.refresh();
      const first = moved.find(([, archived]) => !archived);
      if (first) await this.workspace.open(first[0]);
      if (moved.length === 1) return `"${moved[0]![0]}" is back, with its history and conversation.`;
      return `${moved.length} plugins are back, with their history and conversations.`;
    }
    const { project: found, taken, skipped } = importPlugin(zipEntries(fromBase64(await this.backend.importRead(path))));
    const project = await this.workspace.adopt(found, shownName(found) ?? identity(found).id ?? "Imported plugin");
    await this.keep(() => this.backend.historySnapshot(project.key, "import"));
    const left = skipped.length ? ` Left out: ${skipped.map((s) => `${s.path} (${s.why})`).join(", ")}.` : "";
    return `Imported ${taken.length === 1 ? "1 file" : `${taken.length} files`}.${left}`;
  }

  /** Installs the build tools, as the person chose. */
  async installBuildTools(): Promise<void> {
    this.buildTools = "installing";
    this.changed();
    try {
      await this.backend.buildToolsInstall();
      this.buildTools = "installed";
      this.buildToolsSaid = "";
    } catch (e) {
      this.buildTools = "failed";
      this.buildToolsSaid = e instanceof Error ? e.message : String(e);
    }
    this.changed();
  }

  stop(): void {
    // A question open: not fetched.
    this.asking?.answer("no");
    this.workshop?.stop();
  }
}
