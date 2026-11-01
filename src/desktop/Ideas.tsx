// The ideas to start from, shown in an empty conversation: a click puts
// the idea's words into the message field, for the person to change and
// send. Whether it needs code, the AI decides from the words.

export interface Idea {
  id: string;
  name: string;
  what: string;
  /** What kind of plugin it is, in a word. */
  kind: string;
  /** The words put into the message field. */
  prompt: string;
}

export const IDEAS: Idea[] = [
  { id: "look", name: "A calmer look", what: "Margins, rows, headers, corners, light and dark.", kind: "Look", prompt: "A calmer look: wider margins, roomier rows and soft corners." },
  { id: "home", name: "My home screen", what: "Which books, which widgets, in what order.", kind: "Home", prompt: "A home screen with a big clock, the book I am reading and the ones before it." },
  { id: "keys", name: "Buttons my way", what: "What each button, tap and swipe does.", kind: "Keys", prompt: "Holding the page forward button should switch night mode on and off." },
  { id: "text", name: "Bigger text", what: "Larger letters everywhere, for tired eyes.", kind: "Reading", prompt: "Larger text in books and menus, with more space between lines." },
  { id: "tool", name: "A small tool of my own", what: "A new screen or widget: a timer, a quote a day, a counter.", kind: "With code", prompt: "A screen in the tools menu that shows a short quote, a different one each day." },
];

export function Ideas({ onPick }: { onPick(prompt: string): void }) {
  return (
    <ul class="ideas" aria-label="Ideas to start from">
      {IDEAS.map((idea) => (
        <li key={idea.id}>
          <button type="button" class="idea" onClick={() => onPick(idea.prompt)}>
            <b>{idea.name}</b>
            <span>{idea.what}</span>
            <em>{idea.kind}</em>
          </button>
        </li>
      ))}
    </ul>
  );
}
