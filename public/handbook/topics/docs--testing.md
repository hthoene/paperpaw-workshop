### Testing

Plugins are tested with the real kernel and an in-memory storage, as the
sample's [test](../samples/hello-plugin/tests/hello.rs) does: build a
kernel with the plugin, send it input, look at the open screen, the
settings, the files, the HTTP requests it makes (`Kernel::take_io`)
and answer them (`Kernel::http_response`). The emulator then shows how it
looks and how much memory it needs on each device:

```sh
cargo run -p paperpaw-emulator -- --profile xteink-x4 --headless --script "confirm" --screenshot out.png
```

Before a plugin is published, `paperpaw-dev` checks all of it on every
device: see [Checking your plugin](#checking-your-plugin).
