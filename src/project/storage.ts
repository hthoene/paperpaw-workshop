// Projects in the browser's IndexedDB: the person's plugins stay on their
// computer, across visits, until they delete them. The author's uploads
// are kept in a store of their own, by project and name, so saving a
// project (after every round) does not write its pictures again.

import { openDB, type IDBPDatabase } from "idb";

import type { Project } from "./project";
import type { UploadStore } from "./uploads";

const DB = "paperpaw-workshop";
const STORE = "projects";
const UPLOADS = "uploads";

let opened: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  opened ??= openDB(DB, 2, {
    upgrade(database, from) {
      if (from < 1) database.createObjectStore(STORE, { keyPath: "key" });
      if (from < 2) database.createObjectStore(UPLOADS);
    },
  });
  return opened;
}

/** The uploads' bytes, keyed `<project>/<name>`. */
export const browserUploads: UploadStore = {
  async get(project, name) {
    return (await db()).get(UPLOADS, `${project}/${name}`);
  },
  async put(project, name, bytes) {
    await (await db()).put(UPLOADS, bytes, `${project}/${name}`);
  },
  async remove(project, name) {
    await (await db()).delete(UPLOADS, `${project}/${name}`);
  },
};

export async function saveProject(project: Project): Promise<void> {
  await (await db()).put(STORE, project);
}

export async function loadProject(key: string): Promise<Project | undefined> {
  return (await db()).get(STORE, key);
}

export async function listProjects(): Promise<Project[]> {
  const all: Project[] = await (await db()).getAll(STORE);
  return all.sort((a, b) => b.updated.localeCompare(a.updated));
}

export async function deleteProject(key: string): Promise<void> {
  const database = await db();
  await database.delete(UPLOADS, IDBKeyRange.bound(`${key}/`, `${key}/￿`));
  await database.delete(STORE, key);
}
