`src/lib.rs`:

```rust
//! Settings of a plugin's own, in a group of its own, and a widget that
//! shows what they say: a motto, typed in (`text`), shown plain or in
//! quotes (`choice`), in capitals or not (`switch`), on at most so many
//! lines (`number`). The settings screen lists the group; the kernel
//! keeps the values; `env.settings.read` reads them; a widget is read
//! anew (`update`) when a setting changes.

#![no_std]

extern crate alloc;

use alloc::borrow::Cow;
use alloc::boxed::Box;
use alloc::format;
use alloc::string::String;

use paperpaw_sdk::setting::{Setting, Text};
use paperpaw_sdk::ui::UiStyle;
use paperpaw_sdk::widgets::{self, Align, Frame, Padding, Size, Widget, WidgetSpec, Wrapped};
use paperpaw_sdk::{
    Canvas, Choices, Env, Id, Manifest, Plugin, Rect, RegisterError, Registrar, SettingGroupSpec,
    SettingSpec, Version,
};

/// Ids start with the plugin's id: `motto.…`.
pub const PLUGIN: Id = Id::new_static("motto");
/// Its group of settings, listed in the settings by its title.
pub const GROUP: Id = Id::new_static("motto.group");
/// The widget.
pub const WIDGET: Id = Id::new_static("motto.widget");
/// The settings, each by its id and the type of its value.
pub const TEXT: Setting<Text> = Setting::new("motto.text");
pub const STYLE: Setting<Text> = Setting::new("motto.style");
pub const CAPITALS: Setting<bool> = Setting::new("motto.capitals");
pub const LINES: Setting<i64> = Setting::new("motto.lines");
/// The choices of `STYLE`, each the translation key of its name.
static STYLES: [&str; 2] = ["motto.style.plain", "motto.style.quoted"];

/// The widget's look, as every widget has it.
static LOOK: [SettingSpec; 4] = [
    widgets::frame_spec("motto.widget.frame", WIDGET, Frame::None),
    widgets::padding_spec("motto.widget.padding", WIDGET, Padding::Auto),
    widgets::size_spec("motto.widget.size", WIDGET, Size::Medium, false),
    widgets::align_spec("motto.widget.align", WIDGET, Align::Center),
];

/// The plugin.
#[derive(Debug, Default)]
pub struct Motto;

/// How it works, by language (see `Manifest::how`).
static HOW: [(&str, &str); 1] = [("en", include_str!("../how/en.txt"))];

impl Plugin for Motto {
    fn manifest(&self) -> Manifest {
        Manifest::new(PLUGIN, "Motto", Version::new(0, 1, 0))
            .description("A motto of your own as a widget.")
            .how(&HOW)
            .uses(paperpaw_sdk::Uses::NOTHING)
    }

    fn register(&self, r: &mut Registrar) -> Result<(), RegisterError> {
        // The group, then each setting in it: its title and help are
        // translation keys; the last values are the defaults.
        r.add_setting_group(SettingGroupSpec::new(GROUP, "motto.title"))?;
        r.add_setting(
            SettingSpec::text(&TEXT, "motto.setting.text", "Read a little every day")
                .group(GROUP)
                .description("motto.setting.text.help"),
        )?;
        r.add_setting(
            SettingSpec::choice(&STYLE, "motto.setting.style", Choices::from(&STYLES[..]), STYLES[0])
                .group(GROUP),
        )?;
        r.add_setting(SettingSpec::switch(&CAPITALS, "motto.setting.capitals", false).group(GROUP))?;
        r.add_setting(SettingSpec::number(&LINES, "motto.setting.lines", 1, 6, 3).group(GROUP))?;

        r.add_setting_group(widgets::settings_group(&WIDGET, "motto.widget"))?;
        r.add_settings(&LOOK)?;
        r.add_widget(
            WidgetSpec::new(WIDGET, "motto.widget", |_| Box::new(Shown::default()))
                .category(widgets::categories::PERSONAL),
        )?;
        r.add_translations(Cow::Borrowed(include_str!("../i18n/en.ini")))?;
        Ok(())
    }
}

/// The motto as the settings say it now.
fn motto(env: &Env<'_>) -> String {
    let text = env.settings.read(&TEXT).trim();
    let text = if env.settings.read(&STYLE) == STYLES[1] {
        format!("“{text}”")
    } else {
        String::from(text)
    };
    if env.settings.read(&CAPITALS) {
        text.to_uppercase()
    } else {
        text
    }
}

/// The widget: the motto, read anew when a setting changes.
#[derive(Default)]
struct Shown {
    text: String,
}

impl Shown {
    fn size(env: &Env<'_>) -> f32 {
        widgets::size(env, WIDGET.as_str()).text(&UiStyle::new(env))
    }

    /// At most as many lines as its setting says.
    fn most(env: &Env<'_>) -> u16 {
        let lines = env.settings.read(&LINES).clamp(1, 6) as u16;
        widgets::line_height(env, Self::size(env)) * lines
    }
}

impl Widget for Shown {
    fn update(&mut self, env: &Env<'_>) -> bool {
        let now = motto(env);
        let changed = now != self.text;
        self.text = now;
        changed
    }

    fn live(&self) -> bool {
        false
    }

    fn height(&self, env: &Env<'_>, width: u16) -> u16 {
        Wrapped::new(env, &motto(env), Self::size(env), width, Self::most(env)).height(env)
    }

    fn draw(&self, canvas: &mut Canvas<'_>, env: &Env<'_>, area: Rect) {
        let look = widgets::draw_frame(canvas, env, WIDGET.as_str(), area);
        let inside = look.area;
        let room = inside.height.min(Self::most(env));
        let wrapped = Wrapped::new(env, &self.text, Self::size(env), inside.width, room);
        wrapped.draw(canvas, env, inside, widgets::align(env, WIDGET.as_str()), look.ink);
    }
}
```

`Cargo.toml`:

```toml
[package]
name = "motto"
version = "0.1.0"

[package.metadata.paperpaw]
plugin = "Motto"

[dependencies]
paperpaw-sdk = "0.4"
```

`plugin/plugin.ini`:

```ini
[plugin]
id = motto
name = Motto
description = A motto of your own as a widget.
version = 0.1.0
```

`i18n/en.ini`:

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
motto.plugin.name = Motto
motto.plugin.description = A motto of your own as a widget.
motto.title = Motto
motto.widget = Motto
motto.setting.text = Words
motto.setting.text.help = What the widget says.
motto.setting.style = Style
motto.style.plain = Plain
motto.style.quoted = In quotes
motto.setting.capitals = In capitals
motto.setting.lines = Lines at most
```

`how/en.txt`:

```text
A widget with a motto of your own. Set its words and how it looks in the settings, under Motto.
```
