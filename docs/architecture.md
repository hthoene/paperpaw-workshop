# How the workshop is built

The workshop is a static site: TypeScript with [Preact](https://preactjs.com/),
built by [Vite](https://vite.dev/). Everything runs in the browser. A server
only hands out the files (nginx in `local/`); it never sees a key or a plugin.

```
src/
  app/        the pages (Preact) and the controller between them and the rest
  ai/         the conversation loop, who answers it (providers), prices
  tools/      what the AI can do: files, docs, check, look, press, set_entry,
              and the author's uploads (list, view, convert a picture, place a file)
  pictures/   pictures for e-ink: gray, fitted, toned, dithered, PNG
  handbook/   finding and reading topics of the handbook
  checks/     the rules a data plugin must follow
  emulator/   the interface to the reader, and the frame behind it
  publish/    sharing in the store: its API, screenshots, the AI's draft
  project/    a project, its files, its uploads, its store entry, storage, the ZIP
  i18n/       every text, and t()
handbook/     how the handbook is made from PaperPaw (Node and Rust)
public/       fonts, the icon, the made handbook
test/         the tests (Vitest)
```

Each folder knows only the ones below it in this list of who uses whom:

```
app  ->  publish  ->  ai  ->  tools  ->  emulator, handbook, checks, project
```

`ai` does not know `app`, and `tools` do not know `ai`. The loop gets its
tools and its provider handed in, so tests can hand in others.

## A turn of the conversation

`runTurn` in [src/ai/loop.ts](../src/ai/loop.ts) is the whole loop:

1. Add what the person wrote to the messages.
2. Send the messages, the handbook and the tools to the provider.
3. If the answer asks for tools, run them (input checked with zod first),
   add their results, and go to 2. At most 25 rounds per turn.
4. Otherwise the turn is done.

The messages are only ever added to, never changed. That keeps the prompt
cache working (the handbook is cached once and read cheaply after) and keeps
the AI's thinking valid from one round to the next.

A **provider** ([src/ai/provider.ts](../src/ai/provider.ts)) is who answers:

- `AnthropicDirect`: the person's own key, straight from the browser.
- `ReplayProvider`: a recorded conversation (`src/ai/examples/*.json`), for
  the example on the start page and for tests.
- Later: the site's own proxy with a daily quota.

## Tools

A tool ([src/tools/tool.ts](../src/tools/tool.ts)) is a name, a description
the AI reads, a zod schema for its input, and a `run` function. `run` gets a
`ToolContext` (the project's files, the emulator, the handbook, the devices)
and returns what the AI reads plus a `step`: the line the conversation shows,
as a catalog key.

**Adding a tool:**

1. Write it in a file in `src/tools/`.
2. Add it to `DATA_TOOLS` in [src/tools/registry.ts](../src/tools/registry.ts).
   Add it at the end: the order is part of the cached prompt.
3. Add its step text `step.<name>` to [src/i18n/en.json](../src/i18n/en.json).
4. Test it: call `run` with a bench from [test/helpers.ts](../test/helpers.ts),
   or record a conversation that uses it and replay it in
   [test/loop.test.ts](../test/loop.test.ts).

## The emulator

The workshop talks to the reader through one interface, `Emulator` in
[src/emulator/emulator.ts](../src/emulator/emulator.ts):

| Method | What it does |
|---|---|
| `start(profile, dark, plugin)` | Boots a device with the plugin |
| `setFiles(plugin)` | Gives it the plugin's files as they are now |
| `input(event)` | Presses a button or taps the screen |
| `screenshot(profile?, dark?, screen?)` | The screen as a PNG |
| `check()` | What the reader found wrong with the plugin |

`FrameEmulator` puts this through `postMessage` to a frame (`frame.html`) in
a sandboxed iframe. The messages are in
[src/emulator/protocol.ts](../src/emulator/protocol.ts):

1. The workshop sends `hello` until the frame answers `ready`
   (either may load first). `ready` says whether it is the stub.
2. Then each request (`start`, `files`, `input`, `screenshot`, `check`)
   carries an `id`, and the frame answers with the same `id`, `ok` and a
   `result` or an `error`.

The frame answers with **PaperPaw itself**: its web emulator (PaperPaw's
`shells/web`, the kernel, plugins, device profiles and panel compiled to
WebAssembly), built into `public/emulator/paperpaw-web.wasm` by
`npm run emulator` ([scripts/emulator.mjs](../scripts/emulator.mjs); what it
was built from is in `public/emulator/meta.json`). The frame drives it
through PaperPaw's own loader (`paperpaw-web.js`, copied beside
[src/emulator/frame/shell/reader.ts](../src/emulator/frame/shell/reader.ts)),
not through PaperPaw's frame page, because the workshop asks for more:

- screenshots of another device, in night mode or asleep, without
  changing the reader the author sees: a second instance of the module
  takes them;
- the checker's findings in the workshop's shape: paperpaw-dev's
  `package`, `lint` and `visual` checks, on the device shown;
- a module that stops (PaperPaw panicked, or ran out of the device's
  memory) is loaded anew, and the request says what happened.

Where the module is missing (a checkout that never ran `npm run
emulator`), the stub answers instead ([src/emulator/frame/stub.ts](../src/emulator/frame/stub.ts)):
a rough home screen from the plugin's look and layout, and the workshop's
own checks.

The frame runs without `allow-same-origin`, so its origin is opaque: it
cannot read the workshop's storage or the key. What follows from that is
handled in [local/nginx.conf](../local/nginx.conf): its scripts and the
module are loaded with CORS (`/assets/` and `/emulator/` allow any
origin), and its Content-Security-Policy names the server's real origin
instead of `'self'` (for scripts, and for fetching the module), with
`'wasm-unsafe-eval'` for WebAssembly.
In `npm run dev` the frame gets `allow-same-origin`, because Vite's dev
server sends no CORS headers.

Tests use `FakeEmulator` ([src/emulator/fake.ts](../src/emulator/fake.ts)).

## The handbook

The AI's system prompt is `public/handbook/data.md`: the rules for data
plugins, every setting with its range and every widget, in about 10k tokens.
Everything else is in topics (`public/handbook/topics/`) that the AI reads
with `lookup_docs` when it needs them.

[handbook/generate.mjs](../handbook/generate.mjs) makes all of it from a
PaperPaw tag or branch:

- the docs, taken from `git archive` of that ref;
- the settings, widgets, actions and devices, read by a small Rust program
  ([handbook/registry/](../handbook/registry/)) that builds PaperPaw's
  emulator and asks it;
- the hand-written parts in [handbook/parts/](../handbook/parts/).

`registry.json` is also what the checks in
[src/checks/data.ts](../src/checks/data.ts) use, so the rules the AI reads
and the rules its files are checked against are the same.

## Sharing in the store

The share page (`#/p/<project>/share`) takes a plugin from "works on the
reader" to "sent to the moderators" in as few steps as there can be:

1. **Its page in the store** is drafted by the AI from the conversation
   ([src/publish/draft.ts](../src/publish/draft.ts): one request whose only
   tool is `set_entry`, asked for by name), and the author changes what
   they like. The entry
   lives in `store/store.ini` ([src/project/entry.ts](../src/project/entry.ts)),
   with the store's own limits.
2. **Screenshots** are taken on the emulator, on each device and once at
   night ([src/publish/screenshots.ts](../src/publish/screenshots.ts)), and
   kept in `store/` as the store reads them.
3. **Send**: sign in on paperpaw.org (a mail link that leads back), then
   "Check it in the store" uploads the package as the store's form does,
   the store checks it and keeps a draft, and "Send it to the moderators"
   sends that draft.

The page knows the store only through `StoreApi`
([src/publish/store.ts](../src/publish/store.ts)): `SiteStore` is
paperpaw.org's, `FakeStore` stands in for tests, the example and
`npm run dev`. The requests are described in [store-api.md](store-api.md).
Where there is no store (the workshop on your own computer) or it has
not opened yet, the page offers the same package as a download, to upload
at paperpaw.org/submit.

`store/` goes to the store only: the ZIP for a reader's card and the
files the emulator gets leave it out.

## The author's pictures and files

Authors add pictures (and fonts or texts) to their messages with "Add a
picture" or by dropping them on the conversation. Two uses, which the AI
tells apart from what the author says: **material** it builds into the
plugin (a sleep picture, a logo), and **references** it looks at to make
a design (a screenshot or sketch of a look).

- **Uploads are not plugin files.** [src/project/uploads.ts](../src/project/uploads.ts)
  keeps them with the project, their bytes in an IndexedDB store of their
  own (so saving a project does not write them again), within limits
  (kinds by their bytes, sizes, megapixels, how many). They never go to a
  server; the AI gets a reduced copy (at most 1,568 pixels on the long
  side, re-encoded, so no metadata goes along), at most 4 a message and
  12 a conversation.
- **Pictures for the readers** are made in the browser by pure functions
  in [src/pictures/](../src/pictures/): gray, fitted (fill or whole, a
  crop, a box for a logo), toned for e-ink (levels, brightness, contrast,
  gamma), dithered to the panel's grays (four on the X4: diffusion for
  photos, line art for drawings), written as 2 or 4-bit gray PNG. One
  file per screen size once PaperPaw can pick one; until then one file
  for the largest screen the plugin is for.
- **The tools** `list_uploads`, `view_upload`, `convert_picture` (which
  answers with how the X4 shows the result, so the AI judges its own
  work) and `place_file` are in [src/tools/uploads.ts](../src/tools/uploads.ts).
  The browser parts (decoding, the AI's copy) come through a
  `PictureKit` ([src/pictures/kit.ts](../src/pictures/kit.ts)), which tests
  replace with a fake.
- The stub reader shows the sleep screen ("Asleep" beside the reader,
  `look` with `screen: sleep`): the plugin's sleep picture, or its logo.

## Texts

Every text the person sees is in [src/i18n/en.json](../src/i18n/en.json) and
read with `t("key", { values })`. Texts the AI reads (tool descriptions,
tool results) are English in the code, since they are prompt, not interface.
