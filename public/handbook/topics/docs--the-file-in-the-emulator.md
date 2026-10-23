### The file in the emulator

The desktop emulator loads a plugin's code built for the computer it runs
on, as Android loads `code.so`: a `cdylib` crate with the same
`plugin!` line, built with the emulator's toolchain against its SDK with
the `outline` feature (`paperpaw-sdk = { version = "0.4", features =
["outline"] }`), is `code-host.dll`, `code-host.so` or `code-host.dylib`
in the plugin's folder (`plugins/<id>/` of the emulator's library,
beside its `plugin.ini`). As on a device, only code installed runs:
`--trust-code` installs every such file in the library, and at every
start a file changed since is refused until it is installed again.

```sh
paperpaw-emu --library my-library --trust-code
```

Over `--stdio`, `start` with `"trust_code": true` does the same, and
`reload` loads a new build; `ready` says the fingerprint and compiler
the emulator takes.
