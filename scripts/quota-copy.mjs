// Copies what paperpaw.org's quota proxy sends to Anthropic with every
// request of the free quota (its fixed prompts and tools) from this
// workshop, byte for byte as the workshop sends them with an author's own
// key: the handbooks for data plugins and for plugins with code, and the
// definitions of DATA_TOOLS and CODE_TOOLS.
//
//   npm run quota-copy -- <the paperpaw.org repository>
//
// It writes <repository>/workshop/data.md, tools.json, code.md and
// code-tools.json; their README there names the commit they were made
// from.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { build } from "rolldown";

const [site] = process.argv.slice(2);
if (!site) {
  console.error("usage: npm run quota-copy -- <the paperpaw.org repository>");
  process.exit(2);
}
const here = resolve(import.meta.dirname, "..");
const out = resolve(site, "workshop");

// The tools are TypeScript: bundled once, to read their definitions.
const dir = mkdtempSync(join(tmpdir(), "quota-copy-"));
const entry = join(dir, "entry.ts");
writeFileSync(
  entry,
  `import { CODE_TOOLS, DATA_TOOLS } from ${JSON.stringify(join(here, "src/tools/registry.ts"))};
import { definition } from ${JSON.stringify(join(here, "src/tools/tool.ts"))};
export const tools = DATA_TOOLS.map((t) => definition(t, true));
export const codeTools = CODE_TOOLS.map((t) => definition(t, true));
`,
);
const file = join(dir, "tools.mjs");
await build({ input: entry, output: { file, format: "esm" }, platform: "node", logLevel: "silent" });
const { tools, codeTools } = await import(pathToFileURL(file).href);
rmSync(dir, { recursive: true, force: true });

for (const [name, kind, list] of [
  ["data", "tools.json", tools],
  ["code", "code-tools.json", codeTools],
]) {
  writeFileSync(join(out, kind), JSON.stringify(list, null, 2) + "\n");
  writeFileSync(join(out, `${name}.md`), readFileSync(join(here, `public/handbook/${name}.md`)));
  console.log(`${out}: ${name}.md, ${kind} (${list.map((t) => t.name).join(", ")})`);
}
