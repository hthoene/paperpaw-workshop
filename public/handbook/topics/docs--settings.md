### Settings

A setting is a constant with its id and the type of its value
(`Setting<bool>`, `Setting<i64>` or `Setting<Text>` for choices,
languages, lists and text). Its spec is declared in a `static` list,
which the plugin registers once. On the X4 the list stays in flash and
takes next to no memory:

```rust
pub const NAME: Setting<Text> = Setting::new("hello.name");
pub const DATE: Setting<bool> = Setting::new("hello.clock.date");
const GROUP: Id = Id::new_static("hello.clock");

static SETTINGS: [SettingSpec; 3] = [
    SettingSpec::text(NAME.static_str(), "hello.setting.name", "", GROUP)
        .description("hello.setting.name.help"),
    SettingSpec::switch(DATE.static_str(), "hello.setting.date", true, GROUP),
    SettingSpec::choice("hello.clock.face", "hello.setting.face",
        &["hello.face.plain", "hello.face.ticks"], "hello.face.ticks", GROUP)
        .description("hello.setting.face.help"),
];

r.add_settings(&SETTINGS)?;

let name: &str = env.settings().read(&NAME);
out.push(Command::set(&NAME, "Ada".into()));
```

`SettingSpec::switch`, `number`, `choice`, `language`, `list` and
`text` make them, each with its id, title, default and group;
`SettingSpec::new` takes any kind and an `Id`, for a spec whose id is
known only at run time (registered with `add_setting`). Every builder is
`const`. The settings screens list every setting by its group, with its
description below it; the kernel saves changes to `paperpaw.ini`.
`advanced()` hides rarely needed ones, and `scoped()` lets one be set per
book. Settings known only at run time (one per widget, say) are read by
their ids, `env.settings().text("…")` and so on. Passwords and keys do
not belong in settings: see [Passwords and keys](#passwords-and-keys).

What few settings need goes into a `static SettingExtra`, which a
setting takes with `with_extra(&EXTRA)`: a unit, a step, a section, a
slider, an editor screen of your own, or being a secret.

```rust
static WHILE_SYNCING: SettingExtra = SettingExtra::new().shown_if(Id::new_static("hello.sync"), "on");
static SERVER: [SettingSpec; 1] = [
    SettingSpec::text("hello.server", "hello.setting.server", "", GROUP).with_extra(&WHILE_SYNCING),
];
```

`shown_if` shows a setting only while another has a value. Here the
server's address shows while syncing is on. `check(fn)` checks a value
before it is set. A value it refuses is not set, and the reader sees
the translation of the key it returns. Screens of your
own that list settings open them as the settings pages do with
`ui::setting_opens` (its editor, the keyboard for text, the list of a
choice's values); text typed there comes back to the kernel as
`events::SETTING_TYPED`, which sets it. They lay their rows out as the
settings pages do, so that no title is cut for its control:
`ui::row_lines` tells once, when the list is made, whether a row's
control goes beside its title or below it and how high the row is
(`ui::setting_height` the height alone), and `ui::draw_number_lines`,
`ui::draw_stepper_lines`, `ui::draw_switch_lines` and
`ui::draw_setting_row` draw it there (`RowLines::at` moves it to the
row's place).
