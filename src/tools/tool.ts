// What a tool of the AI is: a name, a description the model reads, an
// input schema (zod: checked before it runs, and sent to the API as JSON
// Schema), and what it does. Adding a tool: one file in this folder, its
// test, and a line in registry.ts.

import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

import type { Emulator } from "../emulator/emulator";
import type { Handbook, Profile } from "../handbook/handbook";
import type { BuildResult, Builder } from "../build/client";
import type { PictureKit } from "../pictures/kit";
import type { Files } from "../project/project";
import type { PictureMode, PictureShape, Uploads } from "../project/uploads";

export interface ToolContext {
  files: Files;
  emulator: Emulator;
  handbook: Handbook;
  /** The devices the workshop shows, in their order. */
  profiles: Profile[];
  /** Gives the emulator the plugin's files as they are now. */
  sync(): Promise<void>;
  /** The author's uploads, and what decodes their pictures. */
  uploads: Uploads;
  pictures: PictureKit;
  /** The reader the author sees: which device, and showing another. */
  reader: {
    shown(): Profile;
    show(profile: Profile): Promise<void>;
    /** Runs a build's module (PaperPaw with the plugin with code in it). */
    useModule(url: string | null): Promise<void>;
  };
  /** Where plugins with code are built, if there is a builder. */
  builder?: Builder;
  /** Told of every build, for the page to show its messages. */
  /** A plugin with code: its id, once the reader runs a build of it,
   *  for its checks. */
  codePlugin?(): string | undefined;
  /** The recorded answers for the plugin's requests, kept with the
   *  project; whether requests none answers go to the internet (only on
   *  one's own computer). */
  network?: {
    set(fixtures: import("../emulator/protocol").Fixture[]): Promise<void>;
    real(): boolean;
  };
  lastBuild?(result: BuildResult): void;
  /** Makes a picture of an upload as `shape` says and as the person chose
   *  for it (smaller, in grays or colours, or kept), where the app can: the
   *  file to write at `to`. Without it, convert_picture dithers itself. */
  optimise?(upload: string, to: string, shape: PictureShape): Promise<{ png: Uint8Array; width: number; height: number; mode: PictureMode }>;
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
