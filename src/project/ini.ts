// PaperPaw's ini files, read as PaperPaw reads them: `[section]` lines,
// `key = value` lines, `#` and `;` comments, blank lines. Each entry keeps
// its line, so findings can say where.

export interface IniEntry {
  section: string;
  key: string;
  value: string;
  line: number;
}

export interface IniProblem {
  line: number;
  message: string;
}

export interface Ini {
  entries: IniEntry[];
  sections: string[];
  problems: IniProblem[];
}

export function parseIni(text: string): Ini {
  const entries: IniEntry[] = [];
  const sections: string[] = [];
  const problems: IniProblem[] = [];
  let section = "";
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = i + 1;
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#") || trimmed.startsWith(";")) return;
    if (trimmed.startsWith("[")) {
      const m = /^\[([^\]]+)\]$/.exec(trimmed);
      if (!m) {
        problems.push({ line, message: `"${trimmed}" is no section: write [name]` });
        return;
      }
      section = m[1]!.trim();
      sections.push(section);
      return;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      problems.push({ line, message: `"${trimmed}" is neither a section nor key = value` });
      return;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (section === "") {
      problems.push({ line, message: `"${key}" comes before any [section]` });
    }
    entries.push({ section, key, value, line });
  });
  return { entries, sections, problems };
}

/** The value of `key` in `section`, if set. */
export function iniValue(ini: Ini, section: string, key: string): string | undefined {
  return ini.entries.find((e) => e.section === section && e.key === key)?.value;
}
