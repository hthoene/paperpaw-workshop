// Projects in the browser's IndexedDB: the person's plugins stay on their
// computer, across visits, until they delete them.

import { openDB, type IDBPDatabase } from "idb";

import type { Project } from "./project";

const DB = "paperpaw-workshop";
const STORE = "projects";

let opened: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  opened ??= openDB(DB, 1, {
    upgrade(database) {
      database.createObjectStore(STORE, { keyPath: "key" });
    },
  });
  return opened;
}

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
  await (await db()).delete(STORE, key);
}
