//! A widget that shows a text fetched from the web as JSON: here a quote
//! of the day from `https://quotes.example.org/api/today`, which answers
//! `{"quote": "…", "author": "…"}`. Everything such a widget needs:
//!
//! - the plugin, which says it uses the network (`Uses::NETWORK`);
//! - the widget (`Widget`, `WidgetSpec`, `add_widget`) with its look, as
//!   every widget has it (frame, room, text size, alignment);
//! - the request (`Command::Http`) when PaperPaw starts and wakes, and
//!   again later (`Command::Work`, only while there is a network);
//! - the reply, an event of the plugin's own (`Event<HttpReply>`): its
//!   JSON read (`json::object`, `json::text`), kept, and the widget told
//!   (`widgets::changed`);
//! - the text drawn wrapped in the widget's room (`Wrapped`).

#![no_std]

extern crate alloc;

use alloc::borrow::Cow;
use alloc::boxed::Box;
use alloc::format;
use alloc::rc::Rc;
use alloc::string::String;
use core::cell::RefCell;
use core::time::Duration;

use paperpaw_sdk::builtin::events;
use paperpaw_sdk::event::Event;
use paperpaw_sdk::replies::HttpReply;
use paperpaw_sdk::ui::UiStyle;
use paperpaw_sdk::widgets::{self, Align, Frame, Padding, Size, Widget, WidgetSpec, Wrapped};
use paperpaw_sdk::work::{Moments, Work};
use paperpaw_sdk::{
    Canvas, Command, Env, HttpRequest, Id, Manifest, Plugin, Rect, RegisterError, Registrar,
    SettingSpec, Version, json,
};

/// Ids start with the plugin's id: `quote.…`.
pub const PLUGIN: Id = Id::new_static("quote");
/// The widget.
pub const WIDGET: Id = Id::new_static("quote.today");
/// Where the text comes from.
const URL: &str = "https://quotes.example.org/api/today";
/// The reply to the request: an event of the plugin's own.
const FETCHED: Event<HttpReply> = Event::new("quote.fetched");
/// Time to fetch it again.
const DUE: Event<()> = Event::new("quote.due");
/// How often, at most.
const EVERY: Duration = Duration::from_secs(6 * 60 * 60);

/// The widget's look, as every widget has it: its frame, its room, its
/// text size and alignment (`<widget>.frame` …, read by `draw_frame`).
static LOOK: [SettingSpec; 4] = [
    widgets::frame_spec("quote.today.frame", WIDGET, Frame::None),
    widgets::padding_spec("quote.today.padding", WIDGET, Padding::Auto),
    widgets::size_spec("quote.today.size", WIDGET, Size::Medium, false),
    widgets::align_spec("quote.today.align", WIDGET, Align::Center),
];

/// What the handlers and the widget share: the text fetched last.
type Shared = Rc<RefCell<Option<String>>>;

/// Asks for the text, and for the next time: later, and only while
/// there is a network (nothing wakes the device or the radio for it).
fn fetch(out: &mut alloc::vec::Vec<Command>) {
    out.push(Command::Http(HttpRequest::new("GET", URL, FETCHED)));
    let next = Work::network(DUE.id().clone())
        .optional()
        .after(EVERY)
        .at_moments(Moments::WAKE | Moments::ONLINE);
    out.push(Command::Work(next));
}

/// The plugin.
#[derive(Debug, Default)]
pub struct Quote;

/// How it works, by language (see `Manifest::how`).
static HOW: [(&str, &str); 1] = [("en", include_str!("../how/en.txt"))];

impl Plugin for Quote {
    fn manifest(&self) -> Manifest {
        Manifest::new(PLUGIN, "Quote of the day", Version::new(0, 1, 0))
            .description("A quote of the day as a widget.")
            .how(&HOW)
            .uses(paperpaw_sdk::Uses::NETWORK)
    }

    fn register(&self, r: &mut Registrar) -> Result<(), RegisterError> {
        let shared: Shared = Rc::new(RefCell::new(None));

        // When to fetch: at the start, on waking, and when it is due.
        for event in [events::STARTED, events::RESUME, DUE] {
            r.on(event, |_, _, out| fetch(out))?;
        }
        // The reply: its JSON read, kept, the widget drawn anew.
        let kept = shared.clone();
        r.on(FETCHED, move |_, reply, out| {
            if !reply.ok() {
                return;
            }
            let members = json::object(&reply.body);
            let Some(quote) = json::text(&members, "quote") else {
                return;
            };
            let text = match json::text(&members, "author") {
                Some(author) => format!("“{quote}”\n{author}"),
                None => String::from(quote),
            };
            *kept.borrow_mut() = Some(text);
            out.push(widgets::changed(&WIDGET));
        })?;

        // The widget: its settings of look, and how it is made for a
        // screen that shows it.
        r.add_setting_group(widgets::settings_group(&WIDGET, "quote.widget"))?;
        r.add_settings(&LOOK)?;
        r.add_widget(
            WidgetSpec::new(WIDGET, "quote.widget", move |_| {
                Box::new(Today {
                    shared: shared.clone(),
                    text: None,
                })
            })
            .category(widgets::categories::WORLD),
        )?;

        r.add_translations(Cow::Borrowed(include_str!("../i18n/en.ini")))?;
        Ok(())
    }
}

/// The lines of text it has room for.
const LINES: u16 = 4;

/// The height its frame and padding take, at `width`: what the look
/// leaves of a tall area, taken from it.
fn frame_room(env: &Env<'_>, width: u16) -> u16 {
    let tall = Rect::new(0, 0, width, 1000);
    tall.height - widgets::look::look(env, WIDGET.as_str(), tall).area.height
}

/// The widget: what it shows, read in `update`, drawn in `draw`.
struct Today {
    shared: Shared,
    text: Option<String>,
}

impl Today {
    /// What it shows: the text, or that it is on its way.
    fn shown<'a>(&'a self, env: &'a Env<'_>) -> &'a str {
        match &self.text {
            Some(text) => text,
            None => env.i18n.tr("quote.waiting"),
        }
    }

    /// Its text size, as its size setting says.
    fn size(env: &Env<'_>) -> f32 {
        widgets::size(env, WIDGET.as_str()).text(&UiStyle::new(env))
    }
}

impl Widget for Today {
    /// Reads the text anew; `true` when it changed, to be drawn again.
    fn update(&mut self, _env: &Env<'_>) -> bool {
        let now = self.shared.borrow().clone();
        let changed = now != self.text;
        self.text = now;
        changed
    }

    /// It changes only when a reply comes, not each minute.
    fn live(&self) -> bool {
        false
    }

    /// Four lines of its text, and its frame: the screen lays it out
    /// before the reply comes, so its height does not follow the text.
    fn height(&self, env: &Env<'_>, width: u16) -> u16 {
        widgets::line_height(env, Self::size(env)) * LINES + frame_room(env, width)
    }

    /// Its frame, then the text wrapped inside it.
    fn draw(&self, canvas: &mut Canvas<'_>, env: &Env<'_>, area: Rect) {
        let look = widgets::draw_frame(canvas, env, WIDGET.as_str(), area);
        let inside = look.area;
        let wrapped = Wrapped::new(env, self.shown(env), Self::size(env), inside.width, inside.height);
        let align = widgets::align(env, WIDGET.as_str());
        wrapped.draw(canvas, env, inside, align, look.ink);
    }
}
