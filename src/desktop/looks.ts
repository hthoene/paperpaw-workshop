// How much the AI looks at the reader's screen itself ("Check the look
// myself" in Settings): not at all, sparingly (once at the end, a second
// device for a layout; at most 3 pictures a turn), or thoroughly (both
// devices, at most 6). Each picture is a little cost; the loop counts them.

export type LookChoice = "off" | "sparingly" | "thoroughly";

export const LOOK_CHOICES: { choice: LookChoice; label: string; hint: string }[] = [
  { choice: "off", label: "Off", hint: "The AI does not look at the screen itself. Cheapest; the checks still run." },
  { choice: "sparingly", label: "Sparingly (recommended)", hint: "Once at the end, a second device for a layout. At most 3 pictures a turn." },
  { choice: "thoroughly", label: "Thoroughly", hint: "On the X4 and the Boox Go 7 where the layout changed. Up to 6 pictures a turn, each a fraction of a cent." },
];

/** What a choice means for a turn: the tools left out, the most looks,
 *  and what the AI is told after each. */
export function lookRules(choice: LookChoice): { without: string[]; perTurn: Record<string, number>; notes: Record<string, string> } {
  if (choice === "off") return { without: ["look"], perTurn: {}, notes: {} };
  if (choice === "thoroughly") {
    return {
      without: [],
      perTurn: { look: 6 },
      notes: { look: "The person asked for a thorough look: where the layout changed, look on the X4 and on the Boox Go 7 too." },
    };
  }
  return { without: [], perTurn: { look: 3 }, notes: {} };
}

const KEY = "workshop.looks";

/** The choice kept in this computer's webview (lost: sparingly). */
export function savedLooks(): LookChoice {
  try {
    const kept = localStorage.getItem(KEY);
    return LOOK_CHOICES.some((c) => c.choice === kept) ? (kept as LookChoice) : "sparingly";
  } catch {
    return "sparingly";
  }
}

export function saveLooks(choice: LookChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Not kept: sparingly next time.
  }
}
