// PaperPaw's source at a tag or branch for the builder's image:
// builder/paperpaw.tar (git archive of the ref, never the working tree),
// what it is in builder/paperpaw.json, and the sample plugin the image
// builds once in builder/sample.json.
//
//   npm run builder-source -- --repo ../paperpaw --ref plugin-store

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const here = path.resolve(import.meta.dirname, "..");
const option = (name, fallback) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1] : fallback;
};
const repo = path.resolve(option("repo", "../paperpaw"));
const ref = option("ref", "main");
const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" });

const commit = git("rev-parse", ref).trim();
const out = path.join(here, "builder");
execFileSync("git", ["-C", repo, "archive", "--format=tar", "-o", path.join(out, "paperpaw.tar"), commit]);
fs.writeFileSync(path.join(out, "paperpaw.json"), JSON.stringify({ ref, commit, made: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");

// The sample plugin (samples/hello-plugin) as a project of the workshop.
const show = (file) => git("show", `${commit}:${file}`);
const files = {
  "Cargo.toml": { text: '[package]\nname = "hello"\nversion = "0.1.0"\n\n[package.metadata.paperpaw]\nplugin = "Hello"\n\n[dependencies]\npaperpaw-sdk = "0.5"\n' },
  "src/lib.rs": { text: show("samples/hello-plugin/src/lib.rs") },
  "i18n/en.ini": { text: show("samples/hello-plugin/i18n/en.ini") },
  "i18n/de.ini": { text: show("samples/hello-plugin/i18n/de.ini") },
  "how/en.txt": { text: show("samples/hello-plugin/how/en.txt") },
  "how/de.txt": { text: show("samples/hello-plugin/how/de.txt") },
  "plugin/plugin.ini": { text: show("samples/hello-native/plugin/plugin.ini") },
};
fs.writeFileSync(path.join(out, "sample.json"), JSON.stringify(files, null, 2) + "\n");
console.log(`builder: PaperPaw ${ref} (${commit.slice(0, 10)}) in builder/paperpaw.tar`);
