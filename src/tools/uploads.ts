// The author's uploads, for the AI: list them, look at one (vision), make
// a picture of one for the readers into the plugin, copy a font or text
// into it. Uploads themselves never become plugin files;
// what these tools write does.

import { z } from "zod";

import { MAX_PICTURE_FILE, makePicture, targetsFor } from "../pictures/convert";
import { isText } from "../project/rules";
import type { WorkshopTool } from "./tool";
import { deviceNamed, type ToolContext } from "./tool";

const RECT = z.object({ x: z.number().min(0), y: z.number().min(0), width: z.number().min(1), height: z.number().min(1) }).strict();

export const listUploads: WorkshopTool<Record<string, never>> = {
  name: "list_uploads",
  description:
    "List the pictures and files the author uploaded: name, kind, size, and a picture's pixels. Uploads are not in the plugin; use convert_picture or place_file to put something of them into it.",
  schema: z.object({}).strict(),
  async run(_input, { uploads }) {
    const list = uploads.list();
    const line = (u: (typeof list)[number]) =>
      `${u.name}: ${u.kind}, ${u.type}, ${u.bytes} bytes${u.width ? `, ${u.width} x ${u.height} pixels` : ""}`;
    return {
      content: list.length ? `${list.map(line).join("\n")}\n(${uploads.showable} more pictures may be viewed in this conversation.)` : "(the author has uploaded nothing)",
      step: { key: "step.list_uploads" },
    };
  },
};

export const viewUpload: WorkshopTool<{ name: string; crop?: z.infer<typeof RECT> }> = {
  name: "view_upload",
  description:
    "Look at an uploaded picture, e.g. a screenshot or sketch of a look the author wants, or to choose how to crop a photo. Optionally only a part of it (crop, in the picture's own pixels) to see details. Each view counts toward the pictures a conversation may show; pictures the author added to a message are already in it.",
  schema: z.object({ name: z.string(), crop: RECT.optional() }).strict(),
  async run({ name, crop }, { uploads, pictures }) {
    const step = { key: "step.view_upload", vars: { name } };
    const info = uploads.info(name);
    const bytes = info && (await uploads.read(name));
    if (!info || !bytes) return { content: `There is no upload ${name}. list_uploads lists them.`, isError: true, step };
    if (info.kind !== "picture") return { content: `${name} is a ${info.kind}, not a picture.`, isError: true, step };
    if (uploads.showable === 0) return { content: "This conversation has shown as many pictures as it may. Work from what you saw.", isError: true, step };
    const picture = await pictures.forAi(bytes, info.type, crop);
    uploads.shown();
    return {
      content: [
        { type: "image", source: { type: "base64", media_type: picture.mediaType, data: picture.data } },
        { type: "text", text: `${name}${crop ? `, the part at ${crop.x},${crop.y} of ${crop.width} x ${crop.height}` : ""}, shown at ${picture.width} x ${picture.height}.` },
      ],
      step,
    };
  },
};

export interface ConvertInput {
  upload: string;
  to: string;
  fit: "fill" | "whole";
  crop?: z.infer<typeof RECT>;
  box?: { width: number; height: number };
  brightness?: number;
  contrast?: number;
  gamma?: number;
  dither?: "auto" | "diffusion" | "lineart" | "none";
  invert?: boolean;
  devices?: string[];
}

export const convertPicture: WorkshopTool<ConvertInput> = {
  name: "convert_picture",
  description:
    "Make an uploaded picture into a picture of the plugin, made for e-ink: gray, fitted to the screen (or to a box, e.g. for a logo), toned, and dithered to the panel's grays (four on the X4). Writes a PNG at `to` (e.g. sleep/1.png, logo.png) and shows you how the X4 shows it: judge it, and convert again with other tone or crop if it is too dark, too flat or cut badly. The devices default to all the workshop shows.",
  schema: z
    .object({
      upload: z.string().describe("The upload's name, from list_uploads"),
      to: z.string().regex(/\.png$/).describe("Its path in the plugin, ending in .png: sleep/1.png, logo.png, pictures/owl.png"),
      fit: z.enum(["fill", "whole"]).describe("fill: cover the screen or box, cut at the edges; whole: all of it, paper around"),
      crop: RECT.optional().describe("Use only this part of the upload, in its own pixels"),
      box: z
        .object({ width: z.number().int().min(8).max(480), height: z.number().int().min(8).max(800) })
        .strict()
        .optional()
        .describe("A box smaller than the screen, in X4 pixels (480 x 800 screen), e.g. 160 x 160 for a logo"),
      brightness: z.number().min(-1).max(1).optional(),
      contrast: z.number().min(-1).max(1).optional(),
      gamma: z.number().min(0.3).max(3).optional().describe("Above 1 lightens the middle grays"),
      dither: z.enum(["auto", "diffusion", "lineart", "none"]).optional().describe("auto: line art for drawings, diffusion for photos"),
      invert: z.boolean().optional(),
      devices: z.array(z.string()).optional().describe('Make it only for these, e.g. ["X4", "X4 Pro"]'),
    })
    .strict(),
  async run(input, context) {
    const step = { key: "step.convert_picture", vars: { path: input.to } };
    const { uploads, pictures, files } = context;
    const info = uploads.info(input.upload);
    const bytes = info && (await uploads.read(input.upload));
    if (!info || !bytes) return { content: `There is no upload ${input.upload}. list_uploads lists them.`, isError: true, step };
    if (info.kind !== "picture") return { content: `${input.upload} is a ${info.kind}, not a picture.`, isError: true, step };
    const profiles = devicesOf(context, input.devices);
    const raster = await pictures.decode(bytes, info.type);
    const made = makePicture(raster, input.to, targetsFor(profiles), {
      fit: input.fit,
      crop: input.crop,
      box: input.box,
      dither: input.dither,
      tone: { brightness: input.brightness, contrast: input.contrast, gamma: input.gamma, invert: input.invert },
    });
    for (const file of made.files) {
      if (file.png.length > MAX_PICTURE_FILE) {
        return {
          content: `${file.path} would be ${Math.round(file.png.length / 1024)} KB, more than ${MAX_PICTURE_FILE / 1000} KB. Use a box, line art dithering for a drawing, or fewer devices.`,
          isError: true,
          step,
        };
      }
    }
    for (const file of made.files) {
      const problem = files.writeBytes(file.path, file.png);
      if (problem) return { content: `Not written: ${problem}.`, isError: true, step };
    }
    await context.sync();
    const lines = made.files.map((f) => `${f.path}: ${f.target.width} x ${f.target.height}, ${f.target.grays} grays, ${Math.round(f.png.length / 1024)} KB, for ${f.target.devices.join(", ")}`);
    const one = made.files.length === 1 && made.files[0]!.target.devices.length > 1 && new Set(profiles.map((p) => p.width)).size > 1;
    const note = one
      ? "One file for all: PaperPaw cannot yet pick a picture per screen size, so the X4 scales this one down and dithers it itself. Made for the X4 alone (devices: [\"X4\", \"X4 Pro\"]) it looks better there."
      : "";
    return {
      content: [
        { type: "text", text: `Wrote:\n${lines.join("\n")}\n${made.drawn ? "It looks drawn: line art dithering." : "It looks like a photo: diffusion dithering."} ${note}\nHow the X4 shows it:` },
        { type: "image", source: { type: "base64", media_type: "image/png", data: base64(made.preview) } },
      ],
      step,
    };
  },
};

export const placeFile: WorkshopTool<{ upload: string; to: string }> = {
  name: "place_file",
  description: "Copy an uploaded font (.ttf, .otf) or text (.txt, .md, .ini, .css) into the plugin as it is, e.g. fonts/Owl.ttf or LICENCE.txt. For pictures use convert_picture.",
  schema: z.object({ upload: z.string(), to: z.string() }).strict(),
  async run({ upload, to }, { uploads, files, sync }) {
    const step = { key: "step.place_file", vars: { path: to } };
    const info = uploads.info(upload);
    const bytes = info && (await uploads.read(upload));
    if (!info || !bytes) return { content: `There is no upload ${upload}. list_uploads lists them.`, isError: true, step };
    if (info.kind === "picture") return { content: `${upload} is a picture: use convert_picture, which makes it for e-ink.`, isError: true, step };
    // A font goes where fonts go, as its kind; a text where texts go.
    const ext = to.toLowerCase().slice(to.lastIndexOf("."));
    const fits = info.kind === "font" ? ext === (info.type === "font/otf" ? ".otf" : ".ttf") : isText(to);
    if (!fits) {
      const want = info.kind === "font" ? (info.type === "font/otf" ? ".otf" : ".ttf") : ".ini, .css, .txt or .md";
      return { content: `${upload} is a ${info.kind}: its path must end in ${want}.`, isError: true, step };
    }
    const problem = info.kind === "text" ? files.write(to, new TextDecoder().decode(bytes)) : files.writeBytes(to, bytes);
    if (problem) return { content: `Not written: ${problem}.`, isError: true, step };
    await sync();
    return { content: `Copied ${upload} to ${to} (${bytes.length} bytes).`, step };
  },
};

function devicesOf(context: ToolContext, names: string[] | undefined) {
  if (!names?.length) return context.profiles;
  return [...new Map(names.map((n) => deviceNamed(context, n)).map((p) => [p.id, p])).values()];
}

function base64(bytes: Uint8Array): string {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}
