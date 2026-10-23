# The SDK the installer brings

For a PaperPaw in work (`0.4.0-dev`), whose SDK is not on crates.io,
`npm run app:installer` copies the SDK of the checkout its emulator was
built in here (see `scripts/sdk.mjs`): `crates/` with `paperpaw-sdk` and
the PaperPaw crates it needs, the workspace's `Cargo.toml` with those as
its members, and `version.txt`. The installer puts it into `sdk/` beside
the app, which builds plugins with code against it for that PaperPaw
only. It is not kept in git.
