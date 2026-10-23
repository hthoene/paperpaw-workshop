// Every public item a plugin with code reaches through paperpaw-sdk, with
// its documentation, for `lookup_docs` to search by name and words
// (public/handbook/sdk-items.json):
//
// - the SDK's own items, as its api.txt names them (where they are after
//   re-exports), with the doc comments of the SDK's source;
// - the items of the crates it passes on, by the paths a plugin uses
//   (`paperpaw_sdk::config::Parser::new`, not `paperpaw_config::...`):
//   from their api.txt where they have one, else from their source (the
//   methods of `Canvas`, `Rect`, `Font` ...).
//
// Each item: { path (after `paperpaw_sdk::`), kind, signature, doc }; a
// trait's method also { decl (as its source declares it), provided (has
// a default) }.

/** The crates the SDK passes on, by their name in paths. */
const PASSED_ON = [
  "paperpaw_config",
  "paperpaw_document",
  "paperpaw_layout",
  "paperpaw_xml",
  "paperpaw_image",
  "paperpaw_hyphen",
  "paperpaw_zip",
  "paperpaw_json",
  "paperpaw_digest",
  "paperpaw_platform",
  "paperpaw_graphics",
  "paperpaw_i18n",
  "paperpaw_text",
  "paperpaw_update",
  "paperpaw_qr",
  "paperpaw_native",
];

const folder = (krate) => `crates/${krate.replace(/_/g, "-")}`;

/** The lines of an api.txt, each without the attributes before it
 *  (`#[non_exhaustive] pub struct …` is `pub struct …`). */
export function apiLines(text) {
  return text.split("\n").map((line) => line.replace(/^(?:#\[[^\]]*\]\s*)+/, ""));
}

/** The item an api.txt line of `krate` names: its kind and its path after
 *  the crate's name, generics left out (`Parser<'a>::next` is
 *  `Parser::next`). */
function named(line, krate) {
  const m = new RegExp(`^pub (?:([a-z]+(?: [a-z]+)*) )?${krate}::(\\w+(?:<[^>]*>)?(?:::\\w+(?:<[^>]*>)?)*)`).exec(line);
  if (!m) return null;
  return { kind: m[1] ? m[1].split(" ").at(-1) : "field", segs: m[2].replace(/<[^>]*>/g, "").split("::") };
}

/** A declaration from line `i` of `lines` up to its body or its end, on
 *  one line, and whether it has a body (a trait's `method`: a default,
 *  also one on its line, `fn live(&self) -> bool { true }`). */
function declaration(lines, i, method = false) {
  let decl = lines[i].trim();
  const done = () => /[{;]\s*$/.test(decl) || (method && decl.includes("{"));
  for (let j = i + 1; j < lines.length && !done() && j < i + 12; j++) decl += " " + lines[j].trim();
  const body = decl.includes("{");
  return {
    decl: decl.replace(/\s*(\{.*|where .*|;)$/, "").replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/,?\s*\)/g, ")"),
    body,
  };
}

/** The items a Rust source declares public: functions, types, constants,
 *  with their owner (the type of an `impl` block, or the trait a method
 *  is declared in), the declaration's first lines and the doc comment's
 *  first paragraph; a trait's methods also whether they have a default
 *  (`provided`). */
export function readItems(source) {
  const items = [];
  const lines = source.split("\n");
  let doc = [];
  let owner = null;
  let trait = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const comment = /^\s*\/\/\/ ?(.*)$/.exec(line);
    if (comment) {
      doc.push(comment[1]);
      continue;
    }
    if (/^\s*#\[/.test(line)) {
      // An attribute over several lines (`#[allow(\n …,\n)]`): to its end,
      // the doc comment above kept for the item below.
      let depth = 0;
      for (let j = i; j < lines.length; j++) {
        for (const c of lines[j]) depth += c === "[" ? 1 : c === "]" ? -1 : 0;
        if (depth <= 0) {
          i = j;
          break;
        }
      }
      continue;
    }
    const impl = /^impl(?:<[^>]*>)?\s+(?:[\w:<>, '&]+\s+for\s+)?([A-Z]\w*)/.exec(line);
    const opened = /^pub trait ([A-Za-z_]\w*)/.exec(line);
    if (impl) owner = impl[1];
    else if (/^}/.test(line)) owner = trait = null;
    // A method declared in a public trait: public with it, no `pub`.
    const method = trait && /^\s+(?:(?:const|async|unsafe)\s+)*fn\s+([A-Za-z_]\w*)/.exec(line);
    if (method) {
      const { decl, body } = declaration(lines, i, true);
      items.push({ owner: trait, name: method[1], kind: "fn", decl, provided: body, doc: doc.join("\n").split(/\n\s*\n/)[0].trim() });
      doc = [];
      continue;
    }
    const item = /^(\s*)pub(?:\([^)]*\))?\s+(?:(?:const|async|unsafe)\s+)*(fn|struct|enum|trait|type|const|static)\s+([A-Za-z_]\w*)/.exec(line);
    if (item && !/^\s*pub\(/.test(line)) {
      // The declaration up to its body (or its end, for a constant).
      const { decl } = declaration(lines, i);
      items.push({
        owner: item[1] && owner ? owner : null,
        name: item[3],
        kind: item[2],
        decl,
        doc: doc.join("\n").split(/\n\s*\n/)[0].trim(),
      });
    }
    if (opened && !/;\s*$/.test(line)) trait = opened[1];
    doc = [];
  }
  return items;
}

/** The SDK's items, as above, from PaperPaw's tree: `read(path)` gives a
 *  file's text, `exists(path)` whether it is there, `files(folder)` the
 *  paths of the `.rs` files under a folder. */
export function sdkItems({ read, exists, files }) {
  if (!exists("crates/paperpaw-sdk/api.txt")) return [];
  // A source file's module: `src/ui/button.rs` is `ui::button`.
  const moduleOf = (file, src) =>
    file
      .slice(src.length + 1)
      .replace(/\.rs$/, "")
      .replace(/(^|\/)(lib|mod)$/, "")
      .split("/")
      .filter(Boolean);
  const sourceItems = (krate) => {
    const src = `${folder(krate)}/src`;
    return exists(src) ? files(src).flatMap((f) => readItems(read(f)).map((it) => ({ ...it, module: moduleOf(f, src) }))) : [];
  };
  // Docs by crate, by `Owner::name` or `name`, each also after its module
  // and every module above it (`ui::button::draw_button`, `ui::draw_button`).
  const docs = new Map();
  // A trait's methods as their source declares them: with the names of
  // their parameters, and whether they have a default.
  const methods = new Map();
  const ofCrate = new Map();
  for (const krate of ["paperpaw_sdk", ...PASSED_ON]) {
    const found = sourceItems(krate);
    ofCrate.set(krate, found);
    const mine = new Map();
    const declared = new Map();
    for (const it of found) {
      const key = it.owner ? `${it.owner}::${it.name}` : it.name;
      for (let n = it.module.length; n >= 0; n--) {
        const at = [...it.module.slice(0, n), key].join("::");
        if (it.doc && !mine.has(at)) mine.set(at, it.doc);
        if (it.provided !== undefined && !declared.has(at)) declared.set(at, { decl: it.decl, provided: it.provided });
      }
    }
    docs.set(krate, mine);
    methods.set(krate, declared);
  }
  // What the source says of a trait's method `segs` of `krate`, by its
  // path, else by its owner and name.
  const methodOf = (krate, segs) => {
    if (segs.length < 2) return undefined;
    const key = `${segs.at(-2)}::${segs.at(-1)}`;
    const mine = methods.get(krate);
    return mine?.get([...segs.slice(0, -2), key].join("::")) ?? mine?.get(key);
  };
  // The doc of `segs` in `krate`: by its path, else by its name. One the
  // SDK passes on (`use`) has that of the crate its module is (`config::`
  // is paperpaw_config's), else of the one crate that has it.
  const docOf = (krate, segs, kind) => {
    const name = segs.at(-1);
    const owned = segs.length > 1 && /^[A-Z]/.test(segs.at(-2));
    const key = owned ? `${segs.at(-2)}::${name}` : name;
    const module = segs.slice(0, owned ? -2 : -1);
    const mine = docs.get(krate);
    const own = mine?.get([...module, key].join("::")) ?? (kind === "use" ? undefined : mine?.get(key));
    if (own || krate !== "paperpaw_sdk") return own ?? "";
    const theirs = module.length ? docs.get(`paperpaw_${module[0]}`) : undefined;
    const fromModule = theirs?.get([...module.slice(1), key].join("::")) ?? theirs?.get(key);
    if (fromModule) return fromModule;
    const all = PASSED_ON.map((k) => docs.get(k)?.get(key)).filter(Boolean);
    return all.length === 1 ? all[0] : (mine?.get(key) ?? "");
  };

  const items = [];
  const seen = new Set();
  const push = (path, kind, signature, doc, method) => {
    if (seen.has(path)) return;
    seen.add(path);
    items.push({ path, kind, signature, doc, ...(method ? { decl: method.decl, provided: method.provided } : {}) });
  };
  // The SDK's api.txt, and the names it passes on (`pub use`).
  const aliases = new Map();
  for (const line of apiLines(read("crates/paperpaw-sdk/api.txt"))) {
    const it = named(line, "paperpaw_sdk");
    if (!it || it.kind === "impl") continue;
    const path = it.segs.join("::");
    if (it.kind === "use") aliases.set(it.segs.at(-1), [...(aliases.get(it.segs.at(-1)) ?? []), path]);
    push(path, it.kind, line, docOf("paperpaw_sdk", it.segs, it.kind), it.kind === "fn" && methodOf("paperpaw_sdk", it.segs));
  }
  // Where the SDK passes on `name` of `krate`: its own module's alias, else
  // the top level's, else the only one.
  const alias = (krate, name) => {
    const all = aliases.get(name) ?? [];
    const module = krate.replace(/^paperpaw_/, "");
    return all.find((p) => p.startsWith(`${module}::`)) ?? all.find((p) => !p.includes("::")) ?? (all.length === 1 ? all[0] : undefined);
  };
  // A path of `krate` (after its name) as a plugin reaches it, if it does.
  const reached = (krate, segs) => {
    const typeAt = segs.findIndex((s) => /^[A-Z]/.test(s));
    const at = typeAt >= 0 ? typeAt : segs.length - 1;
    const base = alias(krate, segs[at]);
    return base ? [base, ...segs.slice(at + 1)].join("::") : undefined;
  };
  for (const krate of PASSED_ON) {
    const api = `${folder(krate)}/api.txt`;
    if (exists(api)) {
      for (const line of apiLines(read(api))) {
        const it = named(line, krate);
        if (!it || ["use", "mod", "impl"].includes(it.kind)) continue;
        const path = reached(krate, it.segs);
        if (path) push(path, it.kind, line, docOf(krate, it.segs, it.kind), it.kind === "fn" && methodOf(krate, it.segs));
      }
    } else {
      // No api.txt: what its source declares public, of the types and
      // functions the SDK passes on.
      for (const it of ofCrate.get(krate) ?? []) {
        const path = it.owner ? reached(krate, [it.owner, it.name]) : alias(krate, it.name) && reached(krate, [it.name]);
        if (path) push(path, it.kind, it.decl, it.doc, it.provided !== undefined && it);
      }
    }
  }
  return items;
}
