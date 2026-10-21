// PaperPaw's web emulator: loads the WebAssembly module (built from
// shells/web) and wraps its plain functions. No generated glue: strings
// and files are copied into the module's memory, texts and pictures read
// back from it.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

export class PaperPawDevice {
  /// Loads the module from `url` (`paperpaw-web.wasm`).
  static async load(url) {
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
      },
    };
    const { instance } = await WebAssembly.instantiateStreaming(fetch(url), imports);
    device.exports = instance.exports;
    device.memory = instance.exports.memory;
    return device;
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

  /// Throws the module's error when `status` says it failed.
  #check(status) {
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

  /// The device: `{ id, name, width, height, dpi, grays, color, touch,
  /// buttons, row }`.
  device() {
    this.#check(this.exports.pp_device());
    return JSON.parse(this.#result());
  }

  /// A button pressed or let go; false if the device has none so named.
  button(name, pressed) {
    return this.#with([name], (p, l) => this.exports.pp_button(p, l, pressed ? 1 : 0)) === 0;
  }

  /// A finger on the screen (`phase` of PHASES) at the screen's pixel.
  pointer(phase, x, y) {
    this.exports.pp_pointer(PHASES[phase] ?? PHASES.cancel, Math.round(x), Math.round(y));
  }

  /// Lets time pass to `now` (ms since the page started); ms until
  /// something is due, or null.
  advance(now) {
    const next = this.exports.pp_advance(now);
    return next < 0 ? null : next;
  }

  /// The screen's size in pixels.
  size() {
    return [this.exports.pp_width(), this.exports.pp_height()];
  }

  /// Whether the panel still changes by itself (a full refresh flashing).
  animating() {
    return this.exports.pp_animating() === 1;
  }

  #image(ptr) {
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

  /// paperpaw-dev's report of the data plugins on the card (`commands`:
  /// some of package, lint, visual, reach; none: all).
  check(commands = []) {
    this.#check(this.#with([commands.join(",")], (p, l) => this.exports.pp_check(p, l)));
    return JSON.parse(this.#result());
  }
}
