// A store without a site, for tests and for `npm run dev`: it answers as
// paperpaw.org would, keeps what it was sent, and refuses what it is told
// to refuse.

import { unzipSync } from "fflate";

import type { Draft, StoreApi, StoreCheck, StoreState, Upload } from "./store";
import { StoreError } from "./store";

export class FakeStore implements StoreApi {
  uploads: Upload[] = [];
  sent: number[] = [];
  /** The store's checks of the next upload; it passes without a fail. */
  checks: StoreCheck[] = [{ check: "manifest", status: "pass", message: "plugin.ini names the plugin." }];

  constructor(
    public current: StoreState = { kind: "signed-in", name: "Test author", csrf: "test-csrf" },
    /** Milliseconds before each answer, for the page to show it working. */
    private pause = 0,
  ) {}

  async state(back: string): Promise<StoreState> {
    await this.wait();
    if (this.current.kind === "signed-out") return { kind: "signed-out", signIn: `/account/sign-in?next=${encodeURIComponent(back)}` };
    return this.current;
  }

  async upload(upload: Upload, csrf: string): Promise<Draft> {
    await this.wait();
    this.allowed(csrf);
    // As the store does: a package is a ZIP with plugin.ini in it.
    const names = Object.keys(unzipSync(upload.package));
    if (!names.some((n) => n.endsWith("plugin.ini"))) {
      throw new StoreError("refused", "The ZIP holds no plugin.ini.", [
        { check: "manifest", status: "fail", message: "The ZIP holds no plugin.ini." },
      ]);
    }
    this.uploads.push(upload);
    const n = this.uploads.length;
    return {
      submission: n,
      passed: !this.checks.some((c) => c.status === "fail"),
      checks: this.checks,
      draftUrl: `/submit/${n}`,
      pageUrl: `/submit/${n}/page`,
    };
  }

  async send(submission: number, csrf: string): Promise<void> {
    await this.wait();
    this.allowed(csrf);
    if (submission < 1 || submission > this.uploads.length) throw new StoreError("other", "No such draft.");
    this.sent.push(submission);
  }

  private allowed(csrf: string): void {
    if (this.current.kind !== "signed-in") throw new StoreError("signed-out", "Not signed in.");
    if (csrf !== this.current.csrf) throw new StoreError("expired", "The session's token is wrong.");
  }

  private wait(): Promise<void> {
    return new Promise((r) => setTimeout(r, this.pause));
  }
}
