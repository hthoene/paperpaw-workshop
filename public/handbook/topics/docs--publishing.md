## Publishing

The plugin library on paperpaw.org is what the website lists and every
reader's store (*Plugin store*) installs from (ADR 0023). A plugin gets
there with the upload form at <https://paperpaw.org/submit>: sign in
with a link sent by e-mail, upload the plugin's folder as a ZIP (and a
code plugin's builds), read the checks, complete the entry, look at the
preview, and send it to the moderators. Or, without the form, tag a
release in the plugin's own repository on GitHub: the library lists it
as "Community, unreviewed" ([below](#publishing-from-github)). (The
paperpaw.org repository's catalogue holds PaperPaw's own plugins only;
it is not a way to publish.)

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
sdk = 0.5

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

### Which devices your plugin is for

A plugin does not have to be for every device. Publish it for the devices
it works on and nothing else: the store, on the site and on each reader,
shows it only to those. Nobody sees a plugin that is not for their device,
and nobody is offered one that would not run.

- **A data plugin** is files, so it works anywhere PaperPaw does. Left
  alone it is offered on every device. To limit it, name the devices in
  `[store]` of `store/store.ini`, separated by commas, of `android`,
  `x4`, `x4-pro` and `x4-classic`:

  ```ini
  [store]
  devices = x4, x4-pro
  ```

  The upload form has the same as the boxes "Runs on". A device not named
  does not see it, also one of the same family: name `x4-classic` too if
  the plugin is for it. The X3 asks the store as an `x4`, so it sees what
  is for the `x4`; there is no `x3` to name.
- **A code plugin** is a build for one chip, so it is for the readers you
  give a build. Upload (or release on GitHub) one signed `.ppn` per reader
  (`x4` is the ESP32-C3 of the X4 and X3, `x4-pro` the ESP32-S3 of the X4
  Pro and the X4 Classic): its devices are those, whatever `devices` says,
  and a build for only the X4 is a plugin for the X4 only. A reader
  needs the build made for its own fingerprint; one that has none for it
  (an older release, a chip you did not build for) does not list the
  plugin, and the site shows it as waiting for a build. Android takes no
  plugin with code from the store, so a code plugin never shows there.
- **Where it shows.** The plugin's page and the library's lists on
  paperpaw.org say "X4 and X4 Pro only" for a plugin that is not for all,
  and the library can be filtered by device. The reader's store (*More
  plugins*) asks for its own device and lists only what fits it. A
  catalogue entry (`catalogue/<id>.toml`) names `devices` the same way,
  and every build it lists must be for one of them.
- **Later.** A new version may add a device: add its build (or name it in
  `devices`) and publish the version.

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
one. Readers remember it at the first install and refuse an update, or
a new install after a removal, signed by another: a new key means a new
plugin for the readers who have it. A lost key is changed only in the
open, through the site's contact address.

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
installs as authors do (see [The crate](#the-crate)).

A plugin of plugin interface 7 has no fingerprint; the site rebuilds it
as its author builds it, with `paperpaw-dev build` of the PaperPaw whose
SDK its `Cargo.lock` pins, once for each chip (the X4's file is the
X3's, the X4 Pro's the X4 Classic's) and once as the library of the
emulator on Linux. `paperpaw-dev build` writes the paths itself: the
plugin's folder as `/plugin`, Cargo's home as `/cargo`. Where the SDK is
taken from a PaperPaw checkout (`new --code --sdk`), it is named through
a link in the plugin's own folder, `.paperpaw`, which is no part of the
source: Cargo makes a path outside the folder a part of the build, so a
plugin that names its SDK by such a path builds to another file on
another computer and cannot be verified. So:

- build with `build.sh`, or with the sample's CI job that runs it
  (`samples/hello-native/.github/workflows/build.yml`). Build from a
  pushed tag, in any folder, on Linux or macOS. On Windows, paths inside
  the source keep their `\`, and such a build matches only builds on
  Windows;
- commit `Cargo.lock`;
- keep the release's compilers pinned (`rust-toolchain.toml`, the job's
  `RUST_X4`, `RUST_X4_PRO`, `ESP_GCC`), its SDK
  (`paperpaw-sdk = "0.6.0-beta.4"`) and, for the X4 Pro, its core libraries
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

### A plugin source of your own

Plugins can also be offered without the library at paperpaw.org: a
**community plugin source** is a plugin list of your own on any `https://`
web server, which readers add on their device by its address (*Plugin
store*, *Sources*). PaperPaw does not check a source or its plugins, and
says so before one is added. The source signs its list with an Ed25519 key;
a device keeps the key of the first list it reads and from then on takes
only lists, and code plugins, signed with it.

[`templates/plugin-source`](../templates/plugin-source) is a repository to
copy: an example plugin with code and a GitHub Actions workflow that builds
it for every device, signs it with your key (a repository secret) and
publishes the source with GitHub Pages; its README has the steps.
`paperpaw-sign pack-source <folder> <out>` makes a source by hand, from
the folders of its plugins and their signed builds
(`<id>-<version>-<device>.ppn` beside each folder), and `paperpaw-sign
check-source <out>/plugins.json` checks the signature as a device does.

### Publishing from GitHub

A plugin can also reach the library from its own repository, without the
form. Give a public repository the topic `paperpaw-plugin` and publish a
GitHub release: paperpaw.org looks through such repositories every hour,
takes each one's newest release, checks it as it checks an upload, keeps
its files and lists the plugin as "Community, unreviewed", with the
GitHub owner as author, a link to the repository and the key's
fingerprint. Readers never download from GitHub; the site serves the kept
files.

The release's tag is `v` and the version of `plugin.ini`. Its assets are
`<id>-<version>.zip`, the plugin's folder as the form takes it (with
`store/`), and for a code plugin one signed build per reader,
`<id>-<version>-<device>.ppn` with the device `x4`, `x4-pro` or
`x4-classic` (the X3 runs the X4's). A release must not be a draft or a
pre-release. The source of a code plugin is `[source]` in
`store/store.ini`, or else the repository at the release's tag.

Start such a repository with `paperpaw-dev new --github <id>` (`--code`
for a plugin with code): it lays out the plugin's folder, `store.ini`
with a valid group, the release workflow and a README. Before every tag,
`paperpaw-dev check-publish` (or the smaller `paperpaw-sign
check-publish .`) checks the repository by the rules the site checks by,
`tools/publish/store-rules.json`, the same file the site serves at
`/api/v1/store-rules.json`, and says what to change.

[`paperpaw-release.yml`](../tools/dev/templates/README.md#publish-by-tagging)
in `tools/dev/templates/.github/workflows` does it all on pushing the
tag: it checks the tag against `plugin.ini`, runs `check-publish`, zips
the folder, builds and signs a code plugin with the key in the
repository's secret `PAPERPAW_PLUGIN_KEY`, checks the files it made, and
creates the release only where every check passed.

The site refuses most often: a group that is none of the twelve, more
than five tags, a screenshot without its line in `[screenshots]`, a
summary longer than one sentence, files in the plugin's folder that are
no plugin's (a README or LICENSE where `PLUGIN_DIR` is the repository's
top), a tag that is not `v` + the version, a build not signed or signed
by another key, and for code a missing `Cargo.lock` or the SDK named by
path. `check-publish` names each with its fix.

Unreviewed means the moderators did not read it; the checks are the same.
An id belongs to whoever it first appeared with, reviewed or from
GitHub: its key, as in [The author's key](#the-authors-key), or for a
data plugin its account or GitHub owner. A release with another's id or
key is not offered; the ids and names of PaperPaw's own plugins are
reserved. Readers refuse an update signed by another key. The admins can
block a repository, an owner or a key, which takes its plugins down at
once. To have it reviewed later, name the repository in the store's form
(*From GitHub*): from then on each new release waits for the moderators
as an update. The skill's
[`publishing.md`](../.claude/skills/paperpaw-plugin-development/publishing.md)
has the steps.

### Document-scoped storage

`native::storage::Root::Install` (root 2) reads the plugin's own install folder,
read only, in any callback. During a permitted format callback, `Book` selects
root 3, `UserCss` root 4 and `DocumentCache` root 6. An empty path names the book
file on root 3 or the CSS file on root 4. Folder and siblings formats may read
relative paths inside root 3. Root 3 is read only; root 4 is read only and
available during `core.format` ops 2 and 3 only. The host enforces the callback scope,
cache quota and reserved `.complete`/`.host/` cache paths. The host writes
`.complete`; a format never writes it. Use the current callback's `Host`
for storage calls and never retain it across callbacks.

### Extension stages and call services

Declare an extension point with `native::declare::StageDecl` and subscribe with
`SubscribeDecl`, passing it to `Declarations::stage` or `subscribe`. Grammar and payload ranges are
checked locally. Stage ownership, self-subscription, duplicate stage/token pairs
and the eight-per-plugin subscription limit are checked by the host at commit.
A subscription's `order` controls its position and its `signature` contributes to
layout invalidation when the stage changes layout.

A subscriber receives `native::events::Event::StageCall { stage, schema, payload, .. }`
at its declared token. Check the stage and schema, decode `payload` with the
stage owner's schema crate, and write the encoded reply using the existing
`native::reply::Reply`. Return `Error::Unsupported` for a schema the subscriber
does not understand. Plugin-defined stage payloads remain opaque.

For `core.widget` major 1, use `native::ui::stages::WidgetCall::decode(payload)`
to read measure, place and target requests. Reply with `reply_size`,
`reply_place` or `reply_targets` into caller-owned scratch, then pass the encoded
bytes to `Reply`. Targets stay in reading order; more than 32 returns
`Error::NoSpace`. For `core.status` major 1, `StatusCall::decode(payload)` exposes
borrowed requested item ids and context params. Build `StatusAnswer::text` or
`StatusAnswer::drawn` values and encode with `StatusCall::reply`. Replies accept
at most eight requested items and refuse duplicates. These adapters use the
generated directional codecs and allocate no heap storage.

`native::stages::Stage::new(host, "reader.insert")` binds a full stage id.
The host refuses another plugin running it with `Error::Denied`.
`native::stages::StageRun::next` lends one `StageReply` at a time from the owner's
reply buffer. Inspect `status()` before using `payload()`; cancellation, busy and
invalid subscriber replies still advance the cursor. Only `style_granted()`
permits an override of a user-protected style value. Size the buffer with
`Stage::out_len(max_reply)`. End-of-stage and host refusals finish the cursor.

`native::services::Service::open(host, key, major, minor)` opens a generated call
service schema. Keep the handle across callbacks and pass each callback's current
host to `call`. Use `max_reply(op)` to size the output buffer. The SDK checks the
operation version and buffer limits before calling the host. Explicitly consume
the handle with `release(host)` when done; teardown also releases it. There is
no automatic Drop release because the handle retains no callback host. Per-family
typed wrappers define the input and output records.
### Format provider callbacks

A format's declared token receives `core.format` major 1 stage calls. Decode
its payload with `native::format::FormatCall::decode` and dispatch using
`FormatOp`. These provider operation ids differ from the document service's
ids. The call borrows its text and sniff bytes; `document()` and `conversion()`
identify the state the provider owns for this document. Close releases it.

Use `FormatState::preparing` to report incremental work and `ready` or `failed`
to finish preparation. `reply_state` keeps the call's document and conversion
identity. Scalar reply helpers validate the request operation before encoding
into caller-owned output. Pass the returned bytes through `native::reply::Reply`.

Blocks (op 8) are written with `FormatCall::reply_block(&BlockReply::new(&block)
.next(offset), out)`, adding `.image_index(n)` for a picture block and `.last_in_section()`
for the section's last block. The reply is one fragment of the block's record list,
from the record the call's `cursor` names; when the block does not fit, the fragment
ends with `more`, the next record index and the block's generation, and the host asks
again with them (a changed block is answered `State`). `out` of 3,840 bytes always
holds a fragment.

Lists (sections, table of contents, links, fonts) are written with
`FormatCall::rows(out)` and its typed row methods. A row that does not fit is
`NoSpace`: end the page with `PageEnd::more(total, next, generation)`; the host asks
again with `next` and that generation. The last page is `PageEnd::last(total, generation)`. `total` is the whole list's row
count and `generation` the format's own for this document, never 0, the same on every
page; a call with a stale generation is answered `State`.
Pages always keep room for their closing record. A link whose `href` is over 1,024
bytes is skipped (`Ok(false)`). `reply_image` answers cover and image requests with
the cache path, the picture's own index and size.

`reply_metadata` borrows the existing `document::Metadata`; title and series
previews advertise UTF-8 cuts with flags. `reply_metadata_text` returns the
requested value in UTF-8 parts, preserving its total byte length. It allocates
no strings and refuses offsets inside a character. `reply_position` preserves
the provider's source section and offset without reader insert ordinals.

During a permitted format callback, `native::storage::Root::DocumentCache`
selects root 6, `Book` root 3 and `UserCss` root 4 (root 2 is the plugin's install folder). An empty path names the book
file on root 3 or the CSS file on root 4. Folder and siblings formats read
relative paths within root 3; for siblings, the call's `text()` names the
opened file unless the operation uses text for an XPointer or href. Root 3 is
read only. Root 4 is read only and available during open/prepare only. The host
enforces the callback's scope, cache quota and reserved `.complete`/`.host/`
paths. Never retain a callback's `Host`; `.complete` belongs to the host.

### Secrets and device randomness

Open `native::secrets::Secrets` once with the metadata-declared `core.secrets`
service, use the current callback's `Host` for each operation and call `release`
when finished. The handle retains no callback binding. `get` accepts an own
unprefixed name; it cannot request another plugin's value. Names and labels
preserve SSID tab, LF and CR characters while refusing other controls.

`SecretWrite::new(SecretName::new(name)?, value)` saves a complete value, including
an empty value. `.label(text)` replaces a label; an empty label preserves an
existing one. `.changeable()` permits editing by the user. `keep` clears the
encoded input buffer before returning, including after a refusal; its borrowed
source value remains the caller's responsibility. `remove` accepts a `SecretName`.

The settings editor declares `uses.secrets`. It lists `SecretList::all()`;
ordinary plugins use `SecretList::own()`. A list page contains borrowed names,
labels and changeable flags, never values. Continue from `page.end().next()`
using the same query's `.from(cursor)`. Concurrent edits may change row order
or totals between pages. `entry.target()` names an owner for removal, and
`entry.replacement(value)` preserves its changeable flag for replacement.
Other owners' values cannot be read, even by the editor.

`random(host, len, input, out)` draws exactly 1-256 bytes. Inspect `bytes()` and
`strong()` on the returned borrowed view. A host without a source refuses the
call; the facade supplies no substitute source. Lock may use a weak draw as a
salt under its contract; callers needing a strong key check the flag. Secret
values and random bytes are redacted in Debug output.

Input buffers of 1,280 bytes cover all calls. Output needs 4,096 bytes for list
or 1,280 bytes for get, keep, remove and random. Views cannot outlive or reuse
their output buffer while borrowed; a caller clears its value output after use.

### Book key and reading position

`Library::book_key(host, book, input, out)` returns the book's key (the folder name for
the plugin's own per-book data, changed by a move) and its KOReader fingerprint and
size, which together identify the book on other devices. Keys come only from the host.
`Library::position` reads the stored position; `Library::set_position` writes a
`PositionWrite`. A local write always wins. A `.sync()` write wins only over an older
sync position; otherwise it answers `State` and stores nothing, so the plugin can ask
the user and write again with `.confirmed()`. `.confirmed()` without `.sync()` is
refused as `Invalid` and stores nothing. `out` of 4,096 bytes always suffices. The input
buffer is 1,024 bytes for `book_key` and `position` and 2,048 bytes for `set_position`.

### Pictures

The host decodes and draws pictures; a plugin never holds one in memory.
`CommandSender::image_prepare(&PrepareImage)` asks for a JPEG, PNG (not interlaced) or GIF
of the plugin's data folder, with `uses.storage` the library, or (`PrepareRoot::Bundle`, no
feature) the plugin's own install folder, read only: the pictures it ships; a plugin built into
the image has none there, and the host answers `ImageStatus::NotFound`
(`PrepareImage::new(PrepareRoot::Data, path, cookie)`, `.side(n)` for the longest side, 0
being the screen's and a side above 1,600 being clamped, `.colour()`). Subscribe to
`EventKind::ImageReady` first: the end is one `Event::ImageReady` carrying the cookie, an
`ImageStatus` (`Ready`, `Unsupported`, `Damaged`, `TooLarge`, `CardFailure`, `NoMemory`,
`NotFound`: no such file at that root and path; an unknown value reads as `Damaged`), and for
`Ready` the `ImageId` and the size made. At
most 4 requests wait and 8 pictures are kept per plugin; give each back with
`image_release(id)`. `ImageInfo::read(host, id)` gives the size and whether it is colour
(`image.info`; `not_decoded()` says the format has not decoded it yet), and
`Canvas::draw_image(id, rect, ImageStyle)` draws it scaled into the rectangle, centred,
clipped by the canvas, only inside a draw callback (`State` elsewhere).
`ImageStyle::new().fill()` crops to fill, `.stretch()` scales to the rectangle and drops the
shape, `.dots()` draws black and white dots also on a panel with grays and `.grays()` in the
panel's grays, `.small()` keeps a small picture out of the ghosting refresh,
`.transparency(0..=255)` blends (255 draws nothing). `PrepareImage::turn()` applies a JPEG's EXIF
orientation (the size in `ImageReady` is the size after the turn), `.tone(&[u8; 256])` maps every
gray through the plugin's own table while the picture is decoded, and `ImageReady::luma()` is the
mean brightness of an 8 by 8 grid over the picture. `NotFound` is an
ended id: prepare it again. The host reads the file in bands, so a card failure can leave
the bands drawn so far.

`Library::cover(host, book, side, input, out)` gives a book's cover as an `ImageId` with its
size (`Cover::image()`, `Cover::info()`), made by the book's format on first use and kept in the
host's cover cache. `side` 0 is the list's size. `NotFound` means the book has no cover (show
text); `Busy` means it is being made, so ask again when `library_changed` bit 6 says it is
ready. Draw it with `Canvas::draw_image` and release it with `image_release` when it scrolls out
of the list. `input` is 1,024 bytes and `out` 4,096.

### Opening a book as a client

`native::document::Documents::open(host)` opens `core.document`. `open_book(host, &OpenBook, input, out)`
opens one book and returns a `DocState`; `OpenBook::new(path)` reads the card's library
with the host's format and picture sizes, and its builders set the root, the format,
flags, picture sides (at most 1,600), a user CSS file and up to 12 `(name, value)`
options. More options than 12, or one over its caps, answers `NoSpace`; the handed root
for the CSS file is `Invalid`. Nothing bad reaches the host. `state` reads the
preparation state (`Preparation`), `close` ends the document, `xpointer` turns a
`DocPosition` into a KOReader XPointer and `locate` turns an XPointer (at most 1,024
bytes) back. An answer for another document is `Invalid`. Reading blocks and the
table of contents are not in this client yet. The host answers `Busy` while a
document is preparing.

`Documents::metadata(host, document, input, out)` reads what the format says about the book:
`title()`, `language()` (a BCP 47 tag, empty for none), `series()`, `series_index()`,
`right_to_left()`, `writing_mode()`, `sections()`, the counts `authors()` and `subjects()` and
`description_bytes()`, with `title_cut()` and `series_cut()` where a text was cut for the
reply. `Documents::text(host, document, DocTextQuery::description(), input, out)` reads any
text whole in parts of at most 1,024 bytes (`title()`, `author(index)`, `subject(index)`,
`description()`, `series()`; `.from(offset)` and `DocTextPart::next_offset()` continue; an
index past the count is `NotFound`). `input` of 64 and `out` of 4,096 bytes suffice.

`Documents::readers(host, scope, cursor, input, out)` lists the reading apps for "Open with" and
the default reader, in pages of at most 64 rows: `scope` keeps the readers that show the format
with that id (empty for all), `ReaderPage::rows()` gives each `Reader` (`id()`, `screen()`,
`title()` and `formats()`, an empty list meaning every format: `reads_every_format()`), and
`ReaderPage::end().next()` is the cursor of the next page, `None` after the last. A cursor whose
list changed answers `State`: start again from `ReaderCursor::start()`. No permission is needed.
A reader opens a book through `command.open` with its `screen` and the slot `core.reader`.
`input` is 256 bytes and `out` 4,096.

`Documents::format_for(host, root, path, sniff, input, out)` tells which format reads a file
(`Root::Data`, or `Root::Library` for the user's files, which needs `uses.storage`): by its extension,
and when none matches and `sniff` is set, by the file's first 512 bytes. The answer is a `Format`
(`id()`, `title()`, `extensions()`, `priority()`); `NotFound` means no format reads it, so a file
manager offers Open only where there is one, and `Documents::readers(host, format.id(), ..)` lists
the readers for Open with. `Documents::formats(host, cursor, input, out)` lists every format in
pages (`FormatPage`, `FormatCursor`). `input` is 1,024 bytes for `format_for` and 256 for
`formats`; `out` 4,096 for both.

### Annotation anchors and per-book folders

`Library::anchors(host, book, cursor, input, out)` pages through the anchors of a book's
annotations: for each annotation that has them, `Anchor::id()` (the annotation's id),
`conversion()` (the conversion its offsets belong to, `Some(0)` differing from `None`) and
`xpointers()` (the start and end KOReader XPointers, at most 1,024 bytes each; one that is
longer reads as absent). The page's end carries the book's annotation generation like
`Library::annotations`; continue with its cursor and start again after `State`. A reader whose
conversion differs relocates an annotation through its XPointers (`Documents::xpointer` and
`locate`) and writes it back. `input` is 1,024 bytes and `out` 4,096.

`Declarations::book_data(name, BookDataKind::UserData | Cache)` declares a folder the plugin
keeps per book at `books/<name>/<book key>/` in its data (the key from `Library::book_key`): user
data moves and goes with the book, a cache is made again from the book and also goes when the
book is no longer found. The host moves and removes the folders; the plugin only writes inside
them. The name is one folder name (lowercase letters, digits and `-`, at most 96 bytes; no dot, no
separator), and the host allows at most 4 per plugin.

### Staging annotation edits

A plugin that saves a whole merged set of annotations (KOReader) stages them in a transaction:
read the book's annotations and keep the annotation generation of the last page, then
`Library::edit_begin(host, book, generation, input, out)` gives a `Transaction`. Stage edits with
`edit_add(host, &mut tx, &[AnnotationEdit], input 4,096, out)`, at most 3 per call (more is
`NoSpace`): `AnnotationEdit::add`, `upsert` (by `client_key`, so a repeated import adds nothing
twice), `replace(id, ..)` and `remove(id)`, with `.percent()`, `.conversion()`, `.times()`,
`.client_key()`, `.text()`, `.note()` (at most 3 KiB) and `.xpointers(start, end)` (1 to 1,024
bytes each). The SDK sends a text or note over 512 bytes and every XPointer in parts, cut on
character boundaries; limits are checked before anything is sent. `edit_commit` applies all edits
or none: `State` means the book's annotations changed since `edit_begin` (read again, merge, begin
again). A plugin advances its own sync state only after a commit answered `Ok`. After an error from
the host while staging, call `edit_abort`: the transaction refuses further staging and commit
(`State`). One transaction is open per plugin and two on the device (`Full`); it ends on commit,
abort, ten idle minutes or when the plugin stops. `edit_receipt(host, &committed, cursor, input,
out)` then pages the annotation ids the edits made, `Receipt::{edit, id, action}`, until the
plugin's next `edit_begin`. Every receipt page carries the annotation generation the commit
answered; a page of another generation is `Invalid`.

### Deleting and importing books

`Library::can_delete(host, paths, input, out)` asks, for 1 to 7 card paths, which books
can go and what would go with them: each `DeleteRow` has `status()` (`Ok`, `Invalid` for
not a book, `NotFound` for gone already, `Io`) and `has_annotations()`,
`has_position()` and `has_book_data()`, so a view can ask the user first.
`Library::delete(host, paths, with_notes, input, out)` removes the books and everything
kept for them; a book with annotations answers `State` in its row unless `with_notes`,
which a plugin passes only for books it downloaded itself or after asking. All three need `uses.library`; `delete`
also needs `uses.storage`, `import` does not. The host refuses
paths whose first segment is `plugins` or `.paperpaw`. Both answer one row per path, with
that path, in the order asked; a reply that does not is `Invalid`. `input` is
4,096 bytes; `out` is 4,096 bytes and also holds the joined paths until the call.

`Library::import(host, &Import, input, out)` puts a downloaded file from the plugin's
root 0 into the library and returns the book's library path, borrowed from `out`.
`Import::new(from, name)` names the source and the file name; `.folder("a/b")` puts it
below the library folder; `.existing(Existing::Replace)` replaces a book this plugin
imported earlier (it keeps its position and annotations), `Existing::FreeName` takes
`name (2).ext`, and the default `Refuse` answers `State`. Names are checked before the
host is called: no empty, `.` or `..` segment, no path separator in the name, no control
character or any of `"*:<>?|`, no trailing dot or space, no reserved device name
(`CON`, `NUL`, `COM1`…), at most 255 UTF-16 units per segment, no name starting with `.`
or `~`; all are `Invalid`. `input` is 2,048 bytes and `out` 4,096. Downloaders need no
storage permission for it.
### Opening a book as a client

`native::document::Documents::open(host)` opens `core.document`. `open_book(host, &OpenBook, input, out)`
opens one book and returns a `DocState`; `OpenBook::new(path)` reads the card's library
with the host's format and picture sizes, and its builders set the root, the format,
flags, picture sides (at most 1,600), a user CSS file and up to 12 `(name, value)`
options. More options than 12, or one over its caps, answers `NoSpace`; the handed root
for the CSS file is `Invalid`. Nothing bad reaches the host. `state` reads the
preparation state (`Preparation`), `close` ends the document, `xpointer` turns a
`DocPosition` into a KOReader XPointer and `locate` turns an XPointer (at most 1,024
bytes) back. An answer for another document is `Invalid`. Reading blocks and the
table of contents are not in this client yet. The host answers `Busy` while a
document is preparing.

### Provided metadata

`Library::provide(host, book, &Provided, input, out)` (needs `uses.library`) sets what another
source knows and the book's file does not name, as calibre does for a book it sent:
`Provided::new().title(..)?.author(..)?.series(..)?.number(..)?.tags("a\nb")?` (title and author
at most 512 bytes, series 256, number 32, up to 32 tags of 1 to 128 bytes one per line, 2,048 in
all). Only the fields set are provided, the rest are left alone: a value is never empty or blank
(only Unicode whitespace; nothing clears a field: leave it out) and has no control
character (`char::is_control`: C0, DEL and C1, so a tab or line break either, and U+2028 and U+2029; a tag list separates its tags by line breaks only), and tags replace the provider's whole tag list. Provided
values fill what the book's file does not name: where the file names a field, its own value wins
on (re)index. The last provider's values replace earlier ones, and there is one tag list per
book. They are kept with the book's data and follow it when the book moves. `input` is 4,096 bytes and `out` 64.
`Documents::format_for(host, root, path, sniff, input, out)` tells which format reads a file
(`Root::Data`, or `Root::Library` for the user's files, which needs `uses.storage`): by its extension,
and when none matches and `sniff` is set, by the file's first 512 bytes. The answer is a `Format`
(`id()`, `title()`, `extensions()`, `priority()`); `NotFound` means no format reads it, so a file
manager offers Open only where there is one, and `Documents::readers(host, format.id(), ..)` lists
the readers for Open with. `Documents::formats(host, cursor, input, out)` lists every format in
pages (`FormatPage`, `FormatCursor`). `input` is 1,024 bytes for `format_for` and 256 for
`formats`; `out` 4,096 for both.

### Book fields and badges

Declare an owned field with `native::declare::BookFieldDecl::new(name, title)`
and `Declarations::book_field`; `.in_catalog()` also keeps short values in the
catalog. `Declarations::book_badge(name, token)` registers the owner callback.
The host supplies each name's plugin prefix. Badge stage payload codecs follow
Kernel's `core.book-badge` schema.

Read all owners' fields with `native::library::Library::fields`, passing a
`BookRef` and `FieldCursor::start()` for the first page. `FieldPage::rows()`
lends each complete id, translated title and value. Continue with
`page.end().next()` until it is `None`; no value is silently shortened.
The cursor carries this book's field generation. It is distinct from the
catalog generation carried by a catalog-based `BookRef`. `Error::State` on
continuation means restart from the first page. At most 64 fields belong to
one book, in owning-plugin/name order; each page fits the service reply cap.

### Core event subscriptions

`native::declare::EventKind` includes setting changes, book opened/closed/finished,
book moves/removals, plugin changes, Wi-Fi, power mode, status and charge changes.
Subscribe with `Declarations::subscribe_event(kind, token)`. A host returns
`Error::Unsupported` until the relevant producer is implemented; these declarations
never start a stopped plugin.

The matching `native::events::Event` variants borrow callback bytes. Book session
edges use `Event::Book { kind, reason, reading, .. }`; page turns and book edges share
`ReadingView`, whose accessors expose the complete path, reading position, titles
and optional page counters. Reason 1 denotes a restored open or a sleep/shutdown
close; reserved reasons become 0. Book-finished reason is always 0.

`Event::SettingChanged` provides an optional typed previous value. A missing or
unreadable previous value is `None`; malformed nonempty settings values are refused.
An empty key is an overflow signal: reread settings retained by the plugin. Read
new values with `native::settings::read_setting`.

Wi-Fi state 4 becomes `WifiLinkState::AccessPoint`; reserved states become `On`
without a connection. `PowerChange` describes the power mode and energy level,
including automatic selection and work stretch. It borrows the mode id and
normalizes reserved energy levels to Normal. `ChargeFlags` separately describes
charging, external power and low battery; unknown flag bits are ignored.

Unknown appended optional fields are accepted, while malformed framing, strings,
reading counters and setting values are refused. `event_dropped` is a host-shell
reporting path, logged by the host; it is not an event delivered to plugin code.

### Flat callbacks in interface 7 draft 5

The flat `native::Plugin` facade borrows all callback input from the host.
`event` receives a decoded `native::events::Event` and a `native::reply::Reply` writer: append the family's encoded
reply with `write`, and return `Ok(())`. The glue returns only the written length.
A full writer returns `Error::NoSpace` without appending a partial write.
Events without replies receive an empty writer.

`draw` receives a decoded `native::callbacks::DrawFrame` with its target rectangle,
clip rows and borrowed payload. `input` receives a typed `Input` and returns
`Handled::Yes` or `Handled::No`. Neither input nor reply storage can escape the
callback. Decoders reject unknown exact tags and invalid input enum values.

Declare screens and actions with `native::declare::ScreenDecl` and `ActionDecl`.
Choose repeated-open behavior with `ScreenDecl::instances(native::declare::Instances::Single)`;
`PerParams` is the default and `Many` creates an instance for each open.
Use `Question::confirm(...)?` with `.confirm_labels("Keep\nDiscard")?` for custom
button words. Empty labels retain the dialog defaults. `.only_yes()?` requires an
empty no label; `.focus_yes()?` selects initial yes focus. Dialog plugins read
`QuestionInfo::{yes_label, no_label, only_yes, focus_yes}`.
For menu discovery, `RegistryItem::user_defined()` reads the host's explicit user
definition flag, including empty definitions and definitions equal to defaults.
Decode their shown/run events with `native::events::Event::decode`. Format catalog strings
with `native::formatting::format_message(host, key, args, &mut buffers)`.
Create `FormatBuffers::new(scratch, out)` to name the temporary argument encoding
storage and translated output separately; neither buffer is allocated by the SDK.
`digits` maps ASCII digits. Both functions return the full required byte length,
so retry when the result exceeds the output capacity.

### Native Bluetooth

Declare `uses.bluetooth` in the metadata for the commands; reads of the radio and the bonded devices
(`Device::bluetooth`, `Device::bonded`) need none. `CommandSender::bt_scan(ms)`, `bt_stop_scan`,
`bt_pair(device)`, `bt_connect`, `bt_disconnect`, `bt_forget`, `bt_give(device, plugin)`,
`bt_take_back` and `bt_keys(device, on)` queue one command each and do not wait; the answers come as
`Event::Bluetooth` to the plugin bound to the host slot `core.bluetooth` (offer a screen for the slot
with `SlotOfferDecl`; no event subscription exists for it). Device ids are those of the reads. The
event carries `kind` (`Changed`, `Found`, `ScanEnded`, `Connected`, `Disconnected`, `Paired`, `Done`,
`Failed`), the device and its kind, the signal in dBm (`None` where not known) and a `reason` (`None`
where none is said); unknown values read as `Other`. Its name borrows the event.

### Native library access

Open `native::library::Library` during a callback and release the service handle
explicitly when finished. Declare `core.library` and request `uses.library` in
metadata. Build borrowed filters with `Query::new().show(Show::Unread)` and
`.words(search)?`. `Library::query` returns a page borrowing the output buffer;
read `page.end().next()` to continue the same query with `.cursor(next)`.
A stale generation returns `State`; start the query again instead of skipping rows.
`Entry::badges()` exposes the host's badge texts without a second lookup.

Identify a book with `BookRef::path(path)?` or a catalog key and its page generation.
`set_finished(host, book, true, input, out)` changes only the finished status and
`set_favourite(host, book, true, input, out)` only the favourite status; both are idempotent.
`Library::book_text(host, book, BookTextQuery::title(), input, out)` reads a whole title,
`author()`, `series()`, the tag at `tag(index)` or the plugin field at `field(index)` (as
`id=value`), the lists' lengths being `Book::tags()` and `Book::fields()`, in parts of at most
1,024 bytes: continue with `BookTextPart::next_offset()` (`.from(offset)`) until it is `None`
(`input` of 1,024 and `out` of 4,096 bytes suffice; an index past the count is `NotFound`).
The catalog rows and `Library::book` cut long values; this does not.
`set_field` takes the full `plugin.name` field id owned by the caller; an empty
value removes it.
The SDK leaves field enumeration out until the host contract supports lossless
paging for all fields. Reply and input buffers belong to the caller; queries
allocate no SDK heap storage.

### Native device inventory

Open `native::device::Device` from a callback after declaring `core.device` in
metadata. Its inventory reads include `device`, `firmware`, `native`, `memory`,
`values` and `builtins`; radio, power and request-status reads use the same handle.
Call `release(host)` explicitly when the handle is no longer needed.
Replies borrow the caller's output buffer, and the SDK allocates no reply storage.

Use `DeviceCursor::start()` for a paged list and continue only with
`page.end().next_cursor()`. A `State` error means restart from the first page.
Hardware values and physical keys are complete unpaged lists; their terminal
metadata is checked before rows are exposed. Optional memory readings return
`None` when the host did not measure them. `FileCheck` is host evidence, not a
local trust decision; installation still goes through the host confirmation flow.

### Native host wrappers for the Battery pilot

Menu declarations use `native::declare::{MenuEntryDecl, EntryPlacement, MenuSectionDecl}`.
Construct a `MenuEntryDecl::new("core.tools", "battery.open")`, set `order = 37`,
then add it through `Declarations::menu_entry` and assign the icon through
`icon("battery.open", "battery")`. Entry and section order are typed `i16` values.
`EntryPlacement` carries an anchor only for after, before and section placement.
Entry items, icon items and device-need items are full ids; foreign items are allowed.
`menu_need(item, MenuNeed)` uses the existing SDK need enum. `menu_section` takes
a `MenuSectionDecl`; `hide_menu_entry(menu, item)` uses full ids, while
`describe_item(item, key)` names an owned item relatively. The builder checks
syntax and generated field limits; the host resolves ids and checks duplicates.
Hosts without menu wiring return `Unsupported` rather than dropping declarations.
These methods also work in build scripts that emit static batches. Card catalogs
remain at `plugins/<id>/i18n/<language>.ini`, with language fallback ending in English.

`native::declare::Declarations::subscribe_event(EventKind::Started, token)`
registers a typed event subscription; `register_draw(token)` registers a draw
callback. `EventKind` lives in `native::declare` and covers tick, lifecycle,
battery, page, screen and action events. These methods use the same ordered,
bounded batches and failure latching as settings, screen and action declarations.
They also work in build scripts that emit static registration batches; a plugin
never needs to write callback record bytes or import private generated codecs.

`native::snapshot::capture_snapshot(host)` returns an owned snapshot with battery,
display and time getters. `native::settings::read_setting(host, key, scratch)`
returns a borrowed `SettingValue`; `Absent`, false, zero and empty text remain
distinct. Grant reads use only `settings::own_grant(host, GrantKind)` and the host
checks the caller. Generic grant reads and typed grant writes are refused.

`native::formatting::copy_message(host, key, out)` returns complete borrowed UTF-8
or `NoSpace`. `MAX_MESSAGE_BYTES` sizes one reusable output buffer. Number labels
can look up `core.decimal` (falling back to "." when missing), format fixed-point
ASCII text, then use the digit conversion slot.

A draw callback obtains its canvas with `frame.draw_canvas()`. A frame decoded outside
entry glue has no canvas access and returns `State`. The non-copyable frame is borrowed mutably for the canvas lifetime;
dropping the canvas allows another borrow. Canvas primitives preserve
the host's frame clipping and colour conversion. `Font::acquire_role` borrows the
callback host, `measure_text` returns advance, and `render_text` takes that canvas
and a `TextOrigin`. Consuming `release` and `Drop` each release a font once. A
font cannot be drawn through a different host binding.

REG declarations use `SetupStepDecl`, `SlotDecl`, `SlotOfferDecl`, `KeyBindingDecl`,
`PresetDecl` and `PresetValueDecl` through `native::declare::Declarations`.
`setting_default` and `setting_choice` extend another plugin's settings; the host
checks authority and resolves extensions in plugin load order. Setup conditions
are declared values and device requirements, with no callback during a query.

Registry commands preserve the difference between a default and an empty user
configuration: `set_menu(menu, None)` restores declared rows, while
`set_menu(menu, Some(&[]))` clears the custom menu. Menu and plugin request lists
are checked against the generated limits and never truncated. A preview set is
submitted as one batch with caller-owned value scratch; oversized previews fail
before submission. Use a preset preview for larger sets. The host checks preview
ownership and obtains any required user consent for mass resets.

`native::commands::CommandSender::new(host, scratch)` stages typed setting changes
with the generated encoder. Each accepted call is one atomic batch, applied by
the host after the callback. Dropping the sender submits nothing.

`Font::read_line_metrics` returns the SDK's `LineMetrics`; `Font::ink` returns
optional `InkBounds`, preserving empty text and whitespace as no ink.
`canvas.clip_region(rect)` returns a nested guard: its clip intersects the parent,
and dropping it restores the previous clip. Explicit `restore` can report a
host refusal. The draw-frame clip remains the outer bound.

`CommandSender` also opens screens, runs actions, queues a redraw with typed
`RedrawMode`, and closes the submitting plugin's top screen. Screen and action
ids are validated before encoding; each call stages one complete batch or none.

### Reading annotations through interface 7

Use `native::library::Library::annotations` with a `BookRef` and
`AnnotationCursor::start()`. `page.end().total()` counts all annotations for
that book, including bookmarks and highlights without notes. This count is
available from the first page; a whole-library overview reads a first page for
each catalog book. There is no count-only call or catalog has-notes filter.

Annotation rows borrow the caller's reply buffer and include stable per-book
ids, kind, source offsets, progress, timestamps and text/note previews. Each
preview is at most 512 UTF-8 bytes. Continue with `page.end().next()` while
keeping the same book reference. The cursor carries the book's annotation
generation; a catalog reference carries a separate catalog generation. On
`Error::State`, restart that book's annotation enumeration.

For lossless exports, read cut previews with `Library::annotation_text` and
`AnnotationTextQuery::new(id, AnnotationTextKind::Text)` or `Note`. The id is
the annotation id, not the row index. Each part borrows at most 1,024 UTF-8 bytes;
continue with `query.from(part.next_offset().unwrap())` only when the offset is
present. Consume each borrowed part before reusing the output buffer. Text calls
have no annotation-generation input, so a multi-call export must handle concurrent
edits; it does not acquire a snapshot. A caller can recheck annotation generation
and restart if it changed.
