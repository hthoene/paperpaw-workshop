// The Windows installer, with PaperPaw's emulator in it: paperpaw-emu,
// paperpaw-dev and paperpaw-sign of the PaperPaw build `PAPERPAW_EMU` names are copied into
// src-tauri/resources/emulator/ (the installer puts them beside the app),
// and what they are is said beside them (version.json); then `tauri build`.
//
//   PAPERPAW_EMU=…/target/release/paperpaw-emu.exe npm run app:installer

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

const build = spawnSync("npx", ["tauri", "build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
process.exit(build.status ?? 1);
