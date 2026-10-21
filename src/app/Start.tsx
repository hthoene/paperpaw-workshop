// The start: what should the reader do differently, who pays for the AI,
// and the plugins already made in this browser.

import { useEffect, useState } from "preact/hooks";

import { STRONGER } from "../ai/pricing";
import { quotaStanding, type QuotaStanding } from "../ai/quota";
import { t } from "../i18n";
import { identity, type Kind, type Project } from "../project/project";
import { listProjects } from "../project/storage";
import { Steps } from "./Header";

/** The ideas to start from; `tool` needs code. */
const IDEAS = ["look", "home", "keys", "text", "tool"];
const CODE_IDEAS = ["tool"];

/** Who pays for the AI: the person's own key, or paperpaw.org's free
 *  quota (whose model the site chooses). */
export type Payer = "key" | "quota";

interface Props {
  apiKey: string;
  remembered: boolean;
  needsKey: boolean;
  payer: Payer;
  onKey(key: string, remember: boolean): void;
  onPayer(payer: Payer): void;
  /** `model` instead of the kind's: Opus, with one's own key. */
  onStart(idea: string, kind: Kind, model?: string): void;
}

export function Start({ apiKey, remembered, needsKey, payer, onKey, onPayer, onStart }: Props) {
  const [idea, setIdea] = useState("");
  const [key, setKey] = useState(apiKey);
  const [remember, setRemember] = useState(remembered);
  const [projects, setProjects] = useState<Project[]>([]);
  const [warn, setWarn] = useState(needsKey);
  const [code, setCode] = useState(false);
  const [stronger, setStronger] = useState(false);
  const [quota, setQuota] = useState<QuotaStanding>({ kind: "none" });

  useEffect(() => {
    listProjects().then(setProjects, () => setProjects([]));
    void quotaStanding().then(setQuota);
  }, []);

  const quotaOpen = quota.kind === "signed-in" && quota.state === "accepted" && !quota.refusal;
  const onQuota = payer === "quota" && quotaOpen;

  const go = () => {
    const kind = code ? "code" : "data";
    if (onQuota) {
      if (idea.trim()) onStart(idea.trim(), kind);
      return;
    }
    if (!key.trim()) {
      setWarn(true);
      document.getElementById("key")?.focus();
      return;
    }
    onKey(key.trim(), remember);
    if (idea.trim()) onStart(idea.trim(), kind, stronger ? STRONGER : undefined);
  };

  return (
    <>
      <Steps now={0} />
      <section class="hero">
        <h1>{t("start.title")}</h1>
        <p>{t("start.lede")}</p>
      </section>

      <div class="box ask">
        <label class="visually-hidden" for="idea">
          {t("start.title")}
        </label>
        <textarea
          id="idea"
          value={idea}
          placeholder={t("start.placeholder")}
          onInput={(e) => setIdea((e.target as HTMLTextAreaElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) go();
          }}
        />
        <label class="check code-choice">
          <input type="checkbox" checked={code} onChange={(e) => setCode((e.target as HTMLInputElement).checked)} />
          <span>
            <b>{t("start.code")}</b> {t("start.code.text")}
          </span>
        </label>
        <div class="row">
          <span class="small">
            {t("start.hint")} <a href="#/example">{t("start.example")}</a>{" "}
            <a href="#/example/sleep-picture">{t("start.example.picture")}</a>{" "}
            <a href="#/example/quote-a-day">{t("start.example.code")}</a>
          </span>
          <button class="btn main" onClick={go} disabled={!idea.trim()}>
            {t("start.go")}
          </button>
        </div>
      </div>

      <ul class="ideas">
        {IDEAS.map((id) => (
          <li key={id}>
            <button
              class="box idea"
              onClick={() => {
                setIdea(t(`start.ideas.${id}.prompt`));
                setCode(CODE_IDEAS.includes(id));
              }}
            >
              <b>{t(`start.ideas.${id}`)}</b>
              <span>{t(`start.ideas.${id}.text`)}</span>
              <em>{t(`start.ideas.${id}.kind`)}</em>
            </button>
          </li>
        ))}
      </ul>

      <section class="pay" aria-labelledby="pay-head">
        <h2 id="pay-head">{t("start.pay.title")}</h2>
        <div class="ways">
          <div class={`box way${onQuota ? "" : " on"}`}>
            {quotaOpen ? (
              <label class="check">
                <input type="radio" name="payer" checked={!onQuota} onChange={() => onPayer("key")} />
                <b>{t("start.pay.key")}</b>
              </label>
            ) : (
              <b>{t("start.pay.key")}</b>
            )}
            <p>{t("start.pay.key.text")}</p>
            <div class="key">
              <label for="key">{t("start.pay.key.label")}</label>
              <input
                id="key"
                type="password"
                autocomplete="off"
                spellcheck={false}
                placeholder="sk-ant-..."
                value={key}
                onInput={(e) => {
                  setKey((e.target as HTMLInputElement).value);
                  setWarn(false);
                }}
              />
              <label class="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember((e.target as HTMLInputElement).checked)} />
                <span>{t("start.pay.key.remember")}</span>
              </label>
              <span class="small">{t("start.pay.key.remember.help")}</span>
              <label class="check">
                <input type="checkbox" checked={stronger} onChange={(e) => setStronger((e.target as HTMLInputElement).checked)} />
                <span>{t("start.pay.key.stronger")}</span>
              </label>
              {warn && <span class="error">{t("start.needs-key")}</span>}
            </div>
          </div>
          <div class={`box way${onQuota ? " on" : quotaOpen ? "" : " off"}`} aria-disabled={!quotaOpen}>
            {quotaOpen ? (
              <label class="check">
                <input type="radio" name="payer" checked={onQuota} onChange={() => onPayer("quota")} />
                <b>{t("start.pay.quota")}</b>
              </label>
            ) : (
              <b>{t("start.pay.quota")}</b>
            )}
            <p>{t("start.pay.quota.text")}</p>
            <QuotaLine quota={quota} />
          </div>
          <div class="box way">
            <b>{t("start.pay.local")}</b>
            <p>
              {t("start.pay.local.text")}{" "}
              <a href="https://github.com/hthoene/paperpaw-workshop#readme">{t("start.pay.local.link")}</a>
            </p>
          </div>
        </div>
      </section>

      <section class="projects" aria-labelledby="projects-head">
        <h2 id="projects-head">{t("start.projects")}</h2>
        {projects.length === 0 ? (
          <p class="small">{t("start.projects.none")}</p>
        ) : (
          <ul>
            {projects.map((p) => (
              <li key={p.key}>
                <span>{identity(p).name ?? p.key}</span>
                <span class="small">{p.updated.slice(0, 10)}</span>
                <a
                  class="btn quiet"
                  href={`#/p/${p.key}`}
                  onClick={() => {
                    if (key.trim()) onKey(key.trim(), remember);
                  }}
                >
                  {t("start.projects.open")}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Where the free quota stands, in a line: how to get it, or what is left. */
function QuotaLine({ quota }: { quota: QuotaStanding }) {
  if (quota.kind === "none") return <p class="small">{t("start.pay.quota.none")}</p>;
  if (quota.kind === "signed-out") {
    return (
      <p class="small">
        <a href={quota.signIn}>{t("start.pay.quota.sign-in")}</a>
      </p>
    );
  }
  if (quota.state === "waiting") return <p class="small">{t("start.pay.quota.waiting")}</p>;
  if (quota.state !== "accepted") {
    return (
      <p class="small">
        {quota.state === "none" ? "" : `${t(`start.pay.quota.${quota.state}`)} `}
        <a href="/account/workshop">{t("start.pay.quota.apply")}</a>
      </p>
    );
  }
  if (quota.refusal) return <p class="small">{t(`start.pay.quota.${quota.refusal}`)}</p>;
  return (
    <p class="small">
      {t("start.pay.quota.left", {
        left: quota.left.toFixed(2),
        budget: quota.budget.toFixed(2),
        euros: (quota.left * quota.eurosPerDollar).toFixed(2),
      })}
    </p>
  );
}
