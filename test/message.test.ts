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

  it("tells Anthropic's overload as Anthropic's, not as a refusal", () => {
    const overloaded = Anthropic.APIError.generate(529, {}, "Overloaded", new Headers());
    expect(message(overloaded)).not.toContain("PaperPaw key");
    expect(message(overloaded).length).toBeGreaterThan(0);
  });
});
