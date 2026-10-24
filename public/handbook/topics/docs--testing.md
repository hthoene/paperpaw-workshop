### Testing

Plugins are tested with the real kernel and an in-memory storage, as the
sample's [test](../samples/hello-plugin/tests/hello.rs) does. The kernel
comes from the crate `paperpaw-core`, a dev-dependency. Build a kernel
with the plugin and send it input. Then look at the open screen, the
settings, the files and the HTTP requests it makes (`Kernel::take_io`).
Answer them with `Kernel::http_response`. The emulator then shows how it
looks and how much memory it needs on each device:

```sh
cargo run -p paperpaw-emulator --features hello -- --profile xteink-x4 --headless --script "run:hello.open" --screenshot out.png --heap-report
```

Before a plugin is published, `paperpaw-dev` checks all of it on every
device: see [Checking your plugin](#checking-your-plugin).
