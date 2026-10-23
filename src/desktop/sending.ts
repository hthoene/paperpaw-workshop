// What sending to a reader says to the person: how it goes while it
// goes, and what came of it. Apart from Send.tsx, so it is tested alone.

import type { CableReader, Installed } from "./backend";

/** The line shown while sending, from the app's `send-progress` step. */
export function stepText(step: string): string {
  if (step === "asking") return "Allow it on the reader.";
  if (step === "installing") return "Installing…";
  const sending = /^sending (\d+)\/(\d+)$/.exec(step);
  if (sending) return `Sending file ${sending[1]} of ${sending[2]}…`;
  return "";
}

/** What the person is told once the reader installed the plugin. */
export function installedText(done: Installed): string {
  return done.restart
    ? `Installed ${done.id}. Its code runs once the reader starts again.`
    : `Installed ${done.id}. It is on the reader now.`;
}

/** A reader on the cable as the list shows it. */
export function readerLabel(reader: CableReader): string {
  if (reader.problem) return `${reader.port}: ${reader.problem}`;
  const name = reader.name ?? reader.device ?? "A reader";
  const version = reader.version ? `, PaperPaw ${reader.version}` : "";
  return `${name} on ${reader.port}${version}`;
}
