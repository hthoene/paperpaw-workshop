import { fireEvent, render } from "@testing-library/preact";
import { describe, expect, it, vi } from "vitest";

import { IDEAS, Ideas, withIdea } from "./Ideas";

describe("the ideas to start from", () => {
  it("are the five the old start page had, each with words to send", () => {
    expect(IDEAS.map((i) => i.id)).toEqual(["look", "home", "keys", "text", "tool"]);
    for (const idea of IDEAS) expect(idea.prompt.length).toBeGreaterThan(20);
    expect(IDEAS.find((i) => i.id === "tool")!.kind).toBe("With code");
  });

  it("put an idea's words into the message on a click", () => {
    const picked = vi.fn();
    const { getByText } = render(<Ideas onPick={picked} />);
    fireEvent.click(getByText("Bigger text").closest("button")!);
    expect(picked).toHaveBeenCalledWith("Larger text in books and menus, with more space between lines.");
  });

  it("fill an empty field, and follow what the person already typed", () => {
    expect(withIdea("", "Bigger text.")).toBe("Bigger text.");
    expect(withIdea("  \n ", "Bigger text.")).toBe("Bigger text.");
    expect(withIdea("A clock on home.", "Bigger text.")).toBe("A clock on home.\n\nBigger text.");
    expect(withIdea("A clock on home.\n", "Bigger text.")).toBe("A clock on home.\n\nBigger text.");
  });
});
