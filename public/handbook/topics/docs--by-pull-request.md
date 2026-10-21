### By pull request

`catalogue/<id>.toml` holds what `store.ini` would, and `author`,
`kind` and the versions; the folder lies at `catalogue/packages/<id>/`
(without `store/`) or elsewhere as a ZIP (`url`, `sha256`). A code
plugin adds `author_key`, `devices` (every reader with a build), and in
each version `[versions.source]` and a `[[versions.builds]]` per reader
with its `device`, its fingerprint as `abi` (which `paperpaw-sign
plugin` prints), and its file. `samples/hello-native/catalogue.toml` is
one to fill in; `paperpaw-website check` in a clone of the paperpaw.org
repository runs the site's checks on it.

[`Plugin`]: ../crates/paperpaw-sdk/src/plugin.rs
[`Registrar`]: ../crates/paperpaw-sdk/src/plugin.rs
[`Env`]: ../crates/paperpaw-sdk/src/env.rs
[`Command`]: ../crates/paperpaw-sdk/src/command.rs
[`Screen`]: ../crates/paperpaw-sdk/src/screen.rs
[`Widget`]: ../crates/paperpaw-sdk/src/widgets.rs

Other protocols go over sockets ([ADR 0014](adr/0014-sockets-for-plugins.md)):
`Command::Connect` opens a TCP connection, `Command::SocketSend` sends,
and `Command::SocketRead` asks for what comes next, as text
(`SocketRead::Text`) or as a file of a known length written to storage as
it comes (`SocketRead::File`), so files of any size never need to fit in
memory. `Command::Broadcast` finds services in the local network by a
UDP datagram and their answers. Everything comes back as events
(`socket_params`); a socket closes when the screen showing as it was
opened is closed.
