// The workshop's side of the build API (design 4.3): the project's files
// go to the builder, which answers with the emulator's module (PaperPaw
// with the plugin compiled in), a `.ppn` for the X4, and the compiler's
// messages. The page reaches the builder on its own origin
// (/api/v1/workshop/builds): docker compose's builder behind the
// workshop's server, or the site's later. Tests give a fake.

export type Target = "web" | "x4";

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
  /** Builds `files` for `targets`; `onState` hears "queued" and "building". */
  build(files: ProjectFiles, targets: Target[], onState?: (state: string, position: number) => void, signal?: AbortSignal): Promise<BuildResult>;
}

/** Why there was no build: the builder is not there, or failed itself. */
export class BuilderUnavailable extends Error {}

export class HttpBuilder implements Builder {
  constructor(private base = "") {}

  async build(files: ProjectFiles, targets: Target[], onState?: (state: string, position: number) => void, signal?: AbortSignal): Promise<BuildResult> {
    let answer: Response;
    try {
      answer = await fetch(`${this.base}/api/v1/workshop/builds`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ files, targets }),
        signal,
      });
    } catch (e) {
      if (signal?.aborted) throw e;
      throw new BuilderUnavailable("the builder could not be reached");
    }
    if (answer.status === 502 || answer.status === 503 || answer.status === 404) throw new BuilderUnavailable(`the builder answered ${answer.status}`);
    let build = (await answer.json()) as Omit<BuildResult, "state"> & { state: string; position?: number };
    // Long polls: each waits up to 25 seconds for another state.
    while (build.state === "queued" || build.state === "building") {
      onState?.(build.state, build.position ?? 0);
      const next = await fetch(`${this.base}/api/v1/workshop/builds/${build.id}?after=${build.state}`, { headers: { accept: "application/json" }, signal });
      if (!next.ok) throw new BuilderUnavailable(`the builder answered ${next.status}`);
      build = await next.json();
    }
    return build as BuildResult;
  }
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
