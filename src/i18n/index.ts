// Every text the workshop shows comes from a catalog, so more languages
// can follow: a JSON file per language, keys as in en.json. English is
// the only one so far and the fallback for missing keys.

import en from "./en.json";

export type Catalog = Record<string, string>;

const catalogs: Record<string, Catalog> = { en };
let current: Catalog = en;

/** Uses the catalog of `language`, if there is one; English otherwise. */
export function useLanguage(language: string): void {
  current = catalogs[language] ?? en;
}

/** The text of `key`, with `{name}` replaced by `vars.name`; the key itself
 *  when no catalog has it, so a missing text is easy to see. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const text = current[key] ?? (en as Catalog)[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (all, name: string) =>
    name in vars ? String(vars[name]) : all,
  );
}
