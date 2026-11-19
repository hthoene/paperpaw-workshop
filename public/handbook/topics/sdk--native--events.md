```rust
pub trait paperpaw_sdk::native::events::kinds::Kind: paperpaw_sdk::native::events::kinds::sealed::Sealed
pub struct paperpaw_sdk::native::events::Answered
pub const fn paperpaw_sdk::native::events::Answered::choice(self) -> u32
pub const fn paperpaw_sdk::native::events::Answered::dialog_closed(self) -> bool
pub const fn paperpaw_sdk::native::events::Answered::kind(self) -> paperpaw_sdk::native::ui::QuestionKind
pub const fn paperpaw_sdk::native::events::Answered::not_started(self) -> bool
pub const fn paperpaw_sdk::native::events::Answered::outcome(self) -> paperpaw_sdk::native::events::AnswerOutcome
pub const fn paperpaw_sdk::native::events::Answered::request(self) -> paperpaw_sdk::native::ui::RequestId
pub const fn paperpaw_sdk::native::events::Answered::text_bytes(self) -> u32
pub const fn paperpaw_sdk::native::events::Answered::typing_stopped(self) -> bool
pub struct paperpaw_sdk::native::events::ChargeFlags(_)
pub fn paperpaw_sdk::native::events::ChargeFlags::battery_low(&self) -> bool
pub fn paperpaw_sdk::native::events::ChargeFlags::charging(&self) -> bool
pub fn paperpaw_sdk::native::events::ChargeFlags::external_power(&self) -> bool
pub fn paperpaw_sdk::native::events::ChargeFlags::from_bits(u32) -> Self
pub struct paperpaw_sdk::native::events::LibraryChanges(_)
pub const fn paperpaw_sdk::native::events::LibraryChanges::annotations(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::bits(self) -> u32
pub const fn paperpaw_sdk::native::events::LibraryChanges::books(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::cover(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::fields(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::from_bits(u32) -> Self
pub const fn paperpaw_sdk::native::events::LibraryChanges::positions(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::status(self) -> bool
pub const fn paperpaw_sdk::native::events::LibraryChanges::walk(self) -> bool
pub struct paperpaw_sdk::native::events::PluginRequestId(_)
pub const fn paperpaw_sdk::native::events::PluginRequestId::get(self) -> u32
pub struct paperpaw_sdk::native::events::RegistryChanges(_)
pub const fn paperpaw_sdk::native::events::RegistryChanges::actions_or_screens(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::bindings(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::bits(self) -> u32
pub const fn paperpaw_sdk::native::events::RegistryChanges::dropped(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::from_bits(u32) -> Self
pub const fn paperpaw_sdk::native::events::RegistryChanges::groups(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::menus(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::presets(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::setup(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::slots(self) -> bool
pub const fn paperpaw_sdk::native::events::RegistryChanges::widgets(self) -> bool
pub struct paperpaw_sdk::native::events::kinds::ActionRun
pub const paperpaw_sdk::native::events::kinds::ActionRun::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ActionRun::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Answered
pub const paperpaw_sdk::native::events::kinds::Answered::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Answered::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BatteryMeasured
pub const paperpaw_sdk::native::events::kinds::BatteryMeasured::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BatteryMeasured::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Bluetooth
pub const paperpaw_sdk::native::events::kinds::Bluetooth::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Bluetooth::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BookClosed
pub const paperpaw_sdk::native::events::kinds::BookClosed::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BookClosed::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BookFinished
pub const paperpaw_sdk::native::events::kinds::BookFinished::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BookFinished::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BookMoved
pub const paperpaw_sdk::native::events::kinds::BookMoved::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BookMoved::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BookOpened
pub const paperpaw_sdk::native::events::kinds::BookOpened::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BookOpened::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::BookRemoved
pub const paperpaw_sdk::native::events::kinds::BookRemoved::TAG: u32
pub const paperpaw_sdk::native::events::kinds::BookRemoved::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Broadcast
pub const paperpaw_sdk::native::events::kinds::Broadcast::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Broadcast::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ChargeChanged
pub const paperpaw_sdk::native::events::kinds::ChargeChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ChargeChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::DisplayChanged
pub const paperpaw_sdk::native::events::kinds::DisplayChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::DisplayChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::DocumentChanged
pub const paperpaw_sdk::native::events::kinds::DocumentChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::DocumentChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::DocumentClosed
pub const paperpaw_sdk::native::events::kinds::DocumentClosed::TAG: u32
pub const paperpaw_sdk::native::events::kinds::DocumentClosed::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::FirmwareChanged
pub const paperpaw_sdk::native::events::kinds::FirmwareChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::FirmwareChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::HttpDone
pub const paperpaw_sdk::native::events::kinds::HttpDone::TAG: u32
pub const paperpaw_sdk::native::events::kinds::HttpDone::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::HttpProgress
pub const paperpaw_sdk::native::events::kinds::HttpProgress::TAG: u32
pub const paperpaw_sdk::native::events::kinds::HttpProgress::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ImageReady
pub const paperpaw_sdk::native::events::kinds::ImageReady::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ImageReady::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::InstallDone
pub const paperpaw_sdk::native::events::kinds::InstallDone::TAG: u32
pub const paperpaw_sdk::native::events::kinds::InstallDone::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::LibraryChanged
pub const paperpaw_sdk::native::events::kinds::LibraryChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::LibraryChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::LookupReady
pub const paperpaw_sdk::native::events::kinds::LookupReady::TAG: u32
pub const paperpaw_sdk::native::events::kinds::LookupReady::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::NetworkIdle
pub const paperpaw_sdk::native::events::kinds::NetworkIdle::TAG: u32
pub const paperpaw_sdk::native::events::kinds::NetworkIdle::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::NetworkWanted
pub const paperpaw_sdk::native::events::kinds::NetworkWanted::TAG: u32
pub const paperpaw_sdk::native::events::kinds::NetworkWanted::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PageTurned
pub const paperpaw_sdk::native::events::kinds::PageTurned::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PageTurned::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PluginAnswered
pub const paperpaw_sdk::native::events::kinds::PluginAnswered::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PluginAnswered::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PluginsChanged
pub const paperpaw_sdk::native::events::kinds::PluginsChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PluginsChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PluginsRequested
pub const paperpaw_sdk::native::events::kinds::PluginsRequested::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PluginsRequested::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PowerChanged
pub const paperpaw_sdk::native::events::kinds::PowerChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PowerChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::PreviewChanged
pub const paperpaw_sdk::native::events::kinds::PreviewChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::PreviewChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::RegistryChanged
pub const paperpaw_sdk::native::events::kinds::RegistryChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::RegistryChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Resume
pub const paperpaw_sdk::native::events::kinds::Resume::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Resume::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ScreenClosed
pub const paperpaw_sdk::native::events::kinds::ScreenClosed::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ScreenClosed::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ScreenHidden
pub const paperpaw_sdk::native::events::kinds::ScreenHidden::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ScreenHidden::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ScreenOpened
pub const paperpaw_sdk::native::events::kinds::ScreenOpened::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ScreenOpened::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ScreenReady
pub const paperpaw_sdk::native::events::kinds::ScreenReady::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ScreenReady::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ScreenShown
pub const paperpaw_sdk::native::events::kinds::ScreenShown::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ScreenShown::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::ServedRequest
pub const paperpaw_sdk::native::events::kinds::ServedRequest::TAG: u32
pub const paperpaw_sdk::native::events::kinds::ServedRequest::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Server
pub const paperpaw_sdk::native::events::kinds::Server::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Server::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::SettingChanged
pub const paperpaw_sdk::native::events::kinds::SettingChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::SettingChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Socket
pub const paperpaw_sdk::native::events::kinds::Socket::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Socket::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Spoken
pub const paperpaw_sdk::native::events::kinds::Spoken::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Spoken::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::StackChanged
pub const paperpaw_sdk::native::events::kinds::StackChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::StackChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::StageCall
pub const paperpaw_sdk::native::events::kinds::StageCall::TAG: u32
pub const paperpaw_sdk::native::events::kinds::StageCall::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Started
pub const paperpaw_sdk::native::events::kinds::Started::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Started::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::StatusChanged
pub const paperpaw_sdk::native::events::kinds::StatusChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::StatusChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Stopping
pub const paperpaw_sdk::native::events::kinds::Stopping::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Stopping::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Suspend
pub const paperpaw_sdk::native::events::kinds::Suspend::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Suspend::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::TextTyped
pub const paperpaw_sdk::native::events::kinds::TextTyped::TAG: u32
pub const paperpaw_sdk::native::events::kinds::TextTyped::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::Tick
pub const paperpaw_sdk::native::events::kinds::Tick::TAG: u32
pub const paperpaw_sdk::native::events::kinds::Tick::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WidgetChanged
pub const paperpaw_sdk::native::events::kinds::WidgetChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WidgetChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WidgetDropped
pub const paperpaw_sdk::native::events::kinds::WidgetDropped::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WidgetDropped::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WidgetMade
pub const paperpaw_sdk::native::events::kinds::WidgetMade::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WidgetMade::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WifiChanged
pub const paperpaw_sdk::native::events::kinds::WifiChanged::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WifiChanged::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WifiDone
pub const paperpaw_sdk::native::events::kinds::WifiDone::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WifiDone::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WifiScanned
pub const paperpaw_sdk::native::events::kinds::WifiScanned::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WifiScanned::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WorkAllowed
pub const paperpaw_sdk::native::events::kinds::WorkAllowed::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WorkAllowed::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WorkDue
pub const paperpaw_sdk::native::events::kinds::WorkDue::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WorkDue::TAG: u32
pub struct paperpaw_sdk::native::events::kinds::WorkRefused
pub const paperpaw_sdk::native::events::kinds::WorkRefused::TAG: u32
pub const paperpaw_sdk::native::events::kinds::WorkRefused::TAG: u32
pub enum paperpaw_sdk::native::events::AnswerOutcome
pub paperpaw_sdk::native::events::AnswerOutcome::Answered
pub paperpaw_sdk::native::events::AnswerOutcome::Cancelled
pub paperpaw_sdk::native::events::AnswerOutcome::Typing
pub enum paperpaw_sdk::native::events::BluetoothDeviceKind
pub paperpaw_sdk::native::events::BluetoothDeviceKind::Keyboard
pub paperpaw_sdk::native::events::BluetoothDeviceKind::Other
pub paperpaw_sdk::native::events::BluetoothDeviceKind::Phone
pub paperpaw_sdk::native::events::BluetoothDeviceKind::Remote
pub paperpaw_sdk::native::events::BluetoothDeviceKind::Sensor
pub enum paperpaw_sdk::native::events::BluetoothKind
pub paperpaw_sdk::native::events::BluetoothKind::Changed
pub paperpaw_sdk::native::events::BluetoothKind::Connected
pub paperpaw_sdk::native::events::BluetoothKind::Disconnected
pub paperpaw_sdk::native::events::BluetoothKind::Done
pub paperpaw_sdk::native::events::BluetoothKind::Failed
pub paperpaw_sdk::native::events::BluetoothKind::Found
pub paperpaw_sdk::native::events::BluetoothKind::Other
pub paperpaw_sdk::native::events::BluetoothKind::Paired
pub paperpaw_sdk::native::events::BluetoothKind::ScanEnded
pub enum paperpaw_sdk::native::events::BluetoothReason
pub paperpaw_sdk::native::events::BluetoothReason::Att
pub paperpaw_sdk::native::events::BluetoothReason::Busy
pub paperpaw_sdk::native::events::BluetoothReason::Declined
pub paperpaw_sdk::native::events::BluetoothReason::Held
pub paperpaw_sdk::native::events::BluetoothReason::Lost
pub paperpaw_sdk::native::events::BluetoothReason::NotAllowed
pub paperpaw_sdk::native::events::BluetoothReason::NotFound
pub paperpaw_sdk::native::events::BluetoothReason::Off
pub paperpaw_sdk::native::events::BluetoothReason::Other
pub paperpaw_sdk::native::events::BluetoothReason::Timeout
pub paperpaw_sdk::native::events::BluetoothReason::Unsupported
pub enum paperpaw_sdk::native::events::BookKind
pub paperpaw_sdk::native::events::BookKind::Closed
pub paperpaw_sdk::native::events::BookKind::Finished
pub paperpaw_sdk::native::events::BookKind::Opened
pub enum paperpaw_sdk::native::events::SpeechStatus
pub paperpaw_sdk::native::events::SpeechStatus::NoVoice
pub paperpaw_sdk::native::events::SpeechStatus::Spoken
pub paperpaw_sdk::native::events::SpeechStatus::Stopped
pub paperpaw_sdk::native::events::SpeechStatus::Unsupported
pub enum paperpaw_sdk::native::events::WifiFailure
pub paperpaw_sdk::native::events::WifiFailure::NeedsUser
pub paperpaw_sdk::native::events::WifiFailure::NotFound
pub paperpaw_sdk::native::events::WifiFailure::Other
pub paperpaw_sdk::native::events::WifiFailure::Password
pub paperpaw_sdk::native::events::WifiFailure::Superseded
pub paperpaw_sdk::native::events::WifiFailure::Timeout
pub paperpaw_sdk::native::events::WifiFailure::Unsupported
pub enum paperpaw_sdk::native::events::WifiLinkState
pub paperpaw_sdk::native::events::WifiLinkState::AccessPoint
pub paperpaw_sdk::native::events::WifiLinkState::Connected
pub paperpaw_sdk::native::events::WifiLinkState::Connecting
pub paperpaw_sdk::native::events::WifiLinkState::Off
pub paperpaw_sdk::native::events::WifiLinkState::On
pub struct paperpaw_sdk::native::events::BluetoothChange<'a>
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::device(&self) -> u32
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::device_kind(&self) -> paperpaw_sdk::native::events::BluetoothDeviceKind
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::kind(&self) -> paperpaw_sdk::native::events::BluetoothKind
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::name(&self) -> &'a str
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::now_ms(&self) -> u64
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::reason(&self) -> core::option::Option<paperpaw_sdk::native::events::BluetoothReason>
pub fn paperpaw_sdk::native::events::BluetoothChange<'a>::signal(&self) -> core::option::Option<i32>
pub enum paperpaw_sdk::native::events::Event<'a>
pub fn paperpaw_sdk::native::events::Event<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub paperpaw_sdk::native::events::Event::ActionRun
pub paperpaw_sdk::native::events::Event::ActionRun::action: &'a str
pub paperpaw_sdk::native::events::Event::ActionRun::background: bool
pub paperpaw_sdk::native::events::Event::ActionRun::now_ms: u64
pub paperpaw_sdk::native::events::Event::Answered
pub paperpaw_sdk::native::events::Event::Answered::answer: paperpaw_sdk::native::events::Answered
pub paperpaw_sdk::native::events::Event::Answered::now_ms: u64
pub paperpaw_sdk::native::events::Event::BatteryMeasured
pub paperpaw_sdk::native::events::Event::BatteryMeasured::now_ms: u64
pub paperpaw_sdk::native::events::Event::Bluetooth(paperpaw_sdk::native::events::BluetoothChange<'a>)
pub paperpaw_sdk::native::events::Event::Book
pub paperpaw_sdk::native::events::Event::Book::kind: paperpaw_sdk::native::events::BookKind
pub paperpaw_sdk::native::events::Event::Book::reading: paperpaw_sdk::native::events::ReadingView<'a>
pub paperpaw_sdk::native::events::Event::Book::reason: u32
pub paperpaw_sdk::native::events::Event::BookMoved
pub paperpaw_sdk::native::events::Event::BookMoved::from: &'a str
pub paperpaw_sdk::native::events::Event::BookMoved::now_ms: u64
pub paperpaw_sdk::native::events::Event::BookMoved::path: &'a str
pub paperpaw_sdk::native::events::Event::BookRemoved
pub paperpaw_sdk::native::events::Event::BookRemoved::now_ms: u64
pub paperpaw_sdk::native::events::Event::BookRemoved::path: &'a str
pub paperpaw_sdk::native::events::Event::Broadcast(paperpaw_sdk::native::sockets::BroadcastEvent<'a>)
pub paperpaw_sdk::native::events::Event::ChargeChanged
pub paperpaw_sdk::native::events::Event::ChargeChanged::flags: paperpaw_sdk::native::events::ChargeFlags
pub paperpaw_sdk::native::events::Event::ChargeChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::DisplayChanged
pub paperpaw_sdk::native::events::Event::DisplayChanged::height: u32
pub paperpaw_sdk::native::events::Event::DisplayChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::DisplayChanged::ppi: u32
pub paperpaw_sdk::native::events::Event::DisplayChanged::width: u32
pub paperpaw_sdk::native::events::Event::DocumentChanged
pub paperpaw_sdk::native::events::Event::DocumentChanged::document: paperpaw_sdk::native::document::DocId
pub paperpaw_sdk::native::events::Event::DocumentChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::DocumentChanged::progress_ppm: u32
pub paperpaw_sdk::native::events::Event::DocumentChanged::state: paperpaw_sdk::native::document::Preparation
pub paperpaw_sdk::native::events::Event::DocumentClosed
pub paperpaw_sdk::native::events::Event::DocumentClosed::document: paperpaw_sdk::native::document::DocId
pub paperpaw_sdk::native::events::Event::DocumentClosed::now_ms: u64
pub paperpaw_sdk::native::events::Event::DocumentClosed::reason: paperpaw_sdk::native::document::DocClosedReason
pub paperpaw_sdk::native::events::Event::FirmwareChanged
pub paperpaw_sdk::native::events::Event::FirmwareChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::FirmwareChanged::request: core::option::Option<paperpaw_sdk::native::device::DeviceRequest>
pub paperpaw_sdk::native::events::Event::FirmwareChanged::state: paperpaw_sdk::native::device::FirmwareState
pub paperpaw_sdk::native::events::Event::HttpDone(paperpaw_sdk::native::net::HttpDone)
pub paperpaw_sdk::native::events::Event::HttpProgress(paperpaw_sdk::native::net::HttpProgress)
pub paperpaw_sdk::native::events::Event::ImageReady(paperpaw_sdk::native::image::ImageReady)
pub paperpaw_sdk::native::events::Event::InstallDone(paperpaw_sdk::native::events::InstallDone<'a>)
pub paperpaw_sdk::native::events::Event::LibraryChanged
pub paperpaw_sdk::native::events::Event::LibraryChanged::generation: u32
pub paperpaw_sdk::native::events::Event::LibraryChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::LibraryChanged::path: &'a str
pub paperpaw_sdk::native::events::Event::LibraryChanged::what: paperpaw_sdk::native::events::LibraryChanges
pub paperpaw_sdk::native::events::Event::LookupReady
pub paperpaw_sdk::native::events::Event::LookupReady::now_ms: u64
pub paperpaw_sdk::native::events::Event::LookupReady::provider: &'a str
pub paperpaw_sdk::native::events::Event::NetworkIdle
pub paperpaw_sdk::native::events::Event::NetworkIdle::now_ms: u64
pub paperpaw_sdk::native::events::Event::NetworkWanted
pub paperpaw_sdk::native::events::Event::NetworkWanted::now_ms: u64
pub paperpaw_sdk::native::events::Event::PageTurned(paperpaw_sdk::native::events::ReadingView<'a>)
pub paperpaw_sdk::native::events::Event::PluginAnswered
pub paperpaw_sdk::native::events::Event::PluginAnswered::now_ms: u64
pub paperpaw_sdk::native::events::Event::PluginAnswered::outcome: paperpaw_sdk::native::commands::PluginOutcome
pub paperpaw_sdk::native::events::Event::PluginAnswered::plugin: &'a str
pub paperpaw_sdk::native::events::Event::PluginAnswered::request: paperpaw_sdk::native::events::PluginRequestId
pub paperpaw_sdk::native::events::Event::PluginsChanged
pub paperpaw_sdk::native::events::Event::PluginsChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::PluginsRequested
pub paperpaw_sdk::native::events::Event::PluginsRequested::by: &'a str
pub paperpaw_sdk::native::events::Event::PluginsRequested::now_ms: u64
pub paperpaw_sdk::native::events::Event::PluginsRequested::plugins: paperpaw_sdk::native::events::RequestedPlugins<'a>
pub paperpaw_sdk::native::events::Event::PluginsRequested::request: paperpaw_sdk::native::events::PluginRequestId
pub paperpaw_sdk::native::events::Event::PowerChanged(paperpaw_sdk::native::events::PowerChange<'a>)
pub paperpaw_sdk::native::events::Event::PreviewChanged
pub paperpaw_sdk::native::events::Event::PreviewChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::RegistryChanged
pub paperpaw_sdk::native::events::Event::RegistryChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::RegistryChanged::what: paperpaw_sdk::native::events::RegistryChanges
pub paperpaw_sdk::native::events::Event::Resume
pub paperpaw_sdk::native::events::Event::Resume::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenClosed
pub paperpaw_sdk::native::events::Event::ScreenClosed::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::ScreenClosed::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenClosed::screen: &'a str
pub paperpaw_sdk::native::events::Event::ScreenHidden
pub paperpaw_sdk::native::events::Event::ScreenHidden::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::ScreenHidden::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenHidden::screen: &'a str
pub paperpaw_sdk::native::events::Event::ScreenOpened
pub paperpaw_sdk::native::events::Event::ScreenOpened::again: bool
pub paperpaw_sdk::native::events::Event::ScreenOpened::handover: core::option::Option<paperpaw_sdk::native::ui::HandoverId>
pub paperpaw_sdk::native::events::Event::ScreenOpened::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::ScreenOpened::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenOpened::params: u32
pub paperpaw_sdk::native::events::Event::ScreenOpened::restored: bool
pub paperpaw_sdk::native::events::Event::ScreenOpened::screen: &'a str
pub paperpaw_sdk::native::events::Event::ScreenOpened::slot: &'a str
pub paperpaw_sdk::native::events::Event::ScreenOpened::text_bytes: u32
pub paperpaw_sdk::native::events::Event::ScreenReady
pub paperpaw_sdk::native::events::Event::ScreenReady::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::ScreenReady::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenReady::screen: &'a str
pub paperpaw_sdk::native::events::Event::ScreenShown
pub paperpaw_sdk::native::events::Event::ScreenShown::height: u32
pub paperpaw_sdk::native::events::Event::ScreenShown::instance: core::option::Option<paperpaw_sdk::native::ui::Instance>
pub paperpaw_sdk::native::events::Event::ScreenShown::last_input: core::option::Option<paperpaw_sdk::keys::InputMode>
pub paperpaw_sdk::native::events::Event::ScreenShown::now_ms: u64
pub paperpaw_sdk::native::events::Event::ScreenShown::screen: &'a str
pub paperpaw_sdk::native::events::Event::ScreenShown::width: u32
pub paperpaw_sdk::native::events::Event::ServedRequest(paperpaw_sdk::native::net::ServedRequest<'a>)
pub paperpaw_sdk::native::events::Event::Server(paperpaw_sdk::native::net::ServerEvent<'a>)
pub paperpaw_sdk::native::events::Event::SettingChanged
pub paperpaw_sdk::native::events::Event::SettingChanged::key: &'a str
pub paperpaw_sdk::native::events::Event::SettingChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::SettingChanged::old: core::option::Option<paperpaw_sdk::native::settings::SettingValue<'a>>
pub paperpaw_sdk::native::events::Event::Socket(paperpaw_sdk::native::sockets::SocketEvent)
pub paperpaw_sdk::native::events::Event::Spoken
pub paperpaw_sdk::native::events::Event::Spoken::cookie: u32
pub paperpaw_sdk::native::events::Event::Spoken::now_ms: u64
pub paperpaw_sdk::native::events::Event::Spoken::status: paperpaw_sdk::native::events::SpeechStatus
pub paperpaw_sdk::native::events::Event::StackChanged
pub paperpaw_sdk::native::events::Event::StackChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::StageCall
pub paperpaw_sdk::native::events::Event::StageCall::payload: &'a [u8]
pub paperpaw_sdk::native::events::Event::StageCall::schema: u32
pub paperpaw_sdk::native::events::Event::StageCall::stage: &'a str
pub paperpaw_sdk::native::events::Event::Started
pub paperpaw_sdk::native::events::Event::Started::now_ms: u64
pub paperpaw_sdk::native::events::Event::StatusChanged
pub paperpaw_sdk::native::events::Event::StatusChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::Stopping
pub paperpaw_sdk::native::events::Event::Stopping::now_ms: u64
pub paperpaw_sdk::native::events::Event::Suspend
pub paperpaw_sdk::native::events::Event::Suspend::now_ms: u64
pub paperpaw_sdk::native::events::Event::TextTyped
pub paperpaw_sdk::native::events::Event::TextTyped::done: bool
pub paperpaw_sdk::native::events::Event::TextTyped::now_ms: u64
pub paperpaw_sdk::native::events::Event::TextTyped::text: paperpaw_sdk::native::events::TypedText<'a>
pub paperpaw_sdk::native::events::Event::Tick
pub paperpaw_sdk::native::events::Event::Tick::now_ms: u64
pub paperpaw_sdk::native::events::Event::WidgetChanged
pub paperpaw_sdk::native::events::Event::WidgetChanged::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::WidgetChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::WidgetDropped
pub paperpaw_sdk::native::events::Event::WidgetDropped::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::WidgetDropped::now_ms: u64
pub paperpaw_sdk::native::events::Event::WidgetMade
pub paperpaw_sdk::native::events::Event::WidgetMade::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::events::Event::WidgetMade::now_ms: u64
pub paperpaw_sdk::native::events::Event::WidgetMade::place: &'a str
pub paperpaw_sdk::native::events::Event::WidgetMade::widget: &'a str
pub paperpaw_sdk::native::events::Event::WifiChanged
pub paperpaw_sdk::native::events::Event::WifiChanged::now_ms: u64
pub paperpaw_sdk::native::events::Event::WifiChanged::state: paperpaw_sdk::native::events::WifiLinkState
pub paperpaw_sdk::native::events::Event::WifiDone(paperpaw_sdk::native::events::WifiDone<'a>)
pub paperpaw_sdk::native::events::Event::WifiScanned
pub paperpaw_sdk::native::events::Event::WifiScanned::networks: u32
pub paperpaw_sdk::native::events::Event::WifiScanned::now_ms: u64
pub paperpaw_sdk::native::events::Event::WorkAllowed
pub paperpaw_sdk::native::events::Event::WorkAllowed::now_ms: u64
pub paperpaw_sdk::native::events::Event::WorkDue(paperpaw_sdk::native::work::WorkDue<'a>)
pub paperpaw_sdk::native::events::Event::WorkRefused(paperpaw_sdk::native::work::WorkRefused<'a>)
pub struct paperpaw_sdk::native::events::Incoming<'a>
pub fn paperpaw_sdk::native::events::Incoming<'a>::decode(&self) -> core::result::Result<paperpaw_sdk::native::events::Event<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::events::Incoming<'a>::decode_as<K: paperpaw_sdk::native::events::kinds::Kind>(&self) -> core::result::Result<core::option::Option<paperpaw_sdk::native::events::Event<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::events::Incoming<'a>::is<K: paperpaw_sdk::native::events::kinds::Kind>(&self) -> bool
pub fn paperpaw_sdk::native::events::Incoming<'a>::new(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::events::Incoming<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::events::InstallDone<'a>
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::at_next_start(&self) -> bool
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::data_kept(&self) -> bool
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::id(&self) -> &'a str
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::kind(&self) -> paperpaw_sdk::native::device::InstallKind
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::outcome(&self) -> paperpaw_sdk::native::device::DeviceOutcome
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::request(&self) -> core::option::Option<paperpaw_sdk::native::device::DeviceRequest>
pub const fn paperpaw_sdk::native::events::InstallDone<'a>::status(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::events::PowerChange<'a>
pub fn paperpaw_sdk::native::events::PowerChange<'a>::automatic(&self) -> bool
pub fn paperpaw_sdk::native::events::PowerChange<'a>::level(&self) -> paperpaw_sdk::native::device::PowerLevel
pub fn paperpaw_sdk::native::events::PowerChange<'a>::mode(&self) -> &'a str
pub fn paperpaw_sdk::native::events::PowerChange<'a>::now_ms(&self) -> u64
pub fn paperpaw_sdk::native::events::PowerChange<'a>::stretch(&self) -> u32
pub struct paperpaw_sdk::native::events::ReadingView<'a>
pub fn paperpaw_sdk::native::events::ReadingView<'a>::chapter(&self) -> &'a str
pub fn paperpaw_sdk::native::events::ReadingView<'a>::chapter_left(&self) -> core::option::Option<u32>
pub fn paperpaw_sdk::native::events::ReadingView<'a>::insert(&self) -> u32
pub fn paperpaw_sdk::native::events::ReadingView<'a>::now_ms(&self) -> u64
pub fn paperpaw_sdk::native::events::ReadingView<'a>::offset(&self) -> u32
pub fn paperpaw_sdk::native::events::ReadingView<'a>::page(&self) -> core::option::Option<u32>
pub fn paperpaw_sdk::native::events::ReadingView<'a>::pages(&self) -> core::option::Option<u32>
pub fn paperpaw_sdk::native::events::ReadingView<'a>::path(&self) -> &'a str
pub fn paperpaw_sdk::native::events::ReadingView<'a>::progress_ppm(&self) -> u32
pub fn paperpaw_sdk::native::events::ReadingView<'a>::section(&self) -> u32
pub fn paperpaw_sdk::native::events::ReadingView<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::events::RequestedPlugins<'a>(_)
pub fn paperpaw_sdk::native::events::RequestedPlugins<'a>::is_empty(self) -> bool
pub fn paperpaw_sdk::native::events::RequestedPlugins<'a>::iter(self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str> + core::clone::Clone
pub fn paperpaw_sdk::native::events::RequestedPlugins<'a>::len(self) -> usize
pub struct paperpaw_sdk::native::events::TypedText<'a>(_)
pub const fn paperpaw_sdk::native::events::TypedText<'a>::as_str(&self) -> &'a str
pub fn paperpaw_sdk::native::events::TypedText<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::events::WifiDone<'a>
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::failure(&self) -> core::option::Option<paperpaw_sdk::native::events::WifiFailure>
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::request(&self) -> core::option::Option<paperpaw_sdk::native::device::DeviceRequest>
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::ssid(&self) -> &'a str
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::state(&self) -> paperpaw_sdk::native::events::WifiLinkState
pub const fn paperpaw_sdk::native::events::WifiDone<'a>::status(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub mod paperpaw_sdk::native::events::kinds
pub const paperpaw_sdk::native::events::kinds::Kind::TAG: u32
```
