### Flows

A flow is a text file of steps and of what should be true after them, run
on every device it fits:

```text
# Night mode from the menu, with buttons alone.
profiles: xteink-x4, xteink-x4-pro

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

Steps are those of the emulator's scripts: a button's name, `long:`,
`tap:x:y`, `tap-on:<text>`, `long-tap:x:y`, `swipe:`, `down:`, `move:`,
`up:`, `wait:<ms>`, `run:<action>`, `open:<screen>`, `type:<text>`
into the keyboard shown, `type-enter:` to confirm it, `redraw` and
`shot:<file>`. Lines before the first step may say `profiles: a, b`
and `set: <id> = <value>`, a setting before the app starts. Assertions
are `expect screen`, `stack`, `text`, `no text`, `focus`, `on`, `off`,
`setting`, `no warnings` and `picture <name>`, which compares the
screen with a snapshot. `paperpaw-emu --record
my.flow` writes what one does in the emulator's window as a flow, to be
replayed with `paperpaw-dev flows --flow my.flow`; the `expect` lines are
added after.

Write a flow for every action of a plugin: each thing a user does with it
(a setting switched, an entry made, a sync started, a book opened from its
screen), from where they start to what should be true after, by touch and
with the buttons alone. Flows are the main test of what a plugin does;
`explore` only finds what breaks when each thing is touched once.

On the profiles with the X4's budgets every step is measured: the most
the heap held during it and its slowest frame, estimated on an X4. The
costliest step is named: `flows.heap` is an error where the X4 would run
out and a warning above an eighth of its heap, `flows.frame-time` a
warning above half a second.

Unless `--quick`, each flow is then played again in variations that find
what happens at the edges: every step done ten times; *Back*, *Home* or
sleep and waking at a few places in the middle; network answers that
fail, come late, are empty or far too large; the pseudo-language; a book
with a very long name; a storage that is almost full. Assertions are left
out there. Each variation must not panic, must stay within the heap and
must find its way back to the home screen (`flows.varied`).

Keep flows and their snapshots beside the plugin rather than in its
folder (in a plugin's own repository, `tests/flows` and
`tests/snapshots`): `package` warns of those that would ship in a
package. None of this is part of a device's build; `paperpaw-dev` runs on
the computer only.
