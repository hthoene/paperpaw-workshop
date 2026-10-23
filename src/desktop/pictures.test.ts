import { describe, expect, it } from "vitest";

import { newProject } from "../project/project";
import { MemoryUploads, Uploads } from "../project/uploads";
import { fromBase64, toBase64 } from "./folders";
import { WORKSHOP_SCREENS, colourScreen, makeSmaller, modeFor, placePicture, remake, suggestions, type PictureApi, type Screen } from "./pictures";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 1, 2, 3]);
const measured = async () => ({ width: 2000, height: 3000 });

/** Makes a picture into its mode's name and the size asked; tells of a
 *  picture what `infos` says by its first byte. */
function fakeApi(infos: Record<number, { width: number; height: number; colour: boolean }> = {}) {
  const made: { mode: string; max: [number, number] }[] = [];
  const api: PictureApi = {
    async pictureMake(_base64, mode, maxWidth, maxHeight) {
      made.push({ mode, max: [maxWidth, maxHeight] });
      return [toBase64(new TextEncoder().encode(mode)), maxWidth, maxHeight];
    },
    async pictureInfo(base64) {
      const bytes = fromBase64(base64);
      return { ...(infos[bytes[0]!] ?? { width: 100, height: 100, colour: false }), bytes: bytes.length };
    },
  };
  return { api, made };
}

const said = (bytes: unknown) => new TextDecoder().decode(bytes as Uint8Array);

describe("pictures for the plugin", () => {
  it("are made smaller in grays by default, to the largest screen's size, the upload kept", async () => {
    const project = newProject();
    const store = new MemoryUploads();
    const uploads = new Uploads(project, store);
    await uploads.add("Owl.png", PNG, measured);
    const { api, made } = fakeApi();
    await placePicture(project, uploads, "owl.png", "sleep/1.png", WORKSHOP_SCREENS, api);
    expect(said(project.files["sleep/1.png"])).toBe("smaller-grays");
    expect(made[0]!.max).toEqual([1264, 1680]);
    expect(await uploads.read("owl.png")).toEqual(PNG);
    expect(uploads.info("owl.png")!.placed).toEqual([{ path: "sleep/1.png" }]);
  });

  it("keep colours when a reader shows them, and follow the person's choice and setting", () => {
    const project = newProject();
    const upload = { name: "owl.png", kind: "picture" as const, type: "image/png", bytes: 1, added: "" };
    const colour: Screen = { id: "kobo-libra-colour", width: 1264, height: 1680, summary: 'Linux, 7" Kaleido 3 colour 1264x1680' };
    expect(modeFor(project, upload, WORKSHOP_SCREENS)).toBe("smaller-grays");
    expect(modeFor(project, upload, [...WORKSHOP_SCREENS, colour])).toBe("smaller-colour");
    project.optimisePictures = false;
    expect(modeFor(project, upload, WORKSHOP_SCREENS)).toBe("keep");
    expect(modeFor(project, { ...upload, mode: "smaller-grays" }, WORKSHOP_SCREENS)).toBe("smaller-grays");
  });

  it("are made again when the choice changes, in a slot at the slot's size", async () => {
    const project = newProject();
    const uploads = new Uploads(project, new MemoryUploads());
    await uploads.add("logo.png", PNG, measured);
    const { api, made } = fakeApi();
    await placePicture(project, uploads, "logo.png", "logo.png", WORKSHOP_SCREENS, api, { width: 160, height: 160 });
    const upload = uploads.info("logo.png")!;
    upload.mode = "keep";
    await remake(project, uploads, upload, WORKSHOP_SCREENS, api);
    expect(said(project.files["logo.png"])).toBe("keep");
    expect(made.map((m) => m.max)).toEqual([[160, 160], [160, 160]]);
  });

  it("are only suggested before sending: too large, in colour, not when kept or turned off", async () => {
    const project = newProject();
    const uploads = new Uploads(project, new MemoryUploads());
    const { api } = fakeApi({ 1: { width: 3000, height: 2000, colour: false }, 2: { width: 400, height: 300, colour: true }, 3: { width: 4000, height: 4000, colour: true } });
    project.files["big.png"] = new Uint8Array([1]);
    project.files["red.png"] = new Uint8Array([2]);
    project.files["small.png"] = new Uint8Array([4]);
    project.files["store/shot.png"] = new Uint8Array([1]);
    await uploads.add("kept.png", PNG, measured);
    project.files["kept.png"] = new Uint8Array([3]);
    uploads.info("kept.png")!.mode = "keep";
    uploads.info("kept.png")!.placed = [{ path: "kept.png" }];
    const found = await suggestions(project, WORKSHOP_SCREENS, api);
    expect(found.map((s) => [s.path, s.mode])).toEqual([["big.png", "smaller-grays"], ["red.png", "smaller-grays"]]);
    expect(said(project.files["big.png"])).not.toBe("smaller-grays");
    await makeSmaller(project, found[0]!, WORKSHOP_SCREENS, api);
    expect(said(project.files["big.png"])).toBe("smaller-grays");
    project.optimisePictures = false;
    expect(await suggestions(project, WORKSHOP_SCREENS, api)).toEqual([]);
  });
});

describe("a colour screen", () => {
  it("is what the registry says, else what its summary names", () => {
    const screen: Screen = { id: "kobo-libra-colour", width: 1264, height: 1680, summary: "Linux, 7\" 1264x1680" };
    expect(colourScreen({ ...screen, colour_screen: true })).toBe(true);
    expect(colourScreen({ ...screen, summary: "Kaleido 3 colour" })).toBe(true);
    expect(colourScreen({ ...screen, summary: "Kaleido 3 colour", colour_screen: false })).toBe(false);
  });
});
