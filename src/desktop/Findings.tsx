// "Checks: ok" or "Checks: 2 to fix" in the bar, and under it what they
// are, for the person to look at: each in plain words, where it was seen
// (reader, language, screen), a small picture of the spot where the check
// took one, and "Let the AI fix it" or "Ignore". Calm and compact.

import { useState } from "preact/hooks";

import { forModel, ignoredKey, shown, summary, type Found } from "./checks";
import type { Desk } from "./desk";

const READERS: Record<string, string> = { "xteink-x4": "X4", "xteink-x4-pro": "X4 Pro", "boox-go-7": "Boox Go 7" };

/** Where a finding was seen, in words: "X4 and X4 Pro, in English and German". */
export function where(f: Found): string {
  const readers = new Set<string>();
  const languages = new Set<string>();
  for (const variant of f.seen) {
    const [profile, language] = variant.split(" ");
    if (profile) readers.add(READERS[profile] ?? profile);
    if (language && language !== "pseudo") languages.add(languageName(language));
  }
  const list = (items: Set<string>) => [...items].join(", ").replace(/, ([^,]*)$/, " and $1");
  const parts = [readers.size ? `on ${list(readers)}` : "", languages.size ? `in ${list(languages)}` : ""].filter(Boolean);
  return parts.join(", ");
}

function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** A check's words, its `ids` set apart. */
function Words({ text }: { text: string }) {
  return <>{text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}</>;
}

export function Findings({ desk }: { desk: Desk }) {
  const [open, setOpen] = useState(false);
  const project = desk.workspace.project;
  const checks = desk.checker.checks;
  const ignored = project?.ignoredChecks ?? [];
  const visible = checks.state === "done" ? { state: "done" as const, found: shown(checks.found, ignored) } : checks;
  const said = summary(visible);
  if (!said) return null;
  const found = visible.state === "done" ? visible.found : [];

  const ignore = (f: Found) => {
    if (!project) return;
    project.ignoredChecks = [...ignored, ignoredKey(f)];
    void desk.workspace.save();
  };
  const fix = (f: Found) => {
    setOpen(false);
    void desk.send(forModel([f]));
  };

  return (
    <div class="checks">
      <button type="button" class={`checks-state${found.length ? " fix" : ""}`} aria-expanded={open} disabled={!found.length && checks.state !== "failed"} onClick={() => setOpen(!open)}>
        {said}
      </button>
      {open && (
        <div class="checks-list" role="dialog" aria-label="What the checks found">
          {checks.state === "failed" ? (
            <p class="finding-words">{checks.message}</p>
          ) : (
            found.map((f) => (
              <article class="finding" key={ignoredKey(f)}>
                {f.picture && <img src={f.picture} alt="" />}
                <div>
                  <p class="finding-words"><Words text={f.message} /></p>
                  <p class="finding-where">{[where(f), f.place && `at ${f.place}`].filter(Boolean).join(", ")}</p>
                  <p class="finding-do">
                    <button type="button" class="link" disabled={!!desk.workshop?.busy} onClick={() => fix(f)}>Let the AI fix it</button>
                    <button type="button" class="link quiet" onClick={() => ignore(f)}>Ignore</button>
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
