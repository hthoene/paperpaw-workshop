// One plugin being made, as the workshop page uses it: the project, its
// files, the emulator, the AI turn running, what the checker says. The
// page's components only show this and call it.

import Anthropic from "@anthropic-ai/sdk";

import { runTurn, type Said, type TurnEnd } from "../ai/loop";
import { MODELS, modelName } from "../ai/pricing";
import type { Provider } from "../ai/provider";
import type { Finding } from "../checks/data";
import type { Emulator } from "../emulator/emulator";
import { FrameEmulator } from "../emulator/emulator";
import { canSleep, type Screen } from "../emulator/protocol";
import { SHOWN_PROFILES, type Handbook, type Profile } from "../handbook/handbook";
import { t } from "../i18n";
import { browserKit, type PictureKit } from "../pictures/kit";
import { CARRIED, Files, identity, type Project } from "../project/project";
import { browserUploads, saveProject } from "../project/storage";
import { ADDED, MAX_PICTURES_A_MESSAGE, UploadRefused, Uploads, type UploadStore } from "../project/uploads";
import { pluginZip } from "../project/zip";
import { HttpBuilder, type BuildResult, type Builder } from "../build/client";
import { CODE_TOOLS, DATA_TOOLS } from "../tools/registry";
import type { ToolContext } from "../tools/tool";

export class Workshop {
  readonly files: Files;
  readonly uploads: Uploads;
  /** Uploads the author added to the message being written. */
  attached: string[] = [];
  readonly profiles: Profile[];
  profile: Profile;
  dark = false;
  /** The screen the reader shows: home, or asleep. */
  screen: Screen = "home";
  busy = false;
  /** The AI's words of the round running, as they come. */
  live = "";
  /** The summary of its thinking in the round running, as it comes. */
  thinking = "";
  /** Whether the conversation has grown too long to go on in. */
  long = false;
  /** A plugin with code: its last build. */
  build: BuildResult | undefined;
  error = "";
  findings: Finding[] = [];
  stub = true;
  private emulator: Emulator | undefined;
  private frameEmulator: FrameEmulator | undefined;
  private abort: AbortController | undefined;
  private listeners = new Set<() => void>();

  constructor(
    readonly project: Project,
    readonly handbook: Handbook,
    private provider: Provider,
    readonly pictures: PictureKit = browserKit,
    store: UploadStore = browserUploads,
    /** Where plugins with code are built. */
    private builder: Builder = new HttpBuilder(),
  ) {
    this.files = new Files(project, () => void this.sync());
    this.uploads = new Uploads(project, store, () => {
      void saveProject(project);
      this.changed();
    });
    this.profiles = SHOWN_PROFILES.map((id) => handbook.profile(id)).filter((p): p is Profile => !!p);
    this.profile = this.profiles[0]!;
  }


  get model(): string {
    return this.project.kind === "code" ? MODELS.code : MODELS.data;
  }

  get code(): boolean {
    return this.project.kind === "code";
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
    this.frameEmulator?.dispose();
    this.frameEmulator = emulator;
    this.emulator = emulator;
    await this.restart();
    // A plugin with code: its last build's module, while the builder keeps it.
    if (this.code && this.project.module) {
      await emulator.useModule(this.project.module).catch(() => {
        this.project.module = undefined;
      });
    }
    this.stub = emulator.stub;
    await this.refreshFindings();
  }

  /** The plugin as readers install it: without the store's folder. */
  private plugin() {
    const id = identity(this.project).id ?? "plugin";
    // A plugin with code is compiled into the reader's module; its crate's
    // files are no data plugin for the card.
    if (this.code) return { id, files: {} };
    return { id, files: this.files.bytes({ store: false }) };
  }

  /** What the AI's tools work with. */
  toolContext(): ToolContext {
    if (!this.emulator) throw new Error(t("workshop.error.reader"));
    return {
      files: this.files,
      emulator: this.emulator,
      handbook: this.handbook,
      profiles: this.profiles,
      sync: () => this.sync(),
      uploads: this.uploads,
      pictures: this.pictures,
      reader: {
        shown: () => this.profile,
        show: (profile) => this.show(profile),
        useModule: (url) => this.useModule(url),
      },
      builder: this.code ? this.builder : undefined,
      lastBuild: (result) => {
        this.build = result;
        this.changed();
      },
    };
  }

  /** Files the author gives (chosen or dropped): kept as uploads and added
   *  to the message being written. Refusals say why, one by one. */
  async addFiles(files: File[]): Promise<void> {
    this.error = "";
    for (const file of files) {
      if (this.attached.length >= MAX_PICTURES_A_MESSAGE) {
        this.error = t("upload.refused.message", { n: MAX_PICTURES_A_MESSAGE });
        break;
      }
      try {
        const info = await this.uploads.add(file.name, new Uint8Array(await file.arrayBuffer()), (b, type) => this.pictures.size(b, type));
        this.attached.push(info.name);
      } catch (e) {
        this.error = e instanceof UploadRefused ? t(e.key, e.vars) : t("upload.refused.broken", { name: file.name });
      }
    }
    this.changed();
  }

  /** Takes an upload off the message being written (it stays uploaded). */
  leaveOut(name: string): void {
    this.attached = this.attached.filter((n) => n !== name);
    this.changed();
  }

  /** The person's words with what they attached: each picture as the AI
   *  sees it (reduced), each named so the AI can use it with its tools. */
  /** The conversation has grown too long: it goes on in a fresh one. The
   *  files and uploads stay; the earlier conversation is kept to read
   *  back; the next message carries a short summary of it. */
  freshConversation(): void {
    if (this.busy || this.project.messages.length === 0) return;
    const asked = this.project.messages
      .filter((m) => m.role === "user")
      .flatMap((m) => (typeof m.content === "string" ? [m.content] : m.content.filter((b) => b.type === "text").map((b) => b.text)))
      .filter((text) => !text.startsWith(ADDED) && !text.startsWith(CARRIED))
      .map((text) => `- ${text.length > 300 ? `${text.slice(0, 300)} ...` : text}`);
    const files = this.files.list().map((f) => `- ${f.path} (${f.size} bytes)`);
    const uploads = this.uploads.list().map((u) => `- ${u.name}`);
    this.project.carried = [
      `${CARRIED}, which grew too long. What the person asked for in it:`,
      ...asked.slice(-20),
      "",
      "The plugin's files now (read them with read_file before changing them):",
      ...(files.length ? files : ["(none)"]),
      ...(uploads.length ? ["", "The person's uploads (list_uploads, view_upload):", ...uploads] : []),
    ].join("\n");
    (this.project.earlier ??= []).push(this.project.messages);
    this.project.messages = [];
    this.project.lastPrompt = 0;
    this.project.picturesShown = 0;
    this.long = false;
    this.error = "";
    void saveProject(this.project);
    this.changed();
  }

  private async said(text: string): Promise<Said> {
    const carried: Anthropic.ContentBlockParam[] = this.project.carried ? [{ type: "text", text: this.project.carried }] : [];
    if (this.attached.length === 0) return carried.length ? [...carried, { type: "text", text }] : text;
    const pictures = this.attached.filter((n) => this.uploads.info(n)?.kind === "picture");
    if (pictures.length > this.uploads.showable) throw new Error(t("upload.refused.shown", { n: this.uploads.showable }));
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const name of this.attached) {
      const info = this.uploads.info(name);
      if (!info) continue;
      if (info.kind === "picture") {
        const picture = await this.pictures.forAi((await this.uploads.read(name))!, info.type);
        blocks.push({ type: "image", source: { type: "base64", media_type: picture.mediaType, data: picture.data } });
        blocks.push({ type: "text", text: `${ADDED} picture "${name}" (${info.width} x ${info.height} pixels).` });
      } else {
        blocks.push({ type: "text", text: `${ADDED} ${info.kind} "${name}" (${info.bytes} bytes).` });
      }
    }
    this.uploads.shown(pictures.length);
    blocks.push({ type: "text", text });
    return [...carried, ...blocks];
  }

  /** Whether the reader is there to take screenshots. */
  get ready(): boolean {
    return !!this.emulator;
  }

  /** Who answers the AI's requests, for the share page's draft. */
  get ai(): Provider {
    return this.provider;
  }

  async restart(): Promise<void> {
    try {
      await this.emulator?.start(this.profile, this.dark, this.plugin(), this.screen);
    } catch (e) {
      // The reader stopped (PaperPaw panicked, or ran out of memory) and
      // was started again: say so.
      this.screen = "home";
      this.error = e instanceof Error ? e.message : String(e);
    }
    this.changed();
  }

  async show(profile: Profile, dark = this.dark, screen = this.screen): Promise<void> {
    this.profile = profile;
    this.dark = dark;
    // Asleep is PaperPaw's own sleep screen, on readers with a power
    // button; Android readers sleep by themselves.
    this.screen = canSleep(profile) ? screen : "home";
    await this.restart();
  }

  async press(name: string, long = false): Promise<void> {
    try {
      await this.emulator?.input({ kind: "button", name, long });
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      this.changed();
    }
  }

  async sync(): Promise<void> {
    await this.emulator?.setFiles(this.plugin());
  }

  /** The reader runs a build's module (or the standard one, `null`). */
  async useModule(url: string | null): Promise<void> {
    await this.emulator?.useModule(url);
    this.project.module = url ?? undefined;
    void saveProject(this.project);
  }

  async refreshFindings(): Promise<void> {
    if (!this.emulator) return;
    if (this.code) {
      // A plugin with code: what the compiler said in its last build (the
      // checks of code plugins in the browser come with PaperPaw's shell).
      this.findings = (this.build?.diagnostics ?? []).map((d) => ({
        check: "build",
        level: d.level,
        place: d.file ? `${d.file}${d.line ? `:${d.line}` : ""}` : "(build)",
        message: d.message,
      }));
      this.changed();
      return;
    }
    this.findings = Object.keys(this.project.files).length ? await this.emulator.check() : [];
    this.changed();
  }

  /** The person's words to the AI: one turn, as many rounds as it takes. */
  async send(text: string): Promise<void> {
    if (this.busy || !text.trim() || !this.emulator) return;
    let said: Said;
    try {
      said = await this.said(text.trim());
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      this.changed();
      return;
    }
    this.attached = [];
    this.project.carried = undefined;
    this.busy = true;
    this.error = "";
    this.live = "";
    this.thinking = "";
    this.abort = new AbortController();
    this.changed();
    let end: TurnEnd | undefined;
    try {
      end = await runTurn(
        {
          provider: this.provider,
          project: this.project,
          tools: this.code ? CODE_TOOLS : DATA_TOOLS,
          handbook: this.handbook,
          prompt: this.handbook.promptFor(this.project.kind),
          context: this.toolContext(),
          model: this.model,
          // Rust against an SDK the model has not seen: more thought.
          effort: this.code ? "high" : "medium",
        },
        said,
        {
          onText: (d) => {
            this.live += d;
            this.changed();
          },
          onThinking: (d) => {
            this.thinking += d;
            this.changed();
          },
          onRound: () => {
            this.live = "";
            this.thinking = "";
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
      this.thinking = "";
      await saveProject(this.project);
      await this.refreshFindings();
    }
    if (end === "refusal") this.error = t("workshop.error.refusal");
    if (end === "too_long") {
      this.error = t("workshop.error.long");
      this.long = true;
    }
    if (end === "limit") this.error = t("workshop.limit");
    if (end === "cut") this.error = t("workshop.error.cut");
    this.changed();
  }

  stop(): void {
    this.abort?.abort();
  }

  /** The page goes: a turn running stops, the reader's messages end. */
  detach(): void {
    this.stop();
    this.frameEmulator?.dispose();
    this.frameEmulator = undefined;
    this.emulator = undefined;
  }

  /** The plugin as a ZIP for a reader's card: without the store's folder. */
  zip(): Blob {
    const id = identity(this.project).id ?? "plugin";
    return new Blob([pluginZip(id, this.files.bytes({ store: false })) as BlobPart], { type: "application/zip" });
  }

  /** The plugin as the store's form takes it: with its entry and
   *  screenshots in `store/`. */
  storePackage(): Uint8Array {
    return pluginZip(identity(this.project).id ?? "plugin", this.files.bytes());
  }
}

/** What went wrong, in the person's words: Anthropic's errors each in
 *  their own, the rest as they are. */
export function message(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return t("workshop.error.key");
  if (e instanceof Anthropic.RateLimitError) return t("workshop.error.rate");
  if (e instanceof Anthropic.APIConnectionError) return t("workshop.error.network");
  if (e instanceof Anthropic.APIError) {
    const said = e.message.toLowerCase();
    if (said.includes("credit balance") || said.includes("billing")) return t("workshop.error.billing");
    if (e.status === 529 || said.includes("overloaded")) return t("workshop.error.busy");
    if (e.status !== undefined && e.status >= 500) return t("workshop.error.server");
    if (e.status === 413) return t("workshop.error.long");
  }
  return t("workshop.error.other", { message: e instanceof Error ? e.message : String(e) });
}
