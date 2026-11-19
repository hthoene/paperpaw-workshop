//! Hello: a PaperPaw plugin with code, for plugin interface 7.
//!
//! It puts an entry into the tools menu that opens a screen with a greeting. A setting, the
//! name to greet, is listed in the settings; an event it listens to, a book opened, is counted
//! and shown. Start from here: `make` says what the plugin brings, `event` is told what
//! happens, `draw` paints the screen and `input` gets its keys and touches.
#![no_std]
#![no_main]

extern crate alloc;

use alloc::format;

use paperpaw_sdk::{
    Color, Handled,
    builtin::groups,
    native::{
        Error, Host, Plugin,
        callbacks::{DrawFrame, Input},
        commands::CommandSender,
        declare::{
            ActionDecl, Declarations, DeclareError, EventKind, Kind, MenuEntryDecl, ScreenDecl,
            SpecDecl,
        },
        events::{Event, Incoming, kinds},
        fonts::{Font, FontRole, TextOrigin},
        registrations,
        reply::Reply,
        settings::{self, SettingValue},
    },
};

/// The numbers the device hands back with what belongs to the screen and to the action.
const SCREEN: u32 = 1;
const OPEN: u32 = 2;
const OPENED: u32 = 3;

/// The plugin's state: what it keeps between calls. The books opened since it started.
struct Hello {
    opened: u32,
}

/// What the plugin brings: the screen, the action that opens it, where the action shows, the
/// setting and the event it hears. The ids get the plugin's id in front (`hello.screen`); the
/// titles are keys of `plugin/i18n/<language>.ini`.
fn declare(host: &Host<'_>) -> Result<(), DeclareError> {
    let mut declarations =
        Declarations::new(|batch| registrations::submit(host, batch).map_err(i32::from));
    declarations.screen(ScreenDecl::new("screen", "hello.title", SCREEN))?;
    declarations.action(ActionDecl::new("open", "hello.title", OPEN))?;
    declarations.menu_entry(MenuEntryDecl::new("core.tools", "hello.open"))?;
    // The name to greet: listed in the settings (group "other"), saved by the device.
    let group = groups::OTHER;
    let mut name = SpecDecl::new("name", Kind::Text(""), group.as_str(), "hello.setting.name");
    name.help = "hello.setting.name.help";
    declarations.spec(name)?;
    // Every reader says when a book opens.
    declarations.subscribe_event(EventKind::BookOpened, OPENED)?;
    declarations.submit()
}

impl Plugin for Hello {
    /// Called once when the plugin is loaded. A declaration the device refuses ends the load
    /// with its cause.
    fn make(host: &Host<'_>) -> Result<Self, Error> {
        declare(host).map_err(DeclareError::to_error)?;
        Ok(Self { opened: 0 })
    }

    fn event(
        &mut self,
        host: &Host<'_>,
        token: u32,
        incoming: Incoming<'_>,
        _: &mut Reply<'_>,
    ) -> Result<(), Error> {
        if token == OPENED {
            if let Some(Event::Book { .. }) = incoming.decode_as::<kinds::BookOpened>()? {
                self.opened += 1;
            }
            return Ok(());
        }
        if token == OPEN
            && let Some(Event::ActionRun {
                action: "hello.open",
                ..
            }) = incoming.decode_as::<kinds::ActionRun>()?
        {
            let mut scratch = [0; 256];
            return CommandSender::new(host, &mut scratch).open_screen("hello.screen");
        }
        Ok(())
    }

    fn draw(&mut self, host: &Host<'_>, token: u32, mut frame: DrawFrame<'_>) -> Result<(), Error> {
        if token != SCREEN {
            return Err(Error::Invalid);
        }
        let canvas = frame.draw_canvas()?;
        let area = canvas.frame_rect();
        canvas.fill_rectangle(area, Color::WHITE)?;
        let font = Font::acquire_role(host, FontRole::Ui)?;
        let origin = TextOrigin::new(area.x as f32 + 24.0, area.y + 64);
        // The setting, read when the screen is drawn: a change shows the next time it opens.
        let mut scratch = [0; 64];
        let name = match settings::read_setting(host, "hello.name", &mut scratch)? {
            SettingValue::Text(name) if !name.trim().is_empty() => name.trim(),
            _ => "someone",
        };
        let line = format!("Hello {name}, from Hello");
        font.render_text(&canvas, 24.0, origin, Color::BLACK, &line)?;
        let origin = TextOrigin::new(area.x as f32 + 24.0, area.y + 104);
        let line = format!("Books opened since the start: {}", self.opened);
        font.render_text(&canvas, 24.0, origin, Color::BLACK, &line)?;
        font.release()
    }

    fn input(&mut self, _: &Host<'_>, _: u32, _: Input<'_>) -> Result<Handled, Error> {
        // Not handled: the device's own keys (back, home) keep working.
        Ok(Handled::No)
    }
}

// What the plugin calls of the device, as the record the packer puts into its file: one for
// each chip and one for the emulator, all made from `native/metadata.json` by
// `paperpaw-dev metadata` (and by `paperpaw-dev build`). A call that is not listed is refused.
#[cfg(target_arch = "riscv32")]
const CALLS: &[u8] = include_bytes!("../native/metadata.bin");
#[cfg(target_arch = "xtensa")]
const CALLS: &[u8] = include_bytes!("../native/metadata.s3.bin");
#[cfg(not(any(target_arch = "riscv32", target_arch = "xtensa")))]
const CALLS: &[u8] = include_bytes!("../native/metadata.host.bin");

// The plugin's entry, its heap and its panic handler.
paperpaw_sdk::native_plugin!(Hello, metadata = CALLS);
