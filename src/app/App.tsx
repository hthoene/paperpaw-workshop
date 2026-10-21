// The workshop's pages: the start (your idea, who pays, your plugins), the
// workshop (the conversation beside the reader) with the person's key,
// and the same with a recorded example instead (#/example). The key lives
// here, in memory, and in the browser's storage only if they ask.

import { useEffect, useMemo, useState } from "preact/hooks";

import { AnthropicDirect } from "../ai/anthropic";
import example from "../ai/examples/night-owl.json";
import type { Provider } from "../ai/provider";
import { ReplayProvider, type Recording } from "../ai/replay";
import { Handbook } from "../handbook/handbook";
import { newProject, type Project } from "../project/project";
import { loadProject, saveProject } from "../project/storage";
import { Header } from "./Header";
import { Start } from "./Start";
import { WorkshopPage } from "./WorkshopPage";

const KEY_STORE = "paperpaw-workshop.key";

function rememberedKey(): string {
  try {
    return localStorage.getItem(KEY_STORE) ?? "";
  } catch {
    return "";
  }
}

type Route = { page: "start" } | { page: "project"; key: string } | { page: "example" };

function route(): Route {
  const m = /^#\/p\/([0-9a-f]+)$/.exec(location.hash);
  if (m) return { page: "project", key: m[1]! };
  if (location.hash === "#/example") return { page: "example" };
  return { page: "start" };
}

export function App() {
  const [handbook, setHandbook] = useState<Handbook | null>(null);
  const [failed, setFailed] = useState("");
  const [key, setKey] = useState(rememberedKey);
  const [where, setWhere] = useState<Route>(route);
  const [project, setProject] = useState<Project | null>(null);
  const [first, setFirst] = useState("");

  useEffect(() => {
    Handbook.load(new URL("handbook/", document.baseURI).href).then(setHandbook, (e) => setFailed(String(e)));
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
      setProject(newProject());
      setFirst((example as Recording).user[0]!);
    }
  }, [where]);

  const provider: Provider | null = useMemo(() => {
    if (where.page === "example") return new ReplayProvider(example as Recording, 900);
    return key ? new AnthropicDirect(key) : null;
  }, [where, key]);

  const useKey = (value: string, remember: boolean) => {
    setKey(value);
    try {
      if (remember) localStorage.setItem(KEY_STORE, value);
      else localStorage.removeItem(KEY_STORE);
    } catch {
      // Storage may be off: the key then lives for this tab only.
    }
  };

  const start = async (idea: string) => {
    const p = newProject();
    await saveProject(p);
    setFirst(idea);
    location.hash = `#/p/${p.key}`;
  };

  const working = handbook && project && provider && where.page !== "start";
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
            onFirstSent={() => setFirst("")}
          />
        ) : (
          handbook && (
            <Start
              apiKey={key}
              remembered={!!rememberedKey()}
              onKey={useKey}
              onStart={start}
              needsKey={where.page === "project" && !key}
            />
          )
        )}
      </main>
    </>
  );
}
