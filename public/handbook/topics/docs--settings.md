### Settings

A setting is a constant with its id and the type of its value
(`Setting<bool>`, `Setting<i64>` or `Setting<Text>` for choices,
languages, lists and text):

```rust
pub const NAME: Setting<Text> = Setting::new("hello.name");

r.add_setting(
    SettingSpec::text(&NAME, "hello.setting.name", "")
        .group(groups::OTHER)
        .description("hello.setting.name.help"),
)?;

let name: &str = env.settings.read(&NAME);
out.push(Command::set(&NAME, "Ada".into()));
```

`SettingSpec::switch`, `number`, `choice`, `language`, `list` and
`text` make the others, their defaults of the setting's type. The
settings screens list every setting by its group, with its description
below it; the kernel saves changes to `paperpaw.ini`. Settings can be
numbers with units and steps, switches, choices, languages or text;
`advanced()` hides rarely needed ones, `scoped()` lets one be set per
book, `editor(screen)` opens a screen of your own instead. Settings
known only at run time (one per widget, say) are read by their ids,
`env.settings.text("…")` and so on. Passwords and keys do not belong in
settings: see [Passwords and keys](#passwords-and-keys).

Each setting built this way takes about 200 bytes while the device
runs. A plugin with many settings keeps them in the program instead, in
a `static` list (on the X4 it stays in flash, next to no memory):

```rust
const GROUP: Id = Id::new_static("hello.clock");
static SETTINGS: [SettingSpec; 2] = [
    SettingSpec::fixed_switch("hello.clock.date", "hello.setting.date", true, GROUP),
    SettingSpec::fixed_choice("hello.clock.face", "hello.setting.face",
        &["hello.face.plain", "hello.face.ticks"], "hello.face.ticks", GROUP)
        .described("hello.setting.face.help"),
];

r.add_settings(&SETTINGS)?;
```

Such settings are read like any other; those that need a unit, a step,
a section or an editor screen are made as above.

A setting may show only while another has a value
(`SettingExtra::shown_if("hello.sync", "on")`, the server's address
while syncing is on), and check a value before it is set
(`SettingExtra::check(fn)`): a value it refuses is not set, and the
reader is told the translation of the key it returns. Screens of your
own that list settings open them as the settings pages do with
`ui::setting_opens` (its editor, the keyboard for text, the list of a
choice's values); text typed there comes back to the kernel as
`events::SETTING_TYPED`, which sets it.
