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
//
// With a code signing certificate's thumbprint in WORKSHOP_SIGN_THUMBPRINT
// (the certificate in the user's store, e.g. while SimplySign Desktop is
// logged in; signtool where SIGNTOOL says, else Windows' SDK), PaperPaw's
// programs, the app and the installer are Authenticode-signed first
// (tauri's signCommand), the updater's signature made after, over the
// signed installer, and both checked (scripts/release-local.mjs).

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { bundleSdk } from "./sdk.mjs";
import { checkUpdaterSignature } from "./updater-signature.mjs";

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
// PaperPaw's licence and notices, beside its tools as its release has them.
for (const name of ["LICENSE", "NOTICE"]) {
  const from = join(dirname(emu), name);
  if (existsSync(from)) copyFileSync(from, join(into, name));
  else console.warn(`installer: no ${name} beside ${emu}: PaperPaw's notices are missing from the installer.`);
}
// paperpaw-sign packs plugins with code for the readers (Publish…).
const sign = join(dirname(emu), `paperpaw-sign${exe}`);
if (existsSync(sign)) copyFileSync(sign, join(into, `paperpaw-sign${exe}`));
else console.warn(`installer: no paperpaw-sign beside ${emu}: Publish… cannot pack plugins with code (cargo build --release -p paperpaw-sign).`);

// Authenticode, where a certificate is named: signtool's command for a file.
const thumbprint = process.env.WORKSHOP_SIGN_THUMBPRINT?.trim();
const signtool = thumbprint ? findSigntool() : null;
const signArgs = (file) => ["sign", "/sha1", thumbprint, "/fd", "sha256", "/tr", "http://time.certum.pl", "/td", "sha256", file];
if (thumbprint) {
  for (const name of readdirSync(into).filter((n) => n.endsWith(".exe"))) {
    const signed = spawnSync(signtool, signArgs(join(into, name)), { stdio: "inherit" });
    if (signed.status !== 0) {
      console.error(`installer: ${name} could not be signed: is SimplySign Desktop logged in?`);
      process.exit(1);
    }
  }
}

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
const extra = {};
if (signed) extra.createUpdaterArtifacts = true;
// The app and the installer Authenticode-signed by tauri as it makes
// them, before the updater's signature.
if (thumbprint) extra.windows = { signCommand: { cmd: signtool, args: signArgs("%1") } };
// As a file: on Windows the shell would strip the quotes of inline JSON.
if (Object.keys(extra).length) {
  const updater = join(root, "src-tauri", "target", "updater.conf.json");
  mkdirSync(dirname(updater), { recursive: true });
  writeFileSync(updater, JSON.stringify({ bundle: extra }));
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
// The updater's signature over the installer as it is now, Authenticode
// and all: else installed workshops refuse the update.
const why = checkUpdaterSignature(readFileSync(join(nsis, setup)), signature, conf.plugins.updater.pubkey);
if (why) {
  console.error(`installer: the updater's signature of ${setup}: ${why}`);
  process.exit(1);
}
// The installer Authenticode-signed (the app in it was signed before it
// was packed; the copy in target/ is written again by cargo, unsigned).
if (thumbprint) {
  const checked = spawnSync(signtool, ["verify", "/pa", join(nsis, setup)], { stdio: "inherit" });
  if (checked.status !== 0) {
    console.error(`installer: ${setup} is not Authenticode-signed as it should be`);
    process.exit(1);
  }
}
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

/** signtool: SIGNTOOL, else the newest of Windows' SDK. */
function findSigntool() {
  if (process.env.SIGNTOOL) return process.env.SIGNTOOL;
  const kits = "C:\\Program Files (x86)\\Windows Kits\\10\\bin";
  const versions = existsSync(kits) ? readdirSync(kits).filter((v) => /^10\./.test(v)) : [];
  versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const version of versions.reverse()) {
    const tool = join(kits, version, "x64", "signtool.exe");
    if (existsSync(tool)) return tool;
  }
  console.error("installer: no signtool: install Windows' SDK, or name it in SIGNTOOL.");
  process.exit(1);
}
