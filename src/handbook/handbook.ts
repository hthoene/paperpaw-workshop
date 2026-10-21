// The AI handbook generated from a PaperPaw ref (handbook/generate.mjs),
// served as static files: the system prompt for data plugins, the topics
// `lookup_docs` answers from, and the registry of every setting, widget,
// action and device profile that PaperPaw has.

export interface Choice {
  value: string;
  label: string;
}

export interface SettingInfo {
  id: string;
  title: string;
  help?: string;
  kind: "switch" | "number" | "choice" | "text" | "language" | "list" | "other";
  min?: number;
  max?: number;
  choices?: Choice[];
  default: string | number | boolean | null;
  group: string;
  advanced: boolean;
  scoped: boolean;
}

export interface Profile {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  touch: boolean;
  buttons: string[];
  colors: boolean;
  store: string | null;
  summary: string;
}

export interface Registry {
  settings: SettingInfo[];
  widgets: { id: string; title: string }[];
  actions: { id: string; title: string }[];
  profiles: Profile[];
}

export interface Topic {
  id: string;
  title: string;
  file: string;
  summary: string;
  tokens: number;
}

export interface Meta {
  ref: string;
  commit: string;
  generated: string;
  dataTokens: number;
}

/** The devices the workshop shows, by their profile ids, in this order. */
export const SHOWN_PROFILES = ["xteink-x4", "xteink-x4-pro", "boox-go-7"];

/** The longest answer `lookup_docs` gives, in tokens (about). */
export const MAX_TOPIC_TOKENS = 4000;

export class Handbook {
  constructor(
    readonly meta: Meta,
    readonly prompt: string,
    readonly topics: Topic[],
    readonly registry: Registry,
    private fetchTopic: (file: string) => Promise<string>,
  ) {}

  /** Loads it from `base` (a URL folder, `./handbook/` by default). */
  static async load(base = "./handbook/"): Promise<Handbook> {
    const get = async (name: string) => {
      const r = await fetch(base + name);
      if (!r.ok) throw new Error(`the handbook's ${name} could not be loaded (${r.status})`);
      return r;
    };
    const [meta, prompt, topics, registry] = await Promise.all([
      get("meta.json").then((r) => r.json()),
      get("data.md").then((r) => r.text()),
      get("index.json").then((r) => r.json()),
      get("registry.json").then((r) => r.json()),
    ]);
    return new Handbook(meta, prompt, topics, registry, (file) =>
      get(`topics/${file}`).then((r) => r.text()),
    );
  }

  profile(id: string): Profile | undefined {
    return this.registry.profiles.find((p) => p.id === id);
  }

  setting(id: string): SettingInfo | undefined {
    return this.registry.settings.find((s) => s.id === id);
  }

  /** The topic `query` names, or the closest ones by their words. */
  find(query: string): { topic?: Topic; candidates: Topic[] } {
    const q = query.trim().toLowerCase();
    // An id first, then a docs section of that name, then a title.
    const exact =
      this.topics.find((t) => t.id === q) ??
      this.topics.find((t) => t.id === `docs/${q}`) ??
      this.topics.find((t) => t.title.toLowerCase() === q);
    if (exact) return { topic: exact, candidates: [] };
    const words = q.split(/[^a-z0-9.@-]+/).filter((w) => w.length > 1);
    const scored = this.topics
      .map((t) => {
        const hay = `${t.id} ${t.title} ${t.summary}`.toLowerCase();
        const score = words.reduce((n, w) => n + (hay.includes(w) ? (t.id.includes(w) ? 3 : 1) : 0), 0);
        return { t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.t.tokens - b.t.tokens);
    return { candidates: scored.slice(0, 8).map((x) => x.t) };
  }

  /** The text of `topic`, cut to [`MAX_TOPIC_TOKENS`] with a note. */
  async read(topic: Topic): Promise<string> {
    const text = await this.fetchTopic(topic.file);
    const limit = MAX_TOPIC_TOKENS * 3.6;
    if (text.length <= limit) return text;
    const cut = text.slice(0, limit);
    const end = cut.lastIndexOf("\n");
    const narrower = topic.id.startsWith("settings/")
      ? ` Ask for a narrower one, such as settings-group/<group> for one group of these settings.`
      : "";
    return `${cut.slice(0, end > 0 ? end : limit)}\n\n(Cut here: the topic is longer than one answer.${narrower})`;
  }
}
