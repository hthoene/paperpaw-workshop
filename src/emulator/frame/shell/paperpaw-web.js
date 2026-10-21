// PaperPaw's web emulator: loads the WebAssembly module (built from
// shells/web) and wraps its plain functions. No generated glue: strings
// and files are copied into the module's memory, texts and pictures read
// back from it.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/// What a call returns once a panic stopped the module.
const STOPPED = 2;

/// The phases of a finger on the screen, as the module numbers them.
export const PHASES = { down: 0, move: 1, up: 2, cancel: 3 };

/// Keys of the computer's keyboard as the device's buttons, as the
/// desktop emulator has them (shells/desktop/src/gui.rs).
export const KEYS = {
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

/// Throws unless `now` is a time: input stamped with none would be taken
/// as at the start, and a short press as a long one.
function needsTime(now) {
  if (!Number.isFinite(now)) {
    throw new TypeError("the time it happens at is needed (ms, as advance takes it)");
  }
}

export class PaperPawDevice {
  /// Loads the module from `url` (`paperpaw-web.wasm`).
  static async load(url) {
    return PaperPawDevice.from(await WebAssembly.compileStreaming(fetch(url)));
  }

  /// A device of the compiled `module`: a fresh instance, its own memory.
  static async from(module) {
    const device = new PaperPawDevice();
    const imports = {
      paperpaw: {
        random: (ptr, len) => {
          crypto.getRandomValues(new Uint8Array(device.memory.buffer, ptr, len));
          return 1;
        },
        log: (ptr, len) => {
          console.error("paperpaw:", decoder.decode(new Uint8Array(device.memory.buffer, ptr, len)));
        },
        now: () => performance.now(),
      },
    };
    const instance = await WebAssembly.instantiate(module, imports);
    device.module = module;
    device.exports = instance.exports;
    device.memory = instance.exports.memory;
    // A module built around plugins with code adds them first.
    device.exports.pp_plugins?.();
    return device;
  }

  /// A fresh instance of the same module: after a panic, which leaves
  /// this one stopped for good (a trap, `WebAssembly.RuntimeError`).
  fresh() {
    return PaperPawDevice.from(this.module);
  }

  /// Calls `f` with `values` (strings or bytes) copied into the module's
  /// memory, as `(ptr, len)` pairs, and frees them after.
  #with(values, f) {
    const copies = values.map((value) => {
      const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
      const ptr = bytes.length ? this.exports.pp_alloc(bytes.length) : 0;
      if (bytes.length) {
        new Uint8Array(this.memory.buffer, ptr, bytes.length).set(bytes);
      }
      return [ptr, bytes.length];
    });
    try {
      return f(...copies.flat());
    } finally {
      for (const [ptr, len] of copies) {
        if (len) this.exports.pp_free(ptr, len);
      }
    }
  }

  /// The text the module left in its result buffer.
  #result() {
    const ptr = this.exports.pp_result_ptr();
    const len = this.exports.pp_result_len();
    return decoder.decode(new Uint8Array(this.memory.buffer, ptr, len).slice());
  }

  /// Throws the module's error when `status` says it failed; once a
  /// panic stopped it (2), as the trap did: start a fresh one.
  #check(status) {
    if (status === STOPPED) throw new WebAssembly.RuntimeError("the device stopped after a panic");
    if (status !== 0) throw new Error(this.#result());
  }

  /// A device of `profile` (`xteink-x4`, `xteink-x4-pro`, `boox-go-7`),
  /// its texts in `language`, dark or not; it replaces the one before.
  create({ profile = "xteink-x4", language = "en", dark = false } = {}) {
    this.#check(this.#with([profile, language], (p, pl, l, ll) => this.exports.pp_new(p, pl, l, ll, dark ? 1 : 0)));
  }

  /// Puts a file of the data plugin `plugin` on the card.
  putFile(plugin, path, bytes) {
    this.#check(this.#with([plugin, path, bytes], (...args) => this.exports.pp_put_file(...args)));
  }

  /// Takes the data plugin `plugin` off the card.
  removePlugin(plugin) {
    this.#check(this.#with([plugin], (p, l) => this.exports.pp_remove_plugin(p, l)));
  }

  /// Starts the device, or starts it again with what is on the card now.
  start() {
    this.#check(this.exports.pp_start());
  }

  /// PaperPaw's version, and the commit the module was built from.
  version() {
    this.exports.pp_version();
    return this.#result();
  }

  /// The device: `{ id, name, width, height, dpi, grays, color, touch,
  /// buttons, row, version }`.
  device() {
    this.#check(this.exports.pp_device());
    return JSON.parse(this.#result());
  }

  /// A button pressed or let go at `now` (ms since the page started, as
  /// `advance` takes it); false if the device has none so named.
  button(name, pressed, now) {
    needsTime(now);
    const status = this.#with([name], (p, l) => this.exports.pp_button(p, l, pressed ? 1 : 0, now));
    if (status === STOPPED) this.#check(status);
    return status === 0;
  }

  /// A finger on the screen (`phase` of PHASES) at the screen's pixel,
  /// at `now` (as `button`).
  pointer(phase, x, y, now) {
    needsTime(now);
    this.#check(this.exports.pp_pointer(PHASES[phase] ?? PHASES.cancel, Math.round(x), Math.round(y), now));
  }

  /// Lets time pass to `now` (ms since the page started); ms until
  /// something is due, or null.
  advance(now) {
    const next = this.exports.pp_advance(now);
    if (next === -2) throw new WebAssembly.RuntimeError("the device stopped after a panic");
    return next < 0 ? null : next;
  }

  /// The screen's size in pixels.
  size() {
    return [this.exports.pp_width(), this.exports.pp_height()];
  }

  /// After a trap: the size of the allocation the device's heap budget
  /// refused during the call that stopped, 0 if none was (then it was no
  /// lack of memory).
  refused() {
    return this.exports.pp_refused();
  }

  /// Whether the panel still changes by itself (a full refresh flashing).
  animating() {
    return this.exports.pp_animating() === 1;
  }

  #image(ptr) {
    if (ptr === 0) throw new WebAssembly.RuntimeError("the device stopped after a panic");
    const [width, height] = this.size();
    const bytes = new Uint8ClampedArray(this.memory.buffer, ptr, width * height * 4).slice();
    return new ImageData(bytes, width, height);
  }

  /// What the panel shows now, flashing included.
  frame() {
    return this.#image(this.exports.pp_frame());
  }

  /// What the panel shows once settled: for screenshots.
  shown() {
    return this.#image(this.exports.pp_shown());
  }

  /// What another device (`profile`), night mode or not (`dark`), or the
  /// sleep screen (`asleep`) shows with the card as it is, made apart:
  /// what this device shows stays.
  snapshot({ profile = "", dark, asleep = false } = {}) {
    const night = dark === undefined ? 2 : dark ? 1 : 0;
    this.#check(this.#with([profile], (p, l) => this.exports.pp_snapshot(p, l, night, asleep ? 1 : 0)));
    const [width, height] = this.#result().split("x").map(Number);
    const ptr = this.exports.pp_snapshot_pixels();
    const bytes = new Uint8ClampedArray(this.memory.buffer, ptr, width * height * 4).slice();
    return new ImageData(bytes, width, height);
  }

  /// paperpaw-dev's report of the data plugins on the card (`commands`:
  /// some of package, lint, visual, reach; none: all).
  check(commands = [], plugins = []) {
    this.#check(this.#with([commands.join(","), plugins.join(",")], (...args) => this.exports.pp_check(...args)));
    return JSON.parse(this.#result());
  }
}
