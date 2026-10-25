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
show which plugins wait for a build. Interface 3 came with 0.5.0-beta.7
(Bluetooth, installing another firmware): a plugin built for an earlier
release is to be built again for it.
