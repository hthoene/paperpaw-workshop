```rust
pub enum paperpaw_sdk::native::commands::CheckKind
pub paperpaw_sdk::native::commands::CheckKind::Firmware
pub paperpaw_sdk::native::commands::CheckKind::Plugin
pub enum paperpaw_sdk::native::commands::InstallRoot
pub paperpaw_sdk::native::commands::InstallRoot::Data
pub paperpaw_sdk::native::commands::InstallRoot::Files
pub enum paperpaw_sdk::native::commands::KeyBinding<'a>
pub paperpaw_sdk::native::commands::KeyBinding::Action(&'a str)
pub paperpaw_sdk::native::commands::KeyBinding::Default
pub paperpaw_sdk::native::commands::KeyBinding::None
pub enum paperpaw_sdk::native::commands::PluginEnabled
pub paperpaw_sdk::native::commands::PluginEnabled::Off
pub paperpaw_sdk::native::commands::PluginEnabled::On
pub enum paperpaw_sdk::native::commands::PluginOutcome
pub paperpaw_sdk::native::commands::PluginOutcome::Declined
pub paperpaw_sdk::native::commands::PluginOutcome::Failed
pub paperpaw_sdk::native::commands::PluginOutcome::Installed
pub paperpaw_sdk::native::commands::PluginOutcome::NotFound
pub enum paperpaw_sdk::native::commands::PowerAction
pub paperpaw_sdk::native::commands::PowerAction::PowerOff
pub paperpaw_sdk::native::commands::PowerAction::Restart
pub paperpaw_sdk::native::commands::PowerAction::Sleep
pub enum paperpaw_sdk::native::commands::PresetMode
pub paperpaw_sdk::native::commands::PresetMode::Apply
pub paperpaw_sdk::native::commands::PresetMode::Preview
pub enum paperpaw_sdk::native::commands::RedrawMode
pub paperpaw_sdk::native::commands::RedrawMode::Fast
pub paperpaw_sdk::native::commands::RedrawMode::Full
pub paperpaw_sdk::native::commands::RedrawMode::Partial
pub paperpaw_sdk::native::commands::RedrawMode::RedrawOnly
pub enum paperpaw_sdk::native::commands::ResetTarget<'a>
pub paperpaw_sdk::native::commands::ResetTarget::All
pub paperpaw_sdk::native::commands::ResetTarget::Group(&'a str)
pub paperpaw_sdk::native::commands::ResetTarget::Placement(&'a str)
pub paperpaw_sdk::native::commands::ResetTarget::Plugin(&'a str)
pub paperpaw_sdk::native::commands::ResetTarget::Setting(&'a str)
pub struct paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::answer_plugin(&mut self, paperpaw_sdk::native::events::PluginRequestId, impl core::convert::AsRef<str>, paperpaw_sdk::native::commands::PluginOutcome) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::apply_preset(&mut self, impl core::convert::AsRef<str>, paperpaw_sdk::native::commands::PresetMode) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bind_key(&mut self, impl core::convert::AsRef<str>, impl core::convert::AsRef<str>, paperpaw_sdk::native::commands::KeyBinding<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bind_slot(&mut self, impl core::convert::AsRef<str>, core::option::Option<&str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::end_preview(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::preview_settings(&mut self, &[paperpaw_sdk::native::commands::PreviewSetting<'_>], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::request_plugins(&mut self, &[&str]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::reset_setting(&mut self, paperpaw_sdk::native::commands::ResetTarget<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_menu(&mut self, impl core::convert::AsRef<str>, core::option::Option<&[&str]>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_plugin_enabled(&mut self, impl core::convert::AsRef<str>, paperpaw_sdk::native::commands::PluginEnabled) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_scope(&mut self, core::option::Option<&str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::back(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::back_to(&mut self, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::cancel_show_again(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::close(&mut self, paperpaw_sdk::native::ui::Instance) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::notify(&mut self, paperpaw_sdk::native::ui::Notify<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::open(&mut self, paperpaw_sdk::native::ui::Open<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::raise_input(&mut self, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::screen_policy(&mut self, core::option::Option<paperpaw_sdk::native::ui::Instance>, paperpaw_sdk::native::ui::ScreenPolicy) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::screen_ready(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_hint(&mut self, paperpaw_sdk::native::ui::ButtonHint<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_key_layer(&mut self, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::show_again(&mut self, u32, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::show_hints(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::speak(&mut self, paperpaw_sdk::native::ui::SpeechRequest<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::stop_speaking(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::widget_changed(&mut self, paperpaw_sdk::native::ui::Instance) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_connect(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_disconnect(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_forget(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_give(&mut self, u32, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_keys(&mut self, u32, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_pair(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_scan(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_stop_scan(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::bt_take_back(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::check_file(&mut self, u32, paperpaw_sdk::native::commands::InstallRoot, &str, paperpaw_sdk::native::commands::CheckKind) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::firmware_restart(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::go_online(&mut self, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::install_firmware(&mut self, u32, paperpaw_sdk::native::commands::InstallRoot, &str, paperpaw_sdk::native::commands::FirmwareOptions<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::install_plugin(&mut self, u32, paperpaw_sdk::native::commands::InstallRoot, &str, bool, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::network_none(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::power_off(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::remove_plugin(&mut self, u32, &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::restart(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::show_then(&mut self, paperpaw_sdk::native::ui::Open<'_>, paperpaw_sdk::native::commands::PowerAction) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::sleep(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wear(&mut self, &str, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_host(&mut self, u32, &str, &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_join(&mut self, u32, &str, &str, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_leave(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_off(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_on(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::wifi_scan(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::image_prepare(&mut self, &paperpaw_sdk::native::image::PrepareImage<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::image_release(&mut self, paperpaw_sdk::native::image::ImageId) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::install_plugin_with(&mut self, u32, paperpaw_sdk::native::commands::InstallRoot, &str, bool, bool, &paperpaw_sdk::native::commands::Evidence<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::trust_revoked(&mut self, &[paperpaw_sdk::native::commands::Revocation<'_>]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::lookup_ready(&mut self, impl core::convert::AsRef<str>, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::set_item_state(&mut self, &str, &paperpaw_sdk::native::commands::ItemState<'_>, &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::close_screen(&mut self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::new(&'cb paperpaw_sdk::native::Host<'cb>, &'buf mut [u8]) -> Self
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::open_screen(&mut self, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::pass_on(&mut self, paperpaw_sdk::native::Error) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::queue_redraw(&mut self, paperpaw_sdk::native::commands::RedrawMode) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::queue_redraw_area(&mut self, paperpaw_sdk::native::commands::RedrawMode, paperpaw_sdk::native::callbacks::FrameRect) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::run_action(&mut self, impl core::convert::AsRef<str>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'cb, 'buf>::set_setting(&mut self, impl core::convert::AsRef<str>, paperpaw_sdk::native::settings::SettingValue<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::commands::CommandSender<'_, '_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::commands::Evidence<'a>
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::author(self, &'a [u8; 32]) -> Self
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::from_catalog(self) -> Self
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::new() -> Self
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::recovery(self, &'a [u8; 32]) -> Self
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::rotations(self, &'a [paperpaw_sdk::native::commands::Rotation<'a>]) -> Self
pub const fn paperpaw_sdk::native::commands::Evidence<'a>::sha256(self, &'a [u8; 32]) -> Self
pub struct paperpaw_sdk::native::commands::FirmwareOptions<'a>
pub const fn paperpaw_sdk::native::commands::FirmwareOptions<'a>::allow_older(self) -> Self
pub const fn paperpaw_sdk::native::commands::FirmwareOptions<'a>::foreign(self) -> Self
pub const fn paperpaw_sdk::native::commands::FirmwareOptions<'a>::key(self, &'a [u8; 32]) -> Self
pub const fn paperpaw_sdk::native::commands::FirmwareOptions<'a>::new() -> Self
pub struct paperpaw_sdk::native::commands::ItemState<'a>
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::badge(self, &'a str, &'a [paperpaw_sdk::native::formatting::Arg<'a>]) -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::faint(self) -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::hidden(self) -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::keep(self) -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::label(self, &'a str, &'a [paperpaw_sdk::native::formatting::Arg<'a>]) -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::new() -> Self
pub const fn paperpaw_sdk::native::commands::ItemState<'a>::switch(self, bool) -> Self
pub struct paperpaw_sdk::native::commands::PreviewSetting<'a>
pub const fn paperpaw_sdk::native::commands::PreviewSetting<'a>::new(&'a str, paperpaw_sdk::native::settings::SettingValue<'a>) -> Self
pub struct paperpaw_sdk::native::commands::Revocation<'a>
pub const fn paperpaw_sdk::native::commands::Revocation<'a>::new(&'a str, &'a [u8; 32], &'a [u8; 64]) -> Self
pub paperpaw_sdk::native::commands::Revocation::key: &'a [u8; 32]
pub paperpaw_sdk::native::commands::Revocation::plugin: &'a str
pub paperpaw_sdk::native::commands::Revocation::signature: &'a [u8; 64]
pub struct paperpaw_sdk::native::commands::Rotation<'a>
pub const fn paperpaw_sdk::native::commands::Rotation<'a>::new(&'a [u8; 32], &'a [u8; 64]) -> Self
pub paperpaw_sdk::native::commands::Rotation::signature: &'a [u8; 64]
pub paperpaw_sdk::native::commands::Rotation::to: &'a [u8; 32]
pub const paperpaw_sdk::native::commands::MAX_REVOCATIONS: usize
pub const paperpaw_sdk::native::commands::MAX_ROTATIONS: usize
pub const paperpaw_sdk::native::commands::SHOW_AGAIN_MIN_MS: u32
```
