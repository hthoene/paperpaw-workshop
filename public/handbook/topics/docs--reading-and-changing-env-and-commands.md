### Reading and changing: `Env` and commands

Plugins never change the kernel's state directly. They read it through
[`Env`]: the device, the settings, the translations, the fonts, the
storage, the time, the battery, the passwords and keys. They change it
with [`Command`]s: open a screen or slot, go back, change a setting,
emit an event, run an action, show a short message, make an HTTP
request, keep a password, and so on. The kernel runs the commands after
the plugin's code returns.

A handler queues its commands in the `Commands` it is handed (`out` in
the examples): `out.push(..)`, `out.extend(..)`, `out.emit(..)`. It
reads as the slice of what is queued so far. Its fields are private, so
that it can grow: what PaperPaw adds to it later reaches every handler
without a new signature.

This keeps plugins simple to test and the API message-based. It does
not confine them: a plugin runs as native code without a sandbox (see
[Plugins as files](#plugins-as-files)).
