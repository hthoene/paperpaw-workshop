// Whether an updater signature (Tauri's `.sig`, a minisign signature in
// base64) holds for a file under the updater's public key (tauri.conf.json's
// `plugins.updater.pubkey`, the same in base64). Installed workshops take
// an update only where it does, so a release is checked before it goes up:
// a file changed after it was signed for the updater (Authenticode signed
// afterwards, say) would be refused by every installed workshop.
//
// minisign: the key is "Ed", a key id (8 bytes) and the Ed25519 key; the
// signature "ED" (over the file's BLAKE2b-512) or "Ed" (over the file), the
// key id and 64 bytes, then a trusted comment and a signature over the
// first signature and that comment.

import { createHash, createPublicKey, verify } from "node:crypto";

/** The second line of a minisign text (key or signature), in base64. */
function payload(base64Text) {
  const lines = Buffer.from(base64Text.trim(), "base64").toString("utf8").split(/\r?\n/);
  return { lines, data: Buffer.from(lines[1] ?? "", "base64") };
}

function ed25519(raw) {
  const spki = Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), raw]);
  return createPublicKey({ key: spki, format: "der", type: "spki" });
}

/** Why `signature` does not hold for `file` under `pubkey`; null where it does. */
export function checkUpdaterSignature(file, signature, pubkey) {
  const key = payload(pubkey).data;
  if (key.length !== 42 || key.subarray(0, 2).toString() !== "Ed") return "the updater's key is no minisign key";
  const { lines, data: sig } = payload(signature);
  if (sig.length !== 74) return "the signature is no minisign signature";
  const algorithm = sig.subarray(0, 2).toString();
  if (algorithm !== "ED" && algorithm !== "Ed") return `an unknown signature kind ${algorithm}`;
  if (!sig.subarray(2, 10).equals(key.subarray(2, 10))) return "signed by another key than the updater's";
  const pk = ed25519(key.subarray(10));
  const signed = algorithm === "ED" ? createHash("blake2b512").update(file).digest() : Buffer.from(file);
  if (!verify(null, signed, pk, sig.subarray(10))) return "the signature does not hold for this file (was it changed after signing?)";
  const comment = (lines[2] ?? "").replace(/^trusted comment: /, "");
  const global = Buffer.from(lines[3] ?? "", "base64");
  const both = Buffer.concat([sig.subarray(10), Buffer.from(comment)]);
  if (global.length !== 64 || !verify(null, both, pk, global)) return "the signature's trusted comment does not hold";
  return null;
}
