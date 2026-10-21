// Every text the workshop shows comes from a catalog, so more languages
// can follow: a JSON file per language, keys as in en.json. English is
// the only one so far and the fallback for missing keys.
//
// A text with a number in it has a form for each plural category of the
// language (`key.one`, `key.other`, and `key.few` and the like where a
// language has them); `t` picks the one `Intl.PluralRules` names for
// `vars.n`.

import en from "./en.json";

export type Catalog = Record<string, string>;

const catalogs: Record<string, Catalog> = { en };
let language = "en";
let current: Catalog = en;
let plurals = new Intl.PluralRules("en");

/** Uses the catalog of `code`, if there is one; English otherwise. */
export function useLanguage(code: string): void {
  language = catalogs[code] ? code : "en";
  current = catalogs[language]!;
  plurals = new Intl.PluralRules(language);
}

/** The text of `key`, with `{name}` replaced by `vars.name`, in the plural
 *  form for `vars.n` where it has forms; the key itself when no catalog
 *  has it, so a missing text is easy to see. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const text = lookup(key, vars.n) ?? key;
  return text.replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all));
}

function lookup(key: string, n: string | number | undefined): string | undefined {
  const forms = typeof n === "number" ? [`${key}.${plurals.select(n)}`, `${key}.other`, key] : [key, `${key}.other`];
  for (const catalog of [current, en as Catalog]) {
    for (const form of forms) if (form in catalog) return catalog[form];
  }
  return undefined;
}

/** The language in use, for the page's `lang`. */
export function languageInUse(): string {
  return language;
}
