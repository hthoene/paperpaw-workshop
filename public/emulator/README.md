# The reader: PaperPaw's web emulator

`paperpaw-web.wasm` is PaperPaw itself (its `shells/web`: the kernel, the
standard plugins, the device profiles of the X4, the X4 Pro and the Boox,
and paperpaw-dev's checks), compiled to WebAssembly, under PaperPaw's
licence (Apache-2.0, as this repository). `meta.json` says which ref and
commit of PaperPaw it was built from, its size and its SHA-256.

Built anew with

    npm run emulator -- --repo ../paperpaw --ref <tag or branch>

which needs Rust and `rustup target add wasm32-unknown-unknown`; it also
copies PaperPaw's loader (`paperpaw-web.js`) to
`src/emulator/frame/shell/`. The module's names section (for stack
traces only) is left out.
