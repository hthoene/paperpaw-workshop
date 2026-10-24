## Publishing

The plugin library on paperpaw.org is what the website lists and every
reader's store (*More plugins*) installs from (ADR 0023). A plugin gets
there with the upload form at <https://paperpaw.org/submit>: sign in
with a link sent by e-mail, upload the plugin's folder as a ZIP (and a
code plugin's builds), read the checks, complete the entry, look at the
preview, and send it to the moderators. (The paperpaw.org repository's
catalogue holds PaperPaw's own plugins only; it is not a way to
publish.)

Before that, `paperpaw-dev check` (and `paperpaw-dev package` for a
data plugin or a `.ppn` file) finds most of what the checks would refuse,
and what they cannot see: see [Checking your plugin](#checking-your-plugin).

An update is a new version with a higher number, the same way. The
site's guide for authors, <https://paperpaw.org/authors>, has every
field, check and limit; the skill's
[`publishing.md`](../.claude/skills/paperpaw-plugin-development/publishing.md)
walks an AI assistant helping an author through every step. In brief:

### What is uploaded

The plugin's folder as a ZIP, `plugin.ini` at its top (or inside one
folder at its top), its `id` and `version` the ones published. Outside
`store/` only `.ini`, `.css`, `.ttf`, `.otf`, `.ttc`, `.ppfp`, `.txt`,
`.md` and `.png` files, at most 64 (63 for a code plugin), their paths
of letters, digits, `.`, `_` and `-`, none starting with a dot, at most
100 bytes; at most 20 MB zipped, 40 MB unpacked.

A folder `store/` in it is for the store only, and is taken out of what
readers install: `store/store.ini` gives the summary, description,
group, tags, licence, source, SDK and translations, and names the
screenshots beside it.

```ini
[store]
summary = A large clock on the home screen, with the date below it.
group = home
tags = clock, widget
licence = MIT
source = https://codeberg.org/your-name/clock
sdk = 0.4

[source]
repository = https://codeberg.org/your-name/clock
revision = v1.0.0

[screenshots]
home.png = The home screen with the clock widget, on an Xteink X4.
```

It is PaperPaw's INI: a comment is a line of its own, never after a
value.

A code plugin adds one signed `.ppn` per reader (the form's fields
`build-x4`, `build-x4-pro`) and the exact source of
those builds: `[source]` names a public repository on `github.com`,
`codeberg.org` or `gitlab.com` and the tag or commit built (with `path`
and `bin` when the crate is not at the top or the binary not named as
its package), or the source goes up as a ZIP (`source-zip`).

### The author's key

Code plugins are signed by their author with an Ed25519 key of their
own, made once:

```sh
paperpaw-sign key ~/.paperpaw/author.key     # prints the public key, 64 hexadecimal digits
```

The file is the secret key: keep it outside every repository, keep a
copy apart, never commit or share it. In CI it is a secret of the
repository (`PAPERPAW_PLUGIN_KEY` in the sample's job); the site's page
<https://paperpaw.org/authors/sign> also signs in the browser, the key
never leaving the computer. The store reads the public key from the
builds: all of them are signed by one key, and every update by the same
one. Readers remember it at the first install and are warned when an
update is signed by another; a lost key is changed only in the open,
through the site's contact address.

### Builds that match their source

The site keeps each code plugin's source, shows it file by file, and
rebuilds each build in a container with the toolchain its fingerprint
names, with the sample's aliases (`cargo x4`, `cargo +esp x4pro`,
`--locked`). It compares the result byte for byte with the build
without its signature, and the plugin's page says *Verified: matches its
source*, *Not rebuilt* or *Rebuilt, but does not match its source*.
Paths end up in a build (in its panic messages), so the sample's
`build.sh` and the rebuild write them as the same everywhere, with
`--remap-path-prefix` added to the flags of `.cargo/config.toml`
(through `cargo --config`): the source's top as `/plugin` and Cargo's
home as `/cargo`. The core libraries come built, the same for everyone:
rustup's for the X4, the release's for the X4 Pro, which the rebuild
installs as authors do (see [The crate](#the-crate)). So:

- build with `build.sh`, or with the sample's CI job that runs it
  (`samples/hello-native/.github/workflows/build.yml`). Build from a
  pushed tag, in any folder, on Linux or macOS. On Windows, paths inside
  the source keep their `\`, and such a build matches only builds on
  Windows;
- commit `Cargo.lock`;
- keep the release's compilers pinned (`rust-toolchain.toml`, the job's
  `RUST_X4`, `RUST_X4_PRO`, `ESP_GCC`), its SDK
  (`paperpaw-sdk = "0.4"`) and, for the X4 Pro, its core libraries
  installed, and build again for every release until 1.0 (see
  [Which build fits](#which-build-fits));
- never set `RUSTFLAGS`, which would replace the flags that link the
  plugin, and never publish a build made without the remapped paths;
- put nothing of the moment or the computer into the code (a build
  script writing the time, a user name, a random value);
- name dependencies by version or a fixed commit, never a branch, and
  never by a `path` outside the repository (its folder is not remapped,
  and it changes the hashes Cargo gives every crate).

The sample's `build.sh`, which the job runs, builds both readers, packs
and signs the files, and zips the folder, with and without `store/`; the
job attaches them to the tag's release with their SHA-256. Building twice, in two folders, and
comparing the files with `cmp` shows that the build holds.

[`Plugin`]: ../crates/paperpaw-sdk/src/plugin.rs
[`Registrar`]: ../crates/paperpaw-sdk/src/contribution.rs
[`Env`]: ../crates/paperpaw-sdk/src/env.rs
[`Command`]: ../crates/paperpaw-sdk/src/command.rs
[`Screen`]: ../crates/paperpaw-sdk/src/screen.rs
[`Widget`]: ../crates/paperpaw-sdk/src/widgets.rs
