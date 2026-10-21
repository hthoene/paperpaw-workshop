### Flows

A flow is a text file of steps and of what should be true after them, run
on every device it fits:

```text
# Night mode from the menu, with buttons alone.
profiles: xteink-x4, xteink-x4-classic

long:confirm
expect screen menu.list
expect focus "Home"
right
right
right
right
expect off "Night mode"
confirm
expect setting core.night-mode = on
back
expect stack 1
expect no warnings
```

Steps are those of the emulator's scripts (a button's name, `long:`,
`tap:x:y`, `tap-on:<text>`, `swipe:`, `wait:<ms>`, `run:<action>`,
`open:<screen>`); assertions are `expect screen`, `stack`, `text`,
`no text`, `focus`, `on`, `off`, `setting`, `no warnings` and
`picture <name>` (compared with a snapshot). `paperpaw-emu --record
my.flow` writes what one does in the emulator's window as a flow, to be
replayed with `paperpaw-dev flows --flow my.flow`; the `expect` lines are
added after.
