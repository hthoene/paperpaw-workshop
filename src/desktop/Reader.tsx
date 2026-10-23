// The reader beside the conversation: PaperPaw's own emulator, run by the
// app, its panel shown as it changes. Its buttons: the keyboard while the
// reader has the focus (arrows, Enter, Escape, Page Up and Down, P for
// power), touches with the mouse where the reader has a touch screen.

import { useEffect, useRef, useState } from "preact/hooks";

import type { Backend, Frame, Phase } from "./backend";

/** The readers offered, with the names the switch shows. */
export const READERS: { id: string; name: string }[] = [
  { id: "xteink-x4", name: "X4" },
  { id: "xteink-x4-pro", name: "X4 Pro" },
  { id: "boox-go-7", name: "Boox Go 7" },
];

/** Keys to the reader's buttons, as PaperPaw's desktop emulator has them. */
const KEYS: Record<string, string> = {
  PageDown: "page-forward",
  " ": "page-forward",
  PageUp: "page-back",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "confirm",
  Escape: "back",
  Backspace: "back",
  m: "menu",
  h: "home",
  p: "power",
};

interface Props {
  backend: Backend;
}

export function Reader({ backend }: Props) {
  const [profile, setProfile] = useState(READERS[0]!.id);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [error, setError] = useState("");
  const screen = useRef<HTMLImageElement>(null);
  const down = useRef(false);

  useEffect(() => {
    let stop: (() => void)[] = [];
    void (async () => {
      stop.push(await backend.onFrame(setFrame));
      stop.push(await backend.onError(setError));
    })();
    return () => stop.forEach((s) => s());
  }, [backend]);

  useEffect(() => {
    setError("");
    backend.emulatorStart(profile).catch((e: unknown) => setError(String(e)));
  }, [backend, profile]);

  const button = (event: KeyboardEvent, pressed: boolean) => {
    const name = KEYS[event.key];
    if (!name || !frame?.buttons.includes(name) || (pressed && event.repeat)) return;
    event.preventDefault();
    void backend.emulatorButton(name, pressed);
  };

  /** A mouse position as the panel's own pixels. */
  const at = (event: PointerEvent): [number, number] | null => {
    const img = screen.current;
    if (!img || !frame) return null;
    const box = img.getBoundingClientRect();
    return [
      Math.round(((event.clientX - box.left) / box.width) * frame.width),
      Math.round(((event.clientY - box.top) / box.height) * frame.height),
    ];
  };
  const touch = (phase: Phase) => (event: PointerEvent) => {
    if (!frame?.touch) return;
    if (phase === "down") down.current = true;
    else if (!down.current) return;
    if (phase === "up" || phase === "cancel") down.current = false;
    const point = at(event);
    if (point) void backend.emulatorPointer(phase, point[0], point[1]);
  };

  return (
    <section class="reader" aria-label="Reader">
      <div class="which" role="radiogroup" aria-label="Reader">
        {READERS.map((r) => (
          <button
            type="button"
            role="radio"
            aria-checked={r.id === profile}
            class={r.id === profile ? "on" : ""}
            onClick={() => setProfile(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>
      <div
        class={`device device-${profile}`}
        tabIndex={0}
        onKeyDown={(e) => button(e, true)}
        onKeyUp={(e) => button(e, false)}
      >
        {frame ? (
          <img
            ref={screen}
            src={`data:image/png;base64,${frame.png}`}
            width={frame.width}
            height={frame.height}
            alt="The reader's screen"
            draggable={false}
            onPointerDown={touch("down")}
            onPointerMove={touch("move")}
            onPointerUp={touch("up")}
            onPointerLeave={touch("cancel")}
          />
        ) : (
          <div class="starting">Starting the reader…</div>
        )}
      </div>
      <p class="state">{error || (frame?.touch ? "Live: tap it, or use the arrow keys" : "Live: click it, then use the arrow keys")}</p>
    </section>
  );
}
