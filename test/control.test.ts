import { describe, expect, it } from "vitest";

import { control, hex, setFixtures, MAX_FIXTURE_BYTES } from "../src/tools/control";
import { look } from "../src/tools/emulator";
import { bench } from "./helpers";

const text = (content: unknown) => (typeof content === "string" ? content : JSON.stringify(content));

describe("driving the reader directly", () => {
  it("opens a screen with its parameters as the remote's line, then says what shows", async () => {
    const b = bench();
    b.emulator.answers.describe = {
      screen: "quote.screen",
      parts: [
        { role: "heading", x: 20, y: 30, width: 440, height: 40, state: "-", label: "Quote of the day" },
        { role: "button", x: 20, y: 700, width: 200, height: 60, state: "focused", label: "Next" },
      ],
    };
    const answer = await control.run({ do: "show", id: "quote.screen", params: { day: "12" } }, b.context);
    expect(answer.isError).toBeFalsy();
    expect(b.emulator.commands).toEqual([`show quote.screen day=${hex("12")}`, "describe"]);
    expect(text(answer.content)).toContain('- button "Next" at 20,700 200x60 [focused]');
    expect(text(answer.content)).toContain("Screen quote.screen: 2 parts.");
  });

  it("sets a setting with its value in hexadecimal, and refuses what is no id", async () => {
    const b = bench();
    await control.run({ do: "set", id: "core.font-size", value: "14" }, b.context);
    expect(b.emulator.commands[0]).toBe("set core.font-size 3134");
    expect(hex("")).toBe("-");
    const bad = await control.run({ do: "run", id: "x; rm" }, b.context);
    expect(bad.isError).toBe(true);
    expect((await control.run({ do: "show" }, b.context)).isError).toBe(true);
  });

  it("waits for a screen, and says when it did not show", async () => {
    const b = bench();
    b.emulator.showing = "quote.screen";
    expect((await control.run({ do: "wait", id: "quote.screen" }, b.context)).isError).toBeFalsy();
    const late = await control.run({ do: "wait", id: "other.screen", timeout_ms: 500 }, b.context);
    expect(late.isError).toBe(true);
    expect(text(late.content)).toContain("Not shown");
  });

  it("waits without an id until the screen changes, as a reply comes", async () => {
    const b = bench();
    const waiting = { screen: "core.home", parts: [{ role: "text", x: 0, y: 0, width: 10, height: 10, label: "A fact comes soon." }] };
    b.emulator.answers.describe = waiting;
    setTimeout(() => (b.emulator.answers.describe = { ...waiting, parts: [{ ...waiting.parts[0]!, label: "Ducks swim." }] }), 600);
    const came = await control.run({ do: "wait", timeout_ms: 5000 }, b.context);
    expect(came.isError).toBeFalsy();
    expect(text(came.content)).toContain("The screen changed.");
    expect(text(came.content)).toContain('"Ducks swim."');
    const still = await control.run({ do: "wait", timeout_ms: 500 }, b.context);
    expect(text(still.content)).toContain("Nothing changed within 500 ms.");
  });
});

describe("recorded answers for a plugin's requests", () => {
  it("keeps them with the project and gives them to the reader", async () => {
    const b = bench();
    const fixtures = [
      { url: "https://api.example.com/quotes/*", body: { quote: "Read." } },
      { method: "GET", url: "https://api.example.com/fail", status: 500 },
    ];
    const answer = await setFixtures.run({ fixtures }, b.context);
    expect(answer.isError).toBeFalsy();
    expect(b.project.fixtures).toEqual(fixtures);
    expect(b.emulator.network).toEqual({ fixtures, mode: "fixtures" });
    const huge = await setFixtures.run({ fixtures: [{ url: "https://x/*", body: "x".repeat(MAX_FIXTURE_BYTES + 1) }] }, b.context);
    expect(huge.isError).toBe(true);
    expect(b.project.fixtures).toEqual(fixtures);
  });

  it("tells the AI which requests the plugin made, once", async () => {
    const b = bench();
    b.emulator.made = [
      { id: 1, method: "GET", url: "https://api.example.com/quotes/12", source: "fixture", status: 200 },
      { id: 2, method: "GET", url: "https://elsewhere.example/x", source: "none", status: 0 },
    ];
    const first = text((await look.run({}, b.context)).content);
    expect(first).toContain("GET https://api.example.com/quotes/12: answered by a recorded answer, 200");
    expect(first).toContain("no recorded answer: failed as without a network");
    expect(text((await look.run({}, b.context)).content)).not.toContain("requests since");
  });
});
