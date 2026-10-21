// Building a plugin with code: the project's files to the builder, the
// compiler's messages back to the AI, and on success the reader beside the
// conversation runs PaperPaw with the plugin compiled in.

import { z } from "zod";

import { BuilderUnavailable, projectFiles, type BuildResult } from "../build/client";
import type { WorkshopTool } from "./tool";

/** The most characters of compiler output the AI reads in one answer. */
const MAX_OUTPUT = 12_000;

export const build: WorkshopTool<Record<string, never>> = {
  name: "build",
  description:
    "Compile the plugin and put it into the reader beside the conversation: PaperPaw with your plugin in it, on the device shown. Answers with the compiler's messages when it does not compile (errors first; fix the first, then build again), or with how long it took. After a build, look and press to see the plugin at work.",
  schema: z.object({}).strict(),
  async run(_input, context) {
    const step = { key: "step.build" };
    if (!context.builder) return { content: "There is no builder here: plugins with code need it (docker compose up builder).", isError: true, step };
    let result: BuildResult;
    try {
      result = await context.builder.build(projectFiles(context.files.all()), ["web"]);
    } catch (e) {
      const why = e instanceof BuilderUnavailable ? "The builder is not running or could not be reached" : `The build could not be made: ${e instanceof Error ? e.message : String(e)}`;
      return { content: `${why}. Say so to the person; nothing is wrong with the plugin's code.`, isError: true, step };
    }
    context.lastBuild?.(result);
    if (result.problems.length) {
      return { content: `Not built: the project does not fit what the builder takes.\n${result.problems.map((p) => `- ${p}`).join("\n")}`, isError: true, step };
    }
    const errors = result.diagnostics.filter((d) => d.level === "error");
    const warnings = result.diagnostics.filter((d) => d.level === "warning");
    if (result.state !== "done" || errors.length) {
      const text = result.diagnostics.map((d) => d.rendered.trim()).join("\n\n") || result.log_tail;
      return {
        content: `The build failed: ${errors.length} errors, ${warnings.length} warnings.\n\n${text.slice(0, MAX_OUTPUT)}`,
        isError: true,
        step,
      };
    }
    const module = result.files.find((f) => f.target === "web");
    if (module) await context.reader.useModule(module.url);
    const warned = warnings.length ? `\n\n${warnings.length} warnings:\n\n${warnings.map((w) => w.rendered.trim()).join("\n\n").slice(0, MAX_OUTPUT)}` : "";
    return {
      content: `Built in ${result.seconds ?? "?"} s. The reader beside the conversation now runs PaperPaw with the plugin in it; look and press to see it.${warned}`,
      step,
    };
  },
};
