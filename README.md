<p align="center">
  <img src="docs/images/cat.png" width="260" alt="A kitten putting puzzle pieces together">
</p>

<h1 align="center">PaperPaw Workshop</h1>

<p align="center">
  <b>Make your own plugins for your e-reader by saying what you want.</b>
</p>

You say what your reader should do. The workshop makes the plugin and shows
it on a reader right in the window. When you like it, it goes onto your
reader. It works with [PaperPaw](https://paperpaw.org), first on the
Xteink X4 and X4 Pro.

## In three steps

1. **Download** the workshop for your computer from the
   [releases](https://github.com/hthoene/paperpaw-workshop/releases).
2. **Paste your Claude key** when it starts. You get one in the
   [Claude Console](https://console.anthropic.com/).
3. **Describe your plugin** in your own words: "A calm dark look for
   reading at night", "The clock and my last book on the home screen".

<p align="center">
  <img src="docs/images/window.png" width="860" alt="The workshop's window: the conversation about a calm dark look on the left, and on the right an X4 Pro showing its home screen in that look">
</p>

When it looks right, **Send to reader**: over Wi-Fi (open Transfer on the
reader and type the address it shows), or onto its card. Or keep it as a
zip with **Export zip** in the menu.

## No Claude key?

Ask for a **PaperPaw key** at
[workshop.paperpaw.org/apply](https://workshop.paperpaw.org/apply). A
person reads every request. A PaperPaw key works for a while and up to a
small budget, so you can try the workshop before you get a key of your own.

## What it does

- Makes **looks, home screens, buttons and texts**: plugins of a few text
  files. And **plugins with code**, such as new screens and tools.
- Shows the plugin on an **X4 Pro, an X4 and a Boox Go 7**, drawn by
  PaperPaw itself. Tap the screen or use the arrow keys.
- **Checks** the plugin as PaperPaw checks plugins, on every reader and in
  every language it has: text that is cut off, parts that overlap, margins,
  what works with buttons alone. What it finds goes back to the AI to fix.
- Makes your **pictures** small and right for e-ink, if you like.
- Shows what each turn **cost**.

## What it does not do

- **It keeps nothing on our side.** Your plugins are folders in
  *Documents/PaperPaw Workshop* on your computer. Your key stays in your
  computer's keychain.
- **It talks to no one else.** Only to Anthropic with your key, or to
  PaperPaw's key service with a PaperPaw key. No account, no tracking.
- **It does not spend more than it must.** With your own key you pay
  Anthropic for what you use. The workshop uses the smallest model that
  does the job, keeps the conversation short, and shows each turn's cost.
  In Settings you can choose another model.

## What you need

- Windows 10 or 11. macOS and Linux follow.
- A Claude key, or a PaperPaw key.
- For plugins with code: about 1 GB of room. The workshop sets up Rust by
  itself the first time. On Windows it also needs Microsoft's C++ build
  tools.

## For developers

The workshop is a [Tauri](https://tauri.app/) app: the window is
TypeScript with Preact (`src/desktop`, using the conversation, tools and
checks in `src/`), the computer's side is Rust (`src-tauri`). The reader
is PaperPaw's own emulator, `paperpaw-emu`, a program of each PaperPaw
release, so a new PaperPaw needs no new workshop.

To build it you need Node 24, Rust and
[Tauri's prerequisites](https://tauri.app/start/prerequisites/). Then:

```sh
npm install
npm run app
```

While you work on it, point it at a PaperPaw you built yourself:
`PAPERPAW_EMU` names its `paperpaw-emu` (with `paperpaw-dev` beside it),
and `PAPERPAW_SDK` its `crates/paperpaw-sdk` for plugins with code.
`npm run dev` with `?example=night-owl` in the address plays a recorded
conversation instead of asking the model.

Tests: `npm test`, and `cargo test` in `src-tauri`. The key service for
PaperPaw keys is in [`proxy/`](proxy/README.md). An installer comes from
`npm run app:build`.

Licensed under the [Apache License 2.0](LICENSE).
