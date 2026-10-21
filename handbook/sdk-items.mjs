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
// Each item: { path (after `paperpaw_sdk::`), kind, signature, doc }.

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

/** The item an api.txt line of `krate` names: its kind and its path after
 *  the crate's name, generics left out (`Parser<'a>::next` is
 *  `Parser::next`). */
function named(line, krate) {
  const m = new RegExp(`^pub (?:([a-z]+(?: [a-z]+)*) )?${krate}::(\\w+(?:<[^>]*>)?(?:::\\w+(?:<[^>]*>)?)*)`).exec(line);
  if (!m) return null;
  return { kind: m[1] ? m[1].split(" ").at(-1) : "field", segs: m[2].replace(/<[^>]*>/g, "").split("::") };
}

/** The items a Rust source declares public: functions, types, constants,
 *  with their owner (the type of an `impl` block), the declaration's
 *  first lines and the doc comment's first paragraph. */
export function readItems(source) {
  const items = [];
  const lines = source.split("\n");
  let doc = [];
  let owner = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const comment = /^\s*\/\/\/ ?(.*)$/.exec(line);
    if (comment) {
      doc.push(comment[1]);
      continue;
    }
    if (/^\s*#\[/.test(line)) continue;
    const impl = /^impl(?:<[^>]*>)?\s+(?:[\w:<>, '&]+\s+for\s+)?([A-Z]\w*)/.exec(line);
    if (impl) owner = impl[1];
    else if (/^}/.test(line)) owner = null;
    const item = /^(\s*)pub(?:\([^)]*\))?\s+(?:(?:const|async|unsafe)\s+)*(fn|struct|enum|trait|type|const|static)\s+([A-Za-z_]\w*)/.exec(line);
    if (item && !/^\s*pub\(/.test(line)) {
      // The declaration up to its body (or its end, for a constant).
      let decl = line.trim();
      for (let j = i + 1; j < lines.length && !/[{;]\s*$/.test(decl) && j < i + 12; j++) decl += " " + lines[j].trim();
      decl = decl.replace(/\s*(\{.*|where .*)$/, "").replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/,?\s*\)/g, ")");
      items.push({
        owner: item[1] && owner ? owner : null,
        name: item[3],
        kind: item[2],
        decl,
        doc: doc.join("\n").split(/\n\s*\n/)[0].trim(),
      });
    }
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
  const ofCrate = new Map();
  for (const krate of ["paperpaw_sdk", ...PASSED_ON]) {
    const found = sourceItems(krate);
    ofCrate.set(krate, found);
    const mine = new Map();
    for (const it of found) {
      if (!it.doc) continue;
      const key = it.owner ? `${it.owner}::${it.name}` : it.name;
      for (let n = it.module.length; n >= 0; n--) {
        const at = [...it.module.slice(0, n), key].join("::");
        if (!mine.has(at)) mine.set(at, it.doc);
      }
    }
    docs.set(krate, mine);
  }
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
  const push = (path, kind, signature, doc) => {
    if (seen.has(path)) return;
    seen.add(path);
    items.push({ path, kind, signature, doc });
  };
  // The SDK's api.txt, and the names it passes on (`pub use`).
  const aliases = new Map();
  for (const line of read("crates/paperpaw-sdk/api.txt").split("\n")) {
    const it = named(line, "paperpaw_sdk");
    if (!it || it.kind === "impl") continue;
    const path = it.segs.join("::");
    if (it.kind === "use") aliases.set(it.segs.at(-1), [...(aliases.get(it.segs.at(-1)) ?? []), path]);
    push(path, it.kind, line, docOf("paperpaw_sdk", it.segs, it.kind));
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
      for (const line of read(api).split("\n")) {
        const it = named(line, krate);
        if (!it || ["use", "mod", "impl"].includes(it.kind)) continue;
        const path = reached(krate, it.segs);
        if (path) push(path, it.kind, line, docOf(krate, it.segs, it.kind));
      }
    } else {
      // No api.txt: what its source declares public, of the types and
      // functions the SDK passes on.
      for (const it of ofCrate.get(krate) ?? []) {
        const path = it.owner ? reached(krate, [it.owner, it.name]) : alias(krate, it.name) && reached(krate, [it.name]);
        if (path) push(path, it.kind, it.decl, it.doc);
      }
    }
  }
  return items;
}
