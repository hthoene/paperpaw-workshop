```rust
pub paperpaw_sdk::contribution::Contribution::Action(alloc::boxed::Box<paperpaw_sdk::ActionSpec>)
pub paperpaw_sdk::contribution::Contribution::ActionObserver(alloc::boxed::Box<paperpaw_sdk::ObserverSpec>)
pub paperpaw_sdk::contribution::Contribution::ActionOverride(alloc::boxed::Box<paperpaw_sdk::ActionOverride>)
pub paperpaw_sdk::contribution::Contribution::BookBadge(alloc::boxed::Box<paperpaw_sdk::library::service::BookBadge>)
pub paperpaw_sdk::contribution::Contribution::BookData(paperpaw_sdk::library::BookData)
pub paperpaw_sdk::contribution::Contribution::BookField(alloc::boxed::Box<paperpaw_sdk::library::service::BookField>)
pub paperpaw_sdk::contribution::Contribution::Chrome(alloc::boxed::Box<paperpaw_sdk::chrome::ChromeSpec>)
pub paperpaw_sdk::contribution::Contribution::Decorator(alloc::boxed::Box<paperpaw_sdk::decorations::DecoratorSpec>)
pub paperpaw_sdk::contribution::Contribution::EventDeclared(alloc::boxed::Box<paperpaw_sdk::services::EventSpec>)
pub paperpaw_sdk::contribution::Contribution::EventObserver(alloc::boxed::Box<paperpaw_sdk::ObserverSpec>)
pub paperpaw_sdk::contribution::Contribution::FixedPresets(&'static [paperpaw_sdk::presets::Preset])
pub paperpaw_sdk::contribution::Contribution::FixedSettings(&'static [paperpaw_sdk::SettingSpec])
pub paperpaw_sdk::contribution::Contribution::Font(alloc::boxed::Box<paperpaw_sdk::FontSpec>)
pub paperpaw_sdk::contribution::Contribution::FontBinding::font: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::FontBinding::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::contribution::Contribution::FontBinding::role: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::FontExtension::extends: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::FontExtension::id: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::FontExtension::path: alloc::string::String
pub paperpaw_sdk::contribution::Contribution::FontFace(alloc::boxed::Box<paperpaw_sdk::FontFace>)
pub paperpaw_sdk::contribution::Contribution::FontFile::id: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::FontFile::path: alloc::string::String
pub paperpaw_sdk::contribution::Contribution::Format(alloc::boxed::Box<paperpaw_sdk::FormatSpec>)
pub paperpaw_sdk::contribution::Contribution::Gesture(alloc::boxed::Box<paperpaw_sdk::keys::GestureSpec>)
pub paperpaw_sdk::contribution::Contribution::HideMenuEntry::item: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::HideMenuEntry::menu: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Hyphenation(paperpaw_sdk::HyphenationSpec)
pub paperpaw_sdk::contribution::Contribution::Icon::icon: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::Icon::item: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Input(paperpaw_sdk::keys::InputSpec)
pub paperpaw_sdk::contribution::Contribution::InputFilter(paperpaw_sdk::filters::InputFilterSpec)
pub paperpaw_sdk::contribution::Contribution::ItemDescription::item: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::ItemDescription::key: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::ItemState::item: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::ItemState::state: paperpaw_sdk::ItemStateFn
pub paperpaw_sdk::contribution::Contribution::Keymap(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::contribution::Contribution::KeymapPreset::id: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::KeymapPreset::source: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::KeymapWhen::setting: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::KeymapWhen::source: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::LookupProvider(alloc::boxed::Box<paperpaw_sdk::lookup::LookupProviderSpec>)
pub paperpaw_sdk::contribution::Contribution::MenuEntry(paperpaw_sdk::MenuEntry)
pub paperpaw_sdk::contribution::Contribution::MenuNeed::item: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::MenuNeed::need: paperpaw_sdk::MenuNeed
pub paperpaw_sdk::contribution::Contribution::MenuSection(paperpaw_sdk::MenuSection)
pub paperpaw_sdk::contribution::Contribution::PageFrame(alloc::boxed::Box<paperpaw_sdk::layers::PageFrameSpec>)
pub paperpaw_sdk::contribution::Contribution::PageLayer(alloc::boxed::Box<paperpaw_sdk::layers::PageLayerSpec>)
pub paperpaw_sdk::contribution::Contribution::Point(alloc::boxed::Box<paperpaw_sdk::services::PointSpec>)
pub paperpaw_sdk::contribution::Contribution::Preset(alloc::boxed::Box<paperpaw_sdk::presets::Preset>)
pub paperpaw_sdk::contribution::Contribution::Published::id: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Published::service: paperpaw_sdk::services::Service
pub paperpaw_sdk::contribution::Contribution::Reader(paperpaw_sdk::readers::ReaderSpec)
pub paperpaw_sdk::contribution::Contribution::RefreshFilter(paperpaw_sdk::filters::RefreshFilterSpec)
pub paperpaw_sdk::contribution::Contribution::Screen(paperpaw_sdk::ScreenSpec)
pub paperpaw_sdk::contribution::Contribution::ScreenHints::hints: paperpaw_sdk::Hints
pub paperpaw_sdk::contribution::Contribution::ScreenHints::screen: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Service::id: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Service::service: alloc::boxed::Box<dyn core::any::Any>
pub paperpaw_sdk::contribution::Contribution::Setting(alloc::boxed::Box<paperpaw_sdk::SettingSpec>)
pub paperpaw_sdk::contribution::Contribution::SettingDefault::setting: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::SettingDefault::value: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::SettingGroup(paperpaw_sdk::SettingGroupSpec)
pub paperpaw_sdk::contribution::Contribution::SetupStep(alloc::boxed::Box<paperpaw_sdk::setup::SetupStepSpec>)
pub paperpaw_sdk::contribution::Contribution::Slot(paperpaw_sdk::SlotSpec)
pub paperpaw_sdk::contribution::Contribution::SlotBinding::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::contribution::Contribution::SlotBinding::screen: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::SlotBinding::slot: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::StatusItem(alloc::boxed::Box<paperpaw_sdk::status::StatusItemSpec>)
pub paperpaw_sdk::contribution::Contribution::StatusLine(alloc::boxed::Box<paperpaw_sdk::status::StatusLineSpec>)
pub paperpaw_sdk::contribution::Contribution::StatusPlace(alloc::boxed::Box<paperpaw_sdk::status::Place>)
pub paperpaw_sdk::contribution::Contribution::Stylesheet(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::contribution::Contribution::Subscription::event: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::Subscription::handler: paperpaw_sdk::event::EventHandler
pub paperpaw_sdk::contribution::Contribution::TextFilter(paperpaw_sdk::filters::TextFilterSpec)
pub paperpaw_sdk::contribution::Contribution::ToPoint::point: paperpaw_sdk::Id
pub paperpaw_sdk::contribution::Contribution::ToPoint::text: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::contribution::Contribution::Translations(alloc::borrow::Cow<'static, str>)
pub paperpaw_sdk::contribution::Contribution::UiLook::painters: &'static paperpaw_sdk::ui::look::Painters
pub paperpaw_sdk::contribution::Contribution::UiLook::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::contribution::Contribution::Voice(alloc::boxed::Box<paperpaw_sdk::voices::VoiceSpec>)
pub paperpaw_sdk::contribution::Contribution::Widget(alloc::boxed::Box<paperpaw_sdk::widgets::WidgetSpec>)
pub paperpaw_sdk::contribution::Contribution::Work(alloc::boxed::Box<paperpaw_sdk::work::WorkSpec>)
pub fn paperpaw_sdk::contribution::Contribution::id(&self) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::contribution::Contribution::kind(&self) -> &'static str
pub fn paperpaw_sdk::contribution::Contribution::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::contribution::Registrar
pub fn paperpaw_sdk::contribution::Registrar::add(&mut self, paperpaw_sdk::contribution::Contribution) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_action(&mut self, paperpaw_sdk::ActionSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_badge(&mut self, paperpaw_sdk::library::service::BookBadge) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_data(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_field(&mut self, paperpaw_sdk::library::service::BookField) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_chrome(&mut self, paperpaw_sdk::chrome::ChromeSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_decorator(&mut self, paperpaw_sdk::decorations::DecoratorSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font(&mut self, paperpaw_sdk::FontSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_extension(&mut self, paperpaw_sdk::Id, alloc::string::String, paperpaw_sdk::Id) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_face(&mut self, paperpaw_sdk::FontFace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_file(&mut self, paperpaw_sdk::Id, alloc::string::String) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_format(&mut self, paperpaw_sdk::FormatSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gesture(&mut self, paperpaw_sdk::keys::GestureSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_hyphenation(&mut self, paperpaw_sdk::HyphenationSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_icon(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input(&mut self, paperpaw_sdk::keys::InputSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input_filter(&mut self, paperpaw_sdk::filters::InputFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_preset(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_when(&mut self, &paperpaw_sdk::setting::Setting<bool>, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
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
pub fn paperpaw_sdk::contribution::Registrar::add_service(&mut self, paperpaw_sdk::Id, alloc::boxed::Box<dyn core::any::Any>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting(&mut self, paperpaw_sdk::SettingSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting_group(&mut self, paperpaw_sdk::SettingGroupSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_settings(&mut self, &'static [paperpaw_sdk::SettingSpec]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setup_step(&mut self, paperpaw_sdk::setup::SetupStepSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_slot(&mut self, paperpaw_sdk::SlotSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_item(&mut self, paperpaw_sdk::status::StatusItemSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_line(&mut self, paperpaw_sdk::status::StatusLineSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_place(&mut self, paperpaw_sdk::status::Place) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_stylesheet(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_text_filter(&mut self, paperpaw_sdk::filters::TextFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_translations(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_voice(&mut self, paperpaw_sdk::voices::VoiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget(&mut self, paperpaw_sdk::widgets::WidgetSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_work(&mut self, paperpaw_sdk::work::WorkSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_font(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Id, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_slot(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Id, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contribute(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contributions(&self) -> &[paperpaw_sdk::contribution::Contribution]
pub fn paperpaw_sdk::contribution::Registrar::declare_event(&mut self, paperpaw_sdk::services::EventSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::describe_item(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::hide_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::into_contributions(self) -> alloc::vec::Vec<paperpaw_sdk::contribution::Contribution>
pub fn paperpaw_sdk::contribution::Registrar::new(paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::contribution::Registrar::observe_actions(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::observe_events(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::on<P: paperpaw_sdk::event::EventData>(&mut self, paperpaw_sdk::event::Event<P>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &P, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::override_action(&mut self, paperpaw_sdk::Id, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::place_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::plugin(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::contribution::Registrar::provide<T: paperpaw_sdk::services::ServiceType>(&mut self, paperpaw_sdk::Id, T, paperpaw_sdk::Version) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::publish<T: core::any::Any>(&mut self, paperpaw_sdk::Id, T) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_item_state(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::ItemState + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_menu_need(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuNeed) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_screen_hints(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Hints) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_setting_default(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_ui_look(&mut self, &'static paperpaw_sdk::ui::look::Painters, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::subscribe(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::event::EventHandler) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Contribution::id(&self) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::contribution::Contribution::kind(&self) -> &'static str
pub fn paperpaw_sdk::contribution::Contribution::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::contribution::Registrar::add(&mut self, paperpaw_sdk::contribution::Contribution) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_action(&mut self, paperpaw_sdk::ActionSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_badge(&mut self, paperpaw_sdk::library::service::BookBadge) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_data(&mut self, impl core::convert::Into<alloc::borrow::Cow<'static, str>>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_book_field(&mut self, paperpaw_sdk::library::service::BookField) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_chrome(&mut self, paperpaw_sdk::chrome::ChromeSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_decorator(&mut self, paperpaw_sdk::decorations::DecoratorSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font(&mut self, paperpaw_sdk::FontSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_extension(&mut self, paperpaw_sdk::Id, alloc::string::String, paperpaw_sdk::Id) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_face(&mut self, paperpaw_sdk::FontFace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_font_file(&mut self, paperpaw_sdk::Id, alloc::string::String) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_format(&mut self, paperpaw_sdk::FormatSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_gesture(&mut self, paperpaw_sdk::keys::GestureSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_hyphenation(&mut self, paperpaw_sdk::HyphenationSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_icon(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input(&mut self, paperpaw_sdk::keys::InputSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_input_filter(&mut self, paperpaw_sdk::filters::InputFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_preset(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_keymap_when(&mut self, &paperpaw_sdk::setting::Setting<bool>, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
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
pub fn paperpaw_sdk::contribution::Registrar::add_service(&mut self, paperpaw_sdk::Id, alloc::boxed::Box<dyn core::any::Any>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting(&mut self, paperpaw_sdk::SettingSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setting_group(&mut self, paperpaw_sdk::SettingGroupSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_settings(&mut self, &'static [paperpaw_sdk::SettingSpec]) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_setup_step(&mut self, paperpaw_sdk::setup::SetupStepSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_slot(&mut self, paperpaw_sdk::SlotSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_item(&mut self, paperpaw_sdk::status::StatusItemSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_line(&mut self, paperpaw_sdk::status::StatusLineSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_status_place(&mut self, paperpaw_sdk::status::Place) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_stylesheet(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_text_filter(&mut self, paperpaw_sdk::filters::TextFilterSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_translations(&mut self, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_voice(&mut self, paperpaw_sdk::voices::VoiceSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_widget(&mut self, paperpaw_sdk::widgets::WidgetSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::add_work(&mut self, paperpaw_sdk::work::WorkSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_font(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Id, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::bind_slot(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Id, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contribute(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::contributions(&self) -> &[paperpaw_sdk::contribution::Contribution]
pub fn paperpaw_sdk::contribution::Registrar::declare_event(&mut self, paperpaw_sdk::services::EventSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::describe_item(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<alloc::borrow::Cow<'static, str>>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::hide_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::into_contributions(self) -> alloc::vec::Vec<paperpaw_sdk::contribution::Contribution>
pub fn paperpaw_sdk::contribution::Registrar::new(paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::contribution::Registrar::observe_actions(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::observe_events(&mut self, paperpaw_sdk::ObserverSpec) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::on<P: paperpaw_sdk::event::EventData>(&mut self, paperpaw_sdk::event::Event<P>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &P, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::override_action(&mut self, paperpaw_sdk::Id, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::Params, &mut alloc::vec::Vec<paperpaw_sdk::Command>) + 'static, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::place_menu_entry(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuPlace) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::plugin(&self) -> &paperpaw_sdk::Id
pub fn paperpaw_sdk::contribution::Registrar::provide<T: paperpaw_sdk::services::ServiceType>(&mut self, paperpaw_sdk::Id, T, paperpaw_sdk::Version) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::publish<T: core::any::Any>(&mut self, paperpaw_sdk::Id, T) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_item_state(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, impl core::ops::function::Fn(&paperpaw_sdk::Env<'_>) -> paperpaw_sdk::ItemState + 'static) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_menu_need(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::MenuNeed) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_screen_hints(&mut self, paperpaw_sdk::Id, paperpaw_sdk::Hints) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_setting_default(&mut self, paperpaw_sdk::Id, alloc::borrow::Cow<'static, str>) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::set_ui_look(&mut self, &'static paperpaw_sdk::ui::look::Painters, paperpaw_sdk::Priority) -> core::result::Result<(), paperpaw_sdk::RegisterError>
pub fn paperpaw_sdk::contribution::Registrar::subscribe(&mut self, impl core::convert::Into<paperpaw_sdk::Id>, paperpaw_sdk::event::EventHandler) -> core::result::Result<(), paperpaw_sdk::RegisterError>
```
