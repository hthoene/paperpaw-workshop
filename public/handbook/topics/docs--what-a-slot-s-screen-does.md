### What a slot's screen does

A screen bound to a standard slot takes the parameters the others open
it with and answers as they expect, so that every plugin works with it:

| Slot | Opened with | The screen |
|---|---|---|
| `core.home` | nothing; at the start and by `actions::HOME` | is the bottom of the stack: opened again, the screens above it close. It leads to the menu and the library by touch and by buttons alone. |
| `core.library` | nothing; by `actions::LIBRARY` | opens a book with `readers::open` (the reading app chosen for it). For a book it offers the menu `menus::BOOK`, as `Menus::shown_items` has it: when an entry is chosen it emits `events::BOOK_CHOSEN` with the book, then runs the entry's action. |
| `core.settings` | nothing: the groups; `params::ID`: the settings of that group; `params::FOCUS`: the page of that setting, focused on it | changes settings with `Command::SetSetting`, and a setting with an editor (`SettingExtra::editor`, a screen or a slot) by opening that (`Editor::open`). |
| `core.menu` | `params::MENU`, the menu; `params::HIDE`, entries to leave out this time | shows `env.menus.items(menu)`; for an entry chosen it closes (`Command::Back`) and runs its action (`Command::RunAction`); a setting listed there it changes, or opens its editor. |
| `core.choose-folder`, `core.choose-value` | `params::ID`, the setting | writes the folder, or the value, chosen to the setting. Name the slot as the editor (`SettingExtra::editor_slot`) to have it edited there by whichever plugin fills it. |
| `core.choice` | `params::TITLE`, `PATH` (what it is about), the options, `REPLY`; asked with `ask::choice` | shows the options; for one chosen it closes and emits the reply as a `Picked` with the option and `path`; *Back* or a tap outside closes without one. |
| `core.confirm` | `params::TITLE` (the question), `TEXT`, `ui::confirm::YES_LABEL`, `NO_LABEL`, `FOCUS_YES`, `REPLY`; asked with `ask::confirm` | asks yes or no, the focus on no unless `FOCUS_YES`; for an answer it closes and emits the reply as a `Confirmed` with all of its parameters; *Back* or a tap outside closes without one. |
| `core.keyboard` | `params::TITLE`, `TEXT` (to start from), `MODE` (`text`, `number`, `password`), `REPLY`, `LIVE` | on confirming, closes and emits the event named by `reply` as a `Typed` with all of its parameters; with `live`, on each change too, with `Typed::typing` set; *Back* closes without an answer. `ask::text` asks this way. |

The documentation of `builtin::slots` says the same for every slot.
