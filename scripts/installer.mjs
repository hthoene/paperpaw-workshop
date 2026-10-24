// The Windows installer, with PaperPaw's emulator in it: paperpaw-emu,
// paperpaw-dev and paperpaw-sign of the PaperPaw build `PAPERPAW_EMU` names are copied into
// src-tauri/resources/emulator/ (the installer puts them beside the app),
// and what they are is said beside them (version.json). For a PaperPaw in
// work, its SDK too, from the checkout the emulator was built in
// (`PAPERPAW_SRC`, else two folders above it): src-tauri/resources/sdk/,
// see sdk.mjs. Then `tauri build`.
//
//   PAPERPAW_EMU=…/target/release/paperpaw-emu.exe npm run app:installer
//
// With the update key in TAURI_SIGNING_PRIVATE_KEY (its password, if any,
// in TAURI_SIGNING_PRIVATE_KEY_PASSWORD), the installer is also signed for
// the app's updater, and `dist-installer/` gets what a release of the
// workshop attaches: the installer, its signature and `latest.json`,
// which installed workshops ask for (tauri.conf.json's updater). The key
// is never in the repository.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { bundleSdk } from "./sdk.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const into = join(root, "src-tauri", "resources", "emulator");
const exe = process.platform === "win32" ? ".exe" : "";

const emu = process.env.PAPERPAW_EMU;
if (!emu || !existsSync(emu)) {
  console.error("installer: PAPERPAW_EMU names no paperpaw-emu. Build PaperPaw's emulator and point PAPERPAW_EMU at it.");
  process.exit(1);
}
const dev = join(dirname(emu), `paperpaw-dev${exe}`);
if (!existsSync(dev)) {
  console.error(`installer: no paperpaw-dev beside ${emu}. Build it too (cargo build --release -p paperpaw-dev).`);
  process.exit(1);
}

// Only what this build brings: the README stays.
for (const name of readdirSync(into)) if (name !== "README.md") rmSync(join(into, name), { recursive: true });
copyFileSync(emu, join(into, `paperpaw-emu${exe}`));
copyFileSync(dev, join(into, `paperpaw-dev${exe}`));
// paperpaw-sign packs plugins with code for the readers (Publish…).
const sign = join(dirname(emu), `paperpaw-sign${exe}`);
if (existsSync(sign)) copyFileSync(sign, join(into, `paperpaw-sign${exe}`));
else console.warn(`installer: no paperpaw-sign beside ${emu}: Publish… cannot pack plugins with code (cargo build --release -p paperpaw-sign).`);

// What it is, as it says when it starts (`ready`: PaperPaw's version, its
// fingerprint, the compiler of plugins with code).
const started = spawnSync(emu, ["--stdio"], { input: '{"op":"quit"}\n', encoding: "utf8", timeout: 30_000 });
const ready = (started.stdout ?? "")
  .split("\n")
  .map((line) => { try { return JSON.parse(line); } catch { return null; } })
  .find((e) => e?.event === "ready");
if (!ready) {
  console.error(`installer: ${emu} did not start: ${(started.stderr ?? "").trim()}`);
  process.exit(1);
}
const said = { paperpaw: ready.paperpaw, protocol: ready.protocol, fingerprint: ready.fingerprint, toolchain: ready.toolchain };
writeFileSync(join(into, "version.json"), `${JSON.stringify(said, null, 2)}\n`);
console.log(`installer: PaperPaw ${ready.paperpaw} (${ready.fingerprint})`);

// A PaperPaw in work (`-dev`): its SDK is not on crates.io, so it comes
// along. A release, betas included, is there: plugins name its version.
const sdk = join(root, "src-tauri", "resources", "sdk");
const readme = readFileSync(join(sdk, "README.md"), "utf8");
for (const name of readdirSync(sdk)) if (name !== "README.md") rmSync(join(sdk, name), { recursive: true });
if (ready.paperpaw.includes("-dev")) {
  const checkout = process.env.PAPERPAW_SRC ?? resolve(dirname(emu), "..", "..");
  const crates = bundleSdk(checkout, sdk, ready.paperpaw);
  // The README stays: bundleSdk empties the folder.
  writeFileSync(join(sdk, "README.md"), readme);
  console.log(`installer: its SDK from ${checkout} (${crates.length} crates)`);
}

// Signed for the updater only with the key at hand.
const signed = !!process.env.TAURI_SIGNING_PRIVATE_KEY;
if (!signed) console.warn("installer: no TAURI_SIGNING_PRIVATE_KEY: the installer is not signed for updates, and no latest.json is made.");
const args = ["tauri", "build"];
// As a file: on Windows the shell would strip the quotes of inline JSON.
if (signed) {
  const updater = join(root, "src-tauri", "target", "updater.conf.json");
  mkdirSync(dirname(updater), { recursive: true });
  writeFileSync(updater, JSON.stringify({ bundle: { createUpdaterArtifacts: true } }));
  args.push("--config", updater);
}
const build = spawnSync("npx", args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
if (build.status !== 0 || !signed) process.exit(build.status ?? 1);

// What a release attaches, under names without spaces (GitHub would
// change them): the installer, its signature, and latest.json.
const conf = JSON.parse(readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8"));
const version = conf.version;
const nsis = join(root, "src-tauri", "target", "release", "bundle", "nsis");
const setup = readdirSync(nsis).find((n) => n.includes(`_${version}_`) && n.endsWith("-setup.exe"));
if (!setup || !existsSync(join(nsis, `${setup}.sig`))) {
  console.error(`installer: no signed installer of ${version} in ${nsis}`);
  process.exit(1);
}
const out = join(root, "dist-installer");
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
const name = `paperpaw-workshop-${version}-setup.exe`;
copyFileSync(join(nsis, setup), join(out, name));
const signature = readFileSync(join(nsis, `${setup}.sig`), "utf8").trim();
writeFileSync(join(out, `${name}.sig`), `${signature}\n`);
const latest = {
  version,
  notes: `PaperPaw Workshop ${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature,
      url: `https://github.com/hthoene/paperpaw-workshop/releases/download/v${version}/${name}`,
    },
  },
};
writeFileSync(join(out, "latest.json"), `${JSON.stringify(latest, null, 2)}\n`);
console.log(`installer: ${out}: ${name}, its signature, latest.json (attach all three to the release v${version})`);
