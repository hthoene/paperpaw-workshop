// What the window works with: the project (workspace.ts), the reader
// shown, PaperPaw's checks, and for a project the workshop that runs the
// AI's turns (app/controller.ts, the same as on the web) with PaperPaw's
// own emulator (native.ts). A project is made at the first message; the
// reader runs before, on its own.

import type { Provider } from "../ai/provider";
import { modelName } from "../ai/pricing";
import { Workshop } from "../app/controller";
import type { Handbook } from "../handbook/handbook";
import { browserKit } from "../pictures/kit";
import type { Project } from "../project/project";
import type { Backend } from "./backend";
import { forModel, type Checker } from "./checks";
import { modelFor, offered, savedChoice, type ModelChoice } from "./models";
import { LocalBuilder } from "./builder";
import { NativeEmulator } from "./native";
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
  /** The reader shown, by profile id. */
  profile = "xteink-x4";
  lastTurn: TurnCost | null = null;
  /** What a build of a plugin with code is doing, while it runs. */
  building = "";
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
    private allowed: string[] = [],
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
    const builder = new LocalBuilder(this.backend, () => this.workspace.project?.key, () => this.workspace.save());
    const workshop = new Workshop(project, this.handbook, this.provider, browserKit, this.workspace.folders.uploads(), builder, () => this.workspace.save());
    workshop.chooseModel = (p) => modelFor(savedChoice(), p, p.kind, this.may);
    const shown = this.handbook.profile(this.profile);
    if (shown) workshop.profile = shown;
    this.workshop = workshop;
    this.stopWorkshop = workshop.subscribe(() => this.changed());
    await workshop.attachEmulator(new NativeEmulator(this.backend, () => this.workspace.project, this.checker, () => this.workspace.save()));
    return workshop;
  }

  private detach(): void {
    this.workshop?.detach();
    this.stopWorkshop?.();
    this.workshop = null;
    this.lastTurn = null;
  }

  /** The person's words: the project made if there is none, then one
   *  turn. Whether they reached the model (if not, they are not kept). */
  async send(text: string): Promise<boolean> {
    if (!text.trim() || this.workshop?.busy) return false;
    const project = await this.workspace.ensure();
    const workshop = this.workshop?.project === project ? this.workshop : await this.attach(project);
    const before = project.usage.dollars;
    const model = workshop.model;
    let files = filesNow(project);
    const said = project.messages.length;
    await workshop.send(text);
    this.building = "";
    const heard = project.messages.length > said;
    // A turn that changed the plugin: PaperPaw's checks, and what they
    // find to fix back to the AI, short and without pictures.
    for (let fix = 0; fix < AUTO_FIXES && !workshop.error && filesNow(project) !== files; fix++) {
      // The workshop checked at the end of its turn; else check now.
      const checked = this.checker.checks.state === "done" ? this.checker.checks : await this.checker.plugin(project);
      if (checked.state !== "done" || !checked.found.some((f) => f.level === "error")) break;
      files = filesNow(project);
      workshop.escalated = fix > 0;
      await workshop.send(forModel(checked.found));
    }
    workshop.escalated = false;
    const dollars = project.usage.dollars - before;
    this.lastTurn = dollars > 0 ? { dollars, model: modelName(model) } : null;
    this.changed();
    return heard;
  }

  stop(): void {
    this.workshop?.stop();
  }
}

/** A cost in the person's words: under a cent, cents, dollars. */
export function costText(dollars: number): string {
  const cents = dollars * 100;
  if (cents < 1) return "under a cent";
  if (cents < 1.5) return "1 cent";
  if (cents < 100) return `${Math.round(cents)} cents`;
  return `$${dollars.toFixed(2)}`;
}
