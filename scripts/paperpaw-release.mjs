// PaperPaw's emulator for the workshop's installer, from a PaperPaw
// release: `paperpaw-emu-<version>-<target>.zip` (paperpaw-emu and
// paperpaw-dev), fetched with its `.sha256` and its `.sig` and taken only
// where both hold. The signature is PaperPaw's for release assets
// (`paperpaw-sign sign-asset`): Ed25519 by the release key, over
// `paperpaw-asset-v1\n`, the file, and the first 48 bytes of its trailer
// (`PaperPaw`, format 1, the length signed, the signer's key), as
// paperpaw-update's `check_apart` checks it. The key is pinned here, not
// taken from the release.
//
//   node scripts/paperpaw-release.mjs <version> <target> <folder>
//
// writes the zip into <folder> and says its path; the version is the one
// paperpaw-release.txt names, the target e.g. windows-x64.

import { createHash, createPublicKey, verify } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** PaperPaw's release key (fingerprint 55A9 F626 DB17 EB90), as its
 *  update files and the website name it. */
export const RELEASE_KEYS = ["55a9f626db17eb9058707323d29f52470bfcd09638898e17bd01784ef9df0c51"];

/** Where PaperPaw's releases are. */
export const RELEASES = "https://github.com/hthoene/paperpaw/releases/download";

/** What an asset's signature signs before the asset. */
const DOMAIN = Buffer.from("paperpaw-asset-v1\n");
const MAGIC = Buffer.from("PaperPaw");
const TRAILER_LEN = 128;

/** An Ed25519 public key from its 32 bytes. */
function publicKey(raw) {
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), raw]);
  return createPublicKey({ key: spki, format: "der", type: "spki" });
}

/** Whether `signature` (the trailer alone, 128 bytes) is a release key's
 *  signature of the asset `data`; why not, where it is not. */
export function checkAsset(data, signature, keys = RELEASE_KEYS) {
  const sig = Buffer.from(signature);
  if (sig.length !== TRAILER_LEN || !sig.subarray(0, 8).equals(MAGIC)) return "not an asset's signature";
  if (sig.readUInt32LE(8) !== 1) return "a signature of a newer format";
  const message = Buffer.concat([DOMAIN, Buffer.from(data)]);
  if (sig.readUInt32LE(12) !== message.length) return "signed for another length";
  const key = sig.subarray(16, 48);
  if (!keys.includes(key.toString("hex"))) return `signed by another key (${key.toString("hex")})`;
  const signed = Buffer.concat([message, sig.subarray(0, 48)]);
  return verify(null, signed, publicKey(key), sig.subarray(48, 112)) ? null : "the signature does not hold";
}

/** The SHA-256 a `.sha256` file names (`<hex>  <name>`). */
export function checksum(text) {
  const hex = text.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return /^[0-9a-f]{64}$/.test(hex) ? hex : null;
}

async function fetched(url) {
  const answer = await fetch(url, { redirect: "follow" });
  if (!answer.ok) throw new Error(`${url}: ${answer.status}`);
  return Buffer.from(await answer.arrayBuffer());
}

/** Fetches and checks the emulator of PaperPaw `version` for `target`
 *  into `folder`: its path. */
export async function fetchEmulator(version, target, folder) {
  const name = `paperpaw-emu-${version}-${target}.zip`;
  const base = `${RELEASES}/v${version}/${name}`;
  const [zip, sum, sig] = await Promise.all([fetched(base), fetched(`${base}.sha256`), fetched(`${base}.sig`)]);
  const want = checksum(sum.toString("utf8"));
  const got = createHash("sha256").update(zip).digest("hex");
  if (!want || want !== got) throw new Error(`${name}: its SHA-256 is ${got}, its .sha256 says ${want}`);
  const why = checkAsset(zip, sig);
  if (why) throw new Error(`${name}: ${why}`);
  mkdirSync(folder, { recursive: true });
  const path = join(folder, name);
  writeFileSync(path, zip);
  return path;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [version, target, folder] = process.argv.slice(2);
  if (!version || !target || !folder) {
    console.error("usage: node scripts/paperpaw-release.mjs <version> <target> <folder>");
    process.exit(2);
  }
  try {
    console.log(await fetchEmulator(version.trim().replace(/^v/, ""), target, folder));
  } catch (e) {
    console.error(`paperpaw-release: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
