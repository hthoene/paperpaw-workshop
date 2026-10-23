// The workshop's side of the build API: the project's files
// go to the builder, which answers with the emulator's module (PaperPaw
// with the plugin compiled in), a `.ppn` for the X4, and the compiler's
// messages. The page reaches the builder on its own origin
// (/api/v1/workshop/builds): docker compose's builder behind the
// workshop's server, or paperpaw.org's, which builds for signed-in authors
// (the session's cookie comes along, its form token in a header) within
// limits. Tests give a fake.

/** The reader's module, or a plugin file for a device. */
export type Target = "web" | "x4" | "x4-pro" | "host";

/** One message of the compiler, about the plugin's own files. */
export interface Diagnostic {
  level: "error" | "warning";
  file: string | null;
  line: number | null;
  column: number | null;
  message: string;
  /** The compiler's own text, with the code around it. */
  rendered: string;
}

export interface BuildResult {
  id: string;
  state: "done" | "failed";
  /** How long it took, in seconds. */
  seconds: number | null;
  /** Why the project was not built at all (files, Cargo.toml). */
  problems: string[];
  diagnostics: Diagnostic[];
  files: { target: Target; name: string; size: number; url: string }[];
  /** The end of the build's log, when it failed for no message's reason. */
  log_tail: string;
}

/** A project's files as the builder takes them. */
export type ProjectFiles = Record<string, { text: string } | { base64: string }>;

export interface Builder {
  /** What the reader beside the conversation runs: PaperPaw's web module
   *  with the plugin in it (`web`, the default), or the plugin's own
   *  library loaded by PaperPaw's emulator on this computer (`host`). */
  readonly target?: Target;
  /** Builds `files` for `targets`; `onState` hears "queued" and "building". */
  build(files: ProjectFiles, targets: Target[], onState?: (state: string, position: number) => void, signal?: AbortSignal): Promise<BuildResult>;
}

/** Why there was no build: the builder is not there, or failed itself. */
export class BuilderUnavailable extends Error {}

/** Why paperpaw.org did not take a build, in its words: signed out, one at
 *  a time, the day's builds used, builds stopped. */
export class BuilderRefused extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export class HttpBuilder implements Builder {
  /** The site's form token: undefined where there is none (a builder of
   *  one's own), null until asked. */
  private csrf: string | undefined | null = null;

  constructor(private base = "") {}

  async build(files: ProjectFiles, targets: Target[], onState?: (state: string, position: number) => void, signal?: AbortSignal): Promise<BuildResult> {
    let answer = await this.start(files, targets, signal);
    if (answer.status === 403 && (await refusal(answer.clone()))?.error === "expired") {
      // The session's token changed: asked again, once.
      this.csrf = null;
      answer = await this.start(files, targets, signal);
    }
    if (answer.status === 502 || answer.status === 404) throw new BuilderUnavailable(`the builder answered ${answer.status}`);
    const body = (await answer.json().catch(() => null)) as (Omit<BuildResult, "state"> & { state: string; position?: number }) | { error: string; message?: string } | null;
    if (!body || !("state" in body)) {
      if (body && "error" in body) throw new BuilderRefused(body.error, body.message ?? body.error);
      throw new BuilderUnavailable(`the builder answered ${answer.status}`);
    }
    let build = body;
    // Long polls: each waits up to 25 seconds for another state.
    while (build.state === "queued" || build.state === "building") {
      onState?.(build.state, build.position ?? 0);
      const next = await fetch(`${this.base}/api/v1/workshop/builds/${build.id}?after=${build.state}`, { headers: { accept: "application/json" }, signal });
      if (!next.ok) throw new BuilderUnavailable(`the builder answered ${next.status}`);
      build = await next.json();
    }
    return build as BuildResult;
  }

  private async start(files: ProjectFiles, targets: Target[], signal?: AbortSignal): Promise<Response> {
    const csrf = await this.token();
    try {
      return await fetch(`${this.base}/api/v1/workshop/builds`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json", ...(csrf ? { "x-paperpaw-csrf": csrf } : {}) },
        body: JSON.stringify({ files, targets }),
        signal,
      });
    } catch (e) {
      if (signal?.aborted) throw e;
      throw new BuilderUnavailable("the builder could not be reached");
    }
  }

  /** The site's form token, if the workshop runs on paperpaw.org and
   *  someone is signed in there. */
  private async token(): Promise<string | undefined> {
    if (this.csrf !== null) return this.csrf;
    try {
      const answer = await fetch(`${this.base}/api/v1/workshop/session`, { headers: { accept: "application/json" } });
      const session = answer.ok ? ((await answer.json()) as { csrf?: unknown }) : {};
      this.csrf = typeof session.csrf === "string" ? session.csrf : undefined;
    } catch {
      this.csrf = undefined;
    }
    return this.csrf;
  }
}

async function refusal(answer: Response): Promise<{ error?: string } | null> {
  return (await answer.json().catch(() => null)) as { error?: string } | null;
}

/** The project's files for the builder: text as text, the rest as base64. */
export function projectFiles(files: Record<string, string | Uint8Array>): ProjectFiles {
  const out: ProjectFiles = {};
  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith("store/")) continue;
    out[path] = typeof content === "string" ? { text: content } : { base64: base64(content) };
  }
  return out;
}

function base64(bytes: Uint8Array): string {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}
