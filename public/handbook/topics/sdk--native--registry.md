```rust
pub struct paperpaw_sdk::native::registry::PageCursor
pub const fn paperpaw_sdk::native::registry::PageCursor::generation(self) -> u32
pub const fn paperpaw_sdk::native::registry::PageCursor::offset(self) -> u32
pub const fn paperpaw_sdk::native::registry::PageCursor::start() -> Self
pub struct paperpaw_sdk::native::registry::Registry
pub fn paperpaw_sdk::native::registry::Registry::actions<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::bindings<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryBinding<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::choices<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryChoice<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::groups<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryGroup<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::inputs<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::menu<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::MenuQuery, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryMenuRow<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::menus<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::needs<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryNeed<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::plugins<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryPlugin<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::presets<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::screens<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::settings<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistrySetting<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::setup<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistrySetupStep<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::slot_offers<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryItem<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::slots<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistrySlot<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::values<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::ValuesQuery<'_>, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryValue<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::widgets<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryWidget<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::widgets_previewing<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryWidget<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::plugin<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPluginDetail<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::preset<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPresetDetail<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::setting<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistrySettingDetail<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::registry::Registry::status<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::registry::StatusScope, paperpaw_sdk::native::registry::PageCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::registry::RegistryPage<'a, paperpaw_sdk::native::registry::RegistryStatus<'a>>, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::registry::RegistryPageEnd
pub const fn paperpaw_sdk::native::registry::RegistryPageEnd::generation(self) -> u32
pub const fn paperpaw_sdk::native::registry::RegistryPageEnd::is_last(self) -> bool
pub const fn paperpaw_sdk::native::registry::RegistryPageEnd::next_cursor(self) -> core::option::Option<paperpaw_sdk::native::registry::PageCursor>
pub const fn paperpaw_sdk::native::registry::RegistryPageEnd::total(self) -> u32
pub enum paperpaw_sdk::native::registry::MenuQuery
pub paperpaw_sdk::native::registry::MenuQuery::All
pub paperpaw_sdk::native::registry::MenuQuery::Current
pub paperpaw_sdk::native::registry::MenuQuery::Declared
pub enum paperpaw_sdk::native::registry::RegistryBindingOrigin
pub paperpaw_sdk::native::registry::RegistryBindingOrigin::Device
pub paperpaw_sdk::native::registry::RegistryBindingOrigin::Plugin
pub paperpaw_sdk::native::registry::RegistryBindingOrigin::Preset
pub paperpaw_sdk::native::registry::RegistryBindingOrigin::Unknown(u32)
pub paperpaw_sdk::native::registry::RegistryBindingOrigin::User
pub enum paperpaw_sdk::native::registry::RegistryMenuKind
pub paperpaw_sdk::native::registry::RegistryMenuKind::Action
pub paperpaw_sdk::native::registry::RegistryMenuKind::Section
pub paperpaw_sdk::native::registry::RegistryMenuKind::Setting
pub paperpaw_sdk::native::registry::RegistryMenuKind::Submenu
pub paperpaw_sdk::native::registry::RegistryMenuKind::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistryNeedKind
pub paperpaw_sdk::native::registry::RegistryNeedKind::Feature
pub paperpaw_sdk::native::registry::RegistryNeedKind::Plugin
pub paperpaw_sdk::native::registry::RegistryNeedKind::Service
pub paperpaw_sdk::native::registry::RegistryNeedKind::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistryPluginKind
pub paperpaw_sdk::native::registry::RegistryPluginKind::BuiltIn
pub paperpaw_sdk::native::registry::RegistryPluginKind::Code
pub paperpaw_sdk::native::registry::RegistryPluginKind::Data
pub paperpaw_sdk::native::registry::RegistryPluginKind::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistryPluginState
pub paperpaw_sdk::native::registry::RegistryPluginState::Failed
pub paperpaw_sdk::native::registry::RegistryPluginState::Off
pub paperpaw_sdk::native::registry::RegistryPluginState::Running
pub paperpaw_sdk::native::registry::RegistryPluginState::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistrySettingKind
pub paperpaw_sdk::native::registry::RegistrySettingKind::Bool
pub paperpaw_sdk::native::registry::RegistrySettingKind::Choice
pub paperpaw_sdk::native::registry::RegistrySettingKind::Int
pub paperpaw_sdk::native::registry::RegistrySettingKind::Language
pub paperpaw_sdk::native::registry::RegistrySettingKind::List
pub paperpaw_sdk::native::registry::RegistrySettingKind::Text
pub paperpaw_sdk::native::registry::RegistrySettingKind::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistrySetupPageKind
pub paperpaw_sdk::native::registry::RegistrySetupPageKind::Screen
pub paperpaw_sdk::native::registry::RegistrySetupPageKind::Setting
pub paperpaw_sdk::native::registry::RegistrySetupPageKind::Unknown(u32)
pub enum paperpaw_sdk::native::registry::RegistryValueSource
pub paperpaw_sdk::native::registry::RegistryValueSource::BookScope
pub paperpaw_sdk::native::registry::RegistryValueSource::Default
pub paperpaw_sdk::native::registry::RegistryValueSource::Preset
pub paperpaw_sdk::native::registry::RegistryValueSource::Profile
pub paperpaw_sdk::native::registry::RegistryValueSource::Unknown(u32)
pub paperpaw_sdk::native::registry::RegistryValueSource::User
pub enum paperpaw_sdk::native::registry::StatusKind
pub paperpaw_sdk::native::registry::StatusKind::Item
pub paperpaw_sdk::native::registry::StatusKind::Line
pub enum paperpaw_sdk::native::registry::StatusScope
pub paperpaw_sdk::native::registry::StatusScope::All
pub paperpaw_sdk::native::registry::StatusScope::Items
pub paperpaw_sdk::native::registry::StatusScope::Lines
pub enum paperpaw_sdk::native::registry::ValuesQuery<'a>
pub paperpaw_sdk::native::registry::ValuesQuery::Placement(&'a str)
pub paperpaw_sdk::native::registry::ValuesQuery::Preset(&'a str)
pub struct paperpaw_sdk::native::registry::RegistryBinding<'a>
pub fn paperpaw_sdk::native::registry::RegistryBinding<'a>::action(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryBinding<'a>::input(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryBinding<'a>::layer(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryBinding<'a>::origin(&self) -> paperpaw_sdk::native::registry::RegistryBindingOrigin
pub struct paperpaw_sdk::native::registry::RegistryChoice<'a>
pub fn paperpaw_sdk::native::registry::RegistryChoice<'a>::title(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryChoice<'a>::value(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryGroup<'a>
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::icon(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::order(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::page(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::parent(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryGroup<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryItem<'a>
pub fn paperpaw_sdk::native::registry::RegistryItem<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryItem<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryItem<'a>::plugin(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryItem<'a>::title(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryItem<'a>::user_defined(&self) -> bool
pub struct paperpaw_sdk::native::registry::RegistryMenuRow<'a>
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::badge(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::by(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::describe(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::icon(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::item(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::kind(&self) -> paperpaw_sdk::native::registry::RegistryMenuKind
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::order(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistryMenuRow<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryNeed<'a>
pub fn paperpaw_sdk::native::registry::RegistryNeed<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryNeed<'a>::key(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryNeed<'a>::kind(&self) -> paperpaw_sdk::native::registry::RegistryNeedKind
pub fn paperpaw_sdk::native::registry::RegistryNeed<'a>::version(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryPage<'a, T>
pub const fn paperpaw_sdk::native::registry::RegistryPage<'a, T>::end(&self) -> paperpaw_sdk::native::registry::RegistryPageEnd
pub const fn paperpaw_sdk::native::registry::RegistryPage<'a, T>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::registry::RegistryPage<'a, T>::len(&self) -> usize
pub fn paperpaw_sdk::native::registry::RegistryPage<'a, T>::rows(&self) -> paperpaw_sdk::native::registry::RegistryRows<'a, T>
pub fn paperpaw_sdk::native::registry::RegistryPage<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::registry::RegistryPlugin<'a>
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::kind(&self) -> paperpaw_sdk::native::registry::RegistryPluginKind
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::name(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::problem(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::problem_arg(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::state(&self) -> paperpaw_sdk::native::registry::RegistryPluginState
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::update(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryPlugin<'a>::version(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryPluginDetail<'a>
pub const fn paperpaw_sdk::native::registry::RegistryPluginDetail<'a>::description(&self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::registry::RegistryPluginDetail<'a>::plugin(&self) -> paperpaw_sdk::native::registry::RegistryPlugin<'a>
pub struct paperpaw_sdk::native::registry::RegistryPresetDetail<'a>
pub const fn paperpaw_sdk::native::registry::RegistryPresetDetail<'a>::description(&self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::registry::RegistryPresetDetail<'a>::preset(&self) -> paperpaw_sdk::native::registry::RegistryItem<'a>
pub struct paperpaw_sdk::native::registry::RegistryRows<'a, T>
pub type paperpaw_sdk::native::registry::RegistryRows<'a, T>::Item = T
pub fn paperpaw_sdk::native::registry::RegistryRows<'a, T>::next(&mut self) -> core::option::Option<T>
pub fn paperpaw_sdk::native::registry::RegistryRows<'a, T>::size_hint(&self) -> (usize, core::option::Option<usize>)
pub fn paperpaw_sdk::native::registry::RegistryRows<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::registry::RegistrySetting<'a>
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::group(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::key(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::kind(&self) -> paperpaw_sdk::native::registry::RegistrySettingKind
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::source(&self) -> paperpaw_sdk::native::registry::RegistryValueSource
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::title(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetting<'a>::value(&self) -> core::option::Option<paperpaw_sdk::native::settings::SettingValue<'a>>
pub struct paperpaw_sdk::native::registry::RegistrySettingDetail<'a>
pub const fn paperpaw_sdk::native::registry::RegistrySettingDetail<'a>::extra(&self) -> paperpaw_sdk::native::registry::RegistrySettingExtra<'a>
pub const fn paperpaw_sdk::native::registry::RegistrySettingDetail<'a>::help(&self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::registry::RegistrySettingDetail<'a>::setting(&self) -> paperpaw_sdk::native::registry::RegistrySetting<'a>
pub struct paperpaw_sdk::native::registry::RegistrySettingExtra<'a>
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::choices(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::editor(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::editor_kind(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::follows(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::max(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::min(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::section(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::shown_id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::shown_value(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::step(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistrySettingExtra<'a>::unit(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistrySetupStep<'a>
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::badge(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::order(&self) -> i32
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::page(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::page_kind(&self) -> paperpaw_sdk::native::registry::RegistrySetupPageKind
pub fn paperpaw_sdk::native::registry::RegistrySetupStep<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistrySlot<'a>
pub fn paperpaw_sdk::native::registry::RegistrySlot<'a>::default(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySlot<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistrySlot<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySlot<'a>::screen(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistrySlot<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryStatus<'a>
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::drawn_by_owner(self) -> bool
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::kind(self) -> paperpaw_sdk::native::registry::StatusKind
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::plugin(self) -> &'a str
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::priority(self) -> u32
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::private(self) -> bool
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::size(self) -> u32
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::tap(self) -> &'a str
pub const fn paperpaw_sdk::native::registry::RegistryStatus<'a>::title(self) -> &'a str
pub struct paperpaw_sdk::native::registry::RegistryValue<'a>
pub fn paperpaw_sdk::native::registry::RegistryValue<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryValue<'a>::key(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryValue<'a>::value(&self) -> core::option::Option<paperpaw_sdk::native::settings::SettingValue<'a>>
pub struct paperpaw_sdk::native::registry::RegistryWidget<'a>
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::cells(&self) -> (u8, u8)
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::flags(&self) -> u32
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::icon(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::id(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::kind(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::min_cells(&self) -> (u8, u8)
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::plugin(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::previews(&self) -> &'a str
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::square(&self) -> bool
pub fn paperpaw_sdk::native::registry::RegistryWidget<'a>::title(&self) -> &'a str
```
