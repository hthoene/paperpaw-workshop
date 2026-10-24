`src/lib.rs`:

```rust
//! A widget's settings: a motto, typed in (`text`), shown plain or in
//! quotes (`choice`), in capitals or not (`switch`), on at most so many
//! lines (`number`). Settings of a widget belong to the widget: its own
//! settings group (`widgets::settings_group`, the group's id the
//! widget's), which the home screen's widget editor opens and the
//! Settings list leaves out. The kernel keeps the values;
//! `env.settings().read` reads them; a widget is read anew (`update`) when
//! a setting changes.
//!
//! Only what applies to the whole plugin goes on a page in Settings: a
//! group of its own with an icon, under Customise by its order (201 and
//! up), e.g. `static PAGE: SettingGroupSpec = SettingGroupSpec::new(GROUP,
//! "my.title").order(210);` with `r.add_setting_group(&PAGE)?;
//! r.add_icon(GROUP, Cow::Borrowed("star"))?;`.

#![no_std]

extern crate alloc;

use alloc::borrow::Cow;
use alloc::boxed::Box;
use alloc::format;
use alloc::string::String;

use paperpaw_sdk::setting::{Setting, Text};
use paperpaw_sdk::ui::UiStyle;
use paperpaw_sdk::widgets::{self, Align, Frame, Padding, TextSize, Widget, WidgetSpec, Wrapped};
use paperpaw_sdk::{
    Canvas, Env, Id, Manifest, Plugin, Rect, RegisterError, Registrar, SettingSpec, Version,
};

/// Ids start with the plugin's id: `motto.…`.
pub const PLUGIN: Id = Id::new_static("motto");
/// The widget; its settings group has its id.
pub const WIDGET: Id = Id::new_static("motto.widget");
/// The widget's settings, each by its id (`<widget>.<key>`) and the type
/// of its value.
pub const TEXT: Setting<Text> = Setting::new("motto.widget.text");
pub const STYLE: Setting<Text> = Setting::new("motto.widget.style");
pub const CAPITALS: Setting<bool> = Setting::new("motto.widget.capitals");
pub const LINES: Setting<i64> = Setting::new("motto.widget.lines");
/// The choices of `STYLE`, each the translation key of its name.
static STYLES: [&str; 2] = ["motto.style.plain", "motto.style.quoted"];

/// The widget's settings, all in its group (the last argument): each by
/// its id, its title and its default; its help is a translation key too.
/// Then its look, as every widget has it.
static SETTINGS: [SettingSpec; 8] = [
    SettingSpec::text(TEXT.static_str(), "motto.setting.text", "Read a little every day", WIDGET)
        .description("motto.setting.text.help"),
    SettingSpec::choice(STYLE.static_str(), "motto.setting.style", &STYLES, STYLES[0], WIDGET),
    SettingSpec::switch(CAPITALS.static_str(), "motto.setting.capitals", false, WIDGET),
    SettingSpec::number(LINES.static_str(), "motto.setting.lines", 1, 6, 3, WIDGET),
    widgets::frame_spec("motto.widget.frame", WIDGET, Frame::None),
    widgets::padding_spec("motto.widget.padding", WIDGET, Padding::Auto),
    widgets::size_spec("motto.widget.size", WIDGET, TextSize::Medium, false),
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
        // The widget's settings group, then its settings in it.
        r.add_setting_group(widgets::settings_group(&WIDGET, "motto.widget"))?;
        r.add_settings(&SETTINGS)?;
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
    let text = env.settings().read(&TEXT).trim();
    let text = if env.settings().read(&STYLE) == STYLES[1] {
        format!("“{text}”")
    } else {
        String::from(text)
    };
    if env.settings().read(&CAPITALS) {
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
        let lines = env.settings().read(&LINES).clamp(1, 6) as u16;
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

    /// Its text wrapped inside its frame, and the frame.
    fn height(&self, env: &Env<'_>, width: u16) -> u16 {
        let tall = Rect::new(0, 0, width, 1000);
        let inside = widgets::widget_look(env, WIDGET.as_str(), tall).area;
        let text = Wrapped::new(env, &motto(env), Self::size(env), inside.width, Self::most(env));
        text.height(env) + (tall.height - inside.height)
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
paperpaw-sdk = "0.5"
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
A widget with a motto of your own. Place it on the home screen, then edit it there to set its words and how it looks.
```
