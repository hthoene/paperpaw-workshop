// @vitest-environment node
import { generateKeyPairSync, sign } from "node:crypto";
import fs, { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { checkAsset, checksum } from "../scripts/paperpaw-release.mjs";
import { checkUpdaterSignature } from "../scripts/updater-signature.mjs";

/** An asset's signature as paperpaw-sign's sign-asset makes it, by a key
 *  of the test's own: its trailer, and the key's 64 hexadecimal digits. */
function signed(data: Buffer, length?: number): { sig: Buffer; key: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const raw = publicKey.export({ format: "der", type: "spki" }).subarray(12);
  const message = Buffer.concat([Buffer.from("paperpaw-asset-v1\n"), data]);
  const head = Buffer.alloc(48);
  head.write("PaperPaw", 0, "latin1");
  head.writeUInt32LE(1, 8);
  head.writeUInt32LE(length ?? message.length, 12);
  raw.copy(head, 16);
  const signature = sign(null, Buffer.concat([message, head]), privateKey);
  return { sig: Buffer.concat([head, signature, Buffer.alloc(16)]), key: raw.toString("hex") };
}

describe("PaperPaw's release assets for the installer", () => {
  const zip = Buffer.from("an emulator, zipped");

  it("takes an asset its release key signed, and nothing else", () => {
    const { sig, key } = signed(zip);
    expect(checkAsset(zip, sig, [key])).toBeNull();
    expect(checkAsset(Buffer.from("another"), sig, [key])).toBe("signed for another length");
    const changed = Buffer.from(zip);
    changed[0]! ^= 1;
    expect(checkAsset(changed, sig, [key])).toBe("the signature does not hold");
    expect(checkAsset(zip, sig)).toMatch(/^signed by another key/);
    expect(checkAsset(zip, sig.subarray(0, 100), [key])).toBe("not an asset's signature");
  });

  it("is never a flash image's signature, signed without the domain", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const raw = publicKey.export({ format: "der", type: "spki" }).subarray(12);
    const head = Buffer.alloc(48);
    head.write("PaperPaw", 0, "latin1");
    head.writeUInt32LE(1, 8);
    head.writeUInt32LE(zip.length + 18, 12);
    raw.copy(head, 16);
    const flash = Buffer.concat([head, sign(null, Buffer.concat([zip, head]), privateKey), Buffer.alloc(16)]);
    expect(checkAsset(zip, flash, [raw.toString("hex")])).toBe("the signature does not hold");
  });

  it("reads a .sha256 file", () => {
    expect(checksum(`${"AB".repeat(32)}  paperpaw-emu-0.5.0-windows-x64.zip\n`)).toBe("ab".repeat(32));
    expect(checksum("no sum")).toBeNull();
  });

  // paperpaw-sign's own signature, where a test made one with it
  // (PAPERPAW_ASSET_SAMPLE: the file; its .sig and .key beside it).
  const sample = process.env.PAPERPAW_ASSET_SAMPLE;
  it.skipIf(!sample || !existsSync(`${sample}.sig`))("takes a signature paperpaw-sign made", () => {
    const key = readFileSync(`${sample}.pub`, "utf8").trim();
    expect(checkAsset(readFileSync(sample!), readFileSync(`${sample}.sig`), [key])).toBeNull();
  });
});

describe("the updater's signature", () => {
  // A file signed by `tauri signer sign` with a key made for this test.
  const dir = path.join(import.meta.dirname, "fixtures", "updater");
  const read = (name: string) => fs.readFileSync(path.join(dir, name));
  const pubkey = read("test.key.pub").toString("utf8");
  const signature = read("file.bin.sig").toString("utf8");

  it("holds for the file it was made over, under its key", () => {
    expect(checkUpdaterSignature(read("file.bin"), signature, pubkey)).toBeNull();
  });

  it("fails for a file changed after it, and under another key", () => {
    expect(checkUpdaterSignature(Buffer.from("hello installer, signed again"), signature, pubkey)).toMatch(/does not hold/);
    const conf = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "src-tauri", "tauri.conf.json"), "utf8"));
    expect(checkUpdaterSignature(read("file.bin"), signature, conf.plugins.updater.pubkey)).toMatch(/another key/);
  });
});
