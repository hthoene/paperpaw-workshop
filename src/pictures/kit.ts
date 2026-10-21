// What needs a browser to do with pictures: decoding any picture file,
// and the reduced copy the AI sees. Tools get a `PictureKit`; the page
// gives them the browser's, tests a fake.

import type { Raster, Rect } from "./gray";

/** The longest side of a picture the AI sees: Anthropic reduces larger
 *  ones to this anyway, so nothing is lost and nothing is paid twice. */
export const AI_LONG_SIDE = 1568;

/** A picture for the AI: base64, its type and size. */
export interface AiPicture {
  data: string;
  mediaType: "image/jpeg" | "image/png";
  width: number;
  height: number;
}

export interface PictureKit {
  /** Its size in pixels, as it shows (turned as its EXIF says). */
  size(bytes: Uint8Array, type: string): Promise<{ width: number; height: number }>;
  /** Decodes a picture file (PNG, JPEG, WebP, GIF, SVG) to pixels,
   *  turned as its EXIF says. */
  decode(bytes: Uint8Array, type: string): Promise<Raster>;
  /** A reduced copy for the AI, re-encoded (no metadata goes along):
   *  JPEG for photos, PNG for drawings. */
  forAi(bytes: Uint8Array, type: string, crop?: Rect): Promise<AiPicture>;
}

/** What the AI's copy of a `width` x `height` picture costs, in tokens. */
export function aiTokens(width: number, height: number): number {
  const scale = Math.min(1, AI_LONG_SIDE / Math.max(width, height));
  return Math.ceil((width * scale * (height * scale)) / 750);
}

/** The browser's: its own decoders, a canvas to draw and encode. */
export const browserKit: PictureKit = {
  async size(bytes, type) {
    const image = await load(bytes, type);
    const size = { width: image.width, height: image.height };
    close(image);
    return size;
  },

  async decode(bytes, type) {
    const image = await load(bytes, type);
    const canvas = drawn(image, { x: 0, y: 0, width: image.width, height: image.height }, image.width, image.height);
    const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
    close(image);
    return { width: canvas.width, height: canvas.height, data };
  },

  async forAi(bytes, type, crop) {
    const image = await load(bytes, type);
    const part = crop ?? { x: 0, y: 0, width: image.width, height: image.height };
    const scale = Math.min(1, AI_LONG_SIDE / Math.max(part.width, part.height));
    const width = Math.max(1, Math.round(part.width * scale));
    const height = Math.max(1, Math.round(part.height * scale));
    const canvas = drawn(image, part, width, height);
    close(image);
    const photo = type === "image/jpeg" || type === "image/webp";
    const mediaType = photo ? "image/jpeg" : "image/png";
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("the picture could not be encoded"))), mediaType, 0.85),
    );
    return { data: base64(new Uint8Array(await blob.arrayBuffer())), mediaType, width, height };
  },
};

type Loaded = ImageBitmap | HTMLImageElement;

/** The picture, decoded by the browser. SVG goes through an <img>, where
 *  no script of it runs; it is never put into the page as markup. */
async function load(bytes: Uint8Array, type: string): Promise<Loaded> {
  const blob = new Blob([bytes as BlobPart], { type });
  if (type !== "image/svg+xml") return createImageBitmap(blob, { imageOrientation: "from-image" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    // An SVG without a size of its own is drawn at a useful one.
    if (!img.naturalWidth || !img.naturalHeight) {
      img.width = 1024;
      img.height = 1024;
    }
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawn(image: Loaded, part: Rect, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d", { willReadFrequently: true })!;
  g.imageSmoothingQuality = "high";
  g.drawImage(image, part.x, part.y, part.width, part.height, 0, 0, width, height);
  return canvas;
}

function close(image: Loaded): void {
  if ("close" in image) image.close();
}

function base64(bytes: Uint8Array): string {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}
