// The build API (design 4.3), the local way: one container, one build at
// a time, builds kept for 24 hours. The workshop's page reaches it through
// its own server (/api/v1/workshop/builds), so no CORS but for the files
// the emulator frame (an opaque origin) fetches.
//
//   POST /api/v1/workshop/builds          { files: { path: { text } | { base64 } }, targets: ["web", "x4"] }
//                                         -> { id, state: "queued" }
//   GET  /api/v1/workshop/builds/{id}     ?after=<state> waits up to 25 s for another state
//                                         -> { id, state, position, seconds, diagnostics, problems, files, log_tail }
//   GET  /api/v1/workshop/builds/{id}/files/{name}
//
// Paths in the container: PaperPaw at /paperpaw, the build at /work (the
// plugin, the harness, the native wrapper), compiled crates in /cache,
// finished files in /builds.

import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

import { bytesOf, cargo, diagnostics, harness, native, pluginManifest, problems } from "./project.mjs";

const PAPERPAW = process.env.PAPERPAW ?? "/paperpaw";
const WORK = process.env.WORK ?? "/work";
const CACHE = process.env.CACHE ?? "/cache";
const BUILDS = process.env.BUILDS ?? "/builds";
const PORT = Number(process.env.PORT ?? 8090);
/** The most seconds a target may take. */
const LIMITS = { web: 180, x4: 300 };
const KEEP_HOURS = 24;
const TARGETS = ["web", "x4"];

/** Builds by id: { id, state, targets, files, created, started, finished, diagnostics, problems, outputs, log } */
const builds = new Map();
const queue = [];
let running = false;
const waiters = new Set();

function json(res, status, body, cors = false) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store", ...(cors ? { "access-control-allow-origin": "*" } : {}) });
  res.end(JSON.stringify(body));
}

function view(build) {
  return {
    id: build.id,
    state: build.state,
    position: build.state === "queued" ? queue.indexOf(build) + 1 : 0,
    seconds: build.finished && build.started ? Math.round((build.finished - build.started) / 100) / 10 : null,
    problems: build.problems,
    diagnostics: build.diagnostics,
    files: build.outputs.map((o) => ({ target: o.target, name: o.name, size: o.size, url: `/api/v1/workshop/builds/${build.id}/files/${o.name}` })),
    log_tail: build.state === "failed" ? build.log.slice(-4000) : "",
  };
}

function changed() {
  for (const wake of waiters) wake();
}

async function read(req, max) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new Error("too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://builder");
  const parts = url.pathname.split("/").filter(Boolean);
  if (url.pathname === "/healthz") return json(res, 200, { ok: true });
  if (parts.slice(0, 4).join("/") !== "api/v1/workshop/builds") return json(res, 404, { error: "not-found" });
  try {
    if (req.method === "POST" && parts.length === 4) {
      const body = JSON.parse(await read(req, 40 * 1024 * 1024));
      const targets = (Array.isArray(body.targets) ? body.targets : ["web"]).filter((t) => TARGETS.includes(t));
      const files = body.files ?? {};
      const found = problems(files);
      const build = { id: crypto.randomBytes(9).toString("hex"), state: "queued", targets, files, created: Date.now(), diagnostics: [], problems: found, outputs: [], log: "" };
      builds.set(build.id, build);
      if (found.length) {
        build.state = "failed";
        return json(res, 422, view(build));
      }
      queue.push(build);
      void next();
      return json(res, 201, view(build));
    }
    const build = builds.get(parts[4]);
    if (!build) return json(res, 404, { error: "not-found" });
    if (req.method === "GET" && parts.length === 5) {
      const after = url.searchParams.get("after");
      if (after && after === build.state && !["done", "failed"].includes(build.state)) {
        await new Promise((resolve) => {
          const wake = () => {
            if (build.state !== after) done();
          };
          const done = () => {
            waiters.delete(wake);
            clearTimeout(timer);
            resolve();
          };
          const timer = setTimeout(done, 25_000);
          waiters.add(wake);
          req.on("close", done);
        });
      }
      return json(res, 200, view(build));
    }
    if (req.method === "GET" && parts.length === 7 && parts[5] === "files") {
      const output = build.outputs.find((o) => o.name === parts[6]);
      if (!output) return json(res, 404, { error: "not-found" }, true);
      res.writeHead(200, {
        "content-type": output.name.endsWith(".wasm") ? "application/wasm" : "application/octet-stream",
        "content-length": output.size,
        // The emulator frame has an opaque origin.
        "access-control-allow-origin": "*",
        "cache-control": "private, max-age=86400, immutable",
      });
      return fs.createReadStream(output.file).pipe(res);
    }
    json(res, 405, { error: "method" });
  } catch (e) {
    json(res, 400, { error: "bad-request", message: String(e.message ?? e) });
  }
});

/** Runs the next build in the queue, one at a time. */
async function next() {
  if (running || queue.length === 0) return;
  running = true;
  const build = queue.shift();
  build.state = "building";
  build.started = Date.now();
  changed();
  try {
    await run(build);
    build.state = build.outputs.length && !build.diagnostics.some((d) => d.level === "error") ? "done" : "failed";
  } catch (e) {
    build.state = "failed";
    build.log += `\n${e.message ?? e}`;
  }
  build.finished = Date.now();
  build.files = undefined;
  running = false;
  changed();
  void next();
}

/** One build: the plugin crate written to /work/plugin, then each target. */
async function run(build) {
  const manifest = cargo(bytesOf(build.files["Cargo.toml"]).toString("utf8"));
  const plugin = path.join(WORK, "plugin");
  fs.rmSync(plugin, { recursive: true, force: true });
  for (const [file, content] of Object.entries(build.files)) {
    const to = path.join(plugin, file);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, bytesOf(content));
  }
  const sdk = path.join(PAPERPAW, "crates", "paperpaw-sdk");
  fs.writeFileSync(path.join(plugin, "Cargo.toml"), pluginManifest(manifest.name, manifest.version, sdk));
  const out = path.join(BUILDS, build.id);
  fs.mkdirSync(out, { recursive: true });

  if (build.targets.includes("web")) {
    const dir = write("web", harness(manifest.name, manifest.plugin, path.join(PAPERPAW, "shells", "web")));
    const result = await cargoBuild(build, dir, ["--release", "--target", "wasm32-unknown-unknown"], path.join(CACHE, "target-web"), LIMITS.web);
    build.diagnostics.push(...diagnostics(result.output, plugin));
    const wasm = path.join(CACHE, "target-web", "wasm32-unknown-unknown", "release", "workshop_web.wasm");
    if (result.ok) keep(build, "web", "web.wasm", wasm, out);
    else return;
  }
  if (build.targets.includes("x4")) {
    const dir = write("native", native(manifest.name, manifest.plugin, path.join(PAPERPAW, "crates", "paperpaw-sdk")));
    const target = path.join(CACHE, "target-native");
    const result = await cargoBuild(build, dir, ["--release", "--target", "riscv32imc-unknown-none-elf"], target, LIMITS.x4);
    build.diagnostics.push(...diagnostics(result.output, plugin));
    if (!result.ok) return;
    const elf = path.join(target, "riscv32imc-unknown-none-elf", "release", "plugin");
    const ppn = path.join(out, "x4.ppn");
    const packed = await exec(build, "paperpaw-sign", ["pack", elf, ppn], WORK, 60);
    if (packed.ok) keep(build, "x4", "x4.ppn", ppn, out);
  }
}

function write(name, files) {
  const dir = path.join(WORK, name);
  for (const [file, content] of Object.entries(files)) {
    const to = path.join(dir, file);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    // Unchanged files keep their time, so cargo builds only what changed.
    if (!fs.existsSync(to) || fs.readFileSync(to, "utf8") !== content) fs.writeFileSync(to, content);
  }
  return dir;
}

function keep(build, target, name, from, out) {
  const file = path.join(out, name);
  if (from !== file) fs.copyFileSync(from, file);
  build.outputs.push({ target, name, file, size: fs.statSync(file).size });
}

/** Offline but while the image is made: every crate is in the image. */
const OFFLINE = process.argv[2] !== "prepare";

function cargoBuild(build, dir, args, target, limit) {
  const offline = OFFLINE ? ["--offline"] : [];
  return exec(build, "cargo", ["build", ...offline, "--message-format=json", ...args], dir, limit, { CARGO_TARGET_DIR: target });
}

/** Runs a command, its output kept for the log and the diagnostics. */
function exec(build, command, args, cwd, seconds, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env } });
    let output = "";
    const take = (chunk) => {
      output += chunk;
      build.log = (build.log + chunk).slice(-200_000);
    };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      build.log += `\n${command} took longer than ${seconds} s and was stopped.`;
    }, seconds * 1000);
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, output });
    });
  });
}

/** Builds older than a day go, with their files. */
setInterval(() => {
  const old = Date.now() - KEEP_HOURS * 3600_000;
  for (const [id, build] of builds) {
    if (build.created < old && build.state !== "building") {
      fs.rmSync(path.join(BUILDS, id), { recursive: true, force: true });
      builds.delete(id);
    }
  }
}, 3600_000).unref();

if (process.argv[2] === "prepare") {
  // At the image's build: the sample plugin built once for each target,
  // so PaperPaw's crates are compiled and the registry is in the image.
  const files = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
  const build = { id: "prepare", state: "building", targets: TARGETS, files, created: Date.now(), diagnostics: [], problems: [], outputs: [], log: "" };
  run(build).then(
    () => {
      const failed = !build.outputs.length || build.diagnostics.some((d) => d.level === "error");
      console.log(failed ? build.log.slice(-6000) : `prepared: ${build.outputs.map((o) => `${o.name} ${o.size}`).join(", ")}`);
      process.exit(failed ? 1 : 0);
    },
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
} else {
  server.listen(PORT, () => console.log(`builder: listening on ${PORT}`));
}
