// How long a conversation grows before the AI makes it shorter
// ("Conversation length" in Settings): the points are in ai/length.ts.
// Every step of the AI reads the conversation again, so a longer one costs
// more a step near its end; a shorter one is summarised sooner.

import type { LengthChoice } from "../ai/length";

export const LENGTH_CHOICES: { choice: LengthChoice; label: string; hint: string }[] = [
  { choice: "short", label: "Short", hint: "Cheapest. Summarised early, so the AI may forget details sooner." },
  { choice: "normal", label: "Normal (recommended)", hint: "Summarised when it gets long. A balance of cost and memory." },
  { choice: "long", label: "Long", hint: "The AI remembers more word for word. Late steps cost up to twice as much." },
];

const KEY = "workshop.length";

/** The choice kept in this computer's webview (lost: normal). */
export function savedLength(): LengthChoice {
  try {
    const kept = localStorage.getItem(KEY);
    return LENGTH_CHOICES.some((c) => c.choice === kept) ? (kept as LengthChoice) : "normal";
  } catch {
    return "normal";
  }
}

export function saveLength(choice: LengthChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Not kept: normal next time.
  }
}
