// The start: what should the reader do differently, who pays for the AI,
// and the plugins already made in this browser.

import { useEffect, useState } from "preact/hooks";

import { t } from "../i18n";
import { identity, type Project } from "../project/project";
import { listProjects } from "../project/storage";
import { Steps } from "./Header";

const IDEAS = ["look", "home", "keys", "text"];

interface Props {
  apiKey: string;
  remembered: boolean;
  needsKey: boolean;
  onKey(key: string, remember: boolean): void;
  onStart(idea: string): void;
}

export function Start({ apiKey, remembered, needsKey, onKey, onStart }: Props) {
  const [idea, setIdea] = useState("");
  const [key, setKey] = useState(apiKey);
  const [remember, setRemember] = useState(remembered);
  const [projects, setProjects] = useState<Project[]>([]);
  const [warn, setWarn] = useState(needsKey);

  useEffect(() => {
    listProjects().then(setProjects, () => setProjects([]));
  }, []);

  const go = () => {
    if (!key.trim()) {
      setWarn(true);
      document.getElementById("key")?.focus();
      return;
    }
    onKey(key.trim(), remember);
    if (idea.trim()) onStart(idea.trim());
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
        <div class="row">
          <span class="small">
            {t("start.hint")} <a href="#/example">{t("start.example")}</a>
          </span>
          <button class="btn main" onClick={go} disabled={!idea.trim()}>
            {t("start.go")}
          </button>
        </div>
      </div>

      <ul class="ideas">
        {IDEAS.map((id) => (
          <li key={id}>
            <button class="box idea" onClick={() => setIdea(t(`start.ideas.${id}.prompt`))}>
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
          <div class="box way on">
            <b>{t("start.pay.key")}</b>
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
              {warn && <span class="error">{t("start.needs-key")}</span>}
            </div>
          </div>
          <div class="box way off" aria-disabled="true">
            <b>{t("start.pay.quota")}</b>
            <p>{t("start.pay.quota.text")}</p>
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
