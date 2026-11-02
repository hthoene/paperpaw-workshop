import Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import { message } from "../src/app/controller";

describe("what went wrong, in the person's words", () => {
  it("says a PaperPaw key's refusal in the proxy's own words", () => {
    const refused = Anthropic.APIError.generate(
      429,
      { error: { type: "rate_limit_error", message: "Your PaperPaw key's budget for this month is used up." } },
      "429",
      new Headers(),
    );
    expect(message(refused)).toBe("Your PaperPaw key's budget for this month is used up.");
  });

  it("tells a PaperPaw key that lacks the model, not 'check your key'", () => {
    // The proxy's 403 for a model the key does not include (the draft's, say).
    const refused = Anthropic.APIError.generate(
      403,
      { type: "error", error: { type: "permission_error", message: "This PaperPaw key does not include claude-haiku-5-5; it includes claude-sonnet-5-5." } },
      "403",
      new Headers(),
    );
    expect(refused).toBeInstanceOf(Anthropic.PermissionDeniedError);
    expect(message(refused)).toBe("This PaperPaw key does not include claude-haiku-5-5; it includes claude-sonnet-5-5.");
  });

  it("tells Anthropic's overload as Anthropic's, not as a refusal", () => {
    const overloaded = Anthropic.APIError.generate(529, {}, "Overloaded", new Headers());
    expect(message(overloaded)).not.toContain("PaperPaw key");
    expect(message(overloaded).length).toBeGreaterThan(0);
  });
});

describe("with a PaperPaw key, the failure is PaperPaw's key service's, not Anthropic's", () => {
  const unreached = () => new Anthropic.APIConnectionError({ message: "Connection error." });

  it("names the key service when it is not reached (no DNS, no route, blocked)", () => {
    const said = message(unreached(), true);
    expect(said).toContain("workshop.paperpaw.org");
    expect(said).not.toContain("Anthropic");
  });

  it("keeps Anthropic's wording for a key of one's own", () => {
    expect(message(unreached())).toContain("Anthropic could not be reached");
  });

  it("does not blame Anthropic for a gateway's error page", () => {
    const gateway = Anthropic.APIError.generate(502, undefined, "502 Bad Gateway", new Headers());
    expect(message(gateway, true)).toContain("PaperPaw's key service");
    expect(message(gateway, true)).not.toContain("Anthropic");
    expect(message(gateway)).toContain("Anthropic");
  });

  it("says a refusal without the proxy's words as the key service's", () => {
    const refused = Anthropic.APIError.generate(401, undefined, "401", new Headers());
    expect(message(refused, true)).toContain("PaperPaw's key service did not accept");
  });

  it("still tells the proxy's own words first", () => {
    const refused = Anthropic.APIError.generate(
      502,
      { type: "error", error: { type: "api_error", message: "Anthropic could not be reached through the PaperPaw key's proxy; try again in a while." } },
      "502",
      new Headers(),
    );
    expect(message(refused, true)).toContain("through the PaperPaw key's proxy");
  });
});
