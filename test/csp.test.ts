import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// A page whose Content-Security-Policy leaves out the PaperPaw key
// service fails every request with a PaperPaw key as "could not be
// reached", the same as a network that is down.
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const proxy = /export const PROXY = "(https:\/\/[^"]+)"/.exec(read("src/desktop/App.tsx"))?.[1];

describe("the pages may call the PaperPaw key service", () => {
  it("knows where the key service is", () => {
    expect(proxy).toMatch(/^https:\/\/workshop\.paperpaw\.org$/);
  });

  it("the app's policy (Tauri) allows it", () => {
    const csp = JSON.parse(read("src-tauri/tauri.conf.json")).app?.security?.csp ?? JSON.parse(read("src-tauri/tauri.conf.json")).tauri?.security?.csp;
    expect(String(csp)).toMatch(new RegExp(`connect-src[^;]*${proxy}`));
  });

  it("the policy of the served page (nginx) allows it", () => {
    const line = read("local/nginx.conf")
      .split("\n")
      .find((l) => l.includes("connect-src 'self'") && l.includes("frame-ancestors"));
    expect(line).toBeDefined();
    expect(line).toContain(`${proxy};`.replace(";", ""));
  });
});
