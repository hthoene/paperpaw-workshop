// The tools of each kind of plugin, in a fixed order (the order is part
// of the cached prompt: changing it costs a cache write once).

import { control, setFixtures } from "./control";
import { lookupDocs } from "./docs";
import { check, look, press } from "./emulator";
import { setEntry } from "./entry";
import { deleteFile, editFile, listFiles, readFile, writeFile } from "./files";
import { build } from "./build";
import type { WorkshopTool } from "./tool";
import { fetchSample } from "./sample";
import { convertPicture, listUploads, placeFile, viewUpload } from "./uploads";

export const DATA_TOOLS: WorkshopTool<any>[] = [
  listFiles,
  readFile,
  writeFile,
  editFile,
  deleteFile,
  lookupDocs,
  check,
  look,
  press,
  setEntry,
  listUploads,
  viewUpload,
  convertPicture,
  placeFile,
  control,
];

/** The tools for a plugin with code: its files, the docs, the build, the
 *  reader to look and press, and paperpaw-dev's checks of the build. */
export const CODE_TOOLS: WorkshopTool<any>[] = [
  listFiles,
  readFile,
  writeFile,
  editFile,
  deleteFile,
  lookupDocs,
  build,
  look,
  press,
  setEntry,
  check,
  control,
  setFixtures,
  // Last: the order is part of the cached prompt.
  fetchSample,
];
