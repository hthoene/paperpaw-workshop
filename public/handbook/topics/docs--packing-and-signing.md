### Packing and signing

`paperpaw-sign` (in this repository, `tools/sign`) makes the file from
the linked plugin and signs it as its author:

```sh
paperpaw-sign key author.key                      # once; keep it safe, never publish it
paperpaw-sign pack target/riscv32imc-unknown-none-elf/release/my-plugin my-plugin-x4.ppn --key author.key
paperpaw-sign plugin my-plugin-x4.ppn             # what it holds, and who signed it
```

`pack` refuses what cannot run from where the file lands: writable data
(a `static` that changes; keep state on the heap, as in `Rc`s handed to
closures), symbols it cannot find, and code that reaches an address
fixed in the firmware or ROM directly. The signature goes into the file
itself, so it travels with it; a device remembers the author's key at
the first install and warns when an update is signed by another.
