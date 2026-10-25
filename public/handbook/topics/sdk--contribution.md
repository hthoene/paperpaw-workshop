```rust
pub struct paperpaw_sdk::contribution::Registrar
pub fn paperpaw_sdk::contribution::Registrar::add_action(&mut self, paperpaw_sdk::ActionSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_badge(&mut self, paperpaw_sdk::library::service::BookBadge) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_cache(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_data(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_field(&mut self, paperpaw_sdk::library::service::BookField) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_choice(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_chrome(&mut self, paperpaw_sdk::chrome::ChromeSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_decorator(&mut self, paperpaw_sdk::decorations::DecoratorSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font(&mut self, paperpaw_sdk::FontSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_extension(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::string::String>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_face(&mut self, paperpaw_sdk::FontFace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_file(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::string::String>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_format(&mut self, paperpaw_sdk::FormatSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gatt_service(&mut self, paperpaw_sdk::bluetooth::ServiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gesture(&mut self, paperpaw_sdk::keys::GestureSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_hyphenation(&mut self, paperpaw_sdk::HyphenationSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_icon(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input(&mut self, paperpaw_sdk::keys::InputSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input_filter(&mut self, paperpaw_sdk::filters::InputFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_preset(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_when(&mut self, &paperpaw_sdk::setting::Setting<bool>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_lookup_provider(&mut self, paperpaw_sdk::lookup::LookupProviderSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_menu_entry(&mut self, paperpaw_sdk::MenuEntry) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_menu_section(&mut self, paperpaw_sdk::MenuSection) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_page_frame(&mut self, paperpaw_sdk::layers::PageFrameSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_page_layer(&mut self, paperpaw_sdk::layers::PageLayerSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_point(&mut self, paperpaw_sdk::services::PointSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_preset(&mut self, paperpaw_sdk::presets::Preset) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_presets(&mut self, &'static [paperpaw_sdk::presets::Preset]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_reader(&mut self, paperpaw_sdk::readers::ReaderSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_refresh_filter(&mut self, paperpaw_sdk::filters::RefreshFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_screen(&mut self, paperpaw_sdk::ScreenSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting(&mut self, paperpaw_sdk::SettingSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting_group(&mut self, impl core::convert::Into<paperpaw_sdk::SettingGroup>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_settings(&mut self, &'static [paperpaw_sdk::SettingSpec]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setup_step(&mut self, paperpaw_sdk::setup::SetupStepSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_slot(&mut self, paperpaw_sdk::SlotSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_item(&mut self, paperpaw_sdk::status::StatusItemSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_line(&mut self, paperpaw_sdk::status::StatusLineSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_place(&mut self, paperpaw_sdk::status::Place) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_stylesheet(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_text_filter(&mut self, paperpaw_sdk::filters::TextFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_translations(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_voice(&mut self, paperpaw_sdk::voices::VoiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget(&mut self, paperpaw_sdk::widgets::WidgetSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget_category(&mut self, paperpaw_sdk::widgets::WidgetCategory) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget_place(&mut self, paperpaw_sdk::widgets::WidgetPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_work(&mut self, paperpaw_sdk::work::WorkSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_font(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_slot(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contribute(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::declare_event(&mut self, paperpaw_sdk::services::EventSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::describe_item(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::hide_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::new(impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::contribution::Registrar::observe_actions(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::observe_events(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::on<P: paperpaw_sdk::event::EventData>(&mut self, paperpaw_sdk::event::Event<P>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &P, &mut paperpaw_sdk::Commands) + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::override_action(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut paperpaw_sdk::Commands) + 'static, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::place_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::plugin(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::contribution::Registrar::provide<T: paperpaw_sdk::services::ServiceType>(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, T, paperpaw_sdk::Version) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_item_state(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::ItemState + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_menu_need(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuNeed) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_screen_hints(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::HintVisibility) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_setting_default(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_ui_look(&mut self, &'static paperpaw_sdk::ui::look::Painters, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::subscribe(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::event::EventHandler) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_action(&mut self, paperpaw_sdk::ActionSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_badge(&mut self, paperpaw_sdk::library::service::BookBadge) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_cache(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_data(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_field(&mut self, paperpaw_sdk::library::service::BookField) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_choice(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_chrome(&mut self, paperpaw_sdk::chrome::ChromeSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_decorator(&mut self, paperpaw_sdk::decorations::DecoratorSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font(&mut self, paperpaw_sdk::FontSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_extension(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::string::String>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_face(&mut self, paperpaw_sdk::FontFace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_file(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::string::String>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_format(&mut self, paperpaw_sdk::FormatSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gatt_service(&mut self, paperpaw_sdk::bluetooth::ServiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gesture(&mut self, paperpaw_sdk::keys::GestureSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_hyphenation(&mut self, paperpaw_sdk::HyphenationSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_icon(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input(&mut self, paperpaw_sdk::keys::InputSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input_filter(&mut self, paperpaw_sdk::filters::InputFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_preset(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_when(&mut self, &paperpaw_sdk::setting::Setting<bool>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_lookup_provider(&mut self, paperpaw_sdk::lookup::LookupProviderSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_menu_entry(&mut self, paperpaw_sdk::MenuEntry) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_menu_section(&mut self, paperpaw_sdk::MenuSection) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_page_frame(&mut self, paperpaw_sdk::layers::PageFrameSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_page_layer(&mut self, paperpaw_sdk::layers::PageLayerSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_point(&mut self, paperpaw_sdk::services::PointSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_preset(&mut self, paperpaw_sdk::presets::Preset) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_presets(&mut self, &'static [paperpaw_sdk::presets::Preset]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_reader(&mut self, paperpaw_sdk::readers::ReaderSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_refresh_filter(&mut self, paperpaw_sdk::filters::RefreshFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_screen(&mut self, paperpaw_sdk::ScreenSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting(&mut self, paperpaw_sdk::SettingSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting_group(&mut self, impl core::convert::Into<paperpaw_sdk::SettingGroup>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_settings(&mut self, &'static [paperpaw_sdk::SettingSpec]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setup_step(&mut self, paperpaw_sdk::setup::SetupStepSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_slot(&mut self, paperpaw_sdk::SlotSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_item(&mut self, paperpaw_sdk::status::StatusItemSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_line(&mut self, paperpaw_sdk::status::StatusLineSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_place(&mut self, paperpaw_sdk::status::Place) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_stylesheet(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_text_filter(&mut self, paperpaw_sdk::filters::TextFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_translations(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_voice(&mut self, paperpaw_sdk::voices::VoiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget(&mut self, paperpaw_sdk::widgets::WidgetSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget_category(&mut self, paperpaw_sdk::widgets::WidgetCategory) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget_place(&mut self, paperpaw_sdk::widgets::WidgetPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_work(&mut self, paperpaw_sdk::work::WorkSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_font(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_slot(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contribute(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::declare_event(&mut self, paperpaw_sdk::services::EventSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::describe_item(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::hide_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::new(impl core::convert::Into<paperpaw_sdk::Id>) -> Self
pub fn paperpaw_sdk::contribution::Registrar::observe_actions(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::observe_events(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::on<P: paperpaw_sdk::event::EventData>(&mut self, paperpaw_sdk::event::Event<P>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &P, &mut paperpaw_sdk::Commands) + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::override_action(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut paperpaw_sdk::Commands) + 'static, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::place_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::plugin(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::contribution::Registrar::provide<T: paperpaw_sdk::services::ServiceType>(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, T, paperpaw_sdk::Version) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_item_state(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::ItemState + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_menu_need(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuNeed) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_screen_hints(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::HintVisibility) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_setting_default(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_ui_look(&mut self, &'static paperpaw_sdk::ui::look::Painters, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::subscribe(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::event::EventHandler) -> core::result::Result<(), paperpaw_sdk::RegisterError>
```
