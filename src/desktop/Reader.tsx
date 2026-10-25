// The reader beside the conversation: PaperPaw's own emulator, run by the
// app, its panel shown as it changes, in its body with its keys where
// they sit on the real device (the emulator says where: `body`). Its
// buttons: those keys, clicked or tapped, and the computer's keys the
// device's profile binds while the reader has the focus; touches with the
// mouse where the reader has a touch screen. An emulator from before
// bodies: the keyboard alone (arrows, Enter, Escape, Page Up and Down, P
// for power). The camera beside the switch keeps what a reader shows as
// one of the store's screenshots.

import { useEffect, useRef, useState } from "preact/hooks";

import type { Backend, Body, Frame, Phase } from "./backend";
import { bezels, fit, isEdge, keyMap, margins, place, type Label } from "./body";

/** The readers offered, with the names the switch shows. */
export const READERS: { id: string; name: string }[] = [
  { id: "xteink-x4", name: "X4" },
  { id: "xteink-x4-pro", name: "X4 Pro" },
  { id: "boox-go-7", name: "Boox Go 7" },
];

/** Keys to the reader's buttons, as PaperPaw's desktop emulator has them,
 *  for buttons the body places no key for. */
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
  /** The reader shown, by profile id. */
  shown: string;
  /** Another reader chosen; whoever owns the reader starts it. */
  onChoose(id: string): void;
  /** Keeps what reader `id` shows (`dark`: in night mode) as a store
   *  screenshot; what to say. None where there is no plugin yet. */
  onShot?(id: string, dark: boolean): Promise<string>;
}

/** The camera: which reader, light or dark, then the picture. */
function Camera({ shown, onShot }: { shown: string; onShot(id: string, dark: boolean): Promise<string> }) {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState(shown);
  const [dark, setDark] = useState(false);
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState("");
  useEffect(() => setDevice(shown), [shown]);
  const take = async () => {
    setBusy(true);
    setSaid("");
    try {
      setSaid(await onShot(device, dark));
    } catch (e) {
      setSaid(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div class="camera">
      <button type="button" class="camera-button" aria-label="Store screenshot" title="Store screenshot" aria-expanded={open} onClick={() => { setOpen(!open); setSaid(""); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z" />
          <circle cx="12" cy="13.2" r="3.4" />
        </svg>
      </button>
      {open && (
        <div class="menu-list camera-panel" role="dialog" aria-label="Store screenshot">
          <p class="menu-note">For the store: what the reader shows now.</p>
          <div class="which" role="radiogroup" aria-label="Reader">
            {READERS.map((r) => (
              <button type="button" role="radio" aria-checked={r.id === device} class={r.id === device ? "on" : ""} onClick={() => setDevice(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
          <div class="which" role="radiogroup" aria-label="Light or dark">
            <button type="button" role="radio" aria-checked={!dark} class={!dark ? "on" : ""} onClick={() => setDark(false)}>Light</button>
            <button type="button" role="radio" aria-checked={dark} class={dark ? "on" : ""} onClick={() => setDark(true)}>Dark</button>
          </div>
          <button type="button" class="go" disabled={busy} onClick={() => void take()}>
            {busy ? "Taking it…" : "Take screenshot"}
          </button>
          {said && <p class="menu-note" role="status">{said}</p>}
        </div>
      )}
    </div>
  );
}

/** A key's icon, as PaperPaw's hint bar draws it. */
function Icon({ name }: { name: NonNullable<Label["icon"]> }) {
  const shapes = {
    left: ["0 0 10 16", <polyline points="8,2 2,8 8,14" />],
    right: ["0 0 10 16", <polyline points="2,2 8,8 2,14" />],
    up: ["0 0 16 10", <polyline points="2,8 8,2 14,8" />],
    down: ["0 0 16 10", <polyline points="2,2 8,8 14,2" />],
    power: ["0 0 16 16", <path d="M8 1.5v6M4.2 4.2a5.5 5.5 0 1 0 7.6 0" />],
  } as const;
  const [box, shape] = shapes[name];
  return (
    <svg viewBox={box} class={`icon-${name}`} aria-hidden="true">
      {shape}
    </svg>
  );
}

export function Reader({ backend, shown, onChoose, onShot }: Props) {
  const profile = shown;
  const [frame, setFrame] = useState<Frame | null>(null);
  const [error, setError] = useState("");
  const [bodies, setBodies] = useState<Record<string, Body>>({});
  const [room, setRoom] = useState<[number, number] | null>(null);
  const [held, setHeld] = useState<string[]>([]);
  const screen = useRef<HTMLImageElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const down = useRef(false);

  useEffect(() => {
    let stop: (() => void)[] = [];
    void (async () => {
      stop.push(await backend.onFrame(setFrame));
      stop.push(await backend.onError(setError));
    })();
    return () => stop.forEach((s) => s());
  }, [backend]);

  // Where the keys sit, once the emulator said it (kept on its side).
  useEffect(() => {
    void backend.emulatorBodies().then(setBodies, () => setBodies({}));
  }, [backend, profile]);

  // The room the reader has, which the body with its keys is fitted to
  // (the stage's size never follows what it holds).
  useEffect(() => {
    const at = stage.current;
    if (!at) return;
    const seen = new ResizeObserver(() => setRoom([at.clientWidth, at.clientHeight]));
    seen.observe(at);
    return () => seen.disconnect();
  }, []);

  const body = frame && bodies[frame.profile]?.keys.length ? bodies[frame.profile]! : null;
  const keys = keyMap(body, frame?.buttons ?? [], KEYS);

  const press = (name: string, pressed: boolean) => {
    setHeld((now) => (pressed ? [...now.filter((n) => n !== name), name] : now.filter((n) => n !== name)));
    void backend.emulatorButton(name, pressed);
  };

  const button = (event: KeyboardEvent, pressed: boolean) => {
    // A key of the body with the focus presses itself (Enter, Space).
    if (event.target instanceof HTMLButtonElement) return;
    const name = keys[event.key];
    if (!name || !frame?.buttons.includes(name) || (pressed && event.repeat)) return;
    event.preventDefault();
    press(name, pressed);
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

  // The body around the screen, and its keys, where it has a body: the
  // screen as large as the room allows with them around it.
  const width = body && frame && room ? fit(body, frame.width, frame.height, room) : 0;
  const size: [number, number] | null = width ? [width, Math.round((width * frame!.height) / frame!.width)] : null;
  const bezel = body && size ? bezels(body, size[0]) : null;
  const placed = body && size && bezel ? place(body, size[0] + bezel[1] + bezel[3], size[1] + bezel[0] + bezel[2], bezel) : [];
  const edges = body ? margins(body) : null;

  return (
    <section class="reader" aria-label="Reader">
      <div class="reader-top">
      <div class="which" role="radiogroup" aria-label="Reader">
        {READERS.map((r) => (
          <button
            type="button"
            role="radio"
            aria-checked={r.id === profile}
            class={r.id === profile ? "on" : ""}
            onClick={() => { setError(""); onChoose(r.id); }}
          >
            {r.name}
          </button>
        ))}
      </div>
      {onShot && <Camera shown={profile} onShot={onShot} />}
      </div>
      <div class="stage" ref={stage}>
      <div class="body-room" style={edges ? { padding: edges.map((n) => `${n}px`).join(" ") } : undefined}>
        <div
          class={`device device-${profile}${body ? " has-body" : ""}`}
          style={bezel ? { padding: bezel.map((n) => `${n}px`).join(" ") } : undefined}
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
              style={size ? { width: `${size[0]}px`, height: `${size[1]}px` } : undefined}
              draggable={false}
              onPointerDown={touch("down")}
              onPointerMove={touch("move")}
              onPointerUp={touch("up")}
              onPointerLeave={touch("cancel")}
            />
          ) : (
            <div class="starting">Starting the reader…</div>
          )}
          {placed.map(({ key, label, x, y, width, height }) => {
            const bound = key.keys.length ? ` (${key.keys.map((k) => (k === " " ? "Space" : k)).join(", ")})` : "";
            return (
              <button
                type="button"
                class={`key ${isEdge(key.place) ? "edge" : "face"} ${key.place}${width < 64 ? " tight" : ""}${held.includes(key.button) ? " down" : ""}`}
                style={{ left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` }}
                aria-label={label.icon ? label.spoken : undefined}
                title={`${label.spoken}${bound}`}
                data-button={key.button}
                onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); press(key.button, true); }}
                onPointerUp={() => press(key.button, false)}
                onPointerCancel={() => press(key.button, false)}
                onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); press(key.button, true); } }}
                onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(key.button, false); } }}
              >
                {label.icon ? <Icon name={label.icon} /> : label.text}
              </button>
            );
          })}
        </div>
      </div>
      </div>
      <p class="state">
        {error ||
          (body
            ? "Live: press its keys, or use the keyboard"
            : frame?.touch
              ? "Live: tap it, or use the arrow keys"
              : "Live: click it, then use the arrow keys")}
      </p>
    </section>
  );
}
