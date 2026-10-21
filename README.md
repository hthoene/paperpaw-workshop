# PaperPaw plugin workshop

Make plugins for [PaperPaw](https://paperpaw.org) by talking to an AI, and
try them at once on a reader in your browser.

You say what you want ("a dark look with big letters", "a home screen with
the clock and my last book"). The AI writes the plugin's files, checks them,
looks at the result on an emulated reader and fixes what it sees. When you
like it, you download the plugin as a ZIP and put it on your reader.

For now the workshop makes **data plugins**: themes, home screen layouts,
key bindings, fonts and texts. Plugins with code come later.

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

Your projects are kept in your browser (IndexedDB), not on a server.

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
