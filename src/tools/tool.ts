// What a tool of the AI is: a name, a description the model reads, an
// input schema (zod: checked before it runs, and sent to the API as JSON
// Schema), and what it does. Adding a tool: one file in this folder, its
// test, and a line in registry.ts.

import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import type { Emulator } from "../emulator/emulator";
import type { Handbook, Profile } from "../handbook/handbook";
import type { Files } from "../project/project";

export interface ToolContext {
  files: Files;
  emulator: Emulator;
  handbook: Handbook;
  /** The devices the workshop shows, in their order. */
  profiles: Profile[];
  /** Gives the emulator the plugin's files as they are now. */
  sync(): Promise<void>;
}

/** One line the conversation shows for a step: a catalog key and its values. */
export interface Step {
  key: string;
  vars?: Record<string, string>;
}

export interface ToolResult {
  content: string | Anthropic.ToolResultBlockParam["content"];
  isError?: boolean;
  step: Step;
}

export interface WorkshopTool<I = unknown> {
  name: string;
  description: string;
  schema: z.ZodType<I>;
  /** Whether its input may stream as it is written (large inputs). */
  eager?: boolean;
  run(input: I, context: ToolContext): Promise<ToolResult>;
}

/** The tool as the API takes it. */
export function definition(tool: WorkshopTool, eager: boolean): Anthropic.Tool {
  const schema = z.toJSONSchema(tool.schema) as Anthropic.Tool.InputSchema;
  delete (schema as Record<string, unknown>)["$schema"];
  return {
    name: tool.name,
    description: tool.description,
    input_schema: schema,
    ...(eager && tool.eager ? { eager_input_streaming: true } : {}),
  };
}

/** A device the AI names ("X4", "X4 Pro", "Boox Go 7"), as a profile. */
export function deviceNamed(context: ToolContext, name: string | undefined): Profile {
  const wanted = (name ?? "").toLowerCase().replace(/^xteink\s*/, "");
  const found = context.profiles.find((p) => {
    const short = p.name.toLowerCase().replace(/^xteink\s*/, "");
    return short === wanted || p.id === wanted;
  });
  return found ?? context.profiles[0]!;
}

/** The plain name of `profile` for the conversation ("X4 Pro"). */
export function shortName(profile: Profile): string {
  return profile.name.replace(/^Xteink\s+/, "");
}
