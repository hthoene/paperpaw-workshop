## Memory

PaperPaw's code guidelines ([CONTRIBUTING.md](../CONTRIBUTING.md#code-guidelines)) hold for plugins too: length limits, errors on user data, memory, comments.

The smallest device, the Xteink X4, has 256 KiB of heap for everything.
PaperPaw's standard app holds some 90 KiB of it once it has started
with the sample books, 130 KiB at its peak (the emulator, `--profile
xteink-x4 --headless --script wait:500`). A plugin that should run
there:

- keeps little in memory: lists in files, read as they are needed;
- registers what does not change as `static` lists, which stay in flash:
  actions (`FixedAction`, `r.add_actions`), screens (`FixedScreen`,
  `r.add_screens`), menu entries (`r.add_menu_entries`), icons
  (`r.add_icons`) and settings (`r.add_settings`); an `ActionSpec` or a
  `ScreenSpec` is for a handler or factory that keeps state of its own;
- reads files a piece at a time (`Storage::read_at`), never whole books;
- writes downloads straight to storage (`HttpRequest::save_to`);
- reserves large buffers with `try_reserve` and copes when that fails;
- checks `env.device().memory` (`MemoryClass::Small`) to do less there.

The emulator's X4 profile enforces the budget. After a run with
`--headless`, `--heap-report` shows where memory goes.
`--trace-alloc <bytes>` prints each allocation of at least that size.
