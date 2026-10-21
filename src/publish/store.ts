// The workshop's side of the plugin store on paperpaw.org.
// The share page knows only `StoreApi`: `SiteStore` is paperpaw.org's
// own form, sent as the signed-in author; `FakeStore` stands in for tests
// and for `npm run dev`. The API is described in docs/store-api.md.
//
// The workshop lives on paperpaw.org itself (/workshop), so the store's
// session cookie comes with every request and nothing about the account
// is kept here but the author's name for the page.

/** Where the store stands for this person. */
export type StoreState =
  /** No store here: the workshop runs on someone's own computer. */
  | { kind: "none" }
  /** paperpaw.org, but its store has not opened yet. */
  | { kind: "closed" }
  | { kind: "signed-out"; signIn: string }
  | { kind: "signed-in"; name: string; csrf: string };

/** One of the store's checks of an upload. */
export interface StoreCheck {
  check: string;
  status: "pass" | "warn" | "fail";
  message: string;
}

/** A draft the store made of an upload. */
export interface Draft {
  submission: number;
  /** Whether it may be sent to the moderators as it is. */
  passed: boolean;
  checks: StoreCheck[];
  /** The draft's own page in the store, to complete or change it there. */
  draftUrl: string;
  /** The plugin's page as the store will show it. */
  pageUrl: string;
}

/** What goes with the form. A data plugin is only its package; a plugin
 *  with code adds its signed builds and perhaps its source (phase 5). */
export interface Upload {
  /** The plugin's folder as a ZIP, `store/` (entry, screenshots) included. */
  package: Uint8Array;
  /** Signed `.ppn` builds by the store's device id (`x4`, `x4-pro`). */
  builds?: Record<string, Uint8Array>;
  /** The source as a ZIP. */
  source?: Uint8Array;
}

export interface StoreApi {
  /** Asks the store where it stands. `back` is the address the sign-in
   *  leads back to, a path on this site. */
  state(back: string): Promise<StoreState>;
  /** Uploads as the form does: the store checks it and makes a draft. */
  upload(upload: Upload, csrf: string): Promise<Draft>;
  /** Sends a draft to the moderators. */
  send(submission: number, csrf: string): Promise<void>;
}

/** A refusal of the store, by its catalog key on this side. */
export class StoreError extends Error {
  constructor(
    /** `store.error.<code>` in the catalog. */
    readonly code: StoreErrorCode,
    message: string,
    readonly checks: StoreCheck[] = [],
  ) {
    super(message);
  }
}

export const STORE_ERRORS = ["signed-out", "expired", "busy", "quota", "too-many", "refused", "closed", "network", "other"] as const;
export type StoreErrorCode = (typeof STORE_ERRORS)[number];

/** The store's status codes, in the workshop's words. */
const BY_STATUS: Record<number, StoreErrorCode> = {
  401: "signed-out",
  403: "expired",
  404: "closed",
  413: "quota",
  422: "refused",
  429: "too-many",
  503: "busy",
};

/** The site's store. `origin` is the site's address, the workshop's own
 *  when it runs on paperpaw.org. */
export class SiteStore implements StoreApi {
  constructor(private origin: string) {}

  async state(back: string): Promise<StoreState> {
    let answer: Response;
    try {
      answer = await fetch(`${this.origin}/api/v1/workshop/session`, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      return { kind: "none" };
    }
    const body = await json(answer);
    if (!answer.ok || !body || typeof body.store !== "string") return { kind: "none" };
    if (body.store !== "open") return { kind: "closed" };
    const account = body.account as { name?: unknown } | null | undefined;
    if (!account || typeof body.csrf !== "string") {
      return { kind: "signed-out", signIn: `${this.origin}/account/sign-in?next=${encodeURIComponent(back)}` };
    }
    return { kind: "signed-in", name: String(account.name ?? ""), csrf: body.csrf };
  }

  async upload(upload: Upload, csrf: string): Promise<Draft> {
    const form = new FormData();
    form.append("csrf", csrf);
    form.append("package", new Blob([upload.package as BlobPart], { type: "application/zip" }), "plugin.zip");
    for (const [device, bytes] of Object.entries(upload.builds ?? {})) {
      form.append(`build-${device}`, new Blob([bytes as BlobPart]), `${device}.ppn`);
    }
    if (upload.source) form.append("source-zip", new Blob([upload.source as BlobPart], { type: "application/zip" }), "source.zip");
    const body = await this.post("/submit", form);
    const n = Number(body.submission);
    return {
      submission: n,
      passed: body.passed === true,
      checks: checks(body.checks),
      draftUrl: this.address(body.draft, `/submit/${n}`),
      pageUrl: this.address(body.page, `/submit/${n}/page`),
    };
  }

  async send(submission: number, csrf: string): Promise<void> {
    await this.post(`/submit/${submission}/send`, new URLSearchParams({ csrf }));
  }

  private async post(path: string, body: FormData | URLSearchParams): Promise<Record<string, unknown>> {
    let answer: Response;
    try {
      answer = await fetch(`${this.origin}${path}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        body,
      });
    } catch (e) {
      throw new StoreError("network", e instanceof Error ? e.message : String(e));
    }
    const got = await json(answer);
    if (answer.ok && got) return got;
    const code = BY_STATUS[answer.status] ?? "other";
    const message = typeof got?.message === "string" ? got.message : `${answer.status} ${answer.statusText}`;
    throw new StoreError(code, message, checks(got?.checks));
  }

  private address(given: unknown, otherwise: string): string {
    return `${this.origin}${typeof given === "string" && given.startsWith("/") ? given : otherwise}`;
  }
}

async function json(answer: Response): Promise<Record<string, unknown> | null> {
  if (!answer.headers.get("content-type")?.includes("application/json")) return null;
  try {
    const body: unknown = await answer.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function checks(given: unknown): StoreCheck[] {
  if (!Array.isArray(given)) return [];
  return given
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      check: String(c.check ?? ""),
      status: c.status === "fail" || c.status === "warn" ? c.status : "pass",
      message: String(c.message ?? ""),
    }));
}
