// The stand-in for PaperPaw's web emulator until `shells/web` lands: it
// draws a reader's home screen roughly as PaperPaw would with the plugin's
// look settings (margins, rows, headers, corners, highlight, lines, cards,
// title size, text size, colours, night mode) and its home screen layout,
// and checks the plugin with the workshop's own checks. It is a preview,
// not PaperPaw: the real emulator draws the real screens.

import { checkDataPlugin } from "../../checks/data";
import type { Profile, Registry } from "../../handbook/handbook";
import { parseIni, type Ini } from "../../project/ini";
import type { InputEvent, PluginFiles } from "../protocol";

const PAPER: Record<string, string> = {
  "core.paper.white": "#ffffff",
  "core.paper.cream": "#f6efdc",
  "core.paper.sepia": "#ecdfc4",
  "core.paper.sand": "#e8dcc4",
  "core.paper.light-gray": "#e6e6e6",
  "core.paper.mint": "#e3f1e6",
  "core.paper.light-blue": "#e3ecf6",
  "core.paper.rose": "#f6e4e6",
};
const INK: Record<string, string> = {
  "core.color.black": "#000000",
  "core.color.dark-gray": "#3a3a3a",
  "core.color.gray": "#666666",
  "core.color.brown": "#5a3a22",
  "core.color.dark-blue": "#1d3557",
  "core.color.dark-green": "#1f4d2c",
  "core.color.burgundy": "#6b1f2b",
  "core.color.violet": "#4b2d6b",
};

export class StubDevice {
  profile: Profile | undefined;
  dark = false;
  plugin: PluginFiles | undefined;
  focus = 0;
  private registry: Registry | undefined;

  start(profile: Profile, dark: boolean, plugin: PluginFiles | undefined, registry: Registry): void {
    this.profile = profile;
    this.dark = dark;
    this.plugin = plugin;
    this.registry = registry;
    this.focus = 0;
  }

  setFiles(plugin: PluginFiles): void {
    this.plugin = plugin;
  }

  input(event: InputEvent, count: number): void {
    if (event.kind !== "button") return;
    if (["down", "right", "page-forward"].includes(event.name)) this.focus = (this.focus + 1) % count;
    if (["up", "left", "page-back"].includes(event.name)) this.focus = (this.focus + count - 1) % count;
  }

  check() {
    return checkDataPlugin(this.plugin?.files ?? {}, this.registry ?? { settings: [], widgets: [], actions: [], profiles: [] });
  }

  /** The value of setting `id`: the plugin's layout, then its settings,
   *  then the device's default, then PaperPaw's. */
  value(id: string): string {
    const ini = (path: string): Ini | undefined => {
      const bytes = this.plugin?.files[path];
      return bytes ? parseIni(new TextDecoder().decode(bytes)) : undefined;
    };
    const layout = ini("presets.ini");
    if (layout) {
      const section = layout.entries.find((e) => e.key === "kind" && e.value === "home.layout")?.section;
      const set = layout.entries.find((e) => e.section === section && e.key === id);
      if (section && set) return set.value;
    }
    const [plugin, ...rest] = id.split(".");
    const own = ini("settings.ini")?.entries.find((e) => e.section === plugin && e.key === rest.join("."));
    if (own) return own.value;
    const spec = this.registry?.settings.find((s) => s.id === id);
    return String(spec?.default ?? "");
  }

  /** The things on the home screen, in focus order. */
  items(): { label: string; cell?: [number, number, number, number] }[] {
    const page = this.value("home.page-1");
    const title = (id: string) => this.registry?.widgets.find((w) => w.id === id)?.title ?? id;
    const cells = page
      .split(",")
      .map((p) => p.trim())
      .map((p) => /^([a-z0-9.-]+)(?:@\d+)?\s+(\d+)\/(\d+)\s+(\d+)x(\d+)$/.exec(p))
      .filter((m): m is RegExpExecArray => m !== null)
      .map((m) => ({ label: title(m[1]!), cell: [m[2], m[3], m[4], m[5]].map(Number) as [number, number, number, number] }));
    if (cells.length > 0) return cells;
    return ["Continue reading", "Library", "Recently read", "Fonts", "Settings"].map((label) => ({ label }));
  }

  /** Draws the home screen on `canvas`, at the profile's resolution. */
  draw(canvas: HTMLCanvasElement, profile = this.profile, dark = this.dark): void {
    if (!profile) return;
    canvas.width = profile.width;
    canvas.height = profile.height;
    const g = canvas.getContext("2d");
    if (!g) return;
    const mm = (n: number) => (n * profile.dpi) / 25.4;
    const number = (id: string) => Number(this.value(id)) || 0;
    const choice = (id: string) => this.value(id).split(".").pop() ?? "";

    // Colours: e-ink greys on devices without colour.
    const night = dark || this.value("core.night-mode") === "true";
    let paper = PAPER[this.value("core.paper-color")] ?? "#ffffff";
    let ink = INK[this.value("core.text-color")] ?? "#000000";
    if (!profile.colors) {
      paper = grey(paper);
      ink = grey(ink);
    }
    if (night) [paper, ink] = ["#111111", "#f2f2f2"];
    const strong = choice("core.ui-contrast") === "strong";

    const text = (number("core.ui-size") || 9) * (profile.dpi / 72) * 0.95;
    const margin = mm(number("core.ui-margin"));
    const row = (text * (number("core.ui-row") || 160)) / 100;
    const titleSize = (text * (number("core.ui-title") || 130)) / 100;
    const line = Math.max(1, mm(number("core.ui-lines") / 10));
    const radius = { square: 0, small: mm(0.8), round: row / 2, soft: mm(1.6) }[choice("core.ui-corners")] ?? mm(1.6);
    const font = (size: number, weight = 400) => `${weight} ${Math.round(size)}px system-ui, sans-serif`;

    g.fillStyle = paper;
    g.fillRect(0, 0, profile.width, profile.height);
    let y = 0;

    // The status line.
    if (this.value("home.status-bar") !== "false") {
      g.fillStyle = ink;
      g.font = font(text * 0.75);
      g.textBaseline = "middle";
      g.fillText("22:41", margin, text * 0.9);
      const battery = "87%";
      g.fillText(battery, profile.width - margin - g.measureText(battery).width, text * 0.9);
      y = text * 1.8;
    }

    // The header.
    const header = choice("core.ui-header");
    const headerHeight = titleSize * 2;
    if (header === "dark") {
      g.fillStyle = ink;
      g.fillRect(0, y, profile.width, headerHeight);
      g.fillStyle = paper;
    } else {
      g.fillStyle = ink;
    }
    g.font = font(titleSize, 700);
    g.fillText("Home", margin, y + headerHeight / 2);
    if (header === "light") {
      g.fillStyle = ink;
      g.fillRect(0, y + headerHeight - line, profile.width, line);
    }
    y += headerHeight + mm(1);

    const items = this.items();
    const focus = this.focus % items.length;
    const focusStyle = choice("core.ui-focus");
    const separators = choice("core.ui-separators");
    const cards = choice("core.ui-groups") === "cards";

    if (items[0]?.cell) {
      // A layout: widgets on the grid.
      const columns = number("home.columns") || 4;
      const rows = number("home.rows") || 8;
      const cellW = (profile.width - 2 * margin) / columns;
      const cellH = (profile.height - y - margin - text * 2) / rows;
      items.forEach((item, i) => {
        const [c, r, w, h] = item.cell!;
        const x0 = margin + c * cellW + mm(0.8);
        const y0 = y + r * cellH + mm(0.8);
        const width = w * cellW - mm(1.6);
        const height = h * cellH - mm(1.6);
        const focused = i === focus;
        g.fillStyle = focused && focusStyle === "fill" ? ink : paper;
        roundRect(g, x0, y0, width, height, radius);
        g.fill();
        g.strokeStyle = ink;
        g.lineWidth = focused ? line * 2.5 : strong ? line * 1.5 : line;
        roundRect(g, x0, y0, width, height, radius);
        g.stroke();
        g.fillStyle = focused && focusStyle === "fill" ? paper : ink;
        g.font = font(Math.min(text * 1.1, height / 3), 600);
        g.textBaseline = "middle";
        g.fillText(fit(g, item.label, width - mm(3)), x0 + mm(1.5), y0 + height / 2);
      });
    } else {
      // A list, as menus and the standard home screen show.
      const top = y;
      items.forEach((item, i) => {
        const y0 = top + i * (row + (cards ? mm(1.5) : 0));
        const x0 = margin;
        const width = profile.width - 2 * margin;
        const focused = i === focus;
        if (cards) {
          g.fillStyle = grey("#f0f0f0", night ? 0.15 : 1);
          roundRect(g, x0, y0, width, row, radius);
          g.fill();
        }
        if (focused) {
          if (focusStyle === "ring") {
            g.strokeStyle = ink;
            g.lineWidth = line * 2;
            roundRect(g, x0, y0 + line, width, row - 2 * line, radius);
            g.stroke();
          } else {
            g.fillStyle = focusStyle === "soft" ? grey("#d0d0d0", night ? 0.3 : 1) : ink;
            roundRect(g, x0, y0 + line, width, row - 2 * line, radius);
            g.fill();
          }
        }
        g.fillStyle = focused && focusStyle === "fill" ? paper : ink;
        g.font = font(text, strong ? 600 : 400);
        g.textBaseline = "middle";
        g.fillText(item.label, x0 + mm(2), y0 + row / 2);
        if (!cards && separators !== "none" && i < items.length - 1) {
          const inset = separators === "inset" ? mm(2) : 0;
          g.fillStyle = ink;
          g.globalAlpha = 0.5;
          g.fillRect(x0 + inset, y0 + row - line / 2, width - inset, line);
          g.globalAlpha = 1;
        }
      });
    }

    // Said plainly on the screen: this is the stand-in.
    g.fillStyle = ink;
    g.globalAlpha = 0.55;
    g.font = font(text * 0.6);
    g.textBaseline = "alphabetic";
    g.fillText("Preview: PaperPaw's emulator comes later", margin, profile.height - text * 0.6);
    g.globalAlpha = 1;
  }
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + radius, y);
  g.arcTo(x + w, y, x + w, y + h, radius);
  g.arcTo(x + w, y + h, x, y + h, radius);
  g.arcTo(x, y + h, x, y, radius);
  g.arcTo(x, y, x + w, y, radius);
  g.closePath();
}

/** `text`, shortened with an ellipsis to fit `width`. */
function fit(g: CanvasRenderingContext2D, text: string, width: number): string {
  if (g.measureText(text).width <= width) return text;
  let cut = text;
  while (cut.length > 1 && g.measureText(cut + "...").width > width) cut = cut.slice(0, -1);
  return cut + "...";
}

/** `hex` as the grey of its brightness; `scale` darkens it toward black. */
function grey(hex: string, scale = 1): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const v = Math.round((0.299 * r + 0.587 * g + 0.114 * b) * scale);
  const h = v.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}
