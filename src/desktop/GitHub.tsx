// Publishing on GitHub, under Publish: signing in (the GitHub CLI where
// it is signed in, else GitHub's device flow in the browser), then the
// whole way at one press (releasing.ts). What GitHub or the store refuse
// goes to the AI, which fixes it, and the workshop tries again by itself,
// a few times at most; a version used up is raised on the way.

import { useEffect, useState } from "preact/hooks";

import type { Backend, DeviceCode, GitHubAccount } from "./backend";
import type { Desk } from "./desk";
import { aboutSource, forAi, publishOnGitHub, repoNameProblem, type Outcome, type Publication, type Stage } from "./releasing";

/** How often a refusal goes to the AI before the person decides. */
const AUTO_ROUNDS = 2;

/** What publishing says where the sign-in cannot keep the author key (src-tauri/src/github.rs, `MORE_ACCESS`). */
const MORE_ACCESS = "More access needed";

/** What is said where the store could not take the source. */
const SOURCE_SAID =
  "The store could not take the plugin's source. The workshop names it itself, from the repository it makes and the version's tag, so the AI has nothing to fix here. Try again; if it keeps happening, look at the repository on GitHub: it must be public and hold the tag.";

const STAGES: { stage: Stage; name: string }[] = [
  { stage: "check", name: "Checked as the store will" },
  { stage: "publish", name: "Put on GitHub" },
  { stage: "build", name: "Released by GitHub" },
  { stage: "store", name: "Taken by paperpaw.org" },
];

interface Props {
  desk: Desk;
  backend: Backend;
  /** Whether what the store needs is there (a group, a key, …). */
  held: boolean;
  /** The plugin made ready: its store entry complete, a plugin with
   *  code built; or what keeps it from being published. */
  prepare(): Promise<Publication | string[]>;
  /** The next version, where the last one was used up. */
  raise(): Promise<void>;
  /** Published as `version` in `repo`. */
  done(version: string, repo: string): Promise<void>;
  /** The repository known, kept even when publishing stopped half way. */
  remember(repo: string): Promise<void>;
  /** The project's repository (`owner/name`), once there is one: its name stays. */
  known: string | null;
  /** The name a repository is made with if the person chose none: the plugin's id. */
  defaultName: string;
  /** The name the person chose ("" for none), kept with the project. */
  repoName: string;
  onRepoName(name: string): Promise<void>;
}

type Step =
  | { at: "idle" }
  | { at: "working"; stage: Stage; text: string; fixing?: boolean }
  | { at: "done"; outcome: Extract<Outcome, { ok: true }> }
  | { at: "failed"; problems: string[]; url?: string; held?: boolean }
  /** GitHub keeps the author key as a secret only for a sign-in with more access. */
  | { at: "more"; text: string };

export function GitHub({ desk, backend, held, prepare, raise, done, remember, known, defaultName, repoName, onRepoName }: Props) {
  const [account, setAccount] = useState<GitHubAccount | null>(null);
  const [device, setDevice] = useState<DeviceCode | null>(null);
  const [step, setStep] = useState<Step>({ at: "idle" });
  const [said, setSaid] = useState("");

  useEffect(() => {
    void backend.githubAccount().then(setAccount, () => setAccount({ login: null, expired: false, gh: false, browser: false }));
  }, [backend]);

  // The device flow: asked as often as GitHub says, until the code is typed.
  useEffect(() => {
    if (!device) return;
    let every = Math.max(device.interval, 5) * 1000;
    let stop = false;
    const ask = async () => {
      if (stop) return;
      try {
        const answer = await backend.githubDevicePoll(device.device_code);
        if (answer === "done") {
          setDevice(null);
          setStep((now) => {
            if (now.at === "more") setSaid("Allowed. Press Publish on GitHub again.");
            return now.at === "more" ? { at: "idle" } : now;
          });
          setAccount(await backend.githubAccount());
          return;
        }
        if (answer === "slow_down") every += 5000;
        setTimeout(() => void ask(), every);
      } catch (e) {
        setDevice(null);
        setSaid(text(e));
      }
    };
    const first = setTimeout(() => void ask(), every);
    return () => {
      stop = true;
      clearTimeout(first);
    };
  }, [device]);

  useEffect(() => {
    let off: (() => void) | undefined;
    void backend.onGitHubProgress((line) => setStep((now) => (now.at === "working" ? { ...now, text: line } : now))).then((o) => (off = o));
    return () => off?.();
  }, [backend]);

  const signIn = async (how: "gh" | "browser" | "more") => {
    setSaid("");
    try {
      if (how === "gh") setAccount(await backend.githubUseGh());
      else setDevice(await backend.githubDeviceStart(how === "more"));
    } catch (e) {
      setSaid(text(e));
    }
  };

  const signOut = async () => {
    await backend.githubSignOut().catch(() => {});
    setAccount(await backend.githubAccount());
  };

  // What is typed, kept with the project as it is typed.
  const [typed, setTyped] = useState(repoName);
  const nameProblem = !known && typed.trim() ? repoNameProblem(typed.trim()) : null;

  const go = async () => {
    setSaid("");
    if (nameProblem) return;
    // Signed in still: GitHub's sign-ins expire after some hours.
    const now = await backend.githubAccount().catch(() => null);
    if (!now?.login) return setAccount(now);
    for (let round = 0; ; round++) {
      setStep({ at: "working", stage: "check", text: "Getting it ready…" });
      const ready = await prepare().catch((e: unknown) => [text(e)]);
      if (Array.isArray(ready)) return setStep({ at: "failed", problems: ready });
      const outcome = await publishOnGitHub(backend, ready, (stage, line) => setStep({ at: "working", stage, text: line }));
      if (outcome.ok) {
        await done(ready.version, outcome.repo);
        return setStep({ at: "done", outcome });
      }
      if (outcome.repo) await remember(outcome.repo);
      if (outcome.problems.some((p) => p.startsWith("Confirm with GitHub again"))) {
        setStep({ at: "idle" });
        return setAccount(await backend.githubAccount());
      }
      const more = outcome.problems.find((p) => p.startsWith(MORE_ACCESS));
      if (more) return setStep({ at: "more", text: more });
      // Only the version is used up: the next one, without the AI.
      if (outcome.stage === "check" && outcome.released) {
        await raise();
        continue;
      }
      if (outcome.held || outcome.stage === "publish" || round >= AUTO_ROUNDS) {
        return setStep({ at: "failed", problems: outcome.problems, url: outcome.url, held: outcome.held });
      }
      // The source is named by the workshop, not by the AI, which could only guess.
      if (aboutSource(outcome.problems)) {
        if (outcome.released) await raise();
        return setStep({ at: "failed", problems: [SOURCE_SAID, ...outcome.problems], url: outcome.url });
      }
      setStep({ at: "working", stage: outcome.stage, text: "The AI fixes what was refused…", fixing: true });
      const heard = await desk.send(forAi(outcome, ready.version));
      if (!heard) return setStep({ at: "failed", problems: outcome.problems, url: outcome.url });
      if (outcome.released) await raise();
    }
  };

  const working = step.at === "working";
  const reached = working ? STAGES.findIndex((s) => s.stage === step.stage) : -1;

  const code = device && (
    <div class="before device-code">
      <p>GitHub opened in your browser. Type this code there:</p>
      <p class="code" aria-live="polite">{device.user_code}</p>
      <p class="hint">Waiting for GitHub…</p>
    </div>
  );

  return (
    <section class="way github" aria-label="Publish on GitHub">
      <h3>Publish on GitHub</h3>
      <p>
        Its own public repository on GitHub, listed in the store as a community plugin. Needs a free GitHub account. The
        workshop asks to reach your public repositories only, never your private ones.
      </p>
      {account === null ? (
        <p class="hint" role="status">Looking for your GitHub account…</p>
      ) : !account.login ? (
        device ? (
          code
        ) : (
          <div class="choices-row">
            {account.expired && <p class="hint">Your GitHub sign-in has expired.</p>}
            {account.browser && (
              <button type="button" class="go" onClick={() => void signIn("browser")}>
                {account.expired ? "Confirm with GitHub again" : "Sign in to GitHub"}
              </button>
            )}
            {account.gh && (
              <button type="button" class={account.browser ? "link" : "go"} onClick={() => void signIn("gh")}>Use the GitHub CLI's account</button>
            )}
            {!account.gh && !account.browser && (
              <p class="hint">
                Install the GitHub CLI and sign in with <code>gh auth login</code>, then open Publish again. Or pack it for
                the store below.
              </p>
            )}
          </div>
        )
      ) : (
        <>
          <p class="hint">
            Signed in as <b>{account.login}</b>.{" "}
            <button type="button" class="link quiet" disabled={working} onClick={() => void signOut()}>Sign out</button>
          </p>
          {(working || step.at === "failed") && (
            <ol class="steps github-steps">
              {STAGES.map((s, i) => (
                <li key={s.stage} class={i < reached ? "past" : i === reached ? "now" : ""}>
                  {s.name}
                  {i === reached && working && <small role="status"> {step.text}</small>}
                </li>
              ))}
            </ol>
          )}
          {step.at === "more" && !device && (
            <div class="before">
              <p>
                A plugin with code is built and signed by GitHub with your author key, which GitHub keeps as a secret in
                the plugin's repository. GitHub lets only a sign-in with full repository access do that. The workshop
                still touches that one public repository and nothing else. Allow it once.
              </p>
              <button type="button" class="go" onClick={() => void signIn("more")}>Allow more access</button>
            </div>
          )}
          {device && code}
          {step.at === "done" && (
            <p class="store-file">
              {step.outcome.state === "listed"
                ? "It is in the store, as a community plugin."
                : step.outcome.state === "waiting"
                  ? "It waits for the store's moderators, as an update of a reviewed plugin."
                  : "It is released on GitHub. The store takes it within the hour."}
              <small>
                <button type="button" class="link quiet" onClick={() => void backend.githubOpen(step.outcome.url)}>{step.outcome.repo}</button>
              </small>
            </p>
          )}
          {step.at === "failed" && (
            <div class="before">
              <p>{step.held ? "The store's review holds it for the moderators:" : "It was refused:"}</p>
              <ul class="problems">{step.problems.map((p) => <li key={p}><pre>{p}</pre></li>)}</ul>
              {step.url && (
                <button type="button" class="link quiet" onClick={() => void backend.githubOpen(step.url!)}>See it on GitHub</button>
              )}
            </div>
          )}
          <div class="repo-name">
            <label for="repo-name">Repository name</label>
            {known ? (
              <p class="hint">
                This plugin is published as <b>{known}</b>. A new version goes there too.
              </p>
            ) : (
              <>
                <input
                  id="repo-name"
                  type="text"
                  value={typed}
                  placeholder={defaultName || "my-plugin"}
                  disabled={working}
                  autoComplete="off"
                  spellcheck={false}
                  aria-invalid={!!nameProblem}
                  onInput={(e) => {
                    setTyped(e.currentTarget.value);
                    void onRepoName(e.currentTarget.value);
                  }}
                />
                <p class={nameProblem ? "problem" : "hint"}>
                  {nameProblem ?? `It is made as ${account.login}/${typed.trim() || defaultName || "…"}, public. Leave it empty for the plugin's id.`}
                </p>
              </>
            )}
          </div>
          <button type="button" class="go" disabled={held || working || !!nameProblem || !!desk.workshop?.busy} onClick={() => void go()}>
            {step.at === "failed" ? "Try again" : working ? "Publishing…" : "Publish on GitHub"}
          </button>
        </>
      )}
      {said && <p class="said" role="status">{said}</p>}
    </section>
  );
}

function text(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
