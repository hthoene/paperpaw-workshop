// The workshop's pages: the start (your idea, who pays, your plugins), the
// workshop (the conversation beside the reader) with the person's key,
// and the same with a recorded example instead (#/example); each with a
// share page (…/share) for the store. The key lives here, in memory, and
// in the browser's storage only if they ask.

import { useEffect, useMemo, useState } from "preact/hooks";

import { AnthropicDirect } from "../ai/anthropic";
import { QuotaProxy } from "../ai/quota";
import nightOwl from "../ai/examples/night-owl.json";
import quoteADay from "../ai/examples/quote-a-day.json";
import sleepPicture from "../ai/examples/sleep-picture.json";
import type { Provider } from "../ai/provider";
import { ReplayProvider, type Recording } from "../ai/replay";
import { Handbook } from "../handbook/handbook";
import { newProject, type Project } from "../project/project";
import { loadProject, saveProject } from "../project/storage";
import { FakeStore } from "../publish/fake";
import { SiteStore, type StoreApi } from "../publish/store";
import { Header } from "./Header";
import { loadHosting, type Hosting } from "./hosting";
import { Start, type Payer } from "./Start";
import { WorkshopPage } from "./WorkshopPage";

const KEY_STORE = "paperpaw-workshop.key";
const PAYER_STORE = "paperpaw-workshop.payer";

function rememberedPayer(): Payer {
  try {
    return localStorage.getItem(PAYER_STORE) === "quota" ? "quota" : "key";
  } catch {
    return "key";
  }
}

function rememberedKey(): string {
  try {
    return localStorage.getItem(KEY_STORE) ?? "";
  } catch {
    return "";
  }
}

/** The recorded examples to watch, by the name in their address
 *  (`#/example` is the first). */
const EXAMPLES: Record<string, Recording> = {
  "night-owl": nightOwl as Recording,
  "sleep-picture": sleepPicture as Recording,
  "quote-a-day": quoteADay as Recording,
};

type Route =
  | { page: "start" }
  | { page: "project"; key: string; share: boolean }
  | { page: "example"; name: string; share: boolean };

function route(): Route {
  const m = /^#\/p\/([0-9a-f]+)(\/share)?$/.exec(location.hash);
  if (m) return { page: "project", key: m[1]!, share: !!m[2] };
  // #/example, #/example/share, #/example/<name>, #/example/<name>/share
  const [hash, page, ...rest] = location.hash.split("/");
  if (hash === "#" && page === "example") {
    const share = rest.at(-1) === "share";
    const name = (share ? rest.slice(0, -1) : rest)[0] ?? "night-owl";
    if (name in EXAMPLES && rest.length <= (share ? 2 : 1)) return { page: "example", name, share };
  }
  return { page: "start" };
}

/** Which project a route shows: the same while only its page changes. */
function shown(where: Route): string {
  return where.page === "project" ? where.key : where.page === "example" ? `example:${where.name}` : where.page;
}

export function App() {
  const [handbook, setHandbook] = useState<Handbook | null>(null);
  const [hosting, setHosting] = useState<Hosting | null>(null);
  const [failed, setFailed] = useState("");
  const [key, setKey] = useState(rememberedKey);
  const [payer, setPayer] = useState<Payer>(rememberedPayer);
  const [where, setWhere] = useState<Route>(route);
  const [project, setProject] = useState<Project | null>(null);
  const [first, setFirst] = useState("");
  const [firstFiles, setFirstFiles] = useState<string[]>([]);

  useEffect(() => {
    Handbook.load(new URL("handbook/", document.baseURI).href).then(setHandbook, (e) => setFailed(String(e)));
    void loadHosting().then(setHosting);
    const moved = () => setWhere(route());
    addEventListener("hashchange", moved);
    return () => removeEventListener("hashchange", moved);
  }, []);

  // The project the address names, or a new one for the example.
  useEffect(() => {
    setProject(null);
    if (where.page === "project") {
      void loadProject(where.key).then((p) => setProject(p ?? null));
    } else if (where.page === "example") {
      const recording = EXAMPLES[where.name]!;
      const code = recording.kind === "code";
      // A plugin with code starts from the handbook's sample.
      if (code && !handbook) return;
      setProject(newProject(recording.kind, code ? handbook!.codeSample : undefined));
      setFirst(recording.user[0]!);
      setFirstFiles(recording.attach ?? []);
    }
  }, [shown(where), !!handbook]);

  // The free quota pays for both kinds, with the model the site chooses;
  // a project started with another model (Opus) goes on with the key.
  const quota = payer === "quota" && !!project && !project.model;
  const provider: Provider | null = useMemo(() => {
    if (where.page === "example") return new ReplayProvider(EXAMPLES[where.name]!, 900);
    if (quota) return new QuotaProxy(project!.kind);
    return key ? new AnthropicDirect(key) : null;
  }, [shown(where), key, quota, project?.kind]);

  // The store: paperpaw.org's own where the workshop runs there; a pretend
  // one for the example (nothing of it is sent) and in development.
  const pretend = where.page === "example" || import.meta.env.DEV;
  const store: StoreApi = useMemo(
    () => (pretend ? new FakeStore(undefined, 700) : new SiteStore(location.origin)),
    [pretend],
  );

  const choosePayer = (value: Payer) => {
    setPayer(value);
    try {
      localStorage.setItem(PAYER_STORE, value);
    } catch {
      // Storage may be off: the choice lives for this tab only.
    }
  };

  const useKey = (value: string, remember: boolean) => {
    setKey(value);
    try {
      if (remember) localStorage.setItem(KEY_STORE, value);
      else localStorage.removeItem(KEY_STORE);
    } catch {
      // Storage may be off: the key then lives for this tab only.
    }
  };

  const start = async (idea: string, kind: "data" | "code" = "data", model?: string) => {
    // A plugin with code starts from PaperPaw's sample.
    const p = newProject(kind, kind === "code" ? handbook?.codeSample : undefined, model);
    await saveProject(p);
    setFirst(idea);
    location.hash = `#/p/${p.key}`;
  };

  const working = handbook && hosting && project && provider && where.page !== "start";
  return (
    <>
      <Header />
      <main class="wrap">
        {failed && <p class="error">{failed}</p>}
        {working ? (
          <WorkshopPage
            key={project.key}
            project={project}
            handbook={handbook}
            provider={provider}
            first={first}
            firstFiles={firstFiles}
            onFirstSent={() => {
              setFirst("");
              setFirstFiles([]);
            }}
            sharing={"share" in where && where.share}
            store={store}
            pretend={pretend}
            frame={hosting.frame}
          />
        ) : (
          handbook && (
            <Start
              apiKey={key}
              remembered={!!rememberedKey()}
              payer={payer}
              onPayer={choosePayer}
              onKey={useKey}
              onStart={start}
              needsKey={where.page === "project" && !key && !quota}
            />
          )
        )}
      </main>
    </>
  );
}
