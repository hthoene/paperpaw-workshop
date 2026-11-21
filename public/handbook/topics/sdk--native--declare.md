```rust
pub enum paperpaw_sdk::native::declare::BookDataKind
pub paperpaw_sdk::native::declare::BookDataKind::Cache
pub paperpaw_sdk::native::declare::BookDataKind::UserData
pub enum paperpaw_sdk::native::declare::DeclareError
pub paperpaw_sdk::native::declare::DeclareError::Choices
pub paperpaw_sdk::native::declare::DeclareError::Default
pub paperpaw_sdk::native::declare::DeclareError::Empty(&'static str)
pub paperpaw_sdk::native::declare::DeclareError::Encode(i32)
pub paperpaw_sdk::native::declare::DeclareError::NoMemory
pub paperpaw_sdk::native::declare::DeclareError::Range
pub paperpaw_sdk::native::declare::DeclareError::SecretScoped
pub paperpaw_sdk::native::declare::DeclareError::Sink(i32)
pub paperpaw_sdk::native::declare::DeclareError::TooLong(&'static str)
pub const fn paperpaw_sdk::native::declare::DeclareError::to_error(self) -> paperpaw_sdk::native::Error
pub fn paperpaw_sdk::native::declare::DeclareError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub enum paperpaw_sdk::native::declare::EditorDecl<'a>
pub paperpaw_sdk::native::declare::EditorDecl::Screen(&'a str)
pub paperpaw_sdk::native::declare::EditorDecl::Slot(&'a str)
pub enum paperpaw_sdk::native::declare::EntryPlacement<'a>
pub paperpaw_sdk::native::declare::EntryPlacement::After(&'a str)
pub paperpaw_sdk::native::declare::EntryPlacement::Before(&'a str)
pub paperpaw_sdk::native::declare::EntryPlacement::First
pub paperpaw_sdk::native::declare::EntryPlacement::InSection(&'a str)
pub paperpaw_sdk::native::declare::EntryPlacement::Last
pub paperpaw_sdk::native::declare::EntryPlacement::Order
pub enum paperpaw_sdk::native::declare::EventKind
pub paperpaw_sdk::native::declare::EventKind::ActionRun
pub paperpaw_sdk::native::declare::EventKind::BatteryMeasured
pub paperpaw_sdk::native::declare::EventKind::BookClosed
pub paperpaw_sdk::native::declare::EventKind::BookFinished
pub paperpaw_sdk::native::declare::EventKind::BookMoved
pub paperpaw_sdk::native::declare::EventKind::BookOpened
pub paperpaw_sdk::native::declare::EventKind::BookRemoved
pub paperpaw_sdk::native::declare::EventKind::Broadcast
pub paperpaw_sdk::native::declare::EventKind::ChargeChanged
pub paperpaw_sdk::native::declare::EventKind::DocumentChanged
pub paperpaw_sdk::native::declare::EventKind::DocumentClosed
pub paperpaw_sdk::native::declare::EventKind::FirmwareChanged
pub paperpaw_sdk::native::declare::EventKind::HttpDone
pub paperpaw_sdk::native::declare::EventKind::HttpProgress
pub paperpaw_sdk::native::declare::EventKind::ImageReady
pub paperpaw_sdk::native::declare::EventKind::InstallDone
pub paperpaw_sdk::native::declare::EventKind::LibraryChanged
pub paperpaw_sdk::native::declare::EventKind::LookupReady
pub paperpaw_sdk::native::declare::EventKind::NetworkIdle
pub paperpaw_sdk::native::declare::EventKind::NetworkWanted
pub paperpaw_sdk::native::declare::EventKind::PageTurned
pub paperpaw_sdk::native::declare::EventKind::PluginAnswered
pub paperpaw_sdk::native::declare::EventKind::PluginsChanged
pub paperpaw_sdk::native::declare::EventKind::PluginsRequested
pub paperpaw_sdk::native::declare::EventKind::PowerChanged
pub paperpaw_sdk::native::declare::EventKind::PreviewChanged
pub paperpaw_sdk::native::declare::EventKind::RegistryChanged
pub paperpaw_sdk::native::declare::EventKind::Resume
pub paperpaw_sdk::native::declare::EventKind::ScreenReady
pub paperpaw_sdk::native::declare::EventKind::ScreenShown
pub paperpaw_sdk::native::declare::EventKind::ServedRequest
pub paperpaw_sdk::native::declare::EventKind::Server
pub paperpaw_sdk::native::declare::EventKind::SettingChanged
pub paperpaw_sdk::native::declare::EventKind::Socket
pub paperpaw_sdk::native::declare::EventKind::Spoken
pub paperpaw_sdk::native::declare::EventKind::StackChanged
pub paperpaw_sdk::native::declare::EventKind::Started
pub paperpaw_sdk::native::declare::EventKind::StatusChanged
pub paperpaw_sdk::native::declare::EventKind::Stopping
pub paperpaw_sdk::native::declare::EventKind::Suspend
pub paperpaw_sdk::native::declare::EventKind::Tick
pub paperpaw_sdk::native::declare::EventKind::WidgetChanged
pub paperpaw_sdk::native::declare::EventKind::WifiChanged
pub paperpaw_sdk::native::declare::EventKind::WifiDone
pub paperpaw_sdk::native::declare::EventKind::WifiScanned
pub paperpaw_sdk::native::declare::EventKind::WorkAllowed
pub paperpaw_sdk::native::declare::EventKind::WorkDue
pub paperpaw_sdk::native::declare::EventKind::WorkRefused
pub enum paperpaw_sdk::native::declare::HintRow
pub paperpaw_sdk::native::declare::HintRow::Hidden
pub paperpaw_sdk::native::declare::HintRow::OnPress
pub paperpaw_sdk::native::declare::HintRow::Shown
pub enum paperpaw_sdk::native::declare::InputKind
pub paperpaw_sdk::native::declare::InputKind::Gesture
pub paperpaw_sdk::native::declare::InputKind::Input
pub enum paperpaw_sdk::native::declare::Instances
pub paperpaw_sdk::native::declare::Instances::Many
pub paperpaw_sdk::native::declare::Instances::PerParams
pub paperpaw_sdk::native::declare::Instances::Single
pub enum paperpaw_sdk::native::declare::Kind<'a>
pub paperpaw_sdk::native::declare::Kind::Bool(bool)
pub paperpaw_sdk::native::declare::Kind::Choice
pub paperpaw_sdk::native::declare::Kind::Choice::choices: &'a [&'a str]
pub paperpaw_sdk::native::declare::Kind::Choice::default: &'a str
pub paperpaw_sdk::native::declare::Kind::Int
pub paperpaw_sdk::native::declare::Kind::Int::default: i64
pub paperpaw_sdk::native::declare::Kind::Int::max: i32
pub paperpaw_sdk::native::declare::Kind::Int::min: i32
pub paperpaw_sdk::native::declare::Kind::Language(&'a str)
pub paperpaw_sdk::native::declare::Kind::List(&'a str)
pub paperpaw_sdk::native::declare::Kind::Text(&'a str)
pub enum paperpaw_sdk::native::declare::SetupPage<'a>
pub paperpaw_sdk::native::declare::SetupPage::Screen(&'a str)
pub paperpaw_sdk::native::declare::SetupPage::Setting(&'a str)
pub enum paperpaw_sdk::native::declare::StatusBar
pub paperpaw_sdk::native::declare::StatusBar::Default
pub paperpaw_sdk::native::declare::StatusBar::Hide
pub paperpaw_sdk::native::declare::StatusBar::Show
pub enum paperpaw_sdk::native::declare::WidgetLayout
pub paperpaw_sdk::native::declare::WidgetLayout::Grid
pub paperpaw_sdk::native::declare::WidgetLayout::Stack
pub struct paperpaw_sdk::native::declare::ActionDecl<'a>
pub fn paperpaw_sdk::native::declare::ActionDecl<'a>::new(&'a str, &'a str, u32) -> Self
pub paperpaw_sdk::native::declare::ActionDecl::name: &'a str
pub paperpaw_sdk::native::declare::ActionDecl::needs_screen: bool
pub paperpaw_sdk::native::declare::ActionDecl::title: &'a str
pub paperpaw_sdk::native::declare::ActionDecl::token: u32
pub struct paperpaw_sdk::native::declare::BookFieldDecl<'a>(_)
pub const fn paperpaw_sdk::native::declare::BookFieldDecl<'a>::in_catalog(self) -> Self
pub fn paperpaw_sdk::native::declare::BookFieldDecl<'a>::new(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::declare::DeclareError>
pub struct paperpaw_sdk::native::declare::Declarations<F>
pub fn paperpaw_sdk::native::declare::Declarations<F>::action(&mut self, paperpaw_sdk::native::declare::ActionDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::extra(&mut self, paperpaw_sdk::native::declare::ExtraDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::font_extension(&mut self, paperpaw_sdk::native::declare::FontExtensionDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::font_face(&mut self, paperpaw_sdk::native::declare::FontFaceDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::group(&mut self, paperpaw_sdk::native::declare::GroupDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::hyphenation(&mut self, &str, &str) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::declare::Declarations<F>::len(&self) -> usize
pub fn paperpaw_sdk::native::declare::Declarations<F>::new(F) -> Self
pub fn paperpaw_sdk::native::declare::Declarations<F>::screen(&mut self, paperpaw_sdk::native::declare::ScreenDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::spec(&mut self, paperpaw_sdk::native::declare::SpecDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::submit(&mut self) -> core::result::Result<(), paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::book_badge(&mut self, &str, u32) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::book_data(&mut self, &str, paperpaw_sdk::native::declare::BookDataKind) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::book_field(&mut self, paperpaw_sdk::native::declare::BookFieldDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::describe_item(&mut self, &str, &str) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::hide_menu_entry(&mut self, &str, &str) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::icon(&mut self, &str, &str) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::menu_entry(&mut self, paperpaw_sdk::native::declare::MenuEntryDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::menu_need(&mut self, &str, paperpaw_sdk::MenuNeed) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::menu_section(&mut self, paperpaw_sdk::native::declare::MenuSectionDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::format(&mut self, paperpaw_sdk::native::declare::FormatDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::help_hint(&mut self, paperpaw_sdk::native::declare::HelpHintDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::input(&mut self, paperpaw_sdk::native::declare::InputDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::status_item(&mut self, paperpaw_sdk::native::declare::StatusItemDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::status_line(&mut self, paperpaw_sdk::native::declare::StatusLineDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::status_place(&mut self, paperpaw_sdk::native::declare::StatusPlaceDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::widget(&mut self, paperpaw_sdk::native::declare::WidgetDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::widget_place(&mut self, paperpaw_sdk::native::declare::WidgetPlaceDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::key_binding(&mut self, paperpaw_sdk::native::declare::KeyBindingDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::preset(&mut self, paperpaw_sdk::native::declare::PresetDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::preset_value(&mut self, paperpaw_sdk::native::declare::PresetValueDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::setting_choice(&mut self, &str, &str, &str) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::setting_default(&mut self, &str, paperpaw_sdk::native::settings::SettingValue<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::setup_step(&mut self, paperpaw_sdk::native::declare::SetupStepDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::slot(&mut self, paperpaw_sdk::native::declare::SlotDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::slot_offer(&mut self, paperpaw_sdk::native::declare::SlotOfferDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::lookup_provider(&mut self, paperpaw_sdk::native::declare::LookupProviderDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::reader(&mut self, paperpaw_sdk::native::declare::ReaderDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::register_draw(&mut self, u32) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::subscribe_event(&mut self, paperpaw_sdk::native::declare::EventKind, u32) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::stage(&mut self, paperpaw_sdk::native::declare::StageDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::subscribe(&mut self, paperpaw_sdk::native::declare::SubscribeDecl<'_>) -> core::result::Result<&mut Self, paperpaw_sdk::native::declare::DeclareError>
pub fn paperpaw_sdk::native::declare::Declarations<F>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::native::declare::Declarations<F>::drop(&mut self)
pub struct paperpaw_sdk::native::declare::ExtraDecl<'a>
pub fn paperpaw_sdk::native::declare::ExtraDecl<'a>::new(&'a str) -> Self
pub paperpaw_sdk::native::declare::ExtraDecl::editor: core::option::Option<paperpaw_sdk::native::declare::EditorDecl<'a>>
pub paperpaw_sdk::native::declare::ExtraDecl::follows: &'a str
pub paperpaw_sdk::native::declare::ExtraDecl::keeps_unknown: bool
pub paperpaw_sdk::native::declare::ExtraDecl::name: &'a str
pub paperpaw_sdk::native::declare::ExtraDecl::section: &'a str
pub paperpaw_sdk::native::declare::ExtraDecl::section_of_plugin: bool
pub paperpaw_sdk::native::declare::ExtraDecl::shown_if: core::option::Option<(&'a str, &'a str)>
pub paperpaw_sdk::native::declare::ExtraDecl::slider: bool
pub paperpaw_sdk::native::declare::ExtraDecl::step: i32
pub paperpaw_sdk::native::declare::ExtraDecl::unit: &'a str
pub struct paperpaw_sdk::native::declare::FontExtensionDecl<'a>
pub fn paperpaw_sdk::native::declare::FontExtensionDecl<'a>::new(&'a str, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::FontExtensionDecl::extends: &'a str
pub paperpaw_sdk::native::declare::FontExtensionDecl::name: &'a str
pub paperpaw_sdk::native::declare::FontExtensionDecl::path: &'a str
pub struct paperpaw_sdk::native::declare::FontFaceDecl<'a>
pub fn paperpaw_sdk::native::declare::FontFaceDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::FontFaceDecl::family: &'a str
pub paperpaw_sdk::native::declare::FontFaceDecl::name: &'a str
pub paperpaw_sdk::native::declare::FontFaceDecl::path: &'a str
pub paperpaw_sdk::native::declare::FontFaceDecl::priority: i32
pub paperpaw_sdk::native::declare::FontFaceDecl::role: &'a str
pub paperpaw_sdk::native::declare::FontFaceDecl::style: u32
pub paperpaw_sdk::native::declare::FontFaceDecl::weight: u32
pub struct paperpaw_sdk::native::declare::FormatDecl<'a>
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::asks(self) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::folder(self) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::new(&'a str, &'a str, &'a str, u32) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::prepared(self) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::priority(self, i32) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::siblings(self) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::sniffs(self) -> Self
pub const fn paperpaw_sdk::native::declare::FormatDecl<'a>::whole_pages(self) -> Self
pub paperpaw_sdk::native::declare::FormatDecl::extensions: &'a str
pub paperpaw_sdk::native::declare::FormatDecl::name: &'a str
pub paperpaw_sdk::native::declare::FormatDecl::priority: i32
pub paperpaw_sdk::native::declare::FormatDecl::title: &'a str
pub paperpaw_sdk::native::declare::FormatDecl::token: u32
pub struct paperpaw_sdk::native::declare::GroupDecl<'a>
pub fn paperpaw_sdk::native::declare::GroupDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::GroupDecl::name: &'a str
pub paperpaw_sdk::native::declare::GroupDecl::order: i32
pub paperpaw_sdk::native::declare::GroupDecl::page: &'a str
pub paperpaw_sdk::native::declare::GroupDecl::parent: &'a str
pub paperpaw_sdk::native::declare::GroupDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::HelpHintDecl<'a>(_)
pub fn paperpaw_sdk::native::declare::HelpHintDecl<'a>::new(&'a str, &'a str, paperpaw_sdk::native::ui::HintInput) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::declare::HelpHintDecl<'a>::zone(self, paperpaw_platform::geometry::Rect) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::declare::InputDecl<'a>(_)
pub fn paperpaw_sdk::native::declare::InputDecl<'a>::need(self, paperpaw_sdk::MenuNeed) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::declare::InputDecl<'a>::new(&'a str, &'a str, paperpaw_sdk::native::declare::InputKind) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::declare::KeyBindingDecl<'a>
pub const fn paperpaw_sdk::native::declare::KeyBindingDecl<'a>::new(&'a str, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::KeyBindingDecl::action: &'a str
pub paperpaw_sdk::native::declare::KeyBindingDecl::input: &'a str
pub paperpaw_sdk::native::declare::KeyBindingDecl::layer: &'a str
pub paperpaw_sdk::native::declare::KeyBindingDecl::when_key: &'a str
pub paperpaw_sdk::native::declare::KeyBindingDecl::when_value: &'a str
pub struct paperpaw_sdk::native::declare::LookupProviderDecl<'a>
pub const fn paperpaw_sdk::native::declare::LookupProviderDecl<'a>::languages(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::declare::LookupProviderDecl<'a>::new(&'a str, &'a str, u32) -> Self
pub const fn paperpaw_sdk::native::declare::LookupProviderDecl<'a>::online(self) -> Self
pub paperpaw_sdk::native::declare::LookupProviderDecl::languages: &'a str
pub paperpaw_sdk::native::declare::LookupProviderDecl::name: &'a str
pub paperpaw_sdk::native::declare::LookupProviderDecl::network: bool
pub paperpaw_sdk::native::declare::LookupProviderDecl::title: &'a str
pub paperpaw_sdk::native::declare::LookupProviderDecl::token: u32
pub struct paperpaw_sdk::native::declare::MenuEntryDecl<'a>
pub const fn paperpaw_sdk::native::declare::MenuEntryDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::MenuEntryDecl::item: &'a str
pub paperpaw_sdk::native::declare::MenuEntryDecl::menu: &'a str
pub paperpaw_sdk::native::declare::MenuEntryDecl::order: i16
pub paperpaw_sdk::native::declare::MenuEntryDecl::place: paperpaw_sdk::native::declare::EntryPlacement<'a>
pub struct paperpaw_sdk::native::declare::MenuSectionDecl<'a>
pub const fn paperpaw_sdk::native::declare::MenuSectionDecl<'a>::new(&'a str, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::MenuSectionDecl::menu: &'a str
pub paperpaw_sdk::native::declare::MenuSectionDecl::name: &'a str
pub paperpaw_sdk::native::declare::MenuSectionDecl::order: i16
pub paperpaw_sdk::native::declare::MenuSectionDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::PresetDecl<'a>
pub const fn paperpaw_sdk::native::declare::PresetDecl<'a>::new(&'a str, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::PresetDecl::help: &'a str
pub paperpaw_sdk::native::declare::PresetDecl::kind: &'a str
pub paperpaw_sdk::native::declare::PresetDecl::name: &'a str
pub paperpaw_sdk::native::declare::PresetDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::PresetValueDecl<'a>
pub const fn paperpaw_sdk::native::declare::PresetValueDecl<'a>::new(&'a str, &'a str, paperpaw_sdk::native::settings::SettingValue<'a>) -> Self
pub paperpaw_sdk::native::declare::PresetValueDecl::key: &'a str
pub paperpaw_sdk::native::declare::PresetValueDecl::preset: &'a str
pub paperpaw_sdk::native::declare::PresetValueDecl::value: paperpaw_sdk::native::settings::SettingValue<'a>
pub struct paperpaw_sdk::native::declare::ReaderDecl<'a>
pub const fn paperpaw_sdk::native::declare::ReaderDecl<'a>::formats(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::declare::ReaderDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::ReaderDecl::formats: &'a str
pub paperpaw_sdk::native::declare::ReaderDecl::name: &'a str
pub paperpaw_sdk::native::declare::ReaderDecl::screen: &'a str
pub struct paperpaw_sdk::native::declare::ScreenDecl<'a>
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::dims_below(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::grays(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::guards(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::hints(self, paperpaw_sdk::native::declare::HintRow) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::hints_hidden(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::holds_edges(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::instances(self, paperpaw_sdk::native::declare::Instances) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::overlay(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::secret(self) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::status_bar(self, paperpaw_sdk::native::declare::StatusBar) -> Self
pub const fn paperpaw_sdk::native::declare::ScreenDecl<'_>::waits_ready(self) -> Self
pub fn paperpaw_sdk::native::declare::ScreenDecl<'a>::new(&'a str, &'a str, u32) -> Self
pub paperpaw_sdk::native::declare::ScreenDecl::full_refresh_on_open: bool
pub paperpaw_sdk::native::declare::ScreenDecl::name: &'a str
pub paperpaw_sdk::native::declare::ScreenDecl::title: &'a str
pub paperpaw_sdk::native::declare::ScreenDecl::token: u32
pub struct paperpaw_sdk::native::declare::SetupStepDecl<'a>
pub const fn paperpaw_sdk::native::declare::SetupStepDecl<'a>::new(&'a str, &'a str, paperpaw_sdk::native::declare::SetupPage<'a>) -> Self
pub paperpaw_sdk::native::declare::SetupStepDecl::applies: bool
pub paperpaw_sdk::native::declare::SetupStepDecl::applies_key: &'a str
pub paperpaw_sdk::native::declare::SetupStepDecl::applies_value: &'a str
pub paperpaw_sdk::native::declare::SetupStepDecl::help: &'a str
pub paperpaw_sdk::native::declare::SetupStepDecl::name: &'a str
pub paperpaw_sdk::native::declare::SetupStepDecl::need: core::option::Option<paperpaw_sdk::MenuNeed>
pub paperpaw_sdk::native::declare::SetupStepDecl::order: i32
pub paperpaw_sdk::native::declare::SetupStepDecl::page: paperpaw_sdk::native::declare::SetupPage<'a>
pub paperpaw_sdk::native::declare::SetupStepDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::SlotDecl<'a>
pub const fn paperpaw_sdk::native::declare::SlotDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::SlotDecl::name: &'a str
pub paperpaw_sdk::native::declare::SlotDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::SlotOfferDecl<'a>
pub const fn paperpaw_sdk::native::declare::SlotOfferDecl<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::SlotOfferDecl::priority: i32
pub paperpaw_sdk::native::declare::SlotOfferDecl::screen: &'a str
pub paperpaw_sdk::native::declare::SlotOfferDecl::slot: &'a str
pub struct paperpaw_sdk::native::declare::SpecDecl<'a>
pub fn paperpaw_sdk::native::declare::SpecDecl<'a>::new(&'a str, paperpaw_sdk::native::declare::Kind<'a>, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::declare::SpecDecl::advanced: bool
pub paperpaw_sdk::native::declare::SpecDecl::group: &'a str
pub paperpaw_sdk::native::declare::SpecDecl::guarded: bool
pub paperpaw_sdk::native::declare::SpecDecl::help: &'a str
pub paperpaw_sdk::native::declare::SpecDecl::kept_on_reset: bool
pub paperpaw_sdk::native::declare::SpecDecl::kind: paperpaw_sdk::native::declare::Kind<'a>
pub paperpaw_sdk::native::declare::SpecDecl::name: &'a str
pub paperpaw_sdk::native::declare::SpecDecl::scoped: bool
pub paperpaw_sdk::native::declare::SpecDecl::secret: bool
pub paperpaw_sdk::native::declare::SpecDecl::title: &'a str
pub struct paperpaw_sdk::native::declare::StageDecl<'a>
pub fn paperpaw_sdk::native::declare::StageDecl<'a>::changes_layout(self) -> Self
pub fn paperpaw_sdk::native::declare::StageDecl<'a>::draws(self) -> Self
pub fn paperpaw_sdk::native::declare::StageDecl<'a>::new(&'a str, u32, u32, u32, u32) -> Self
pub fn paperpaw_sdk::native::declare::StageDecl<'a>::takes_taps(self) -> Self
pub struct paperpaw_sdk::native::declare::StatusItemDecl<'a>(_)
pub const fn paperpaw_sdk::native::declare::StatusItemDecl<'a>::min_width(self, u32) -> Self
pub fn paperpaw_sdk::native::declare::StatusItemDecl<'a>::new(&'a str, &'a str, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::declare::StatusItemDecl<'a>::priority(self, u8) -> Self
pub const fn paperpaw_sdk::native::declare::StatusItemDecl<'a>::private(self) -> Self
pub fn paperpaw_sdk::native::declare::StatusItemDecl<'a>::tap(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::declare::StatusLineDecl<'a>(_)
pub fn paperpaw_sdk::native::declare::StatusLineDecl<'a>::new(&'a str, &'a str, u32, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::declare::StatusLineDecl<'a>::private(self) -> Self
pub struct paperpaw_sdk::native::declare::StatusPlaceDecl<'a>(_)
pub fn paperpaw_sdk::native::declare::StatusPlaceDecl<'a>::new(&'a str, &'a str, &'a str, &'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::declare::SubscribeDecl<'a>
pub fn paperpaw_sdk::native::declare::SubscribeDecl<'a>::new(&'a str, u32) -> Self
pub fn paperpaw_sdk::native::declare::SubscribeDecl<'a>::order(self, i16) -> Self
pub fn paperpaw_sdk::native::declare::SubscribeDecl<'a>::signature(self, u64) -> Self
pub struct paperpaw_sdk::native::declare::WidgetDecl<'a>(_)
pub const fn paperpaw_sdk::native::declare::WidgetDecl<'a>::cells(self, u8, u8) -> Self
pub const fn paperpaw_sdk::native::declare::WidgetDecl<'a>::live(self) -> Self
pub const fn paperpaw_sdk::native::declare::WidgetDecl<'a>::min_cells(self, u8, u8) -> Self
pub fn paperpaw_sdk::native::declare::WidgetDecl<'a>::new(&'a str, &'a str, &'a str, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::declare::WidgetDecl<'a>::previews(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::declare::WidgetDecl<'a>::private(self) -> Self
pub const fn paperpaw_sdk::native::declare::WidgetDecl<'a>::square(self) -> Self
pub struct paperpaw_sdk::native::declare::WidgetPlaceDecl<'a>(_)
pub fn paperpaw_sdk::native::declare::WidgetPlaceDecl<'a>::new(&'a str, &'a str, &'a str, paperpaw_sdk::native::declare::WidgetLayout) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::declare::WidgetPlaceDecl<'a>::shown_if(self, &'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const paperpaw_sdk::native::declare::BATCH_MAX_BYTES: usize
pub const paperpaw_sdk::native::declare::BATCH_MAX_RECORDS: usize
pub const paperpaw_sdk::native::declare::CHOICES_MAX_VALUES: usize
pub const paperpaw_sdk::native::declare::CHOICE_MAX_BYTES: usize
```
