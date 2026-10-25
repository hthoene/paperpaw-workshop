// Publishing on GitHub as the window follows it: checked, published, the
// release workflow and the store asked until they answer, and what they
// refuse said to the AI.

import { describe, expect, it } from "vitest";

import type { GitHubPrepared, GitHubRun, SiteStatus } from "../src/desktop/backend";
import { forAi, publishOnGitHub, siteVerdict, type Publication, type Timing } from "../src/desktop/releasing";

const PLUGIN: Publication = { project: "p", id: "night-owl", version: "1.0.0", description: "Night owl", known: null, source: null };
const NOW: Timing = { wait: async () => {}, runEvery: 1, runFor: 20, startFor: 3, siteEvery: 1, siteFor: 10 };

const ready: GitHubPrepared = { place: { repo: "ann/night-owl", exists: false, released: false }, passes: true, problems: [], files: 4 };
const site = (state: string, tag = "v1.0.0", problems: string[] = []): SiteStatus => ({ found: true, tag, version: "1.0.0", state, listed: state === "offered", problems });

/** A backend whose runs and store answers come one after the other. */
function backend(runs: GitHubRun[], sites: SiteStatus[], prepared = ready) {
  const asked: string[] = [];
  return {
    asked,
    githubPrepare: async () => prepared,
    githubPublish: async () => ({ repo: "ann/night-owl", tag: "v1.0.0", sha: "abc", url: "https://github.com/ann/night-owl" }),
    githubRun: async () => runs.length > 1 ? runs.shift()! : runs[0]!,
    githubSite: async (_repo: string, check: boolean) => {
      asked.push(check ? "check" : "status");
      return sites.length > 1 ? sites.shift()! : sites[0]!;
    },
  };
}

const run = (state: string, more: Partial<GitHubRun> = {}): GitHubRun => ({ state, url: "https://github.com/ann/night-owl/actions/runs/1", failed_step: null, log: null, ...more });

describe("publishing on GitHub", () => {
  it("goes through to the store, asking it to look first", async () => {
    const calls = backend([run("waiting"), run("in_progress"), run("success")], [site("none", "v0.9.0"), site("offered")]);
    const stages: string[] = [];
    const outcome = await publishOnGitHub(calls, PLUGIN, (stage) => stages.push(stage), NOW);
    expect(outcome).toEqual({ ok: true, repo: "ann/night-owl", url: "https://github.com/ann/night-owl", state: "listed" });
    expect([...new Set(stages)]).toEqual(["check", "publish", "build", "store"]);
    expect(calls.asked[0]).toBe("check");
  });

  it("stops at the check with its errors, and at a version released already", async () => {
    const refused = await publishOnGitHub(
      backend([], [], { ...ready, passes: false, problems: ["error [summary] store.ini: too long", "warning [shot] store/: none"] }),
      PLUGIN, () => {}, NOW,
    );
    expect(refused).toMatchObject({ ok: false, stage: "check", problems: ["error [summary] store.ini: too long"], released: false });
    const used = await publishOnGitHub(backend([], [], { ...ready, place: { ...ready.place, exists: true, released: true } }), PLUGIN, () => {}, NOW);
    expect(used).toMatchObject({ ok: false, stage: "check", released: true });
  });

  it("says which step of the workflow failed, with its log, and when it never started", async () => {
    const failed = await publishOnGitHub(backend([run("failure", { failed_step: "Build, pack and sign", log: "error[E0425]" })], []), PLUGIN, () => {}, NOW);
    expect(failed).toMatchObject({ ok: false, stage: "build", released: false, problems: ['The step "Build, pack and sign" failed.', "error[E0425]"] });
    const never = await publishOnGitHub(backend([run("waiting")], []), PLUGIN, () => {}, NOW);
    expect(never).toMatchObject({ ok: false, stage: "build", problems: ["The release workflow did not start on GitHub."] });
  });

  it("takes the store's refusal as a version used up, and its hold as the moderators'", async () => {
    const refused = await publishOnGitHub(backend([run("success")], [site("failed", "v1.0.0", ["id: taken"])]), PLUGIN, () => {}, NOW);
    expect(refused).toMatchObject({ ok: false, stage: "store", problems: ["id: taken"], released: true });
    const held = await publishOnGitHub(backend([run("success")], [site("held")]), PLUGIN, () => {}, NOW);
    expect(held).toMatchObject({ ok: false, held: true });
    const later = await publishOnGitHub(backend([run("success")], [site("none", "v0.9.0")]), PLUGIN, () => {}, NOW);
    expect(later).toMatchObject({ ok: true, state: "later" });
  });

  it("reads the store's answer for its own tag only", () => {
    expect(siteVerdict(site("offered", "v0.9.0"), "v1.0.0")).toBeNull();
    expect(siteVerdict(site("submitted"), "v1.0.0")).toEqual({ ok: true, state: "waiting" });
  });

  it("tells the AI what was refused, and that the version is raised for it", () => {
    const text = forAi({ ok: false, stage: "store", problems: ["id: taken"], released: true }, "1.0.0");
    expect(text).toContain("paperpaw.org said:\n\nid: taken");
    expect(text).toContain("raises the version itself");
  });
});
