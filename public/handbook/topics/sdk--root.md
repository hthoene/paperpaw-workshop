```rust
pub mod paperpaw_sdk
pub use paperpaw_sdk::Arg
pub use paperpaw_sdk::Battery
pub use paperpaw_sdk::ButtonState
pub use paperpaw_sdk::Canvas
pub use paperpaw_sdk::Color
pub use paperpaw_sdk::DeviceInfo
pub use paperpaw_sdk::DirEntry
pub use paperpaw_sdk::DisplayInfo
pub use paperpaw_sdk::Font
pub use paperpaw_sdk::FontError
pub use paperpaw_sdk::InputCaps
pub use paperpaw_sdk::InputEvent
pub use paperpaw_sdk::Instant
pub use paperpaw_sdk::LineMetrics
pub use paperpaw_sdk::MemoryClass
pub use paperpaw_sdk::NoStorage
pub use paperpaw_sdk::PixelFormat
pub use paperpaw_sdk::Point
pub use paperpaw_sdk::PointerEvent
pub use paperpaw_sdk::PointerPhase
pub use paperpaw_sdk::PointerTool
pub use paperpaw_sdk::Rect
pub use paperpaw_sdk::RefreshMode
pub use paperpaw_sdk::Storage
pub use paperpaw_sdk::StorageError
pub use paperpaw_sdk::SystemStatus
pub use paperpaw_sdk::Translator
pub use paperpaw_sdk::WallClock
pub use paperpaw_sdk::round
pub mod paperpaw_sdk::annotations
pub mod paperpaw_sdk::ask
pub mod paperpaw_sdk::builtin
pub mod paperpaw_sdk::chrome
pub mod paperpaw_sdk::collections
pub type &'a paperpaw_sdk::collections::VecMap<K, V>::IntoIter = core::iter::adapters::map::Map<core::slice::iter::Iter<'a, (K, V)>, fn(&'a (K, V)) -> (&'a K, &'a V)>
pub type &'a paperpaw_sdk::collections::VecMap<K, V>::Item = (&'a K, &'a V)
pub fn &'a paperpaw_sdk::collections::VecMap<K, V>::into_iter(self) -> Self::IntoIter
pub mod paperpaw_sdk::config
pub mod paperpaw_sdk::contribution
pub mod paperpaw_sdk::data
pub fn paperpaw_platform::storage::StorageError::from(paperpaw_sdk::data::Error) -> Self
pub mod paperpaw_sdk::decorations
pub mod paperpaw_sdk::digest
pub mod paperpaw_sdk::document
pub mod paperpaw_sdk::event
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::event::Event<P>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub fn ()::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn ()::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::Params::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::Params::to_params(&self) -> paperpaw_sdk::Params
pub fn alloc::string::String::from_param(&str) -> core::option::Option<Self>
pub fn alloc::string::String::missing() -> core::option::Option<Self>
pub fn alloc::string::String::to_param(&self) -> alloc::string::String
pub fn bool::from_param(&str) -> core::option::Option<Self>
pub fn bool::missing() -> core::option::Option<Self>
pub fn bool::to_param(&self) -> alloc::string::String
pub fn f32::from_param(&str) -> core::option::Option<Self>
pub fn f32::missing() -> core::option::Option<Self>
pub fn f32::to_param(&self) -> alloc::string::String
pub fn i32::from_param(&str) -> core::option::Option<Self>
pub fn i32::missing() -> core::option::Option<Self>
pub fn i32::to_param(&self) -> alloc::string::String
pub fn i64::from_param(&str) -> core::option::Option<Self>
pub fn i64::missing() -> core::option::Option<Self>
pub fn i64::to_param(&self) -> alloc::string::String
pub fn paperpaw_sdk::Id::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::Id::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::Id::to_param(&self) -> alloc::string::String
pub fn u16::from_param(&str) -> core::option::Option<Self>
pub fn u16::missing() -> core::option::Option<Self>
pub fn u16::to_param(&self) -> alloc::string::String
pub fn u32::from_param(&str) -> core::option::Option<Self>
pub fn u32::missing() -> core::option::Option<Self>
pub fn u32::to_param(&self) -> alloc::string::String
pub fn u64::from_param(&str) -> core::option::Option<Self>
pub fn u64::missing() -> core::option::Option<Self>
pub fn u64::to_param(&self) -> alloc::string::String
pub fn u8::from_param(&str) -> core::option::Option<Self>
pub fn u8::missing() -> core::option::Option<Self>
pub fn u8::to_param(&self) -> alloc::string::String
pub fn usize::from_param(&str) -> core::option::Option<Self>
pub fn usize::missing() -> core::option::Option<Self>
pub fn usize::to_param(&self) -> alloc::string::String
pub fn core::option::Option<T>::from_param(&str) -> core::option::Option<Self>
pub fn core::option::Option<T>::missing() -> core::option::Option<Self>
pub fn core::option::Option<T>::to_param(&self) -> alloc::string::String
pub mod paperpaw_sdk::files
pub mod paperpaw_sdk::filters
pub mod paperpaw_sdk::firmware
pub mod paperpaw_sdk::host
pub mod paperpaw_sdk::http_params
pub mod paperpaw_sdk::hyphen
pub mod paperpaw_sdk::icons
pub mod paperpaw_sdk::image
pub mod paperpaw_sdk::install
pub mod paperpaw_sdk::json
pub mod paperpaw_sdk::keys
pub mod paperpaw_sdk::layers
pub mod paperpaw_sdk::library
pub mod paperpaw_sdk::logo
pub mod paperpaw_sdk::lookup
pub mod paperpaw_sdk::native
pub mod paperpaw_sdk::numbers
pub mod paperpaw_sdk::pattern
pub mod paperpaw_sdk::positions
pub mod paperpaw_sdk::power
pub mod paperpaw_sdk::presets
pub mod paperpaw_sdk::qr
pub mod paperpaw_sdk::random
pub mod paperpaw_sdk::readers
pub mod paperpaw_sdk::reading
pub mod paperpaw_sdk::replies
pub mod paperpaw_sdk::secrets
pub mod paperpaw_sdk::semantics
pub mod paperpaw_sdk::server_params
pub mod paperpaw_sdk::services
pub mod paperpaw_sdk::setting
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::setting::Setting<T>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub type bool::Input = bool
pub type bool::Value<'a> = bool
pub fn bool::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> bool
pub fn bool::write(bool) -> paperpaw_sdk::SettingValue
pub type i64::Input = i64
pub type i64::Value<'a> = i64
pub fn i64::read(core::option::Option<&paperpaw_sdk::SettingValue>) -> i64
pub fn i64::write(i64) -> paperpaw_sdk::SettingValue
pub mod paperpaw_sdk::setup
pub mod paperpaw_sdk::socket_params
pub mod paperpaw_sdk::speech_params
pub mod paperpaw_sdk::status
pub mod paperpaw_sdk::text
pub mod paperpaw_sdk::time
pub mod paperpaw_sdk::ui
pub mod paperpaw_sdk::usage
pub mod paperpaw_sdk::voices
pub mod paperpaw_sdk::web
pub mod paperpaw_sdk::widgets
pub mod paperpaw_sdk::wifi
pub mod paperpaw_sdk::words
pub mod paperpaw_sdk::work
pub mod paperpaw_sdk::xml
pub macro paperpaw_sdk::data_path!
pub macro paperpaw_sdk::event_data!
pub macro paperpaw_sdk::package_version!
pub macro paperpaw_sdk::plugin!
pub macro paperpaw_sdk::role_settings!
pub paperpaw_sdk::ActionHint::Hidden
pub paperpaw_sdk::ActionHint::Icon(&'static str)
pub paperpaw_sdk::ActionHint::Label(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::ActionHint::Title
pub paperpaw_sdk::Choices::Fixed(&'static [&'static str])
pub paperpaw_sdk::Choices::Owned(alloc::vec::Vec<alloc::borrow::Cow<'static, str>>)
pub fn paperpaw_sdk::Choices::contains(&self, &str) -> bool
pub fn paperpaw_sdk::Choices::get(&self, usize) -> core::option::Option<&str>
pub fn paperpaw_sdk::Choices::is_empty(&self) -> bool
pub fn paperpaw_sdk::Choices::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &str>
pub fn paperpaw_sdk::Choices::len(&self) -> usize
pub fn paperpaw_sdk::Choices::position(&self, &str) -> core::option::Option<usize>
pub fn paperpaw_sdk::Choices::from(&'static [&'static str]) -> Self
pub fn paperpaw_sdk::Choices::from(alloc::vec::Vec<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::Choices::from_iter<I: core::iter::traits::collect::IntoIterator<Item = alloc::borrow::Cow<'static, str>>>(I) -> Self
pub paperpaw_sdk::CloseCause::Back
pub paperpaw_sdk::CloseCause::Slot
pub paperpaw_sdk::CloseCause::TapOutside
pub paperpaw_sdk::Command::Announce(alloc::string::String)
pub paperpaw_sdk::Command::Back
pub paperpaw_sdk::Command::BackTo(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::Bind::action: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::Command::Bind::input: alloc::string::String
pub paperpaw_sdk::Command::Bind::layer: alloc::string::String
pub paperpaw_sdk::Command::BindSlot(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::Id>)
pub paperpaw_sdk::Command::Broadcast::data: alloc::vec::Vec<u8>
pub paperpaw_sdk::Command::Broadcast::events: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Broadcast::id: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Broadcast::ports: alloc::vec::Vec<u16>
pub paperpaw_sdk::Command::Broadcast::wait_ms: u32
pub paperpaw_sdk::Command::CancelHttp(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::CancelWork(paperpaw_sdk::Id, core::option::Option<alloc::string::String>)
pub paperpaw_sdk::Command::Close(paperpaw_sdk::ScreenKey)
pub paperpaw_sdk::Command::Connect::events: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Connect::host: alloc::string::String
pub paperpaw_sdk::Command::Connect::port: u16
pub paperpaw_sdk::Command::Connect::socket: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Disconnect(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::Emit(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::Firmware(paperpaw_sdk::firmware::FirmwareCommand)
pub paperpaw_sdk::Command::GoOnline
pub paperpaw_sdk::Command::Http(paperpaw_sdk::HttpRequest)
pub paperpaw_sdk::Command::Input(alloc::string::String)
pub paperpaw_sdk::Command::InstallPlugin(paperpaw_sdk::Id, alloc::string::String)
pub paperpaw_sdk::Command::LoadPlugin(alloc::string::String)
pub paperpaw_sdk::Command::NoNetwork
pub paperpaw_sdk::Command::Notify(alloc::string::String)
pub paperpaw_sdk::Command::OpenBook(paperpaw_sdk::Params)
pub paperpaw_sdk::Command::OpenInSlot(paperpaw_sdk::Id, paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::OpenScreen(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::OpenSlot(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::PreviewSettings(alloc::vec::Vec<(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::SettingValue>)>)
pub paperpaw_sdk::Command::ReadClipboard(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::Redraw(paperpaw_platform::display::RefreshMode)
pub paperpaw_sdk::Command::RemovePlugin(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::Replace(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::ResetSetting(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::Respond(paperpaw_sdk::ServerResponse)
pub paperpaw_sdk::Command::Restart
pub paperpaw_sdk::Command::RunAction(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::RunActionWith(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::RunOriginal(paperpaw_sdk::Id, paperpaw_sdk::Params)
pub paperpaw_sdk::Command::Screenshot(alloc::string::String)
pub paperpaw_sdk::Command::Serve::events: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Serve::port: u16
pub paperpaw_sdk::Command::Serve::server: paperpaw_sdk::Id
pub paperpaw_sdk::Command::SetClipboard(alloc::string::String)
pub paperpaw_sdk::Command::SetKeyLayer(paperpaw_sdk::ScreenKey, core::option::Option<paperpaw_sdk::Id>)
pub paperpaw_sdk::Command::SetMenu(paperpaw_sdk::Id, core::option::Option<alloc::vec::Vec<paperpaw_sdk::Id>>)
pub paperpaw_sdk::Command::SetPluginEnabled(paperpaw_sdk::Id, bool)
pub paperpaw_sdk::Command::SetScope(core::option::Option<alloc::string::String>)
pub paperpaw_sdk::Command::SetSecret(paperpaw_sdk::secrets::SecretChange)
pub paperpaw_sdk::Command::SetSetting(paperpaw_sdk::Id, paperpaw_sdk::SettingValue)
pub paperpaw_sdk::Command::ShowHints
pub paperpaw_sdk::Command::Sleep
pub paperpaw_sdk::Command::SocketRead::read: paperpaw_sdk::SocketRead
pub paperpaw_sdk::Command::SocketRead::socket: paperpaw_sdk::Id
pub paperpaw_sdk::Command::SocketSend::data: alloc::vec::Vec<u8>
pub paperpaw_sdk::Command::SocketSend::socket: paperpaw_sdk::Id
pub paperpaw_sdk::Command::Speak(paperpaw_sdk::Speech)
pub paperpaw_sdk::Command::StopServing(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::StopSpeaking
pub paperpaw_sdk::Command::SwitchTask(paperpaw_sdk::Id)
pub paperpaw_sdk::Command::Wear(paperpaw_sdk::power::Wear)
pub paperpaw_sdk::Command::Wifi(paperpaw_sdk::wifi::WifiCommand)
pub paperpaw_sdk::Command::Work(paperpaw_sdk::work::Work)
pub fn paperpaw_sdk::Command::bind(impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>, core::option::Option<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::Command::broadcast(paperpaw_sdk::Id, alloc::vec::Vec<u16>, alloc::vec::Vec<u8>, u32, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::Command::connect(paperpaw_sdk::Id, impl core::convert::Into<alloc::string::String>, u16, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::Command::serve(paperpaw_sdk::Id, u16, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::Command::socket_read(paperpaw_sdk::Id, paperpaw_sdk::SocketRead) -> Self
pub fn paperpaw_sdk::Command::socket_send(paperpaw_sdk::Id, alloc::vec::Vec<u8>) -> Self
pub fn paperpaw_sdk::Command::open_slot(paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::Command::set<T: paperpaw_sdk::setting::SettingType>(&paperpaw_sdk::setting::Setting<T>, <T as paperpaw_sdk::setting::SettingType>::Input) -> paperpaw_sdk::Command
pub paperpaw_sdk::Contribution::Action(alloc::boxed::Box<paperpaw_sdk::ActionSpec>)
pub paperpaw_sdk::Contribution::ActionObserver(alloc::boxed::Box<paperpaw_sdk::ObserverSpec>)
pub paperpaw_sdk::Contribution::ActionOverride(alloc::boxed::Box<paperpaw_sdk::ActionOverride>)
pub paperpaw_sdk::Contribution::BookBadge(alloc::boxed::Box<paperpaw_sdk::library::service::BookBadge>)
pub paperpaw_sdk::Contribution::BookData(paperpaw_sdk::library::BookData)
pub paperpaw_sdk::Contribution::BookField(alloc::boxed::Box<paperpaw_sdk::library::service::BookField>)
pub paperpaw_sdk::Contribution::Choice::setting: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Choice::value: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::Chrome(alloc::boxed::Box<paperpaw_sdk::chrome::ChromeSpec>)
pub paperpaw_sdk::Contribution::Decorator(alloc::boxed::Box<paperpaw_sdk::decorations::DecoratorSpec>)
pub paperpaw_sdk::Contribution::EventDeclared(alloc::boxed::Box<paperpaw_sdk::services::EventSpec>)
pub paperpaw_sdk::Contribution::EventObserver(alloc::boxed::Box<paperpaw_sdk::ObserverSpec>)
pub paperpaw_sdk::Contribution::FixedPresets(&'static [paperpaw_sdk::presets::Preset])
pub paperpaw_sdk::Contribution::FixedSettings(&'static [paperpaw_sdk::SettingSpec])
pub paperpaw_sdk::Contribution::Font(alloc::boxed::Box<paperpaw_sdk::FontSpec>)
pub paperpaw_sdk::Contribution::FontBinding::font: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::FontBinding::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::Contribution::FontBinding::role: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::FontExtension::extends: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::FontExtension::id: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::FontExtension::path: alloc::string::String
pub paperpaw_sdk::Contribution::FontFace(alloc::boxed::Box<paperpaw_sdk::FontFace>)
pub paperpaw_sdk::Contribution::FontFile::id: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::FontFile::path: alloc::string::String
pub paperpaw_sdk::Contribution::Format(alloc::boxed::Box<paperpaw_sdk::FormatSpec>)
pub paperpaw_sdk::Contribution::Gesture(alloc::boxed::Box<paperpaw_sdk::keys::GestureSpec>)
pub paperpaw_sdk::Contribution::HideMenuEntry::item: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::HideMenuEntry::menu: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Hyphenation(paperpaw_sdk::HyphenationSpec)
pub paperpaw_sdk::Contribution::Icon::icon: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::Icon::item: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Input(paperpaw_sdk::keys::InputSpec)
pub paperpaw_sdk::Contribution::InputFilter(paperpaw_sdk::filters::InputFilterSpec)
pub paperpaw_sdk::Contribution::ItemDescription::item: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::ItemDescription::key: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::ItemState::item: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::ItemState::state: paperpaw_sdk::ItemStateFn
pub paperpaw_sdk::Contribution::Keymap(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::Contribution::KeymapPreset::id: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::KeymapPreset::source: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::KeymapWhen::setting: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::KeymapWhen::source: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::LookupProvider(alloc::boxed::Box<paperpaw_sdk::lookup::LookupProviderSpec>)
pub paperpaw_sdk::Contribution::MenuEntry(paperpaw_sdk::MenuEntry)
pub paperpaw_sdk::Contribution::MenuNeed::item: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::MenuNeed::need: paperpaw_sdk::MenuNeed
pub paperpaw_sdk::Contribution::MenuSection(paperpaw_sdk::MenuSection)
pub paperpaw_sdk::Contribution::PageFrame(alloc::boxed::Box<paperpaw_sdk::layers::PageFrameSpec>)
pub paperpaw_sdk::Contribution::PageLayer(alloc::boxed::Box<paperpaw_sdk::layers::PageLayerSpec>)
pub paperpaw_sdk::Contribution::Point(alloc::boxed::Box<paperpaw_sdk::services::PointSpec>)
pub paperpaw_sdk::Contribution::Preset(alloc::boxed::Box<paperpaw_sdk::presets::Preset>)
pub paperpaw_sdk::Contribution::Published::id: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Published::service: paperpaw_sdk::services::Service
pub paperpaw_sdk::Contribution::Reader(paperpaw_sdk::readers::ReaderSpec)
pub paperpaw_sdk::Contribution::RefreshFilter(paperpaw_sdk::filters::RefreshFilterSpec)
pub paperpaw_sdk::Contribution::Screen(paperpaw_sdk::ScreenSpec)
pub paperpaw_sdk::Contribution::ScreenHints::hints: paperpaw_sdk::Hints
pub paperpaw_sdk::Contribution::ScreenHints::screen: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Service::id: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Service::service: alloc::boxed::Box<dyn core::any::Any>
pub paperpaw_sdk::Contribution::Setting(alloc::boxed::Box<paperpaw_sdk::SettingSpec>)
pub paperpaw_sdk::Contribution::SettingDefault::setting: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::SettingDefault::value: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::SettingGroup(paperpaw_sdk::SettingGroupSpec)
pub paperpaw_sdk::Contribution::SetupStep(alloc::boxed::Box<paperpaw_sdk::setup::SetupStepSpec>)
pub paperpaw_sdk::Contribution::Slot(paperpaw_sdk::SlotSpec)
pub paperpaw_sdk::Contribution::SlotBinding::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::Contribution::SlotBinding::screen: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::SlotBinding::slot: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::StatusItem(alloc::boxed::Box<paperpaw_sdk::status::StatusItemSpec>)
pub paperpaw_sdk::Contribution::StatusLine(alloc::boxed::Box<paperpaw_sdk::status::StatusLineSpec>)
pub paperpaw_sdk::Contribution::StatusPlace(alloc::boxed::Box<paperpaw_sdk::status::Place>)
pub paperpaw_sdk::Contribution::Stylesheet(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::Contribution::Subscription::event: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::Subscription::handler: paperpaw_sdk::event::EventHandler
pub paperpaw_sdk::Contribution::TextFilter(paperpaw_sdk::filters::TextFilterSpec)
pub paperpaw_sdk::Contribution::ToPoint::point: paperpaw_sdk::Id
pub paperpaw_sdk::Contribution::ToPoint::text: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Contribution::Translations(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::Contribution::UiLook::painters: &'static paperpaw_sdk::ui::look::Painters
pub paperpaw_sdk::Contribution::UiLook::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::Contribution::Voice(alloc::boxed::Box<paperpaw_sdk::voices::VoiceSpec>)
pub paperpaw_sdk::Contribution::Widget(alloc::boxed::Box<paperpaw_sdk::widgets::WidgetSpec>)
pub paperpaw_sdk::Contribution::Work(alloc::boxed::Box<paperpaw_sdk::work::WorkSpec>)
pub enum paperpaw_sdk::Direction
pub paperpaw_sdk::Direction::Down
pub paperpaw_sdk::Direction::Left
pub paperpaw_sdk::Direction::Right
pub paperpaw_sdk::Direction::Up
pub const fn paperpaw_sdk::Direction::id(self) -> &'static str
pub paperpaw_sdk::Editor::Screen(paperpaw_sdk::Id)
pub paperpaw_sdk::Editor::Slot(paperpaw_sdk::Id)
pub fn paperpaw_sdk::Editor::open(&self, &paperpaw_sdk::Id) -> paperpaw_sdk::Command
pub paperpaw_sdk::GestureKind::DoubleTap
pub paperpaw_sdk::GestureKind::LongPress
pub paperpaw_sdk::GestureKind::Pinch
pub paperpaw_sdk::GestureKind::Pinch::out: bool
pub paperpaw_sdk::GestureKind::Swipe(paperpaw_sdk::Direction)
pub paperpaw_sdk::GestureKind::Tap
pub paperpaw_sdk::GestureKind::TwoFingerTap
pub paperpaw_sdk::Handled::No
pub paperpaw_sdk::Handled::Yes
pub paperpaw_sdk::Hint::Default
pub paperpaw_sdk::Hint::Hidden
pub paperpaw_sdk::Hint::Icon(&'static str)
pub paperpaw_sdk::Hint::Text(alloc::string::String)
pub fn paperpaw_sdk::Hint::only_back(&paperpaw_sdk::Id) -> paperpaw_sdk::Hint
pub paperpaw_sdk::Hints::Hidden
pub paperpaw_sdk::Hints::OnPress
pub paperpaw_sdk::Hints::Shown
pub paperpaw_sdk::Level::Advanced
pub paperpaw_sdk::Level::Basic
pub paperpaw_sdk::MenuNeed::BlackAndWhite
pub paperpaw_sdk::MenuNeed::ButtonRow
pub paperpaw_sdk::MenuNeed::Colors
pub paperpaw_sdk::MenuNeed::Firmware
pub paperpaw_sdk::MenuNeed::Frontlight
pub paperpaw_sdk::MenuNeed::NoTouch
pub paperpaw_sdk::MenuNeed::Rotation
pub paperpaw_sdk::MenuNeed::Sleep
pub paperpaw_sdk::MenuNeed::Speech
pub paperpaw_sdk::MenuNeed::Touch
pub paperpaw_sdk::MenuNeed::Wifi
pub fn paperpaw_sdk::MenuNeed::met(self, paperpaw_sdk::Capabilities) -> bool
pub paperpaw_sdk::MenuPlace::After(paperpaw_sdk::Id)
pub paperpaw_sdk::MenuPlace::Before(paperpaw_sdk::Id)
pub paperpaw_sdk::MenuPlace::First
pub paperpaw_sdk::MenuPlace::InSection(paperpaw_sdk::Id)
pub paperpaw_sdk::MenuPlace::Last
pub paperpaw_sdk::MenuPlace::Order(i16)
pub paperpaw_sdk::Outside::Close
pub paperpaw_sdk::Outside::Ignore
pub paperpaw_sdk::Outside::PassThrough
pub paperpaw_sdk::PluginKind::BuiltIn
pub paperpaw_sdk::PluginKind::Code
pub paperpaw_sdk::PluginKind::Data
pub paperpaw_sdk::PluginProblem::Changed
pub paperpaw_sdk::PluginProblem::Crashed
pub paperpaw_sdk::PluginProblem::Damaged
pub paperpaw_sdk::PluginProblem::Mismatch
pub paperpaw_sdk::PluginProblem::NoRoom
pub paperpaw_sdk::PluginProblem::NotInstalled
pub paperpaw_sdk::PluginProblem::OtherBuild
pub paperpaw_sdk::PluginProblem::SafeMode
pub paperpaw_sdk::PluginProblem::Unsupported
pub paperpaw_sdk::PluginState::Failed
pub paperpaw_sdk::PluginState::Off
pub paperpaw_sdk::PluginState::Running
pub paperpaw_sdk::RegisterError::Duplicate
pub paperpaw_sdk::RegisterError::Duplicate::id: paperpaw_sdk::Id
pub paperpaw_sdk::RegisterError::Invalid
pub paperpaw_sdk::RegisterError::Invalid::message: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::RegisterError::Namespace
pub paperpaw_sdk::RegisterError::Namespace::id: paperpaw_sdk::Id
pub paperpaw_sdk::RegisterError::Parse
pub paperpaw_sdk::RegisterError::Parse::line: u32
pub paperpaw_sdk::RegisterError::Parse::message: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::RegisterError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::ServerNotice::Failed
pub paperpaw_sdk::ServerNotice::Failed::reason: alloc::string::String
pub paperpaw_sdk::ServerNotice::Failed::server: paperpaw_sdk::Id
pub paperpaw_sdk::ServerNotice::Request
pub paperpaw_sdk::ServerNotice::Request::body_file: core::option::Option<alloc::string::String>
pub paperpaw_sdk::ServerNotice::Request::method: alloc::string::String
pub paperpaw_sdk::ServerNotice::Request::request: u32
pub paperpaw_sdk::ServerNotice::Request::server: paperpaw_sdk::Id
pub paperpaw_sdk::ServerNotice::Request::target: alloc::string::String
pub paperpaw_sdk::ServerNotice::Started
pub paperpaw_sdk::ServerNotice::Started::address: alloc::string::String
pub paperpaw_sdk::ServerNotice::Started::server: paperpaw_sdk::Id
pub paperpaw_sdk::ServerNotice::Stopped
pub paperpaw_sdk::ServerNotice::Stopped::server: paperpaw_sdk::Id
pub paperpaw_sdk::SettingError::Full
pub paperpaw_sdk::SettingError::InvalidValue
pub paperpaw_sdk::SettingError::Refused(&'static str)
pub paperpaw_sdk::SettingError::Unknown
pub fn paperpaw_sdk::SettingError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::SettingKind::Bool
pub paperpaw_sdk::SettingKind::Choice(paperpaw_sdk::Choices)
pub paperpaw_sdk::SettingKind::Int
pub paperpaw_sdk::SettingKind::Int::max: i64
pub paperpaw_sdk::SettingKind::Int::min: i64
pub paperpaw_sdk::SettingKind::Language
pub paperpaw_sdk::SettingKind::List
pub paperpaw_sdk::SettingKind::Text
pub fn paperpaw_sdk::SettingKind::accepts(&self, &paperpaw_sdk::SettingValue) -> bool
pub fn paperpaw_sdk::SettingKind::parse(&self, &str) -> core::option::Option<paperpaw_sdk::SettingValue>
pub paperpaw_sdk::SettingValue::Bool(bool)
pub paperpaw_sdk::SettingValue::Int(i64)
pub paperpaw_sdk::SettingValue::Text(alloc::borrow::Cow<'static, str>)
pub fn paperpaw_sdk::SettingValue::to_config_text(&self) -> alloc::string::String
pub paperpaw_sdk::ShowsThrough::All
pub paperpaw_sdk::ShowsThrough::FullScreen
pub paperpaw_sdk::ShowsThrough::Nothing
pub paperpaw_sdk::SocketNotice::Answer
pub paperpaw_sdk::SocketNotice::Answer::from: alloc::string::String
pub paperpaw_sdk::SocketNotice::Answer::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Answer::text: alloc::string::String
pub paperpaw_sdk::SocketNotice::Closed
pub paperpaw_sdk::SocketNotice::Closed::reason: alloc::string::String
pub paperpaw_sdk::SocketNotice::Closed::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Connected
pub paperpaw_sdk::SocketNotice::Connected::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Done
pub paperpaw_sdk::SocketNotice::Done::reason: alloc::string::String
pub paperpaw_sdk::SocketNotice::Done::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Failed
pub paperpaw_sdk::SocketNotice::Failed::reason: alloc::string::String
pub paperpaw_sdk::SocketNotice::Failed::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Received
pub paperpaw_sdk::SocketNotice::Received::socket: paperpaw_sdk::Id
pub paperpaw_sdk::SocketNotice::Received::text: alloc::string::String
pub paperpaw_sdk::SocketNotice::Saved
pub paperpaw_sdk::SocketNotice::Saved::path: alloc::string::String
pub paperpaw_sdk::SocketNotice::Saved::socket: paperpaw_sdk::Id
pub enum paperpaw_sdk::SocketRead
pub paperpaw_sdk::SocketRead::File
pub paperpaw_sdk::SocketRead::File::len: u64
pub paperpaw_sdk::SocketRead::File::path: alloc::string::String
pub paperpaw_sdk::SocketRead::Text
pub paperpaw_sdk::SocketRead::Text::max: u32
pub paperpaw_sdk::StatusValue::Bar
pub paperpaw_sdk::StatusValue::Bar::permille: u16
pub paperpaw_sdk::StatusValue::Icon(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::StatusValue::Labelled
pub paperpaw_sdk::StatusValue::Labelled::icon: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::StatusValue::Labelled::text: alloc::string::String
pub paperpaw_sdk::StatusValue::Level
pub paperpaw_sdk::StatusValue::Level::charging: bool
pub paperpaw_sdk::StatusValue::Level::percent: u8
pub paperpaw_sdk::StatusValue::Text(alloc::string::String)
pub enum paperpaw_sdk::Text
pub paperpaw_sdk::ActionOverride::action: paperpaw_sdk::Id
pub paperpaw_sdk::ActionOverride::handler: paperpaw_sdk::ActionParamsHandler
pub paperpaw_sdk::ActionOverride::priority: paperpaw_sdk::Priority
pub fn paperpaw_sdk::ActionOverride::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::ActionSpec::handler: core::option::Option<paperpaw_sdk::ActionHandler>
pub paperpaw_sdk::ActionSpec::hint: paperpaw_sdk::ActionHint
pub paperpaw_sdk::ActionSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::ActionSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::ActionSpec::describe(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::ActionSpec::description(&self) -> core::option::Option<&str>
pub fn paperpaw_sdk::ActionSpec::handler(self, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> Self
pub fn paperpaw_sdk::ActionSpec::handler_with(self, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> Self
pub fn paperpaw_sdk::ActionSpec::hint(self, paperpaw_sdk::ActionHint) -> Self
pub fn paperpaw_sdk::ActionSpec::is_sealed(&self) -> bool
pub fn paperpaw_sdk::ActionSpec::keywords(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::ActionSpec::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::ActionSpec::params_handler(&self) -> core::option::Option<&paperpaw_sdk::ActionParamsHandler>
pub fn paperpaw_sdk::ActionSpec::runs_itself(&self) -> bool
pub fn paperpaw_sdk::ActionSpec::sealed(self) -> Self
pub fn paperpaw_sdk::ActionSpec::search_keywords(&self) -> core::option::Option<&str>
pub fn paperpaw_sdk::ActionSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::Actions
pub fn paperpaw_sdk::Actions::contains(&self, &str) -> bool
pub fn paperpaw_sdk::Actions::get(&self, &str) -> core::option::Option<&paperpaw_sdk::ActionSpec>
pub fn paperpaw_sdk::Actions::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::ActionSpec>
pub fn paperpaw_sdk::Actions::new() -> Self
pub fn paperpaw_sdk::Actions::runnable(&self, &str) -> bool
pub fn paperpaw_sdk::Actions::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::Capabilities::black_and_white: bool
pub paperpaw_sdk::Capabilities::button_row: bool
pub paperpaw_sdk::Capabilities::colors: bool
pub paperpaw_sdk::Capabilities::firmware: bool
pub paperpaw_sdk::Capabilities::frontlight: bool
pub paperpaw_sdk::Capabilities::network: bool
pub paperpaw_sdk::Capabilities::rotation: bool
pub paperpaw_sdk::Capabilities::sleep: bool
pub paperpaw_sdk::Capabilities::speech: bool
pub paperpaw_sdk::Capabilities::system_clipboard: bool
pub paperpaw_sdk::Capabilities::touch: bool
pub paperpaw_sdk::Capabilities::wifi: bool
pub struct paperpaw_sdk::Chosen
pub paperpaw_sdk::Chosen::context: paperpaw_sdk::Params
pub paperpaw_sdk::Chosen::path: alloc::string::String
pub struct paperpaw_sdk::Cx<'a, 'e>
pub fn paperpaw_sdk::Cx<'a, 'e>::close(&mut self)
pub fn paperpaw_sdk::Cx<'a, 'e>::command(&mut self, paperpaw_sdk::Command)
pub fn paperpaw_sdk::Cx<'a, 'e>::entry(&self) -> core::option::Option<&paperpaw_sdk::StackEntry>
pub fn paperpaw_sdk::Cx<'a, 'e>::env(&self) -> &paperpaw_sdk::Env<'e>
pub fn paperpaw_sdk::Cx<'a, 'e>::for_screen(self, paperpaw_sdk::ScreenKey) -> Self
pub fn paperpaw_sdk::Cx<'a, 'e>::key(&self) -> core::option::Option<paperpaw_sdk::ScreenKey>
pub fn paperpaw_sdk::Cx<'a, 'e>::new(&'a paperpaw_sdk::Env<'e>, &'a mut paperpaw_sdk::Output) -> Self
pub fn paperpaw_sdk::Cx<'a, 'e>::refresh_cause(&mut self, paperpaw_sdk::filters::RefreshCause)
pub fn paperpaw_sdk::Cx<'a, 'e>::request_redraw(&mut self)
pub fn paperpaw_sdk::Cx<'a, 'e>::request_redraw_area(&mut self, paperpaw_platform::geometry::Rect)
pub fn paperpaw_sdk::Cx<'a, 'e>::request_refresh(&mut self, paperpaw_platform::display::RefreshMode)
pub fn paperpaw_sdk::Cx<'a, 'e>::screen_id(&self) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Cx<'a, 'e>::set_key_layer(&mut self, core::option::Option<paperpaw_sdk::Id>)
pub fn paperpaw_sdk::Cx<'a, 'e>::set_refresh(&mut self, paperpaw_platform::display::RefreshMode)
pub fn paperpaw_sdk::Cx<'a, 'e>::slot(&self) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Cx<'a, 'e>::wake_at(&mut self, paperpaw_platform::input::Instant)
pub paperpaw_sdk::Env::actions: &'a paperpaw_sdk::Actions
pub paperpaw_sdk::Env::book_badges: &'a [paperpaw_sdk::library::service::BookBadge]
pub paperpaw_sdk::Env::book_data: &'a [paperpaw_sdk::library::BookData]
pub paperpaw_sdk::Env::book_fields: &'a [paperpaw_sdk::library::service::BookField]
pub paperpaw_sdk::Env::caps: paperpaw_sdk::Capabilities
pub paperpaw_sdk::Env::catalog_device: core::option::Option<&'a str>
pub paperpaw_sdk::Env::clipboard: bool
pub paperpaw_sdk::Env::content: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::Env::decorators: &'a paperpaw_sdk::decorations::Decorators
pub paperpaw_sdk::Env::device: &'a paperpaw_platform::DeviceInfo
pub paperpaw_sdk::Env::firmware: core::option::Option<&'a paperpaw_sdk::firmware::Firmware>
pub paperpaw_sdk::Env::font_dirs: &'a [alloc::string::String]
pub paperpaw_sdk::Env::fonts: &'a paperpaw_sdk::Fonts
pub paperpaw_sdk::Env::formats: &'a paperpaw_sdk::Formats
pub paperpaw_sdk::Env::hyphenation: &'a paperpaw_sdk::Hyphenation
pub paperpaw_sdk::Env::i18n: &'a paperpaw_i18n::Translator
pub paperpaw_sdk::Env::inputs: &'a [paperpaw_sdk::keys::InputSpec]
pub paperpaw_sdk::Env::keys: &'a dyn paperpaw_sdk::keys::KeyBindings
pub paperpaw_sdk::Env::last_input: paperpaw_sdk::keys::InputMode
pub paperpaw_sdk::Env::look: paperpaw_sdk::ui::look::Look
pub paperpaw_sdk::Env::lookup: &'a paperpaw_sdk::lookup::LookupProviders
pub paperpaw_sdk::Env::menus: &'a paperpaw_sdk::Menus
pub paperpaw_sdk::Env::metrics: paperpaw_sdk::Metrics
pub paperpaw_sdk::Env::native: core::option::Option<&'a paperpaw_sdk::native::Native>
pub paperpaw_sdk::Env::now: paperpaw_platform::input::Instant
pub paperpaw_sdk::Env::page_layers: &'a paperpaw_sdk::layers::PageLayers
pub paperpaw_sdk::Env::plugins: &'a paperpaw_sdk::Plugins
pub paperpaw_sdk::Env::power: &'a paperpaw_sdk::power::Power
pub paperpaw_sdk::Env::random: paperpaw_sdk::random::Random
pub paperpaw_sdk::Env::reader: bool
pub paperpaw_sdk::Env::readers: &'a paperpaw_sdk::readers::Readers
pub paperpaw_sdk::Env::screens: &'a [(paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>)]
pub paperpaw_sdk::Env::secrets: paperpaw_sdk::secrets::Visible<'a>
pub paperpaw_sdk::Env::services: &'a paperpaw_sdk::services::Services
pub paperpaw_sdk::Env::settings: &'a paperpaw_sdk::Settings
pub paperpaw_sdk::Env::setup: &'a paperpaw_sdk::setup::SetupSteps
pub paperpaw_sdk::Env::slots: &'a [paperpaw_sdk::Id]
pub paperpaw_sdk::Env::stack: &'a [paperpaw_sdk::StackEntry]
pub paperpaw_sdk::Env::status: &'a paperpaw_platform::status::SystemStatus
pub paperpaw_sdk::Env::status_items: &'a paperpaw_sdk::status::StatusItems
pub paperpaw_sdk::Env::storage: &'a dyn paperpaw_platform::storage::Storage
pub paperpaw_sdk::Env::stylesheets: &'a [alloc::borrow::Cow<'static, str>]
pub paperpaw_sdk::Env::text_filters: &'a paperpaw_sdk::filters::TextFilters
pub paperpaw_sdk::Env::usage: &'a paperpaw_sdk::usage::Usage
pub paperpaw_sdk::Env::widgets: &'a paperpaw_sdk::widgets::Widgets
pub paperpaw_sdk::Env::wifi: core::option::Option<&'a paperpaw_sdk::wifi::Wifi>
pub paperpaw_sdk::Env::work: &'a paperpaw_sdk::work::WorkStates
pub fn paperpaw_sdk::Env<'_>::has_slot(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::Env<'_>::make_screen(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Params) -> core::option::Option<alloc::boxed::Box<dyn paperpaw_sdk::Screen>>
pub fn paperpaw_sdk::Env<'_>::plugin_dir(&str) -> alloc::string::String
pub fn paperpaw_sdk::Env<'_>::plugin_usage(&self) -> alloc::vec::Vec<paperpaw_sdk::usage::PluginUsage>
pub fn paperpaw_sdk::Env<'_>::top(&self) -> core::option::Option<&paperpaw_sdk::StackEntry>
pub fn paperpaw_sdk::Env<'a>::device_within(&self, paperpaw_platform::geometry::Rect) -> paperpaw_platform::DeviceInfo
pub fn paperpaw_sdk::Env<'a>::slot_screen(&self, &str) -> core::option::Option<&'a paperpaw_sdk::Id>
pub fn paperpaw_sdk::Env<'a>::slot_screens(&self, &str) -> alloc::vec::Vec<&'a paperpaw_sdk::Id>
pub fn paperpaw_sdk::Env<'a>::within<'b>(&self, &'b paperpaw_platform::DeviceInfo, paperpaw_platform::geometry::Rect) -> paperpaw_sdk::Env<'b> where 'a: 'b
pub fn paperpaw_sdk::Env<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::Event<P: paperpaw_sdk::event::EventData>
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::event::Event<P>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub paperpaw_sdk::FontFace::bold: bool
pub paperpaw_sdk::FontFace::family: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::FontFace::id: paperpaw_sdk::Id
pub paperpaw_sdk::FontFace::italic: bool
pub paperpaw_sdk::FontFace::path: alloc::string::String
pub fn paperpaw_sdk::FontFace::is_pack(&self) -> bool
pub fn paperpaw_sdk::FontFace::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, bool, bool) -> Self
pub struct paperpaw_sdk::FontHandle<'a>
pub fn paperpaw_sdk::FontHandle<'a>::advance(&self, f32, char) -> f32
pub fn paperpaw_sdk::FontHandle<'a>::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, f32, f32, i32, &str, paperpaw_platform::pixel::Color) -> f32
pub fn paperpaw_sdk::FontHandle<'a>::draw_bolder(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, f32, f32, i32, &str, paperpaw_platform::pixel::Color, u16) -> f32
pub fn paperpaw_sdk::FontHandle<'a>::has_char(&self, char) -> bool
pub fn paperpaw_sdk::FontHandle<'a>::id(&self) -> &'a paperpaw_sdk::Id
pub fn paperpaw_sdk::FontHandle<'a>::ink(&self, f32, &str) -> core::option::Option<(i32, i32)>
pub fn paperpaw_sdk::FontHandle<'a>::ink_across(&self, f32, &str) -> core::option::Option<(i32, i32)>
pub fn paperpaw_sdk::FontHandle<'a>::line_metrics(&self, f32) -> paperpaw_text::font::LineMetrics
pub fn paperpaw_sdk::FontHandle<'a>::measure(&self, f32, &str) -> f32
pub fn paperpaw_sdk::FontHandle<'a>::wrap(&self, f32, &str, f32) -> alloc::vec::Vec<core::ops::range::Range<usize>>
pub fn paperpaw_sdk::FontHandle<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::FontSet
pub fn paperpaw_sdk::FontSet::add(&mut self, paperpaw_sdk::Id, paperpaw_text::font::Font) -> usize
pub fn paperpaw_sdk::FontSet::get(&self, usize) -> core::option::Option<paperpaw_sdk::FontHandle<'_>>
pub fn paperpaw_sdk::FontSet::is_empty(&self) -> bool
pub fn paperpaw_sdk::FontSet::len(&self) -> usize
pub fn paperpaw_sdk::FontSet::new(usize) -> Self
pub fn paperpaw_sdk::FontSet::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::FontSpec::bold: bool
pub paperpaw_sdk::FontSpec::family: core::option::Option<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::FontSpec::font: paperpaw_text::font::Font
pub paperpaw_sdk::FontSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::FontSpec::italic: bool
pub fn paperpaw_sdk::FontSpec::family(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, bool, bool) -> Self
pub fn paperpaw_sdk::FontSpec::new(paperpaw_sdk::Id, paperpaw_text::font::Font) -> Self
pub struct paperpaw_sdk::Fonts
pub fn paperpaw_sdk::Fonts::bound(&self, &str) -> core::option::Option<paperpaw_sdk::FontHandle<'_>>
pub fn paperpaw_sdk::Fonts::cache_bytes(&self) -> usize
pub fn paperpaw_sdk::Fonts::contains(&self, &str) -> bool
pub fn paperpaw_sdk::Fonts::families(&self) -> alloc::vec::Vec<&str>
pub fn paperpaw_sdk::Fonts::family(&self) -> core::option::Option<&str>
pub fn paperpaw_sdk::Fonts::get(&self, &str) -> core::option::Option<paperpaw_sdk::FontHandle<'_>>
pub fn paperpaw_sdk::Fonts::ids(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::Fonts::new(usize) -> Self
pub fn paperpaw_sdk::Fonts::role(&self, &str) -> core::option::Option<paperpaw_sdk::FontHandle<'_>>
pub fn paperpaw_sdk::Fonts::user_bound(&self, &str) -> bool
pub fn paperpaw_sdk::Fonts::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::FormatSpec::extensions: alloc::vec::Vec<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::FormatSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::FormatSpec::open: paperpaw_sdk::FormatOpener
pub paperpaw_sdk::FormatSpec::prepared: core::option::Option<paperpaw_sdk::FormatPrepared>
pub paperpaw_sdk::FormatSpec::sniff: core::option::Option<alloc::boxed::Box<dyn core::ops::function::Fn(&[u8]) -> bool>>
pub paperpaw_sdk::FormatSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::FormatSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, alloc::vec::Vec<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::FormatOpener) -> Self
pub fn paperpaw_sdk::FormatSpec::prepared(self, paperpaw_sdk::FormatPrepared) -> Self
pub fn paperpaw_sdk::FormatSpec::sniff(self, impl core::ops::function::Fn(&[u8]) -> bool + 'static) -> Self
pub fn paperpaw_sdk::FormatSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::Formats
pub fn paperpaw_sdk::Formats::contains(&self, &str) -> bool
pub fn paperpaw_sdk::Formats::for_file(&self, &dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<&paperpaw_sdk::FormatSpec>
pub fn paperpaw_sdk::Formats::for_path(&self, &str) -> core::option::Option<&paperpaw_sdk::FormatSpec>
pub fn paperpaw_sdk::Formats::is_empty(&self) -> bool
pub fn paperpaw_sdk::Formats::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::FormatSpec>
pub fn paperpaw_sdk::Formats::may_sniff(&self, &str) -> bool
pub fn paperpaw_sdk::Formats::new() -> Self
pub fn paperpaw_sdk::Formats::open(&self, &dyn paperpaw_platform::storage::Storage, &str) -> core::result::Result<alloc::boxed::Box<dyn paperpaw_document::Document>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::Formats::open_with(&self, &dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::OpenOptions) -> core::result::Result<alloc::boxed::Box<dyn paperpaw_document::Document>, paperpaw_document::DocumentError>
pub fn paperpaw_sdk::Formats::options(&self) -> paperpaw_sdk::OpenOptions
pub fn paperpaw_sdk::Formats::prepared(&self, &dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::OpenOptions) -> bool
pub fn paperpaw_sdk::Formats::sniffs(&self) -> bool
pub fn paperpaw_sdk::Formats::supports(&self, &str) -> bool
pub fn paperpaw_sdk::Formats::supports_file(&self, &dyn paperpaw_platform::storage::Storage, &str) -> bool
pub paperpaw_sdk::Gesture::end: paperpaw_platform::geometry::Point
pub paperpaw_sdk::Gesture::kind: paperpaw_sdk::GestureKind
pub paperpaw_sdk::Gesture::start: paperpaw_platform::geometry::Point
pub paperpaw_sdk::Gesture::tool: paperpaw_platform::input::PointerTool
pub fn paperpaw_sdk::Gesture::new(paperpaw_sdk::GestureKind, paperpaw_platform::geometry::Point, paperpaw_platform::geometry::Point, paperpaw_platform::input::PointerTool) -> Self
pub paperpaw_sdk::HttpOptions::max_body: core::option::Option<usize>
pub paperpaw_sdk::HttpOptions::timeout: core::option::Option<core::time::Duration>
pub paperpaw_sdk::HttpOptions::want_headers: alloc::vec::Vec<alloc::string::String>
pub struct paperpaw_sdk::HttpReply
pub paperpaw_sdk::HttpReply::body: alloc::string::String
pub paperpaw_sdk::HttpReply::content_type: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpReply::context: paperpaw_sdk::Params
pub paperpaw_sdk::HttpReply::etag: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpReply::final_url: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpReply::headers: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::HttpReply::refused: core::option::Option<paperpaw_sdk::work::Refusal>
pub paperpaw_sdk::HttpReply::status: u16
pub paperpaw_sdk::HttpRequest::body: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpRequest::body_from: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpRequest::headers: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::HttpRequest::method: alloc::string::String
pub paperpaw_sdk::HttpRequest::params: paperpaw_sdk::Params
pub paperpaw_sdk::HttpRequest::reply: paperpaw_sdk::Id
pub paperpaw_sdk::HttpRequest::save_to: core::option::Option<alloc::string::String>
pub paperpaw_sdk::HttpRequest::url: alloc::string::String
pub fn paperpaw_sdk::HttpRequest::body(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::HttpRequest::body_from(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::HttpRequest::get(&str, impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::HttpRequest::header(self, impl core::convert::Into<alloc::string::String>, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::HttpRequest::max_body(self, usize) -> Self
pub fn paperpaw_sdk::HttpRequest::new(&str, &str, impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::HttpRequest::options(&self) -> &paperpaw_sdk::HttpOptions
pub fn paperpaw_sdk::HttpRequest::save_to(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::HttpRequest::timeout(self, core::time::Duration) -> Self
pub fn paperpaw_sdk::HttpRequest::want_headers(self, &[&str]) -> Self
pub fn paperpaw_sdk::HttpRequest::with(self, paperpaw_sdk::Params) -> Self
pub struct paperpaw_sdk::Hyphenation
pub fn paperpaw_sdk::Hyphenation::contains(&self, &str) -> bool
pub fn paperpaw_sdk::Hyphenation::get(&self, &str) -> core::option::Option<&paperpaw_hyphen::Patterns<'static>>
pub fn paperpaw_sdk::Hyphenation::new() -> Self
pub paperpaw_sdk::HyphenationSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::HyphenationSpec::language: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::HyphenationSpec::patterns: &'static [u8]
pub fn paperpaw_sdk::HyphenationSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, &'static [u8]) -> Self
pub fn paperpaw_sdk::HyphenationSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::Id(_)
pub fn paperpaw_sdk::Id::as_str(&self) -> &str
pub fn paperpaw_sdk::Id::is_owned_by(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::Id::namespace(&self) -> &str
pub const fn paperpaw_sdk::Id::new_static(&'static str) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::parse(&str) -> core::result::Result<paperpaw_sdk::Id, paperpaw_sdk::InvalidId>
pub fn paperpaw_sdk::Id::placement(&self, u32) -> paperpaw_sdk::Id
pub const fn paperpaw_sdk::Id::static_str(self) -> &'static str
pub fn paperpaw_sdk::Id::unplaced(&self) -> core::option::Option<paperpaw_sdk::Id>
pub fn paperpaw_sdk::Id::borrow(&self) -> &str
pub fn paperpaw_sdk::Id::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::Id::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::Id::from_param(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::Id::missing() -> core::option::Option<Self>
pub fn paperpaw_sdk::Id::to_param(&self) -> alloc::string::String
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::event::Event<P>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::event::Event<P>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::setting::Setting<T>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub struct paperpaw_sdk::InvalidId
pub fn paperpaw_sdk::InvalidId::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::ItemState::badge: core::option::Option<alloc::string::String>
pub paperpaw_sdk::ItemState::checked: core::option::Option<bool>
pub paperpaw_sdk::ItemState::enabled: bool
pub paperpaw_sdk::ItemState::label: core::option::Option<alloc::string::String>
pub paperpaw_sdk::ItemState::shown: bool
pub fn paperpaw_sdk::ItemState::badge(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::ItemState::checked(self, bool) -> Self
pub fn paperpaw_sdk::ItemState::enabled(self, bool) -> Self
pub fn paperpaw_sdk::ItemState::label(self, impl core::convert::Into<alloc::string::String>) -> Self
pub const fn paperpaw_sdk::ItemState::new() -> Self
pub fn paperpaw_sdk::ItemState::shown(self, bool) -> Self
pub fn paperpaw_sdk::ItemState::text(&self, &str) -> alloc::string::String
pub fn paperpaw_sdk::ItemState::default() -> Self
pub paperpaw_sdk::Manifest::description: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Manifest::id: paperpaw_sdk::Id
pub paperpaw_sdk::Manifest::name: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Manifest::sdk: paperpaw_sdk::Version
pub paperpaw_sdk::Manifest::uses: paperpaw_sdk::Uses
pub paperpaw_sdk::Manifest::version: paperpaw_sdk::Version
pub fn paperpaw_sdk::Manifest::description(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::Manifest::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::Version) -> Self
pub fn paperpaw_sdk::Manifest::sdk(self, paperpaw_sdk::Version) -> Self
pub fn paperpaw_sdk::Manifest::uses(self, paperpaw_sdk::Uses) -> Self
pub struct paperpaw_sdk::MemoryStorage
pub fn paperpaw_sdk::MemoryStorage::get(&self, &str) -> core::option::Option<alloc::vec::Vec<u8>>
pub fn paperpaw_sdk::MemoryStorage::new() -> Self
pub fn paperpaw_sdk::MemoryStorage::with(self, &str, impl core::convert::Into<alloc::vec::Vec<u8>>) -> Self
pub fn paperpaw_sdk::MemoryStorage::append(&self, &str, &[u8]) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::create_dir(&self, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::list(&self, &str, &mut dyn core::ops::function::FnMut(paperpaw_platform::storage::DirEntry<'_>)) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::read_at(&self, &str, u64, &mut [u8]) -> core::result::Result<usize, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::remove(&self, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::remove_dir_all(&self, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::rename(&self, &str, &str) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::size(&self, &str) -> core::result::Result<u64, paperpaw_platform::storage::StorageError>
pub fn paperpaw_sdk::MemoryStorage::write(&self, &str, &[u8]) -> core::result::Result<(), paperpaw_platform::storage::StorageError>
pub paperpaw_sdk::MenuEntry::item: paperpaw_sdk::Id
pub paperpaw_sdk::MenuEntry::menu: paperpaw_sdk::Id
pub paperpaw_sdk::MenuEntry::order: i16
pub paperpaw_sdk::MenuEntry::place: core::option::Option<paperpaw_sdk::MenuPlace>
pub fn paperpaw_sdk::MenuEntry::new(paperpaw_sdk::Id, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::MenuEntry::order(self, i16) -> Self
pub fn paperpaw_sdk::MenuEntry::place(self, paperpaw_sdk::MenuPlace) -> Self
pub struct paperpaw_sdk::MenuItem<'a>
pub paperpaw_sdk::MenuItem::icon: core::option::Option<&'a str>
pub paperpaw_sdk::MenuItem::id: &'a paperpaw_sdk::Id
pub paperpaw_sdk::MenuItem::section: bool
pub paperpaw_sdk::MenuItem::title: &'a str
pub paperpaw_sdk::MenuSection::id: paperpaw_sdk::Id
pub paperpaw_sdk::MenuSection::menu: paperpaw_sdk::Id
pub paperpaw_sdk::MenuSection::order: i16
pub paperpaw_sdk::MenuSection::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::MenuSection::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::MenuSection::order(self, i16) -> Self
pub struct paperpaw_sdk::Menus
pub fn paperpaw_sdk::Menus::available(&self, &str) -> bool
pub fn paperpaw_sdk::Menus::contributed_ids(&self, &str) -> alloc::vec::Vec<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::default_ids(&self, &str) -> alloc::vec::Vec<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::description(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::Menus::hidden(&paperpaw_sdk::Params, &str) -> bool
pub fn paperpaw_sdk::Menus::hidden_by(&self, &str, &str) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::icon(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::Menus::ids(&self, &str) -> alloc::vec::Vec<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::is_customized(&self, &str) -> bool
pub fn paperpaw_sdk::Menus::is_section(&self, &str) -> bool
pub fn paperpaw_sdk::Menus::items(&self, &str) -> alloc::vec::Vec<paperpaw_sdk::MenuItem<'_>>
pub fn paperpaw_sdk::Menus::known(&self, &str) -> core::option::Option<&[paperpaw_sdk::Id]>
pub fn paperpaw_sdk::Menus::menu_ids(&self) -> alloc::vec::Vec<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::new() -> Self
pub fn paperpaw_sdk::Menus::order_of(&self, &str, &str) -> core::option::Option<i16>
pub fn paperpaw_sdk::Menus::referenced_items(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::Id>
pub fn paperpaw_sdk::Menus::shown_items(&self, &paperpaw_sdk::Env<'_>, &str) -> alloc::vec::Vec<paperpaw_sdk::MenuItem<'_>>
pub fn paperpaw_sdk::Menus::state(&self, &paperpaw_sdk::Env<'_>, &str) -> paperpaw_sdk::ItemState
pub fn paperpaw_sdk::Menus::title(&self, &str) -> core::option::Option<&str>
pub struct paperpaw_sdk::Metrics
pub paperpaw_sdk::Metrics::dpi: u16
pub const fn paperpaw_sdk::Metrics::mm(&self, u32) -> u32
pub const fn paperpaw_sdk::Metrics::new(u16) -> Self
pub fn paperpaw_sdk::Metrics::pt(&self, f32) -> f32
pub const fn paperpaw_sdk::Metrics::tenth_mm(&self, u32) -> u32
pub paperpaw_sdk::ObserverSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::ObserverSpec::observer: paperpaw_sdk::Observer
pub fn paperpaw_sdk::ObserverSpec::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> Self
pub fn paperpaw_sdk::ObserverSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::OpenOptions::color: bool
pub paperpaw_sdk::OpenOptions::cover_fit: paperpaw_image::Fit
pub paperpaw_sdk::OpenOptions::css: alloc::string::String
pub paperpaw_sdk::OpenOptions::image_fit: paperpaw_image::Fit
pub paperpaw_sdk::OpenOptions::publisher_styles: bool
pub paperpaw_sdk::OpenOptions::settings: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub fn paperpaw_sdk::OpenOptions::color(self, bool) -> Self
pub fn paperpaw_sdk::OpenOptions::cover_fit(self, paperpaw_image::Fit) -> Self
pub fn paperpaw_sdk::OpenOptions::css(self, alloc::string::String) -> Self
pub fn paperpaw_sdk::OpenOptions::image_fit(self, paperpaw_image::Fit) -> Self
pub fn paperpaw_sdk::OpenOptions::publisher_styles(self, bool) -> Self
pub fn paperpaw_sdk::OpenOptions::setting(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::OpenOptions::settings(self, alloc::vec::Vec<(alloc::string::String, alloc::string::String)>) -> Self
pub fn paperpaw_sdk::OpenOptions::default() -> Self
pub paperpaw_sdk::Output::commands: alloc::vec::Vec<paperpaw_sdk::Command>
pub paperpaw_sdk::Output::redraw: bool
pub paperpaw_sdk::Output::redraw_area: core::option::Option<paperpaw_platform::geometry::Rect>
pub paperpaw_sdk::Output::refresh: core::option::Option<paperpaw_platform::display::RefreshMode>
pub paperpaw_sdk::Output::refresh_cause: core::option::Option<paperpaw_sdk::filters::RefreshCause>
pub paperpaw_sdk::Output::refresh_set: core::option::Option<paperpaw_platform::display::RefreshMode>
pub paperpaw_sdk::Output::wake_at: core::option::Option<paperpaw_platform::input::Instant>
pub fn paperpaw_sdk::Output::request_refresh(&mut self, paperpaw_platform::display::RefreshMode)
pub struct paperpaw_sdk::Params(_)
pub fn paperpaw_sdk::Params::get(&self, &str) -> core::option::Option<&str>
pub fn paperpaw_sdk::Params::is_empty(&self) -> bool
pub fn paperpaw_sdk::Params::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = (&str, &str)>
pub const fn paperpaw_sdk::Params::new() -> Self
pub fn paperpaw_sdk::Params::set(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::string::String>)
pub fn paperpaw_sdk::Params::with(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::Params::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::Params::to_params(&self) -> paperpaw_sdk::Params
pub struct paperpaw_sdk::PluginInfo
pub paperpaw_sdk::PluginInfo::enabled: bool
pub paperpaw_sdk::PluginInfo::kind: paperpaw_sdk::PluginKind
pub paperpaw_sdk::PluginInfo::manifest: paperpaw_sdk::Manifest
pub paperpaw_sdk::PluginInfo::problem: core::option::Option<paperpaw_sdk::PluginProblem>
pub paperpaw_sdk::PluginInfo::required_for: paperpaw_sdk::RequiredFor
pub paperpaw_sdk::PluginInfo::state: paperpaw_sdk::PluginState
pub paperpaw_sdk::PluginInfo::update: core::option::Option<paperpaw_sdk::Version>
pub fn paperpaw_sdk::PluginInfo::can_switch_off(&self) -> bool
pub fn paperpaw_sdk::PluginInfo::description<'a>(&'a self, &'a paperpaw_i18n::Translator) -> &'a str
pub fn paperpaw_sdk::PluginInfo::name<'a>(&'a self, &'a paperpaw_i18n::Translator) -> &'a str
pub fn paperpaw_sdk::PluginInfo::restart_needed(&self) -> bool
pub struct paperpaw_sdk::Plugins
pub fn paperpaw_sdk::Plugins::get(&self, &str) -> core::option::Option<&paperpaw_sdk::PluginInfo>
pub fn paperpaw_sdk::Plugins::is_empty(&self) -> bool
pub fn paperpaw_sdk::Plugins::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::PluginInfo>
pub fn paperpaw_sdk::Plugins::len(&self) -> usize
pub const fn paperpaw_sdk::Plugins::new() -> Self
pub fn paperpaw_sdk::Plugins::owner(&self, &paperpaw_sdk::Id) -> core::option::Option<&paperpaw_sdk::PluginInfo>
pub fn paperpaw_sdk::Plugins::restart_needed(&self) -> bool
pub struct paperpaw_sdk::Priority(pub i16)
pub const paperpaw_sdk::Priority::DEFAULT: paperpaw_sdk::Priority
pub const paperpaw_sdk::Priority::FALLBACK: paperpaw_sdk::Priority
pub const paperpaw_sdk::Priority::PREFERRED: paperpaw_sdk::Priority
pub struct paperpaw_sdk::Registrar
pub struct paperpaw_sdk::RequiredFor(_)
pub fn paperpaw_sdk::RequiredFor::contains(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::RequiredFor::insert(&mut self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::RequiredFor::is_empty(&self) -> bool
pub fn paperpaw_sdk::RequiredFor::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'static paperpaw_sdk::Id> + '_
pub struct paperpaw_sdk::ScreenKey(_)
pub const fn paperpaw_sdk::ScreenKey::new(u32) -> Self
pub paperpaw_sdk::ScreenSpec::factory: paperpaw_sdk::ScreenFactory
pub paperpaw_sdk::ScreenSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::ScreenSpec::refresh_on_open: core::option::Option<paperpaw_platform::display::RefreshMode>
pub paperpaw_sdk::ScreenSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::ScreenSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::ScreenFactory) -> Self
pub fn paperpaw_sdk::ScreenSpec::refresh_on_open(self, paperpaw_platform::display::RefreshMode) -> Self
pub fn paperpaw_sdk::ScreenSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::ServerResponse
pub paperpaw_sdk::ServerResponse::body: alloc::vec::Vec<u8>
pub paperpaw_sdk::ServerResponse::body_from: core::option::Option<alloc::string::String>
pub paperpaw_sdk::ServerResponse::content_type: alloc::string::String
pub paperpaw_sdk::ServerResponse::headers: alloc::vec::Vec<(alloc::string::String, alloc::string::String)>
pub paperpaw_sdk::ServerResponse::request: u32
pub paperpaw_sdk::ServerResponse::status: u16
pub fn paperpaw_sdk::ServerResponse::new(u32, u16, &str, alloc::vec::Vec<u8>) -> Self
pub struct paperpaw_sdk::Setting<T: paperpaw_sdk::setting::SettingType>
pub fn paperpaw_sdk::Id::eq(&self, &paperpaw_sdk::setting::Setting<T>) -> bool
pub fn paperpaw_sdk::Id::from(&paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Id::from(paperpaw_sdk::setting::Setting<T>) -> paperpaw_sdk::Id
pub struct paperpaw_sdk::SettingCheck(pub fn(&paperpaw_sdk::Settings, &paperpaw_sdk::SettingValue) -> core::result::Result<(), &'static str>)
pub fn paperpaw_sdk::SettingCheck::eq(&self, &Self) -> bool
pub fn paperpaw_sdk::SettingCheck::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub paperpaw_sdk::SettingExtra::check: core::option::Option<paperpaw_sdk::SettingCheck>
pub paperpaw_sdk::SettingExtra::editor: core::option::Option<paperpaw_sdk::Editor>
pub paperpaw_sdk::SettingExtra::follows: core::option::Option<&'static str>
pub paperpaw_sdk::SettingExtra::keeps_unknown: bool
pub paperpaw_sdk::SettingExtra::secret: bool
pub paperpaw_sdk::SettingExtra::section: core::option::Option<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::SettingExtra::shown_if: core::option::Option<(&'static str, &'static str)>
pub paperpaw_sdk::SettingExtra::slider: bool
pub paperpaw_sdk::SettingExtra::step: i64
pub paperpaw_sdk::SettingExtra::unit: core::option::Option<alloc::borrow::Cow<'static, str>>
pub const fn paperpaw_sdk::SettingExtra::check(self, fn(&paperpaw_sdk::Settings, &paperpaw_sdk::SettingValue) -> core::result::Result<(), &'static str>) -> Self
pub const fn paperpaw_sdk::SettingExtra::editor(self, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingExtra::editor_slot(self, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingExtra::follows(self, &'static str) -> Self
pub const fn paperpaw_sdk::SettingExtra::keeps_unknown(self) -> Self
pub const fn paperpaw_sdk::SettingExtra::new() -> Self
pub const fn paperpaw_sdk::SettingExtra::secret(self) -> Self
pub const fn paperpaw_sdk::SettingExtra::section(self, &'static str) -> Self
pub const fn paperpaw_sdk::SettingExtra::shown_if(self, &'static str, &'static str) -> Self
pub const fn paperpaw_sdk::SettingExtra::slider(self) -> Self
pub const fn paperpaw_sdk::SettingExtra::step(self, i64) -> Self
pub const fn paperpaw_sdk::SettingExtra::unit(self, &'static str) -> Self
pub fn paperpaw_sdk::SettingExtra::default() -> Self
pub paperpaw_sdk::SettingGroupSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::SettingGroupSpec::order: i32
pub paperpaw_sdk::SettingGroupSpec::page: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::SettingGroupSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::SettingGroupSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingGroupSpec::order(self, i32) -> Self
pub fn paperpaw_sdk::SettingGroupSpec::page(self, impl core::convert::Into<core::option::Option<paperpaw_sdk::Id>>) -> Self
pub paperpaw_sdk::SettingSpec::default: paperpaw_sdk::SettingValue
pub paperpaw_sdk::SettingSpec::description: core::option::Option<alloc::borrow::Cow<'static, str>>
pub paperpaw_sdk::SettingSpec::group: paperpaw_sdk::Id
pub paperpaw_sdk::SettingSpec::guarded: bool
pub paperpaw_sdk::SettingSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::SettingSpec::kind: paperpaw_sdk::SettingKind
pub paperpaw_sdk::SettingSpec::level: paperpaw_sdk::Level
pub paperpaw_sdk::SettingSpec::scoped: bool
pub paperpaw_sdk::SettingSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::SettingSpec::accepts(&self, &paperpaw_sdk::SettingValue) -> bool
pub const fn paperpaw_sdk::SettingSpec::advanced(self) -> Self
pub fn paperpaw_sdk::SettingSpec::choice(&paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::Choices, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub const fn paperpaw_sdk::SettingSpec::described(self, &'static str) -> Self
pub fn paperpaw_sdk::SettingSpec::description(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingSpec::editor(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::SettingSpec::editor_slot(self, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::SettingSpec::extra(&self) -> &paperpaw_sdk::SettingExtra
pub const fn paperpaw_sdk::SettingSpec::fixed(&'static str, &'static str, paperpaw_sdk::SettingKind, paperpaw_sdk::SettingValue, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::fixed_choice(&'static str, &'static str, &'static [&'static str], &'static str, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::fixed_number(&'static str, &'static str, i64, i64, i64, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::fixed_switch(&'static str, &'static str, bool, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::fixed_text(&'static str, &'static str, &'static str, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::for_advanced(self) -> Self
pub fn paperpaw_sdk::SettingSpec::group(self, paperpaw_sdk::Id) -> Self
pub const fn paperpaw_sdk::SettingSpec::guarded(self) -> Self
pub fn paperpaw_sdk::SettingSpec::keeps_unknown(self) -> Self
pub fn paperpaw_sdk::SettingSpec::language(&paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingSpec::list(&paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingSpec::new(impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, paperpaw_sdk::SettingKind, paperpaw_sdk::SettingValue) -> Self
pub fn paperpaw_sdk::SettingSpec::number(&paperpaw_sdk::setting::Setting<i64>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, i64, i64, i64) -> Self
pub fn paperpaw_sdk::SettingSpec::parse(&self, &str) -> core::option::Option<paperpaw_sdk::SettingValue>
pub const fn paperpaw_sdk::SettingSpec::scoped(self) -> Self
pub fn paperpaw_sdk::SettingSpec::secret(self) -> Self
pub fn paperpaw_sdk::SettingSpec::section(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingSpec::slider(self) -> Self
pub fn paperpaw_sdk::SettingSpec::step(self, i64) -> Self
pub fn paperpaw_sdk::SettingSpec::switch(&paperpaw_sdk::setting::Setting<bool>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, bool) -> Self
pub fn paperpaw_sdk::SettingSpec::text(&paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub fn paperpaw_sdk::SettingSpec::unit(self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub const fn paperpaw_sdk::SettingSpec::with_extra(self, &'static paperpaw_sdk::SettingExtra) -> Self
pub struct paperpaw_sdk::Settings
pub fn paperpaw_sdk::Settings::bool(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::get(&self, &str) -> core::option::Option<&paperpaw_sdk::SettingValue>
pub fn paperpaw_sdk::Settings::global(&self, &str) -> core::option::Option<&paperpaw_sdk::SettingValue>
pub fn paperpaw_sdk::Settings::goes_to_scope(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::governs(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::group_of(&self, &paperpaw_sdk::SettingSpec) -> paperpaw_sdk::Id
pub fn paperpaw_sdk::Settings::groups(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::SettingGroupSpec>
pub fn paperpaw_sdk::Settings::int(&self, &str) -> i64
pub fn paperpaw_sdk::Settings::is_scoped(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::is_set(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::is_worn(&self, &str) -> bool
pub fn paperpaw_sdk::Settings::new() -> Self
pub fn paperpaw_sdk::Settings::placement_values(&self, &str) -> alloc::vec::Vec<paperpaw_sdk::Id>
pub fn paperpaw_sdk::Settings::presets(&self) -> &paperpaw_sdk::presets::Presets
pub fn paperpaw_sdk::Settings::previewing(&self) -> bool
pub fn paperpaw_sdk::Settings::read<T: paperpaw_sdk::setting::SettingType>(&self, &paperpaw_sdk::setting::Setting<T>) -> <T as paperpaw_sdk::setting::SettingType>::Value
pub fn paperpaw_sdk::Settings::released(&self) -> &[paperpaw_sdk::Id]
pub fn paperpaw_sdk::Settings::scope(&self) -> core::option::Option<&paperpaw_sdk::collections::VecMap<paperpaw_sdk::Id, paperpaw_sdk::SettingValue>>
pub fn paperpaw_sdk::Settings::scoped_value(&self, &str) -> core::option::Option<&paperpaw_sdk::SettingValue>
pub fn paperpaw_sdk::Settings::shows(&self, &paperpaw_sdk::SettingSpec) -> bool
pub fn paperpaw_sdk::Settings::spec(&self, &str) -> core::option::Option<&paperpaw_sdk::SettingSpec>
pub fn paperpaw_sdk::Settings::specs(&self) -> impl core::iter::traits::iterator::Iterator<Item = &paperpaw_sdk::SettingSpec>
pub fn paperpaw_sdk::Settings::text(&self, &str) -> &str
pub fn paperpaw_sdk::Settings::with_placement<R>(&self, core::option::Option<&str>, impl core::ops::function::FnOnce() -> R) -> R
pub paperpaw_sdk::SlotSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::SlotSpec::title: alloc::borrow::Cow<'static, str>
pub fn paperpaw_sdk::SlotSpec::new(paperpaw_sdk::Id, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> Self
pub paperpaw_sdk::Speech::language: alloc::string::String
pub paperpaw_sdk::Speech::params: paperpaw_sdk::Params
pub paperpaw_sdk::Speech::queue: bool
pub paperpaw_sdk::Speech::rate: u16
pub paperpaw_sdk::Speech::reply: paperpaw_sdk::Id
pub paperpaw_sdk::Speech::text: alloc::string::String
pub fn paperpaw_sdk::Speech::answer(&self, bool) -> paperpaw_sdk::Command
pub fn paperpaw_sdk::Speech::language(self, impl core::convert::Into<alloc::string::String>) -> Self
pub fn paperpaw_sdk::Speech::new(impl core::convert::Into<alloc::string::String>, paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::Speech::params(self, paperpaw_sdk::Params) -> Self
pub fn paperpaw_sdk::Speech::queue(self, bool) -> Self
pub fn paperpaw_sdk::Speech::rate(self, u16) -> Self
pub paperpaw_sdk::StackEntry::guards: bool
pub paperpaw_sdk::StackEntry::key: paperpaw_sdk::ScreenKey
pub paperpaw_sdk::StackEntry::overlay: bool
pub paperpaw_sdk::StackEntry::screen: paperpaw_sdk::Id
pub paperpaw_sdk::StackEntry::slot: core::option::Option<paperpaw_sdk::Id>
pub fn paperpaw_sdk::StackEntry::guarding(self, bool) -> Self
pub fn paperpaw_sdk::StackEntry::is(&self, &paperpaw_sdk::Id) -> bool
pub fn paperpaw_sdk::StackEntry::new(paperpaw_sdk::Id, core::option::Option<paperpaw_sdk::Id>, bool, paperpaw_sdk::ScreenKey) -> Self
pub paperpaw_sdk::StatusFrame::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::StatusFrame::color: paperpaw_platform::pixel::Color
pub paperpaw_sdk::StatusFrame::context: &'a paperpaw_sdk::Params
pub paperpaw_sdk::StatusFrame::font: &'a str
pub paperpaw_sdk::StatusFrame::place: core::option::Option<&'a str>
pub paperpaw_sdk::StatusFrame::size: f32
pub paperpaw_sdk::StatusFrame::top: bool
pub paperpaw_sdk::StatusItemSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::StatusItemSpec::min_width: f32
pub paperpaw_sdk::StatusItemSpec::priority: u8
pub paperpaw_sdk::StatusItemSpec::tap: core::option::Option<paperpaw_sdk::Id>
pub paperpaw_sdk::StatusItemSpec::title: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::StatusItemSpec::value: paperpaw_sdk::status::StatusFn
pub struct paperpaw_sdk::StatusItems
pub paperpaw_sdk::StatusLineSpec::draw: paperpaw_sdk::status::StatusLineFn
pub paperpaw_sdk::StatusLineSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::StatusLineSpec::signature: core::option::Option<paperpaw_sdk::status::StatusSignatureFn>
pub paperpaw_sdk::StatusLineSpec::targets: core::option::Option<paperpaw_sdk::status::StatusTargetsFn>
pub paperpaw_sdk::StatusLineSpec::title: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::Typed::context: paperpaw_sdk::Params
pub paperpaw_sdk::Typed::text: alloc::string::String
pub paperpaw_sdk::Typed::typing: bool
pub struct paperpaw_sdk::Uses(_)
pub const paperpaw_sdk::Uses::NETWORK: paperpaw_sdk::Uses
pub const paperpaw_sdk::Uses::NOTHING: paperpaw_sdk::Uses
pub const fn paperpaw_sdk::Uses::bits(self) -> u8
pub const fn paperpaw_sdk::Uses::contains(self, paperpaw_sdk::Uses) -> bool
pub const fn paperpaw_sdk::Uses::from_bits(u8) -> paperpaw_sdk::Uses
pub type paperpaw_sdk::Uses::Output = paperpaw_sdk::Uses
pub fn paperpaw_sdk::Uses::bitor(self, paperpaw_sdk::Uses) -> paperpaw_sdk::Uses
pub struct paperpaw_sdk::Version
pub paperpaw_sdk::Version::major: u16
pub paperpaw_sdk::Version::minor: u16
pub paperpaw_sdk::Version::patch: u16
pub const fn paperpaw_sdk::Version::new(u16, u16, u16) -> Self
pub fn paperpaw_sdk::Version::parse(&str) -> core::option::Option<paperpaw_sdk::Version>
pub fn paperpaw_sdk::Version::satisfies(&self, &paperpaw_sdk::Version) -> bool
pub fn paperpaw_sdk::Version::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub const paperpaw_sdk::COVER_FIT: paperpaw_image::Fit
pub const paperpaw_sdk::DATA_FORMATS: u32
pub const paperpaw_sdk::IMAGE_FIT: paperpaw_image::Fit
pub const paperpaw_sdk::MAX_CLIPBOARD: usize
pub const paperpaw_sdk::SDK_VERSION: paperpaw_sdk::Version
pub trait paperpaw_sdk::EventData: core::marker::Sized + 'static
pub fn paperpaw_sdk::EventData::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::EventData::to_params(&self) -> paperpaw_sdk::Params
pub fn ()::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn ()::to_params(&self) -> paperpaw_sdk::Params
pub fn paperpaw_sdk::Params::from_params(&paperpaw_sdk::Params) -> core::option::Option<Self>
pub fn paperpaw_sdk::Params::to_params(&self) -> paperpaw_sdk::Params
pub trait paperpaw_sdk::Plugin
pub fn paperpaw_sdk::Plugin::manifest(&self) -> paperpaw_sdk::Manifest
pub fn paperpaw_sdk::Plugin::register(&self, &mut paperpaw_sdk::contribution::Registrar) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub trait paperpaw_sdk::Screen
pub fn paperpaw_sdk::Screen::dims_below(&self) -> bool
pub fn paperpaw_sdk::Screen::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::Screen::grays(&self) -> bool
pub fn paperpaw_sdk::Screen::guards(&self) -> bool
pub fn paperpaw_sdk::Screen::hint(&self, &paperpaw_sdk::Id, &paperpaw_sdk::Env<'_>) -> paperpaw_sdk::Hint
pub fn paperpaw_sdk::Screen::hints(&self) -> core::option::Option<paperpaw_sdk::Hints>
pub fn paperpaw_sdk::Screen::holds_edges(&self) -> bool
pub fn paperpaw_sdk::Screen::mirrored(&self) -> bool
pub fn paperpaw_sdk::Screen::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::Screen::on_close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::Screen::on_close_request(&mut self, paperpaw_sdk::CloseCause, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::Screen::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::Screen::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::Screen::on_hide(&mut self)
pub fn paperpaw_sdk::Screen::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::Screen::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::Screen::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::Screen::outside(&self) -> paperpaw_sdk::Outside
pub fn paperpaw_sdk::Screen::passes_through(&self) -> bool
pub fn paperpaw_sdk::Screen::region(&self, &paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::Screen::secret(&self) -> bool
pub fn paperpaw_sdk::Screen::shows_through(&self) -> paperpaw_sdk::ShowsThrough
pub fn paperpaw_sdk::Screen::takes_double_taps(&self) -> bool
pub fn paperpaw_sdk::cover_fit(paperpaw_image::Fit) -> paperpaw_image::Fit
pub fn paperpaw_sdk::read_file(&dyn paperpaw_platform::storage::Storage, &str, usize) -> core::result::Result<alloc::vec::Vec<u8>, paperpaw_platform::storage::StorageError>
pub type paperpaw_sdk::ActionHandler = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
pub type paperpaw_sdk::ActionParamsHandler = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
pub type paperpaw_sdk::EventHandler = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
pub type paperpaw_sdk::FormatOpener = alloc::boxed::Box<dyn core::ops::function::Fn(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::OpenOptions) -> core::result::Result<alloc::boxed::Box<dyn paperpaw_document::Document>, paperpaw_document::DocumentError>>
pub type paperpaw_sdk::FormatPrepared = alloc::boxed::Box<dyn core::ops::function::Fn(&dyn paperpaw_platform::storage::Storage, &str, &paperpaw_sdk::OpenOptions) -> bool>
pub type paperpaw_sdk::ItemStateFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::ItemState>
pub type paperpaw_sdk::Observer = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>)>
pub type paperpaw_sdk::ScreenFactory = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::boxed::Box<dyn paperpaw_sdk::Screen>>
pub type paperpaw_sdk::StatusFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> core::option::Option<paperpaw_sdk::status::StatusValue>>
pub type paperpaw_sdk::StatusLineFn = alloc::boxed::Box<dyn core::ops::function::Fn(&mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>, &paperpaw_sdk::status::StatusFrame<'_>)>
pub type paperpaw_sdk::StatusSignatureFn = alloc::boxed::Box<dyn core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params) -> alloc::string::String>
```
