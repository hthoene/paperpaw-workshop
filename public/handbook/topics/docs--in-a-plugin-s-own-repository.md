### In a plugin's own repository

[`tools/dev/templates`](../tools/dev/templates/README.md) has what a
plugin's repository needs: the harness, the snapshot test and a CI job.
`paperpaw-dev` is a dev-dependency by git, with the tag of the release the
plugin is made for, and the SDK is patched to the same tag, so that the
plugin and the app share one:

```toml
[dev-dependencies]
paperpaw-dev = { git = "https://github.com/hthoene/paperpaw", tag = "v0.5.0-beta.10" }

[patch.crates-io]
paperpaw-sdk = { git = "https://github.com/hthoene/paperpaw", tag = "v0.5.0-beta.10" }
```

`examples/paperpaw-dev.rs` adds the plugin to the app:

```rust
fn main() -> std::process::ExitCode {
    paperpaw_dev::main(|app| app.plugin(my_plugin::MyPlugin))
}
```

`tests/snapshots.rs` compares the cases of `tests/snapshots/cases.ini`
with the pictures beside it; `PAPERPAW_BLESS=1 cargo test --test
snapshots` writes them anew (look at each before committing it):

```ini
[x4-screen]
screen = my-plugin.screen
profile = xteink-x4

[boox-widget-wide]
widget = my-plugin.widget 4x2
profile = boox-go-7
core.night-mode = true
```

The CI job (`.github/workflows/paperpaw-dev.yml`) runs the tests,
`check --plugin my-plugin --quick` and the flows of `tests/flows`
(`flows --flow tests/flows`, varied at the edges), and keeps the report
as the run's artifact, also when a check failed.
