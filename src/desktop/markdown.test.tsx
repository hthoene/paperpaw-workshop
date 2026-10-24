import { render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { Markdown, blocks } from "./Markdown";

describe("the AI's Markdown", () => {
  it("is cut into paragraphs, lists, headings and code", () => {
    const text = "Das Spiel läuft.\n\n## Steuern\n- **Starten:** OK\n- Links\n  und rechts\n\n1. eins\n2. zwei\n\n```\nlet x = 1;\n```\nEnde";
    expect(blocks(text)).toEqual([
      { kind: "p", text: "Das Spiel läuft." },
      { kind: "h", text: "Steuern" },
      { kind: "ul", items: ["**Starten:** OK", "Links und rechts"] },
      { kind: "ol", items: ["eins", "zwei"] },
      { kind: "code", text: "let x = 1;" },
      { kind: "p", text: "Ende" },
    ]);
  });

  it("shows bold, italic and code without their marks", () => {
    const { container } = render(<Markdown text={"- **Starten:** OK oder *Tippen*, `cargo x4`"} />);
    expect(container.querySelector("li strong")?.textContent).toBe("Starten:");
    expect(container.querySelector("li em")?.textContent).toBe("Tippen");
    expect(container.querySelector("li code")?.textContent).toBe("cargo x4");
    expect(container.textContent).not.toContain("**");
  });

  it("never takes the text as HTML", () => {
    const { container } = render(<Markdown text={"<img src=x onerror=alert(1)> **ok**"} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("<img src=x onerror=alert(1)>");
  });

  it("leaves a lone star or a times sign as it is", () => {
    const { container } = render(<Markdown text={"3 * 4 = 12"} />);
    expect(container.textContent).toBe("3 * 4 = 12");
  });
});
