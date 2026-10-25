// The AI handbook generated from a PaperPaw ref (handbook/generate.mjs),
// served as static files: the system prompt for data plugins, the topics
// `lookup_docs` answers from, every public item of the SDK with its
// documentation (searched by name), and the registry of every setting,
// widget, action and device profile that PaperPaw has.

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
  /** Whether its screen shows colours (registry 2; older ones say it in
   *  `summary` only). */
  colour_screen?: boolean;
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

/** A public item a plugin reaches through the SDK (sdk-items.json). */
export interface SdkItem {
  /** After `paperpaw_sdk::`, e.g. `ui::Ui::button`, `Canvas::fill`. */
  path: string;
  kind: string;
  signature: string;
  doc: string;
  /** A trait's method: as its source declares it (with its parameters'
   *  names), and whether it has a default. */
  decl?: string;
  provided?: boolean;
}

/** The most items a search answers with. */
export const MAX_ITEMS = 12;

/** Kinds of items that have members, shown whole when looked up. */
const WHOLE = ["trait", "struct", "enum"];

/** Paths in a signature as a plugin writes them: `Option<Rect>`, not
 *  `core::option::Option<paperpaw_platform::geometry::Rect>`. */
export function shortTypes(text: string): string {
  return text
    .replace(/\b(?:alloc|core|std)::(?:[a-z_]\w*::)*/g, "")
    .replace(/\bpaperpaw_\w+::(?:[a-z_]\w*::)*(?=[A-Z])/g, "")
    .replace(/\bcrate::/g, "");
}

/** The first lines of a documentation, indented. */
function docLines(doc: string, indent: string, lines = 3): string {
  const kept = doc.split("\n").slice(0, lines);
  return kept.length && kept[0] ? `\n${kept.map((l) => indent + l).join("\n")}${doc.split("\n").length > lines ? " …" : ""}` : "";
}

/** A member of `owner` as written inside it: `fn height(&self, …) -> u16`,
 *  `pub width: u16`. */
function memberLine(owner: SdkItem, member: SdkItem): string {
  if (member.decl) return shortTypes(member.decl);
  const name = owner.path.split("::").at(-1)!;
  return shortTypes(member.signature).replace(new RegExp(`\\b${name}::(?=\\w+[:(<])`), "");
}

/** An item as `lookup_docs` gives it: its signature and documentation;
 *  a trait, struct or enum whole, with every member (a trait's methods
 *  required first, then those with a default; a struct's fields, then
 *  its constructors, then its methods). */
export function describe(item: SdkItem, members: SdkItem[] = []): string {
  const head = `${item.signature}${docLines(item.doc, "    ", 6)}`;
  if (!members.length) return head;
  const block = (title: string, list: SdkItem[]) =>
    list.length ? `\n  ${title}\n${list.map((m) => `    ${memberLine(item, m)}${docLines(m.doc, "        ")}`).join("\n")}` : "";
  if (item.kind === "trait") {
    const required = members.filter((m) => m.provided === false);
    const provided = members.filter((m) => m.provided !== false);
    return `${head}${block("Required methods (implement each):", required)}${block("Provided methods (they have a default; implement one only to change it):", provided)}`;
  }
  const fields = members.filter((m) => m.kind === "field");
  const fns = members.filter((m) => m.kind !== "field");
  const made = (m: SdkItem) => /->\s*(Self|[A-Z]\w*Spec)\b/.test(m.signature) && !/\(&(mut )?self/.test(m.signature);
  return `${head}${block(item.kind === "enum" ? "Variants and fields:" : "Fields:", fields)}${block("Made with:", fns.filter(made))}${block("Methods:", fns.filter((m) => !made(m)))}`;
}

/** What follows `kept` of a long answer: the names left out, to look up. */
function leftOut(names: string[]): string {
  const shown = names.slice(0, 80);
  const more = names.length - shown.length;
  return `\n\n(Not shown, as this is longer than one answer: ${shown.join(", ")}${more > 0 ? ` and ${more} more` : ""}. Look any of them up by name: the answer has the whole item.)`;
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
    /** The system prompt for plugins with code. */
    readonly code = "",
    /** The project a plugin with code starts from: PaperPaw's sample. */
    readonly codeSample: Record<string, string> = {},
    /** The SDK's items, fetched when first searched (none if the handbook
     *  has none). */
    private fetchItems: () => Promise<SdkItem[]> = async () => [],
  ) {}

  private sdk?: Promise<SdkItem[]>;

  /** The system prompt for a kind of plugin. */
  promptFor(kind: "data" | "code"): string {
    return kind === "code" ? this.code : this.prompt;
  }

  /** Loads it from `base` (a URL folder, `./handbook/` by default). */
  static async load(base = "./handbook/"): Promise<Handbook> {
    const get = async (name: string) => {
      const r = await fetch(base + name);
      if (!r.ok) throw new Error(`the handbook's ${name} could not be loaded (${r.status})`);
      return r;
    };
    const [meta, prompt, topics, registry, code, sample] = await Promise.all([
      get("meta.json").then((r) => r.json()),
      get("data.md").then((r) => r.text()),
      get("index.json").then((r) => r.json()),
      get("registry.json").then((r) => r.json()),
      get("code.md").then((r) => r.text()),
      get("code-sample.json").then((r) => r.json()),
    ]);
    // An older handbook has no sdk-items.json: then nothing is found.
    const items = () =>
      fetch(base + "sdk-items.json").then(
        (r) => (r.ok ? (r.json() as Promise<SdkItem[]>) : []),
        () => [],
      );
    return new Handbook(meta, prompt, topics, registry, (file) => get(`topics/${file}`).then((r) => r.text()), code, sample, items);
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
        // A whole title named in the query matters more than words
        // repeated across many settings' summaries.
        const named = (` ${q} `).includes(` ${t.title.toLowerCase()} `) ? 4 : 0;
        const score = named + words.reduce((n, w) => n + (hay.includes(w) ? (t.id.includes(w) ? 3 : 1) : 0), 0);
        return { t, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.t.tokens - b.t.tokens);
    return { candidates: scored.slice(0, 8).map((x) => x.t) };
  }

  /** The SDK's items that `query` names or describes, best first: by
   *  their name (`Ui::button`, `Canvas::fill`), else by the words of
   *  their path and documentation (`button`, `canvas text`). */
  async items(query: string): Promise<SdkItem[]> {
    const all = await (this.sdk ??= this.fetchItems().catch(() => []));
    const q = query.trim().replace(/^paperpaw_sdk::/, "").toLowerCase();
    if (!q) return [];
    const words = q.split(/[^a-z0-9_:]+/).filter((w) => w.length > 1);
    // "fill rect" may mean fill_rect.
    const joined = words.join("_");
    const scored = all
      .map((item) => {
        const path = item.path.toLowerCase();
        const name = path.split("::").at(-1)!;
        let score = 0;
        if (path === q || path.endsWith(`::${q}`)) score += 100;
        else if (name === q || name === joined) score += 60;
        else if (words.length > 1 && words.every((w) => name.includes(w))) score += 10;
        for (const w of words) {
          if (name === w) score += 20;
          else if (name.includes(w)) score += 8;
          else if (path.includes(w)) score += 4;
          else if (item.doc.toLowerCase().includes(w)) score += 1;
          else score -= 3;
        }
        // Functions and types before fields and re-exports.
        if (score > 0 && ["fn", "struct", "enum", "trait", "const"].includes(item.kind)) score += 2;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.path.length - b.item.path.length);
    return scored.slice(0, MAX_ITEMS).map((x) => x.item);
  }

  /** The members of the type or trait at `path`: its fields, methods and
   *  variants, in the order the SDK lists them. */
  async members(path: string): Promise<SdkItem[]> {
    const all = await (this.sdk ??= this.fetchItems().catch(() => []));
    const depth = path.split("::").length + 1;
    return all.filter((i) => i.path.startsWith(`${path}::`) && i.path.split("::").length === depth && i.kind !== "impl");
  }

  /** The SDK's items for `query` as `lookup_docs` answers: those it
   *  names whole (a trait with every method, a struct with its fields and
   *  constructors), the others with their signatures; never cut inside an
   *  item, and what does not fit named at the end. */
  async lookup(query: string): Promise<string> {
    const found = await this.items(query);
    const asked = query.trim().replace(/^(?:paperpaw_sdk::|trait |struct |enum )/, "").split(/\s+/)[0]!.toLowerCase();
    const parts: { name: string; text: string }[] = [];
    const inside = new Set<string>();
    for (const item of found) {
      if (inside.has(item.path)) continue;
      const name = item.path.split("::").at(-1)!.toLowerCase();
      const whole = WHOLE.includes(item.kind) && (item.path.toLowerCase() === asked || item.path.toLowerCase().endsWith(`::${asked}`) || name === asked);
      const members = whole ? await this.members(item.path) : [];
      members.forEach((m) => inside.add(m.path));
      parts.push({ name: item.path, text: describe(item, members) });
    }
    const limit = MAX_TOPIC_TOKENS * 3.6;
    const kept: string[] = [];
    let size = 0;
    for (const [i, part] of parts.entries()) {
      if (kept.length && size + part.text.length > limit) return kept.join("\n\n") + leftOut(parts.slice(i).map((p) => p.name));
      kept.push(part.text);
      size += part.text.length + 2;
    }
    return kept.join("\n\n");
  }

  /** The text of `topic`, whole up to [`MAX_TOPIC_TOKENS`]; longer, as
   *  many whole parts as fit (an item of the SDK, a paragraph, a table's
   *  row), never cut inside one, and what is left out named. */
  async read(topic: Topic): Promise<string> {
    const text = await this.fetchTopic(topic.file);
    const limit = MAX_TOPIC_TOKENS * 3.6;
    if (text.length <= limit) return text;
    const fenced = /^```(\w*)\n([\s\S]*?)\n```\s*$/.exec(text);
    // A module's items: its types and functions, without the members of
    // its types, which a lookup of the type gives whole.
    const member = (line: string) => /paperpaw_sdk::(?:\w+::)*[A-Z]\w*::\w+/.test(line);
    const blocks = fenced
      ? fenced[2]!.split("\n").filter((l) => !member(l))
      : text.split(/\n\n/).flatMap((b) => (b.length > limit ? b.split("\n") : [b]));
    const join = fenced ? "\n" : "\n\n";
    const kept: string[] = [];
    let size = 0;
    let i = 0;
    for (; i < blocks.length && size + blocks[i]!.length <= limit - 400; i++) {
      kept.push(blocks[i]!);
      size += blocks[i]!.length + join.length;
    }
    const body = fenced ? `\`\`\`${fenced[1]}\n${kept.join("\n")}\n\`\`\`` : kept.join(join);
    const rest = blocks.slice(i);
    if (fenced) {
      const names = rest.map((l) => /paperpaw_sdk::([\w:]+)/.exec(l)?.[1]).filter((n): n is string => !!n);
      const note = "\n\n(The fields and methods of the types above are not listed: look a type up by name for it whole.)";
      return body + note + (names.length ? leftOut(names) : "");
    }
    const headings = rest.map((b) => /^#+ (.*)/.exec(b)?.[1]).filter((h): h is string => !!h);
    const narrower = topic.id.startsWith("settings/") ? " Ask for a narrower one, such as settings-group/<group> for one group of these settings." : "";
    return `${body}\n\n(Not shown, as the topic is longer than one answer: ${headings.length ? headings.join(", ") : `${rest.length} more parts`}.${narrower})`;
  }
}
