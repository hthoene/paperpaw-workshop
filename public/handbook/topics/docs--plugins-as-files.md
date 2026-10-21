## Plugins as files

A code plugin can also be a file, `code.ppn`, in a plugin's folder on
the card, which the X4 and the X4 Pro load at their start (ADR 0024):
from the plugin store or from the web flasher with the firmware. Only
code installed runs: an installer names the file by its digest
(`native::remember_code`, kept in `.paperpaw` where neither the Wi-Fi
transfer nor plugins' folders reach), and a file put into a plugin's
folder otherwise is not run (the plugin manager says why); an author
trying their own build names it over USB
(`tools/x4-remote.py --trust-code <id>`). Its code is the same as that of a plugin built in, and it runs
as part of PaperPaw, at full speed and without a sandbox: it can do
whatever PaperPaw can, also past the SDK. The X4 Pro runs it from its
PSRAM; the X4 writes it once into flash behind its firmware (about 1.8
MB for all its plugins together) and runs it from there, for some
hundred bytes of RAM.

[`samples/hello-native`](../samples/hello-native) is the sample plugin
above as a file, in a workspace of its own as a plugin's own repository
is, with a CI job to start from.

### The crate

The plugin stays a library crate, tried in the emulator and tested as
any other. A second crate, a `#![no_std]`, `#![no_main]` binary, makes
the file with one line:

```rust
#![no_std]
#![no_main]

paperpaw_sdk::plugin!(my_plugin::MyPlugin::default());
```

`plugin!` gives the file its entry, its heap (the kernel's: what the
plugin boxes, the kernel may drop) and its panic handler. The crate's
`.cargo/config.toml` links it as a plugin: copy the sample's, which
links with `paperpaw-plugin.x` (the SDK brings it), keeps the
relocations, and on the X4 builds with the medium code model and frame
pointers. It also sets `--cfg paperpaw_plugin`, with which the SDK asks
the firmware for what it has already instead of copying it into the
file (the names of all icons, some 125 KB in a plugin that draws an icon
by name). Build it for both chips:

```sh
cargo x4                  # riscv32imc-unknown-none-elf, the X4
cargo +esp x4pro          # xtensa-esp32s3-none-elf, the X4 Pro (espup's toolchain)
```

### Which build fits

Until PaperPaw 1.0 a plugin file runs only on the PaperPaw it was built
for: the same compiler for the same chip from the same SDK with the same
features (but `kernel` and `unstable`, which only add functions). Its
fingerprint says so, and a device loads only files with its own;
*About* shows the device's fingerprint and the compiler to build with. Build against the SDK of the release (`paperpaw-sdk = "0.5"`)
with the toolchain that release names, and build again for every
release; the store and the update check show which plugins wait for a
build. From 1.0 on, plugins will be built against a versioned interface
and keep working across minor releases.

### Packing and signing

`paperpaw-sign` (in this repository, `tools/sign`) makes the file from
the linked plugin and signs it as its author:

```sh
paperpaw-sign key author.key                      # once; keep it safe, never publish it
paperpaw-sign pack target/riscv32imc-unknown-none-elf/release/my-plugin my-plugin-x4.ppn --key author.key
paperpaw-sign plugin my-plugin-x4.ppn             # what it holds, and who signed it
```

`pack` refuses what cannot run from where the file lands: writable data
(a `static` that changes; keep state on the heap, as in `Rc`s handed to
closures), symbols it cannot find, and code that reaches an address
fixed in the firmware or ROM directly. The signature goes into the file
itself, so it travels with it; a device remembers the author's key at
the first install and warns when an update is signed by another.

### Trying it on a device

A code plugin is a folder like a data plugin's, with its code beside its
`plugin.ini`:

```text
plugins/my-plugin/
  plugin.ini     [plugin] id, name, description, version
  code.ppn       its code, for this device and this firmware
  i18n/*.ini     translations, settings.ini, … as for data plugins
```

Copy the folder onto the card (over USB: `python tools/x4-remote.py
--push my-plugin plugins/my-plugin`) and restart. The plugin manager
lists it as one with code, and says why one does not run (built for
another PaperPaw, damaged, no room). Over USB, `native` (and `--info`)
says where each plugin lies and what loading it took.

A panic's calls inside a plugin are kept with its name and the offset
into its file, e.g. `4261a402 (my-plugin+0x452)`: its function lies at
`0x42000000 + offset - 80` in the plugin's ELF. A plugin that crashes
before PaperPaw shows its first frame is switched off: after two such
starts PaperPaw starts without plugins with code and says so (holding
*Back* on the X4, *Home* on the X4 Pro, while switching it on does the
same). The plugins it switched off are switched on again in the plugin
manager, one at a time.

### Keeping it small

On the X4 every plugin's file takes room in flash. A plugin carries its
own copy of the SDK code it uses, which is most of a small plugin: of
the sample's 63 KB on the X4, its own code is some 9 KB.

- Build with `opt-level = "s"` (as PaperPaw) or `"z"` (some 5 % smaller
  on the X4, a little slower), `lto = "fat"`, `codegen-units = 1`,
  `panic = "abort"`, as the sample does.
- Leave out what pulls in large parts of `core`: parsing floats from
  text (`str::parse::<f32>()`, 16 KB of tables), `{:?}` of strings.
- Keep translations and other text in the folder's files rather than in
  the code, where they are needed once.

Services between plugins are found by their type's name too, so a plugin
built apart finds those of the firmware's plugins (see [Services and
points of your own](#services-and-points-of-your-own)).

### Publishing a code plugin

The plugin library (paperpaw.org) lists a code plugin with its folder
and a build per reader (`x4`, `x4-pro`, `x4-classic`), each a signed
`.ppn` with the fingerprint it was built for, the author's key, and its
source, which the library rebuilds to compare. The sample's `build.sh`
builds, packs and signs both files, and its CI job
(`samples/hello-native/.github/workflows/build.yml`, for a plugin's own
repository) runs it on every tag, with the author's key kept as a
secret of the repository. [Publishing](#publishing) says how.
