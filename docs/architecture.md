# How the workshop is built

The workshop is a [Tauri](https://tauri.app/) app. The window is
TypeScript with [Preact](https://preactjs.com/), built by
[Vite](https://vite.dev/); the computer's side is Rust. The reader beside
the conversation and PaperPaw's checks are PaperPaw's own programs,
`paperpaw-emu` and `paperpaw-dev`, of the PaperPaw release the workshop
works with, so a new PaperPaw needs no new workshop.

Nothing goes to a server of ours. The window talks to Anthropic with the
person's Claude key, or to the key service in [proxy/](../proxy/README.md)
with a PaperPaw key, and to nothing else (the window's
Content-Security-Policy in
[src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json) allows only
those two).

```
src/
  desktop/    the window: the app (App.tsx), the desk that ties a project
              to its workshop, the project list, the files drawer, the
              reader, the checks, sending, costs, models
  app/        the workshop of one project (controller.ts) and how its
              conversation is shown; shared with the web workshop
  ai/         the conversation loop, who answers it (providers), prices
  tools/      what the AI can do: files, docs, look, press, build, and the
              person's uploads (list, view, convert a picture, place a file)
  pictures/   pictures for e-ink in the window: gray, fitted, toned, the
              X4's preview
  handbook/   finding and reading topics of the handbook
  checks/     the workshop's own rules for a data plugin (a few, before
              PaperPaw's checks)
  emulator/   the interface to the reader the tools use
  project/    a project, its files, its uploads, the rules of its paths
  i18n/       every text, and t()
  build/      the interface to a builder of plugins with code
src-tauri/    the computer's side (Rust): see below
handbook/     how the handbook is made from PaperPaw (Node and Rust)
proxy/        the key service for PaperPaw keys (Node)
public/       fonts, the icon, the made handbook
test/         the tests (Vitest); the Rust side's are in its files
```

Each folder of `src/` knows only the ones after it in this list of who
uses whom:

```
desktop  ->  app  ->  ai  ->  tools  ->  emulator, handbook, checks, project
```

`ai` does not know `app`, and `tools` do not know `ai`. The loop gets its
tools and its provider handed in, so tests can hand in others. What only
the app can do (the emulator, the checks, building, making pictures) the
desktop hands to the workshop through interfaces of `src/`
(`Emulator`, `Builder`, `ToolContext.optimise`).

## The computer's side

[src-tauri/src/lib.rs](../src-tauri/src/lib.rs) lists every command the
window may call. Each file is one concern:

| File | What it does |
|---|---|
| `key.rs` | The key in the system's keychain (Credential Manager, Keychain, Secret Service), never in a file |
| `paths.rs` | Where things are: projects in *Documents/PaperPaw Workshop*, the app's own in the system's place for app data |
| `projects.rs` | Projects as plain folders: the plugin's files right in it, the workshop's in `.workshop/` (`project.json`, `conversation.json`, `uploads/`); rename, archive, the bin. Every path checked to stay inside |
| `emulator.rs` | `paperpaw-emu --stdio`, driven over its standard input and output |
| `checks.rs` | `paperpaw-dev check` on the project's folder, its findings with a picture of the spot |
| `code.rs` | Plugins with code: the crate checked, then built for the emulator |
| `toolchain.rs` | Rust for plugins with code, set up in the app's folder, the compiler the emulator names; on Windows, Microsoft's C++ build tools |
| `pictures.rs` | Pictures made smaller, as the person chose; the AI's shape of an upload made so |
| `send.rs` | The plugin onto a reader: over Wi-Fi, onto its card, or as a zip |

[src/desktop/backend.ts](../src/desktop/backend.ts) is the window's side
of these calls (`Backend`), and a stand-in for a plain browser
(`npm run dev`), which keeps everything in memory.

## A turn of the conversation

`runTurn` in [src/ai/loop.ts](../src/ai/loop.ts) is the whole loop:

1. Add what the person wrote to the messages.
2. Send the messages, the handbook and the tools to the provider.
3. If the answer asks for tools, run them (input checked with zod first),
   add their results, and go to 2. At most 25 rounds per turn.
4. Otherwise the turn is done.

The messages are only ever added to, never changed. That keeps the prompt
cache working (the handbook is cached once and read cheaply after) and keeps
the AI's thinking valid from one round to the next. Thinking blocks are
never taken out.

A **provider** ([src/ai/provider.ts](../src/ai/provider.ts)) is who answers:

- `AnthropicDirect` ([src/ai/anthropic.ts](../src/ai/anthropic.ts)): the
  Messages API, with the person's Claude key (`sk-ant-…`) at Anthropic,
  or with a PaperPaw key (`ppw-…`) at the key service, which speaks the
  same API. The key's kind decides.
- `ReplayProvider`: a recorded conversation (`src/ai/examples/*.json`), for
  tests and for `?example=` in `npm run dev`.

A project is a data plugin or a plugin with code (`Project.kind`). The
kind picks the model (Haiku for data, Sonnet for code; another in
Settings, [src/desktop/models.ts](../src/desktop/models.ts)), the tools
(`DATA_TOOLS` or `CODE_TOOLS`), the system prompt
(`handbook.promptFor(kind)`) and how much the model thinks
(`thinkingFor` in the loop). A PaperPaw key allows only the models the key
service names.

After a turn that changed the plugin, the desk
([src/desktop/desk.ts](../src/desktop/desk.ts)) runs PaperPaw's checks
and, if they find something to fix, gives the AI their short findings in
another turn, at most twice per message of the person (the second time
thinking more). What each turn cost is kept with the project and shown
beside it ([src/desktop/costs.ts](../src/desktop/costs.ts)).

## Tools

A tool ([src/tools/tool.ts](../src/tools/tool.ts)) is a name, a description
the AI reads, a zod schema for its input, and a `run` function. `run` gets a
`ToolContext` (the project's files, the emulator, the handbook, the devices,
the uploads) and returns what the AI reads plus a `step`: the line the
conversation shows, as a catalog key.

**Adding a tool:**

1. Write it in a file in `src/tools/`.
2. Add it to `DATA_TOOLS` (or `CODE_TOOLS`) in
   [src/tools/registry.ts](../src/tools/registry.ts). Add it at the end:
   the order is part of the cached prompt.
3. Add its step text `step.<name>` to [src/i18n/en.json](../src/i18n/en.json).
4. Test it: call `run` with a bench from [test/helpers.ts](../test/helpers.ts),
   or record a conversation that uses it and replay it in
   [test/loop.test.ts](../test/loop.test.ts).

## The reader

The reader is PaperPaw's own emulator, `paperpaw-emu`, as a program of its
own ([src-tauri/src/emulator.rs](../src-tauri/src/emulator.rs)). The
workshop runs it with `--stdio` and talks to it one JSON object a line each
way (PaperPaw's `shells/desktop/src/stdio.rs`, protocol 1):

- requests: `start` (a device, its library, its settings, whether it may
  load code), `button`, `pointer`, `reload`, `describe`, `run`, `open`,
  `shot`, `quit`;
- events: `ready` (with the compiler a plugin with code needs), `started`,
  `frame` (the panel as a PNG, only when it changed), `described`, `shot`,
  `request`, `warning`, `error`.

The plugin being made is copied into the emulated reader's own folder
(`plugins/<id>/`, as on a reader's card), and the reader started again on
it, only when its files changed. If the program stops, the next request
starts it again.

The AI's tools see it as an `Emulator`
([src/emulator/emulator.ts](../src/emulator/emulator.ts)):
[src/desktop/native.ts](../src/desktop/native.ts) is that interface on top
of these commands. There is one reader at a time: a screenshot of another
device starts that one, then the one shown again. The device shown at the
start is the X4 Pro; the X4 and the Boox Go 7 are a click away.

Where it comes from: `PAPERPAW_EMU` names a build of one's own while the
workshop is worked on; otherwise the release's program, kept in the app's
folder (`emulators/<version>/`); otherwise the one the installer brought,
in `emulator/` beside the app. `paperpaw-dev` lies beside it.

## The installer

`npm run app:installer` ([scripts/installer.mjs](../scripts/installer.mjs))
copies `paperpaw-emu` and `paperpaw-dev` of the build `PAPERPAW_EMU` names
into `src-tauri/resources/emulator/` (with `version.json`: PaperPaw's
version, its fingerprint, its compiler) and runs `tauri build`. The
installer is NSIS, for the person alone (no administrator), and fetches
Microsoft's WebView2 only where Windows lacks it. It is not signed yet, so
Windows SmartScreen warns before the first start.

Tests use `FakeEmulator` ([src/emulator/fake.ts](../src/emulator/fake.ts)).

## PaperPaw's checks

After every change, and before the plugin is sent or exported,
[src-tauri/src/checks.rs](../src-tauri/src/checks.rs) runs
`paperpaw-dev check` on the project's folder, on every device the workshop
shows and in every language the plugin has: its files (package), its texts
and settings (lint), what it draws (text cut off, parts overlapping or
outside their cell, uneven margins, focus not shown, small touch targets,
contrast) and whether every screen is reached and left with buttons alone.

What is to fix goes to the AI (short, without pictures) and to the person
([src/desktop/Findings.tsx](../src/desktop/Findings.tsx)): each finding
with a small picture of its spot, "Let the AI fix it" and "Ignore". The
checks the person ignores stay ignored for the project.

## The handbook

The AI's system prompt is `public/handbook/data.md` or `code.md`. It holds
the workshop's own part (how to work with the person, the project, the
tools), and PaperPaw's: its guide's sections for plugins, every setting
with its range, every widget and action. Everything else is in topics
(`public/handbook/topics/`) that the AI reads with `lookup_docs` when it
needs them.

[handbook/generate.mjs](../handbook/generate.mjs) makes all of it from a
PaperPaw tag, branch or commit:

```sh
npm run handbook -- --repo ../paperpaw --ref <ref>
```

- the docs, taken from `git archive` of that ref;
- the settings, widgets, actions and devices, from PaperPaw's registry
  (`paperpaw-emu --registry`, or a file of it with `--registry`);
- the SDK's items for plugins with code, from its source;
- the workshop's own parts in [handbook/parts/](../handbook/parts/). Only
  how the workshop works belongs there; what PaperPaw is comes from
  PaperPaw. `data-interim.md` holds what PaperPaw's docs do not gather yet
  (the data files and their formats, home screens) and goes when they do.

`registry.json` is also what the checks in
[src/checks/data.ts](../src/checks/data.ts) use, so the rules the AI reads
and the rules its files are checked against are the same.

## Plugins with code

A plugin with code is a Rust crate: `Cargo.toml` (with
`[package.metadata.paperpaw] plugin = "Type"`), `src/*.rs`,
`i18n/*.ini`, `how/*.txt` and `plugin/` (its `plugin.ini`). A new one
starts from PaperPaw's sample plugin (`public/handbook/code-sample.json`).

The `build` tool ([src/tools/build.ts](../src/tools/build.ts)) goes to a
`Builder`; in the app that is
[src/desktop/builder.ts](../src/desktop/builder.ts), which calls
[src-tauri/src/code.rs](../src-tauri/src/code.rs):

1. The project's files are checked: only the paths above, no `build.rs`,
   no crate but `paperpaw-sdk`, no sections of Cargo's own. The workshop
   writes the Cargo.toml it builds with.
2. It is built as PaperPaw's emulator loads code: a `cdylib` with the
   SDK's `plugin!` line and its `outline` feature (`code-host.dll`,
   `.so`, `.dylib`), against the SDK of that PaperPaw (`=<version>` from
   crates.io, or `PAPERPAW_SDK` while the workshop is worked on), by the
   very compiler the emulator names in `ready`: the emulator loads only
   code with its own fingerprint.
3. The compiler's messages about the plugin's own files come back to the
   AI, errors first. When it built, the library goes into the reader's
   plugin folder and the reader starts again with code allowed.

Builds live in the app's folder (`builds/<project>/`), so the next one is
quick. The first plugin with code sets up Rust in the app's folder
([src-tauri/src/toolchain.rs](../src-tauri/src/toolchain.rs)): rustup from
rust-lang.org, its SHA-256 checked, then the emulator's compiler; the
person's own Rust is left alone. On Windows the compiler links with
Microsoft's linker: without Visual Studio's C++ build tools the workshop
says so and offers to install them (winget, the VCTools workload).

## The person's pictures and files

People add pictures (and fonts or texts) to their messages, or drop them
into the files drawer ([src/desktop/Drawer.tsx](../src/desktop/Drawer.tsx)).
Two uses, which the AI tells apart from what the person says: **material**
it builds into the plugin (a sleep picture, a logo), and **references** it
looks at to make a design (a screenshot or sketch of a look).

- **Uploads are not plugin files.** They are kept in the project's
  `.workshop/uploads/`, within limits
  ([src/project/uploads.ts](../src/project/uploads.ts)). The AI gets a
  reduced copy (at most 1,568 pixels on the long side, re-encoded, so no
  metadata goes along), at most 4 a message and 12 a conversation.
- **Pictures for the readers** are made on the computer
  ([src-tauri/src/pictures.rs](../src-tauri/src/pictures.rs)), as the
  person chose for each in the drawer, by default as the project's
  "Optimise images for e-ink" says: smaller in 16 grays (the reader
  dithers to its panel), smaller in colour, or as it is. Scaled to what
  the readers need at most, stripped of metadata, compressed with oxipng,
  never interlaced. A changed choice makes the picture again.
- **The tools** `list_uploads`, `view_upload`, `convert_picture` and
  `place_file` are in [src/tools/uploads.ts](../src/tools/uploads.ts).
  `convert_picture` says the part, the fit (fill or whole, a box for a
  logo) and the tone; the app makes it so in the person's mode, and the
  tool answers with how the X4 shows the file written, so the AI judges
  its own work. The AI never chooses the mode.
- Before sending, pictures larger than the readers need, in colour where
  no reader shows it, or heavy are suggested to be made smaller; nothing
  changes unless the person says so
  ([src/desktop/pictures.ts](../src/desktop/pictures.ts)).

## Onto the reader

**Send to reader** ([src/desktop/Send.tsx](../src/desktop/Send.tsx),
[src-tauri/src/send.rs](../src-tauri/src/send.rs)) first says what
PaperPaw's checks found to fix and which pictures could be smaller, and
stops nothing. Then:

- **Wi-Fi**: through the reader's Transfer page, its address with its key
  as the reader shows it (`http://<reader>/?k=<key>`). The Transfer API
  never overwrites (a file sent where one is gets a free name), so the
  plugin's folder there is removed first and made again. PaperPaw's
  atomic `POST /api/plugin/<id>` takes its place once a release has it.
- **Card**: into `plugins/<id>/` of the reader's card in this computer.
- **Export zip**: the plugin as a zip to keep or share.

The store's own files (`store/`) stay home.

## Texts

Every text the person sees is in [src/i18n/en.json](../src/i18n/en.json)
and read with `t("key", { values })`, or written in the window's
components in English. Texts the AI reads (tool descriptions, tool
results) are English in the code, since they are prompt, not interface.

## Left from the web workshop

The workshop began as a web page. Its parts the app does not use are still
in the repository: the reader in a frame (`frame.html`,
`src/emulator/frame/`), the builder's container (`builder/`, `Dockerfile`,
`docker-compose.yml`, `local/`), sharing in the store (`src/publish/`,
[store-api.md](store-api.md)) and the web pages in `src/app/`. They go
when the app has what they did.
