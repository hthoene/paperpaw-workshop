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

The X4's core libraries (`core`, `alloc`) come from rustup, with the
target in the sample's `rust-toolchain.toml`. The X4 Pro's come with each
PaperPaw release, built once and signed
(`paperpaw-xtensa-std-<version>.tar.gz`): install them into the `esp`
toolchain once for each release, with PaperPaw's
`tools/xtensa-std/install.sh` or by hand as its README says. Without
them, `cargo +esp x4pro` finds no `core`.
