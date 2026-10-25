## Plugins as files

A code plugin can also be a file, `code.ppn`, in a plugin's folder on
the card, which the X4 and the X4 Pro load at their
start (ADR 0024): from the plugin store, from the web flasher with the
firmware, or sent from a computer over the USB cable or the Wi-Fi
transfer, where the device asks first ([USB transfer](usb-transfer.md)).
Only code installed runs. An installer names the file by its digest
(`native::remember_code`, kept in `.paperpaw`, which plugins' folders do
not reach), and a file put into a plugin's folder otherwise is not run;
the plugin manager says why. An author trying their own build sends it
with `tools/usb-transfer.py install <folder>`. Its code is the same as that
of a plugin built in, and it runs as part of PaperPaw, at full speed
and without a sandbox: it can do
whatever PaperPaw can, also past the SDK. The X4 Pro runs it from its
PSRAM; the X4 writes it once into the flash behind its
firmware and runs it from there, not from its RAM.

PaperPaw's own plugins that not every reader needs (statistics, widgets,
Calibre, the syncs and the others of
[`tools/plugin-files/plugins.txt`](../tools/plugin-files/plugins.txt))
come this way on the X4s: their firmware leaves them out, and each
release builds them as files, signed with PaperPaw's plugin key, which
readers install from the store. Each has a version of its own, apart
from PaperPaw's: a release builds one that did not change again for its
firmware, at the version it has, and a fix comes as a newer version,
with a release or alone between releases
([`tools/plugin-files`](../tools/plugin-files/README.md)).

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
`.cargo/config.toml` links it as a plugin: copy the sample's, and the
sample's `paperpaw-plugin.x` beside it at the top of the project (the
PaperPaw release's own, from `paperpaw-native`; no build script brings
it, so a build on Windows is the same as one on Linux). It links with
it, keeps the relocations, and on the X4 builds with the medium code model and frame
pointers. It also sets `--cfg paperpaw_plugin`, with which the SDK asks
the firmware for what it has already instead of copying it into the
file (the names of all icons, some 125 KB in a plugin that draws an icon
by name). Build it for both chips:

```sh
cargo x4                  # riscv32imc-unknown-none-elf, the X4
cargo +esp x4pro          # xtensa-esp32s3-none-elf, the X4 Pro (espup's toolchain)
```

The devices draw font packs and load only plugins built without the
SDK's `outline` feature; the emulator's build (for the computer, see
below) takes it. One manifest gives each its own, by target:

```toml
[dependencies]
paperpaw-sdk = "0.5.0-beta.8"

# Outline fonts for the emulator's build only: the X4s draw font packs.
[target.'cfg(not(target_os = "none"))'.dependencies]
paperpaw-sdk = { version = "0.5.0-beta.8", features = ["outline"] }
```

A build for a device that asks for `outline` stops and says so.

The X4's core libraries (`core`, `alloc`) come from rustup, with the
target in the sample's `rust-toolchain.toml`. The X4 Pro's come with each
PaperPaw release, built once and signed
(`paperpaw-xtensa-std-<version>.tar.gz`): install them into the `esp`
toolchain once for each release, with PaperPaw's
`tools/xtensa-std/install.sh` or by hand as its README says. Without
them, `cargo +esp x4pro` finds no `core`.

### Which build fits

A plugin file runs on every PaperPaw of the plugin interface it was
built for ([ADR 0026](adr/0026-plugin-interface-version.md)),
whichever release made it: its fingerprint holds the interface's
version (`native::INTERFACE`, in its top 16 bits), the chip and the
features that change what crosses (`outline`, colour), and a digest of
the layouts of the types that cross. A device loads only files with its
own fingerprint; *About* shows it and the compiler to build with, and
`paperpaw-sign plugin` names a file's interface.

**When to rebuild:** when a release raises the plugin interface (its
release notes say so, and so does the plugin manager on the reader:
*Built for another plugin interface*), and only then. Build with the
toolchain the release names (the sample's `rust-toolchain.toml`, and
espup's of `versions.env` for the X4 Pro): until 1.0 a new compiler is a
new interface. The file names the compiler that built it:
`paperpaw-sign pack` takes it from the plugin's `.comment`, which the
format's linker script keeps, and a device loads the file only where
that compiler built the firmware too. A beta or a release that keeps
the interface runs the plugin as it is. The store and the update check
show which plugins wait for a build. Interface 4 came with 0.5.0-beta.8
(reading, settings and real-time screens): a plugin built for an earlier
release is to be built again for it.

### The file in the emulator

The desktop emulator loads a plugin's code built for the computer it runs
on, as Android loads `code.so`: a `cdylib` crate with the same
`plugin!` line, built with the emulator's toolchain against its SDK with
the `outline` feature (the target section above gives it), is `code-host.dll`, `code-host.so` or `code-host.dylib`
in the plugin's folder (`plugins/<id>/` of the emulator's library,
beside its `plugin.ini`). The emulator runs such code only when it is started
with `--trust-code`, which installs every such file in the library first
(as on a device, only code installed runs); without it, none, whatever
the library says is installed: a library copied from elsewhere runs no
code of its own.

```sh
paperpaw-emu --library my-library --trust-code
```

Over `--stdio`, `start` with `"trust_code": true` does the same, and
`reload` loads a new build; `ready` says the fingerprint and compiler
the emulator takes.

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
the first install (from the store, the key the plugin library names for
its author) and warns when an update is signed by another.

### Trying it on a device

A code plugin is a folder like a data plugin's, with its code beside its
`plugin.ini`:

```text
plugins/my-plugin/
  plugin.ini     [plugin] id, name, description, version
  code.ppn       its code, for this device and this firmware
  i18n/*.ini     translations, settings.ini, … as for data plugins
```

`plugin.ini`'s version is the plugin's: the store, the installer and
updates go by it, and the device shows it. The code's manifest must name
the same version (`paperpaw-dev package` with the folder and `--plugin`
says where it does not).

Send the folder from a computer and say yes on the device
(`python tools/usb-transfer.py install my-plugin`, or the Wi-Fi
transfer); it is loaded at once. A firmware built for development also
takes a folder over its remote control
(`tools/x4-remote.py --push my-plugin plugins/my-plugin --trust-code
my-plugin`, a folder under `plugins/`). The plugin manager lists it as one with code,
and says why one does not run (built for another PaperPaw, damaged, no
room, not installed, changed since it was installed). Over USB, `--script native` (and `--info`)
says where each plugin lies and what loading it took.

A panic's calls inside a plugin are kept with its name and the offset
into its file, e.g. `4261a402 (my-plugin+0x452)`: its function lies at
`0x42000000 + offset - 80` in the plugin's ELF. A plugin that crashes
before PaperPaw shows its first frame is switched off: after two such
starts PaperPaw starts without the plugin the crash was in (without all
plugins with code where that is not known) and says so; holding *Back*
on the X4, *Home* on the X4 Pro, while switching it
on starts without them too. The plugins it switched off are switched on
again in the plugin manager, one at a time.

### Keeping it small

On the X4 every plugin's file takes room in flash. A plugin carries its
own copy of the SDK code it uses, which is most of a small plugin: the
sample's file for the X4 is 78 KB (76 KB of code and constant data),
though the plugin itself is a screen, an action and a setting.

- Build with `opt-level = "s"` (as PaperPaw) or `"z"` (smaller, a little
  slower), `lto = "fat"`, `codegen-units = 1`, `panic = "abort"`, as the
  sample does.
- Leave out what pulls in large parts of `core`: parsing floats from
  text (`str::parse::<f32>()`, 16 KB of tables), `{:?}` of strings.
- Keep translations and other text in the folder's files rather than in
  the code, where they are needed once.

Services between plugins are found by their type's name too where the
type is the SDK's, so a plugin built apart finds those of the firmware's
plugins; one of a plugin's own type needs a contract (see [Services and
points of your own](#services-and-points-of-your-own)).

### Publishing a code plugin

The plugin library (paperpaw.org) lists a code plugin with its folder
and a build per reader (`x4`, `x4-pro`), each a signed
`.ppn` with the fingerprint it was built for, the author's key, and its
source, which the library rebuilds to compare. The sample's `build.sh`
builds, packs and signs both files, and its CI job
(`samples/hello-native/.github/workflows/build.yml`, for a plugin's own
repository) runs it on every tag, with the author's key kept as a
secret of the repository. [Publishing](#publishing) says how.
