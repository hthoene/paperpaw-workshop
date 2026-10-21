# PaperPaw plugin workshop

Make plugins for [PaperPaw](https://paperpaw.org) by talking to an AI, and
try them at once on a reader in your browser.

You say what you want ("a dark look with big letters", "a home screen with
the clock and my last book"). The AI writes the plugin's files, checks them,
looks at the result on an emulated reader and fixes what it sees. When you
like it, you download the plugin as a ZIP and put it on your reader.

The workshop makes **data plugins**: themes, home screen layouts, key
bindings, fonts and texts. And, with the builder running on your own
computer, **plugins with code**: new screens, widgets and tools, written
in Rust by the AI (see below).

## Try it

You need [Docker](https://www.docker.com/). In this folder:

```bash
docker compose up --build
```

Then open <http://localhost:8080>. Stop it with `Ctrl+C`, or with
`docker compose down` if it runs in the background.

On the start page you can:

- **Watch an example**: a recorded conversation plays back, with the real
  tools and the real reader. It costs nothing and needs no key.
- **Use your own key**: paste a key from the
  [Claude Console](https://console.anthropic.com/). The key stays in your
  browser and goes to Anthropic only: the page may not talk to anyone
  else (its Content-Security-Policy says so). You pay Anthropic for what
  you use; the workshop shows what each turn cost.

On paperpaw.org there is a third way, **the free quota**: authors apply
for it at paperpaw.org/account/workshop, and once an admin accepts, the
site pays for their plugins up to a monthly budget (Claude Haiku 5.5 for
data plugins, Claude Sonnet 5.5 for code; admins need no application).
Claude Opus 5.5 can be chosen at the start with your own key only, and
stays the plugin's model.

Your projects are kept in your browser (IndexedDB), not on a server.
**Import** on the start page makes a project again of a plugin's folder or
a ZIP of it: what the workshop gives as downloads, or a plugin's source
(a ZIP of its repository); it says what it took and what it left out. On
paperpaw.org a plugin's page offers its owner "Edit in the workshop",
which imports the published version the same way (`#/import/<address>`,
the version's package or kept source, fetched from the site itself).

**Pictures**: "Add a picture" beside the message field (or drop one on
the conversation). The AI builds it into the plugin, made for e-ink
(a picture while the reader sleeps, a logo), or takes ideas from it (a
screenshot of a look you like). Your pictures stay in your browser; the
AI sees a smaller copy. The second example on the start page shows it.

When you like your plugin, **Share it in the store** fills in everything
the store asks for: the AI writes its description from your conversation
(change what you like), the screenshots are taken on the reader for you,
and on paperpaw.org you send it with two clicks once signed in. Here on
your own computer there is no store: download it for the store instead
and upload it at paperpaw.org/submit.

### Plugins with code

A plugin with code needs the **builder**, a container that compiles it
together with PaperPaw. It is made from a copy of PaperPaw next to this
folder, once:

```bash
npm run builder-source -- --repo ../paperpaw --ref plugin-store
```

```bash
docker compose --profile code up --build --renew-anon-volumes
```

The first build of the builder takes a while (it compiles PaperPaw for
the browser, the X4 and the X4 Pro ahead, so your builds take seconds).
Compiling runs code, so the builder is closed in: no internet, no port
of its own, its root read-only, nothing of your computer mounted, its
own unprivileged user, limits on processors, memory and time
([what a build may do](docs/architecture.md#what-a-build-may-do)). Then tick
**This needs code** on the start page, or watch the third example
(`#/example/quote-a-day`): the AI starts from PaperPaw's sample plugin,
writes Rust, builds it, reads the compiler's errors and fixes them, and
the reader beside the conversation runs PaperPaw with the plugin in it.
**Download** then builds it for the device the reader shows (the X4 or
the X4 Pro) and saves the plugin's folder with its `code.ppn` (not
signed yet) as a ZIP, for the `plugins` folder of the reader's card.

Plugins with code use Claude Sonnet 5.5: some cents to a dollar a
plugin, more than a data plugin.

> **About the reader:** the reader beside the conversation is PaperPaw
> itself, its web emulator (`public/emulator/`), so you see your plugin as
> an X4, an X4 Pro or a Boox will show it. "What the checker says" is
> PaperPaw's own checker, paperpaw-dev.

## Working on the workshop

You need [Node.js](https://nodejs.org/) 22 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open the address it prints (usually <http://localhost:5173>).
Changes show at once.

| Command | What it does |
|---|---|
| `npm run dev` | The workshop with live reloading |
| `npm test` | All tests (no key needed: they replay recorded conversations) |
| `npm run typecheck` | Checks the TypeScript |
| `npm run build` | The finished site in `dist/` |
| `npm run handbook -- --repo ../paperpaw --ref main` | Makes the handbook anew (see below) |
| `npm run emulator -- --repo ../paperpaw --ref main` | Builds the reader anew from PaperPaw (needs Rust and `rustup target add wasm32-unknown-unknown`) |
| `npm run builder-source -- --repo ../paperpaw --ref plugin-store` | PaperPaw's source for the builder (`builder/paperpaw.tar`) |
| `docker compose --profile code up` | The workshop's server and the builder: `npm run dev` builds through that server (port 8080) |

How the parts fit together is in [docs/architecture.md](docs/architecture.md).
Start there if you want to add a tool, a check or a text.

### The handbook

The AI reads a handbook about PaperPaw: what a plugin may contain, every
setting with its range, every widget, action and device. It is made from a
PaperPaw tag or branch, so it matches that version exactly, and it lives in
`public/handbook/`.

To make it anew you need a copy of the PaperPaw repository next to this one
and [Rust](https://rustup.rs/) (the settings and widgets are read from
PaperPaw itself):

```bash
npm run handbook -- --repo ../paperpaw --ref v0.4.0
```

`--skip-registry` keeps the settings and widgets from last time and only
reads the docs anew (no Rust needed). `public/handbook/meta.json` says which
version the handbook was made from.

### All texts in one place

Every text the workshop shows is in [src/i18n/en.json](src/i18n/en.json),
read through `t("key")`. A test makes sure no key is missing. Translations
can be added as more files next to it.

## Licence

Apache-2.0, see [LICENSE](LICENSE). The fonts in `public/fonts/` come with
their own licences (SIL Open Font License) next to them.
