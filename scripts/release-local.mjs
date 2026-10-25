// A release of the workshop, made on the maintainer's Windows computer:
// GitHub's runners cannot sign it, as the code signing certificate's key
// stays in Certum's cloud (SimplySign Desktop, logged in, puts it into the
// user's certificate store for a while).
//
//   node scripts/release-local.mjs [--dry-run] [--skip-tests]
//
// For the version of src-tauri/tauri.conf.json, whose tag v<version> is
// at HEAD and pushed (CI tests it, .github/workflows/release.yml):
//
// 1. checks what it needs before anything takes long: a clean tree, the
//    tag, signtool, the certificate (thumbprint below), the updater's key
//    (TAURI_SIGNING_PRIVATE_KEY, or the file TAURI_SIGNING_PRIVATE_KEY_PATH
//    names, else ~/.paperpaw/keys/workshop-updater.key; its password in
//    TAURI_SIGNING_PRIVATE_KEY_PASSWORD, else asked, hidden, where the
//    key does not open without one), gh signed in;
// 2. fetches PaperPaw's emulator, paperpaw-dev and paperpaw-sign of the
//    release paperpaw-release.txt names, checked by their signature;
// 3. checks the notices and runs the tests;
// 4. builds the installer (scripts/installer.mjs): PaperPaw's programs,
//    the app and the installer Authenticode-signed, then the updater's
//    signature made over the signed installer, both checked;
// 5. makes the GitHub release of the tag with the installer, its
//    signature and latest.json.
//
// --dry-run signs everything as a release would and checks it, but
// releases nothing: the tree and the tag are not asked for, and
// PAPERPAW_EMU (a build of PaperPaw's own, paperpaw-dev beside it) may
// stand in for the release's programs.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { fetchEmulator } from "./paperpaw-release.mjs";

/** The maintainer's code signing certificate (Certum, open source). */
const THUMBPRINT = "5F3F85728467D093712294D5AF28048C31F2AA4E";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const skipTests = process.argv.includes("--skip-tests");

function fail(message) {
  console.error(`release: ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const done = spawnSync(command, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32" && command === "npx", ...options });
  return { ok: done.status === 0, out: (done.stdout ?? "").trim(), err: (done.stderr ?? "").trim() };
}

function step(what) {
  console.log(`\nrelease: ${what}`);
}

if (process.platform !== "win32") fail("only on Windows: the installer is for Windows and signtool runs there.");

// 1. What it needs, first.
step("checking what the release needs");
const conf = JSON.parse(readFileSync(join(root, "src-tauri", "tauri.conf.json"), "utf8"));
const version = conf.version;
const tag = `v${version}`;
const paperpaw = readFileSync(join(root, "paperpaw-release.txt"), "utf8").trim();
if (!dryRun) {
  if (run("git", ["status", "--porcelain"]).out) fail("the tree has changes: commit them first, the release is made of the tag.");
  const head = run("git", ["rev-parse", "HEAD"]).out;
  const tagged = run("git", ["rev-parse", `${tag}^{commit}`]);
  if (!tagged.ok || tagged.out !== head) fail(`the tag ${tag} is not at HEAD: tag it (git tag ${tag}) and push it (git push origin ${tag}).`);
  if (!run("git", ["ls-remote", "--exit-code", "--tags", "origin", tag]).ok) fail(`the tag ${tag} is not on GitHub: git push origin ${tag}`);
}
const cert = run("powershell", ["-NoProfile", "-Command", `Test-Path Cert:\\CurrentUser\\My\\${THUMBPRINT}`]);
if (cert.out !== "True") fail(`the certificate ${THUMBPRINT} is not in your certificate store: log in to SimplySign Desktop (the token from the SimplySign app), then run this again.`);
const env = { ...process.env, WORKSHOP_SIGN_THUMBPRINT: THUMBPRINT };
if (!env.TAURI_SIGNING_PRIVATE_KEY) {
  const keyFile = env.TAURI_SIGNING_PRIVATE_KEY_PATH ?? join(homedir(), ".paperpaw", "keys", "workshop-updater.key");
  if (!existsSync(keyFile)) fail(`no updater key: set TAURI_SIGNING_PRIVATE_KEY_PATH, or put the key into ${keyFile}.`);
  env.TAURI_SIGNING_PRIVATE_KEY = readFileSync(keyFile, "utf8").trim();
}
// Its password: as given, else none where the key opens without one,
// else asked, never kept.
if (env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD === undefined) {
  env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD = opens("") ? "" : await hidden("The updater key's password: ");
  if (!opens(env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD)) fail("the updater key does not open with that password.");
}
if (!dryRun && !run("gh", ["auth", "status"]).ok) fail("gh is not signed in: gh auth login");
if (!dryRun && run("gh", ["release", "view", tag]).ok) fail(`the release ${tag} exists already.`);

// 2. PaperPaw's programs of its release.
const work = join(tmpdir(), `paperpaw-workshop-release-${version}`);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const bin = join(work, "bin");
if (dryRun && env.PAPERPAW_EMU) {
  step(`dry run: PaperPaw's programs from ${dirname(env.PAPERPAW_EMU)}`);
} else {
  step(`PaperPaw ${paperpaw}: its emulator, checked`);
  const zip = await fetchEmulator(paperpaw, "windows-x64", work).catch((e) => fail(String(e.message ?? e)));
  const expanded = run("powershell", ["-NoProfile", "-Command", `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${bin}'`]);
  if (!expanded.ok) fail(`the emulator's zip could not be unpacked: ${expanded.err}`);
  env.PAPERPAW_EMU = join(bin, "paperpaw-emu.exe");
}
if (!existsSync(join(dirname(env.PAPERPAW_EMU), "paperpaw-sign.exe")) && !dryRun) {
  step("paperpaw-sign of that release, built from its tag");
  const built = spawnSync(
    "cargo",
    ["install", "--locked", "--git", "https://github.com/hthoene/paperpaw", "--tag", `v${paperpaw}`, "paperpaw-sign", "--root", join(work, "sign")],
    { stdio: "inherit" },
  );
  if (built.status !== 0) fail("paperpaw-sign could not be built.");
  run("powershell", ["-NoProfile", "-Command", `Copy-Item '${join(work, "sign", "bin", "paperpaw-sign.exe")}' '${bin}'`]);
}

// 3. The notices and the tests.
if (!skipTests) {
  step("the notices and the tests");
  for (const script of ["notices:check", "test"]) {
    const done = spawnSync("npm", ["run", script], { cwd: root, stdio: "inherit", shell: true });
    if (done.status !== 0) fail(`npm run ${script} failed.`);
  }
}

// 4. The installer, signed twice over and checked.
step("the installer, Authenticode-signed, then signed for the updater");
const built = spawnSync("node", ["scripts/installer.mjs"], { cwd: root, stdio: "inherit", env });
if (built.status !== 0) fail("the installer could not be built and signed.");

// 5. The release.
const files = ["paperpaw-workshop-" + version + "-setup.exe", `paperpaw-workshop-${version}-setup.exe.sig`, "latest.json"].map((f) => join(root, "dist-installer", f));
if (dryRun) {
  step(`dry run: not released. The files: ${files.join(", ")}`);
  process.exit(0);
}
step(`the release ${tag}`);
// Not marked as a pre-release, betas neither: installed workshops ask for
// releases/latest, which GitHub never points at a pre-release.
const released = spawnSync(
  "gh",
  [
    "release", "create", tag, "--verify-tag", "--latest",
    "--title", `PaperPaw Workshop ${version}`,
    "--notes", `PaperPaw Workshop ${version}, with PaperPaw ${paperpaw}. Download paperpaw-workshop-${version}-setup.exe for Windows 10 or 11.`,
    ...files,
  ],
  { cwd: root, stdio: "inherit" },
);
if (released.status !== 0) fail("the release could not be made.");
step(`done: https://github.com/hthoene/paperpaw-workshop/releases/tag/${tag}`);

/** Whether the updater key opens with `password` (a file signed with it). */
function opens(password) {
  const probe = join(tmpdir(), `paperpaw-workshop-key-probe-${process.pid}`);
  writeFileSync(probe, "probe");
  const signed = spawnSync("npx", ["tauri", "signer", "sign", probe], {
    cwd: root,
    shell: true,
    encoding: "utf8",
    env: { ...env, TAURI_SIGNING_PRIVATE_KEY_PASSWORD: password },
  });
  rmSync(probe, { force: true });
  rmSync(`${probe}.sig`, { force: true });
  return signed.status === 0;
}

/** A line typed without being shown. */
async function hidden(question) {
  if (!process.stdin.isTTY) fail("the updater key needs its password: set TAURI_SIGNING_PRIVATE_KEY_PASSWORD, or run this in a terminal.");
  const { createInterface } = await import("node:readline");
  const typed = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  typed._writeToOutput = (s) => {
    if (s === question) process.stdout.write(s);
  };
  const answer = await new Promise((resolve) => typed.question(question, resolve));
  typed.close();
  process.stdout.write("\n");
  return answer;
}
