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
| `install.rs` | A plugin installed on a reader in one step, through PaperPaw's install requests, the same over Wi-Fi and the cable |
| `usb.rs` | The reader on the USB cable: PaperPaw's cable transfer, lines over the chip's own serial link |
| `history.rs` | The project's history: a state after every answer that changed the plugin, going back to one, the versions packed for the store |
| `export.rs` | Projects to another computer: one file with everything of a project, or of all, and bringing it back |

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
never taken out. Old tool results are cleared on Anthropic's side once the
prompt grows (`CLEARING`), never what the docs and the project's files
said (`KEPT_TOOLS`): cleared, the model would look them up again and again.

The loop keeps a turn from going round in circles:

- a lookup or a file read asked again in the same turn with the same input
  is answered with where its first answer is (until a file changes);
- after 15 looks without a change, a tool result tells the model to write
  with what it has, or to ask the person;
- a turn that cost more than $0.25 without changing a file pauses
  (`paused`): the conversation says what it cost, calmly, and "Go on".

The conversation shows the same tool used several times in a row as one
line, with how many and what about
([src/app/conversation.ts](../src/app/conversation.ts)).

A **provider** ([src/ai/provider.ts](../src/ai/provider.ts)) is who answers:

- `AnthropicDirect` ([src/ai/anthropic.ts](../src/ai/anthropic.ts)): the
  Messages API, with the person's Claude key (`sk-ant-…`) at Anthropic,
  or with a PaperPaw key (`ppw-…`) at the key service, which speaks the
  same API. The key's kind decides.
- `ReplayProvider`: a recorded conversation (`src/ai/examples/*.json`), for
  tests and for `?example=` in `npm run dev`.

A project is a data plugin or a plugin with code (`Project.kind`). A new
one takes the kind its first words ask for
([src/desktop/kind.ts](../src/desktop/kind.ts)): one short question to
Haiku ("code" or "data"), else the words; "New plugin with code" sets it
at once. The bar shows it beside the name. The kind picks the model (Haiku for data, Sonnet for code; another in
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

## The history

After every turn that changed the plugin, the desk keeps the plugin as
it is in the project's history
([src-tauri/src/history.rs](../src-tauri/src/history.rs)), and once
before the first change. Under each answer that has such a state, the
conversation offers "Back to this state"
([src/desktop/GoBack.tsx](../src/desktop/GoBack.tsx)): the reader first
shows that state, the project left as it is (a plugin with code is
built as it was, in a folder of builds of its own); then the person goes
back to it, or keeps the plugin as it is. Going back is kept as a state
of its own, so nothing is lost and going forward again is the same step.
The conversation is not changed by it. Each **Publish…** marks the state
it packed with its version and date; the files drawer lists them, each
with "Back to this state".

It is a Git repository of the project's own in `.workshop/history/`,
bare, through libgit2 built into the app: no Git is needed, and the
person never sees it as one. Files with the same bytes are kept once, so
a picture is kept once however often the plugin changes. It keeps the
plugin's files only: not `.workshop/` (the conversation, the person's
files, the packages), not builds (`target/`), never a key file
(`*.key`). An imported plugin's history starts at the import; a project
from before the history, at its next change.

## Another computer

"Export project…" and "Export all projects…" in the menu write one file
([src-tauri/src/export.rs](../src-tauri/src/export.rs)): a ZIP with
`paperpaw-workshop.json` and each project's folder as it is, the
archive's too: the plugin's files, the person's files, the history with
its marked versions, the conversation and the project's settings. Not
builds or packages, which are made again, and never the author key, which
has a backup of its own (the menu says so, with the way to it).

"Import…" takes such a file, or a plugin's ZIP as before
([src/project/import.ts](../src/project/import.ts)). The projects of an
export come back beside those there, under a new name where one is
taken: an import never overwrites.

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
version, its fingerprint, its compiler) and runs `tauri build`. For a
PaperPaw in work (`0.4.0-dev`), whose SDK is not on crates.io, it also
brings that SDK ([scripts/sdk.mjs](../scripts/sdk.mjs)): the SDK's crates
and those they need, of the checkout the emulator was built in
(`PAPERPAW_SRC`, else two folders above it), unchanged, as the
fingerprint of a PaperPaw in work hashes their very files; and the
workspace's Cargo.toml with them as its only members. It lies in `sdk/`
beside the app, with `version.txt`. The
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

`lookup_docs` gives the SDK's items whole: a trait with every method,
required or with a default, each with its signature and the first lines
of its documentation; a struct with its fields and how it is made. A long
topic is cut only between whole items, and what is left out is named.

**Recipes** ([handbook/recipes/](../handbook/recipes/)) are complete
plugins with code for common tasks: a widget with JSON from the web (in
`code.md` whole), settings of its own (a topic). A test builds each
against the emulator's SDK without a warning (code.rs,
`the_handbook_s_recipes_build_without_a_warning`, with `PAPERPAW_EMU` and
`PAPERPAW_SDK`), so they never go stale.

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
   crates.io; for a PaperPaw in work the one the installer brought, or
   `PAPERPAW_SDK` while the workshop is worked on), by the
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
  as the reader shows it (`http://<reader>/?k=<key>`). Each file goes
  with its SHA-256 (`PUT /api/plugin/<id>/<path>`), then the reader
  installs the plugin in one step (`POST /api/plugin/<id>`): the one there
  before stays until the new one is whole. A plugin with code is asked
  about on the reader first; the window says "Allow it on the reader"
  while the workshop waits for the answer (two minutes at most).
- **Cable**: the same requests as lines over the reader's USB serial link
  ([src-tauri/src/usb.rs](../src-tauri/src/usb.rs), PaperPaw's
  docs/usb-transfer.md). The workshop looks only at Espressif's USB
  serial units (an X4's or X4 Pro's chip), opens the port without
  resetting the chip, and waits for each answer a bounded time. It first
  says what is to come, each file with its size and SHA-256; the reader
  asks on its screen, and nothing is written before the person allows
  it there.
- **Card**: into `plugins/<id>/` of the reader's card in this computer.
- **Export zip**: the plugin as a zip to keep or share.

A plugin with code goes as its folder (`plugin/`) with its build for the
reader (`code.ppn`) that Publish… made; for now the X4's alone, until
the workshop builds for the X4 Pro too.

## Updates of the workshop

The workshop updates itself through Tauri's updater
([src/desktop/Updates.tsx](../src/desktop/Updates.tsx)): it asks the
workshop's latest GitHub release for `latest.json` when Settings open,
and says "Update available" there, never in a popup. The update is
fetched and installed only when the person says so, and only when it is
signed with the workshop's update key, whose public half is in
[src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json); then the
workshop starts again. `npm run app:installer` signs the installer when
the private key is in `TAURI_SIGNING_PRIVATE_KEY` and writes the
release's files (`dist-installer/`: the installer, its signature,
`latest.json`). The private key is never in the repository.

The store's own files (`store/`) stay home.

## Publishing

**Publish…** ([src/desktop/Publish.tsx](../src/desktop/Publish.tsx),
[src/desktop/publishing.ts](../src/desktop/publishing.ts),
[src-tauri/src/publish.rs](../src-tauri/src/publish.rs)) makes a plugin
ready for paperpaw.org's upload form; the person uploads it there and
sends it to the moderators. Nothing is uploaded from the workshop.

1. PaperPaw's checks run afresh; what they find to fix holds it back
   until the AI fixed it or the person goes on anyway.
2. The version must be higher than the last one packed for the store
   (`Project.published`): "Raise to …" sets it in `plugin.ini`.
3. The package is the form's `package`: the plugin's folder named as its
   id, `store/` inside, within the site's file rules and limits, its
   files in name order with fixed times (the same plugin, the same
   bytes). It is kept in the project's `.workshop/publish/`.
4. The form opens in the browser, and the package is shown in its folder.

A plugin with code also needs a build for each reader, signed, and its
source ([src-tauri/src/device.rs](../src-tauri/src/device.rs)). The
project becomes a crate of its own: one package with the plugin's
library and a binary with PaperPaw's `plugin!` line, the sample's
`.cargo/config.toml` and `rust-toolchain.toml`, and the SDK's
`paperpaw-plugin.x` beside them (its `paperpaw-native`'s, from the
checkout or Cargo's registry: since PaperPaw's plugin interface 2 no
build script brings it), so that the source the store rebuilds links the
same. It is built for the X4
(`cargo x4 --locked`) as paperpaw.org rebuilds it: with a
`--remap-path-prefix` for every folder that holds Rust (the source as
`/plugin`, Cargo's home as `/cargo`), so that no path of this computer
and no Windows `\` gets into the file. The release's `paperpaw-sign`
packs it, and the author key signs it. The very source built goes to
the form as a ZIP, so no public repository is needed. The X4's part of
Rust is fetched the first time, its size said first. The X4 Pro's builds
come once a PaperPaw release brings `core` and `alloc` built ahead for
it. The form then takes three files: the package, the X4's build and the
source.

Their **author key**
([src-tauri/src/author.rs](../src-tauri/src/author.rs),
[src/desktop/AuthorKey.tsx](../src/desktop/AuthorKey.tsx)): one Ed25519
key, made the first time it is needed, kept in the system's keychain,
never in a project and never sent anywhere. Its backup must be saved
before anything is signed with it; it is the same kind of file as
`paperpaw-sign key` makes (64 hexadecimal digits, not encrypted, so kept
private). Settings show whether and when it was backed up, back it up
again, or take it from a backup on a new computer. Signing writes the
trailer `paperpaw-native` writes, byte for byte.

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
