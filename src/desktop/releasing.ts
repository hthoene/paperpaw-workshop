// Publishing on GitHub, from the window's side: the repository checked
// as the store will check it, published (made, listed, tagged), its
// release workflow followed, then paperpaw.org until it took the release
// or said why not (src-tauri/src/github.rs does the asking). What was
// refused goes to the AI in words it can act on (`forAi`).

import type { Backend, GitHubRun, SiteStatus } from "./backend";

/** Where a publication is. */
export type Stage = "check" | "publish" | "build" | "store";

export type Outcome =
  | {
      ok: true;
      repo: string;
      url: string;
      /** `listed`: in the store as a community plugin; `waiting`: an update
       *  of a reviewed plugin, waiting for the moderators; `later`: the
       *  store has not looked yet (it does every hour). */
      state: "listed" | "waiting" | "later";
    }
  | {
      ok: false;
      stage: Stage;
      problems: string[];
      /** The version is used up (its release made): the next needs a higher one. */
      released: boolean;
      /** The store's review held it: for the moderators, not for the AI. */
      held?: boolean;
      repo?: string;
      url?: string;
    };

export interface Publication {
  project: string;
  id: string;
  version: string;
  description: string;
  /** The project's repository before, if it has one. */
  known: string | null;
  /** A plugin with code: its source ZIP, as its build made it. */
  source: string | null;
}

export interface Timing {
  wait(ms: number): Promise<void>;
  /** How often and how long the workflow and the store are asked. */
  runEvery: number;
  runFor: number;
  /** How long a workflow may take to start. */
  startFor: number;
  siteEvery: number;
  siteFor: number;
}

export const TIMING: Timing = {
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  runEvery: 15_000,
  // A plugin with code builds for two chips: compilers fetched first.
  runFor: 60 * 60_000,
  startFor: 3 * 60_000,
  siteEvery: 30_000,
  siteFor: 15 * 60_000,
};

type Calls = Pick<Backend, "githubPrepare" | "githubPublish" | "githubRun" | "githubSite">;

/** The whole way, `told` hearing where it is. */
export async function publishOnGitHub(
  backend: Calls,
  p: Publication,
  told: (stage: Stage, text: string) => void,
  timing: Timing = TIMING,
): Promise<Outcome> {
  const tag = `v${p.version}`;
  told("check", "Checking it as the store will…");
  let prepared;
  try {
    prepared = await backend.githubPrepare(p.project, p.id, p.version, p.known, p.source);
  } catch (e) {
    return { ok: false, stage: "check", problems: [message(e)], released: false };
  }
  if (prepared.place.released) {
    return { ok: false, stage: "check", problems: [`Version ${p.version} is released on GitHub already.`], released: true, repo: prepared.place.repo };
  }
  if (!prepared.passes) {
    const errors = prepared.problems.filter((l) => l.startsWith("error"));
    return { ok: false, stage: "check", problems: errors.length ? errors : prepared.problems, released: false };
  }

  told("publish", prepared.place.exists ? `Updating ${prepared.place.repo}…` : `Making ${prepared.place.repo}…`);
  let published;
  try {
    published = await backend.githubPublish(p.project, p.id, p.version, p.description, p.known, p.source);
  } catch (e) {
    return { ok: false, stage: "publish", problems: [message(e)], released: false, repo: prepared.place.repo };
  }
  const { repo, url } = published;

  told("build", "GitHub makes the release…");
  let run: GitHubRun | null = null;
  for (let waited = 0; waited <= timing.runFor; waited += timing.runEvery) {
    run = await backend.githubRun(repo, published.sha).catch(() => null);
    if (run && !["waiting", "queued", "in_progress", "pending", "requested"].includes(run.state)) break;
    if ((!run || run.state === "waiting") && waited >= timing.startFor) {
      return { ok: false, stage: "build", problems: ["The release workflow did not start on GitHub."], released: false, repo, url };
    }
    if (run?.state === "in_progress") told("build", "GitHub builds and checks the release…");
    await timing.wait(timing.runEvery);
  }
  if (run?.state !== "success") {
    const problems = run?.failed_step ? [`The step "${run.failed_step}" failed.`, ...(run.log ? [run.log] : [])] : [`The release workflow ended: ${run?.state ?? "unknown"}.`];
    return { ok: false, stage: "build", problems, released: false, repo, url: run?.url || url };
  }

  told("store", "paperpaw.org checks the release…");
  for (let waited = 0; waited <= timing.siteFor; waited += timing.siteEvery) {
    // Asked to look now at first, and again now and then.
    const check = waited % (4 * timing.siteEvery) === 0;
    const site = await backend.githubSite(repo, check).catch(() => null);
    const verdict = site ? siteVerdict(site, tag) : null;
    if (verdict) return { ...verdict, repo, url };
    await timing.wait(timing.siteEvery);
  }
  return { ok: true, repo, url, state: "later" };
}

/** What the store's answer means for `tag`; null while it has not taken
 *  that release yet. */
export function siteVerdict(
  site: SiteStatus,
  tag: string,
): { ok: true; state: "listed" | "waiting" } | { ok: false; stage: "store"; problems: string[]; released: true; held?: boolean } | null {
  if (!site.found || site.tag !== tag) return null;
  switch (site.state) {
    case "offered":
      return { ok: true, state: "listed" };
    case "submitted":
      return { ok: true, state: "waiting" };
    case "failed":
      return { ok: false, stage: "store", problems: site.problems.length ? site.problems : ["The store refused the release."], released: true };
    case "held":
      return { ok: false, stage: "store", problems: ["The store's review holds it for the moderators."], released: true, held: true };
    default:
      return null;
  }
}

/** Whether the store refused the plugin's source. The workshop names it
 *  itself, when it makes the repository (src-tauri/src/github.rs,
 *  `with_source`: the repository and the version's tag), so this is not
 *  the AI's to fix: it can only guess an address. */
export function aboutSource(problems: string[]): boolean {
  return problems.some((p) => /(^|[\s:])source:/i.test(p));
}

/** What was refused, for the AI to fix. */
export function forAi(outcome: Extract<Outcome, { ok: false }>, version: string): string {
  const where = {
    check: "PaperPaw's check of the repository, by the store's rules (paperpaw-dev check-publish),",
    publish: "GitHub",
    build: "The release workflow on GitHub",
    store: "paperpaw.org",
  }[outcome.stage];
  const then = outcome.released
    ? ` Version ${version} is used up: the workshop raises the version itself after your fix.`
    : "";
  return (
    `Publishing version ${version} on GitHub was refused. ${where} said:\n\n${outcome.problems.join("\n")}\n\n` +
    `Fix it in the plugin's files, change nothing else, and check it. The workshop then publishes it again by itself.${then}\n\n` +
    `Never write a [source] section, a repository address or a revision in store.ini: the workshop sets them itself, from the repository it makes.`
  );
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
