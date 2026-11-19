`src/main.rs`:

```rust
//! Motto: a widget for the home screen that shows a short text, the motto, set in its settings.
#![no_std]
#![no_main]

extern crate alloc;

use paperpaw_sdk::{
    Color, Handled,
    native::{
        Error, Host, Plugin,
        callbacks::{DrawFrame, Input},
        declare::{Declarations, DeclareError, GroupDecl, Kind, SpecDecl, WidgetDecl},
        fonts::{Font, FontRole, TextOrigin},
        registrations,
        settings::{self, SettingValue},
    },
};

/// The number the device hands back when it draws the widget.
const WIDGET: u32 = 1;

struct Motto;

fn declare(host: &Host<'_>) -> Result<(), DeclareError> {
    let mut d = Declarations::new(|batch| registrations::submit(host, batch).map_err(i32::from));
    // The widget `motto.note`, in the home screen's list of widgets, and the group of its settings.
    d.group(GroupDecl::new("note", "motto.widget"))?;
    d.widget(
        WidgetDecl::new("note", "motto.widget", "core.widgets.words", WIDGET)
            .map_err(|_| DeclareError::TooLong("widget"))?
            .cells(2, 1),
    )?;
    let mut text = SpecDecl::new("note.text", Kind::Text("Be kind to the page."), "motto.note", "motto.setting.text");
    text.help = "motto.setting.text.help";
    d.spec(text)?;
    d.submit()
}

impl Plugin for Motto {
    fn make(host: &Host<'_>) -> Result<Self, Error> {
        declare(host).map_err(DeclareError::to_error)?;
        Ok(Self)
    }

    fn draw(&mut self, host: &Host<'_>, token: u32, mut frame: DrawFrame<'_>) -> Result<(), Error> {
        if token != WIDGET {
            return Err(Error::Invalid);
        }
        // A place with no room yet (the host measuring) has nothing to draw.
        let Ok(canvas) = frame.draw_canvas() else {
            return Ok(());
        };
        let area = canvas.frame_rect();
        canvas.fill_rectangle(area, Color::WHITE)?;
        let mut scratch = [0; 128];
        let motto = match settings::read_setting(host, "motto.note.text", &mut scratch)? {
            SettingValue::Text(text) if !text.trim().is_empty() => text.trim(),
            _ => "Be kind to the page.",
        };
        let font = Font::acquire_role(host, FontRole::Ui)?;
        let origin = TextOrigin::new(area.x as f32 + 12.0, area.y + area.height as i32 / 2);
        font.render_text(&canvas, 22.0, origin, Color::BLACK, motto)?;
        font.release()
    }

    fn input(&mut self, _: &Host<'_>, _: u32, _: Input<'_>) -> Result<Handled, Error> {
        Ok(Handled::No)
    }
}

#[cfg(target_arch = "riscv32")]
const CALLS: &[u8] = include_bytes!("../native/metadata.bin");
#[cfg(target_arch = "xtensa")]
const CALLS: &[u8] = include_bytes!("../native/metadata.s3.bin");
#[cfg(not(any(target_arch = "riscv32", target_arch = "xtensa")))]
const CALLS: &[u8] = include_bytes!("../native/metadata.host.bin");

paperpaw_sdk::native_plugin!(Motto, metadata = CALLS);
```

`Cargo.toml`:

```toml
[package]
name = "motto"
version = "0.1.0"

[dependencies]
paperpaw-sdk = "0.6"
```

`native/metadata.json`:

```json
{
  "target": "esp32c3-riscv32imc-ilp32-soft-le",
  "floor": 1,
  "used": [
    {"kind": "host", "name": "heap.alloc"},
    {"kind": "host", "name": "heap.dealloc"},
    {"kind": "host", "name": "heap.realloc"},
    {"kind": "host", "name": "registrations.submit"},
    {"kind": "host", "name": "commands.submit"},
    {"kind": "host", "name": "font.acquire"},
    {"kind": "host", "name": "handle.release"},
    {"kind": "host", "name": "canvas.fill_rect"},
    {"kind": "host", "name": "text.draw"},
    {"kind": "host", "name": "settings.read"},
    {"kind": "callback", "name": "drop"},
    {"kind": "callback", "name": "dispatch_event"},
    {"kind": "callback", "name": "draw"},
    {"kind": "callback", "name": "input"}
  ],
  "services": [],
  "features": []
}
```

`plugin/plugin.ini`:

```ini
[plugin]
id = motto
name = Motto
description = A home screen widget that shows a short text of your own.
version = 0.1.0
```

`plugin/i18n/en.ini`:

```ini
[meta]
language = en
name = English
plural = one-other

[messages]
motto.plugin.name = Motto
motto.widget = Motto
motto.setting.text = Motto
motto.setting.text.help = The text the widget shows.
```

`plugin/i18n/de.ini`:

```ini
[meta]
language = de
name = Deutsch
plural = one-other

[messages]
motto.plugin.name = Leitspruch
motto.widget = Leitspruch
motto.setting.text = Leitspruch
motto.setting.text.help = Der Text, den das Widget zeigt.
```
