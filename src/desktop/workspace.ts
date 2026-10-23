// The project the window works on: none until the first message or the
// first file (then a folder is made), one picked from the list, or a new
// one. Saves after every change, only what changed (see folders.ts).

import { shownName, type Kind, type Project } from "../project/project";
import { Uploads } from "../project/uploads";
import { Folders, type FolderApi, type Listed } from "./folders";

export class Workspace {
  readonly folders: Folders;
  project: Project | null = null;
  listed: Listed[] = [];
  private listeners = new Set<() => void>();
  private savedListeners = new Set<(project: Project) => void>();
  private saving: Promise<void> = Promise.resolve();

  constructor(api: FolderApi) {
    this.folders = new Folders(api);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Calls `saved` after each save (the checks run then). */
  afterSave(saved: (project: Project) => void): () => void {
    this.savedListeners.add(saved);
    return () => this.savedListeners.delete(saved);
  }

  private changed(): void {
    this.listeners.forEach((l) => l());
  }

  async refresh(): Promise<void> {
    this.listed = await this.folders.list();
    this.changed();
  }

  /** The name the bar shows: the plugin's own, else its folder's. */
  get name(): string {
    if (!this.project) return "New plugin";
    return shownName(this.project) ?? this.project.key;
  }

  /** What a new plugin will be: with code or without. */
  freshKind: Kind = "data";
  /** The files a plugin with code starts from (PaperPaw's sample). */
  codeSample: Record<string, string> = {};

  /** The project, made now if there is none yet. */
  async ensure(name = "New plugin", kind: Kind = this.freshKind): Promise<Project> {
    if (!this.project) {
      this.project = await this.folders.create(name, kind, kind === "code" ? this.codeSample : {});
      await this.refresh();
    }
    return this.project;
  }

  async open(folder: string): Promise<void> {
    await this.saving;
    this.project = await this.folders.load(folder);
    this.changed();
  }

  /** A project made elsewhere (a plugin imported): a folder of its own,
   *  named after `name`, and opened. */
  async adopt(made: Project, name: string): Promise<Project> {
    await this.saving;
    const project = await this.folders.create(name, made.kind, {}, made.model);
    project.files = { ...made.files };
    this.project = project;
    await this.save();
    await this.refresh();
    return project;
  }

  /** A new plugin (with code or without): no folder until something is
   *  said or added. */
  fresh(kind: Kind = "data"): void {
    this.freshKind = kind;
    this.project = null;
    this.changed();
  }

  /** Renames a project's folder; the one open is opened again under it. */
  async rename(folder: string, name: string): Promise<void> {
    await this.saving;
    const to = await this.folders.api.projectRename(folder, name);
    if (this.project?.key === folder) this.project = await this.folders.load(to);
    await this.refresh();
  }

  /** Puts a project away (its folder stays, in the archive). */
  async archive(folder: string): Promise<void> {
    await this.saving;
    if (this.project?.key === folder) this.project = null;
    await this.folders.api.projectArchive(folder);
    await this.refresh();
  }

  async restore(name: string): Promise<void> {
    await this.folders.api.projectRestore(name);
    await this.refresh();
  }

  /** Moves a project to the system's bin. */
  async trash(folder: string, archived = false): Promise<void> {
    await this.saving;
    if (!archived && this.project?.key === folder) this.project = null;
    await this.folders.api.projectTrash(folder, archived);
    await this.refresh();
  }

  /** Saves the project, one save after the other. */
  save(): Promise<void> {
    const project = this.project;
    if (!project) return this.saving;
    this.saving = this.saving
      .then(() => this.folders.save(project))
      .then(() => {
        this.changed();
        this.savedListeners.forEach((s) => s(project));
      });
    return this.saving;
  }

  /** The drawer's files of the project (made if there is none). */
  async uploads(): Promise<Uploads> {
    const project = await this.ensure();
    return new Uploads(project, this.folders.uploads(), () => void this.save());
  }
}
