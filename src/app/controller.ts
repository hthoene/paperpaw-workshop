// One plugin being made, as the workshop page uses it: the project, its
// files, the emulator, the AI turn running, what the checker says. The
// page's components only show this and call it.

import Anthropic from "@anthropic-ai/sdk";

import { runTurn, type TurnEnd } from "../ai/loop";
import { MODELS, modelName } from "../ai/pricing";
import type { Provider } from "../ai/provider";
import type { Finding } from "../checks/data";
import type { Emulator } from "../emulator/emulator";
import { FrameEmulator } from "../emulator/emulator";
import { SHOWN_PROFILES, type Handbook, type Profile } from "../handbook/handbook";
import { t } from "../i18n";
import { Files, identity, type Project } from "../project/project";
import { saveProject } from "../project/storage";
import { pluginZip } from "../project/zip";
import { DATA_TOOLS } from "../tools/registry";

export class Workshop {
  readonly files: Files;
  readonly profiles: Profile[];
  profile: Profile;
  dark = false;
  busy = false;
  /** The AI's words of the round running, as they come. */
  live = "";
  error = "";
  findings: Finding[] = [];
  stub = true;
  private emulator: Emulator | undefined;
  private abort: AbortController | undefined;
  private listeners = new Set<() => void>();

  constructor(
    readonly project: Project,
    readonly handbook: Handbook,
    private provider: Provider,
  ) {
    this.files = new Files(project, () => void this.sync());
    this.profiles = SHOWN_PROFILES.map((id) => handbook.profile(id)).filter((p): p is Profile => !!p);
    this.profile = this.profiles[0]!;
  }


  get model(): string {
    return MODELS.data;
  }

  get modelLabel(): string {
    return modelName(this.model);
  }

  /** Who pays, in the person's words. */
  get who(): string {
    return t(this.provider.label);
  }

  /** Whether the answers are a recording played back. */
  get example(): boolean {
    return this.provider.label === "provider.example";
  }

  get name(): string {
    return identity(this.project).name ?? "";
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private changed(): void {
    for (const l of this.listeners) l();
  }

  /** The emulator in `frame`, started on the device shown. */
  async attach(frame: HTMLIFrameElement): Promise<void> {
    const emulator = new FrameEmulator(frame, this.handbook.registry);
    this.emulator = emulator;
    await this.restart();
    this.stub = emulator.stub;
    await this.refreshFindings();
  }

  private plugin() {
    return { id: identity(this.project).id ?? "plugin", files: this.files.bytes() };
  }

  async restart(): Promise<void> {
    await this.emulator?.start(this.profile, this.dark, this.plugin());
    this.changed();
  }

  async show(profile: Profile, dark = this.dark): Promise<void> {
    this.profile = profile;
    this.dark = dark;
    await this.restart();
  }

  async press(name: string): Promise<void> {
    await this.emulator?.input({ kind: "button", name });
  }

  async sync(): Promise<void> {
    await this.emulator?.setFiles(this.plugin());
  }

  async refreshFindings(): Promise<void> {
    if (!this.emulator) return;
    this.findings = Object.keys(this.project.files).length ? await this.emulator.check() : [];
    this.changed();
  }

  /** The person's words to the AI: one turn, as many rounds as it takes. */
  async send(text: string): Promise<void> {
    if (this.busy || !text.trim() || !this.emulator) return;
    const emulator = this.emulator;
    this.busy = true;
    this.error = "";
    this.live = "";
    this.abort = new AbortController();
    this.changed();
    let end: TurnEnd | undefined;
    try {
      end = await runTurn(
        {
          provider: this.provider,
          project: this.project,
          tools: DATA_TOOLS,
          handbook: this.handbook,
          context: {
            files: this.files,
            emulator,
            handbook: this.handbook,
            profiles: this.profiles,
            sync: () => this.sync(),
          },
          model: this.model,
          effort: "medium",
        },
        text.trim(),
        {
          onText: (d) => {
            this.live += d;
            this.changed();
          },
          onRound: () => {
            this.live = "";
            void saveProject(this.project);
            this.changed();
          },
        },
        this.abort.signal,
      );
    } catch (e) {
      this.error = message(e);
    } finally {
      this.busy = false;
      this.live = "";
      await saveProject(this.project);
      await this.refreshFindings();
    }
    if (end === "refusal") this.error = t("workshop.error.refusal");
    if (end === "too_long") this.error = t("workshop.error.long");
    if (end === "limit") this.error = t("workshop.limit");
    this.changed();
  }

  stop(): void {
    this.abort?.abort();
  }

  /** The plugin as a ZIP, for the card or the store. */
  zip(): Blob {
    const id = identity(this.project).id ?? "plugin";
    return new Blob([pluginZip(id, this.files.bytes()) as BlobPart], { type: "application/zip" });
  }
}

/** What went wrong, in the person's words. */
export function message(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return t("workshop.error.key");
  if (e instanceof Anthropic.RateLimitError) return t("workshop.error.rate");
  if (e instanceof Anthropic.APIConnectionError) return t("workshop.error.network");
  return t("workshop.error.other", { message: e instanceof Error ? e.message : String(e) });
}
