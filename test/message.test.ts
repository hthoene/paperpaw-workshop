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
