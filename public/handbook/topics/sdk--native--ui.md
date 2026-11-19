```rust
pub struct paperpaw_sdk::native::ui::HandoverId(_)
pub const fn paperpaw_sdk::native::ui::HandoverId::get(self) -> u32
pub const fn paperpaw_sdk::native::ui::HandoverId::text(self) -> paperpaw_sdk::native::ui::TextId
pub struct paperpaw_sdk::native::ui::Instance(_)
pub const fn paperpaw_sdk::native::ui::Instance::get(self) -> u32
pub struct paperpaw_sdk::native::ui::RequestId(_)
pub const fn paperpaw_sdk::native::ui::RequestId::get(self) -> u32
pub const fn paperpaw_sdk::native::ui::RequestId::text(self) -> paperpaw_sdk::native::ui::TextId
pub struct paperpaw_sdk::native::ui::ScreenPolicy
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::grays(self) -> Self
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::guards(self) -> Self
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::holds_edges(self) -> Self
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::new() -> Self
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::secret(self) -> Self
pub const fn paperpaw_sdk::native::ui::ScreenPolicy::status_bar(self, paperpaw_sdk::native::declare::StatusBar) -> Self
pub struct paperpaw_sdk::native::ui::StatusHandle<'cb>
pub struct paperpaw_sdk::native::ui::StatusLineHandle<'cb>
pub struct paperpaw_sdk::native::ui::TextId(_)
pub const fn paperpaw_sdk::native::ui::TextId::get(self) -> u32
pub struct paperpaw_sdk::native::ui::Ui
pub fn paperpaw_sdk::native::ui::Ui::answer(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::RequestId, paperpaw_sdk::native::ui::Answer, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::ask(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::Question<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::RequestId, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::question<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::RequestId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::QuestionInfo<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::text_read<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::TextId, u32, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::TextPart<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::text_write(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::TextId, u32, &str, paperpaw_sdk::native::ui::TextWrite, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::clipboard_read<'a>(&self, &paperpaw_sdk::native::Host<'_>, u32, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::TextPart<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::clipboard_write(&self, &paperpaw_sdk::native::Host<'_>, u32, &str, paperpaw_sdk::native::ui::TextWrite, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::hints<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::ui::UiCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::UiPage<'a, paperpaw_sdk::native::ui::UiHint<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::stack<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::UiCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::UiPage<'a, paperpaw_sdk::native::ui::UiScreen<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::compose<'cb>(&'cb paperpaw_sdk::native::Host<'cb>, paperpaw_sdk::native::ui::Compose<'cb>, paperpaw_sdk::native::callbacks::FrameRect) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_drop(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::WidgetHandle, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_input(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::WidgetHandle, u32, paperpaw_platform::geometry::Point, paperpaw_sdk::native::ui::WidgetInputKind, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_make(&self, &paperpaw_sdk::native::Host<'_>, &str, &str, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::MadeWidget, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_measure(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::WidgetHandle, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::WidgetSize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_place(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::WidgetHandle, paperpaw_sdk::native::callbacks::FrameRect, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::widget_targets<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::WidgetHandle, paperpaw_sdk::native::callbacks::FrameRect, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::UiPage<'a, paperpaw_sdk::native::ui::WidgetTarget>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::handover(&self, &paperpaw_sdk::native::Host<'_>, &[paperpaw_sdk::native::ui::Param<'_>], &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::HandoverId, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::params<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::ui::HandoverId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::UiPage<'a, paperpaw_sdk::native::ui::Param<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::status_line<'a>(&self, &'a paperpaw_sdk::native::Host<'a>, &str, &[paperpaw_sdk::native::ui::Param<'_>], &mut [u8], &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::StatusLine<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Ui::status_values<'a>(&self, &'a paperpaw_sdk::native::Host<'a>, &str, &[paperpaw_sdk::native::ui::Param<'_>], &mut [u8], &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::ui::UiPage<'a, paperpaw_sdk::native::ui::StatusValue<'a>>, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::UiCursor
pub const fn paperpaw_sdk::native::ui::UiCursor::start() -> Self
pub struct paperpaw_sdk::native::ui::UiPageEnd
pub const fn paperpaw_sdk::native::ui::UiPageEnd::generation(self) -> u32
pub const fn paperpaw_sdk::native::ui::UiPageEnd::has_hidden(self) -> bool
pub const fn paperpaw_sdk::native::ui::UiPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::ui::UiCursor>
pub const fn paperpaw_sdk::native::ui::UiPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::ui::WidgetHandle
pub const fn paperpaw_sdk::native::ui::WidgetHandle::instance(self) -> paperpaw_sdk::native::ui::Instance
pub struct paperpaw_sdk::native::ui::WidgetSize
pub const fn paperpaw_sdk::native::ui::WidgetSize::height(self) -> u32
pub const fn paperpaw_sdk::native::ui::WidgetSize::min_height(self) -> u32
pub struct paperpaw_sdk::native::ui::WidgetTarget
pub const fn paperpaw_sdk::native::ui::WidgetTarget::new(u32, paperpaw_sdk::native::callbacks::FrameRect) -> Self
pub const fn paperpaw_sdk::native::ui::WidgetTarget::rect(self) -> paperpaw_sdk::native::callbacks::FrameRect
pub const fn paperpaw_sdk::native::ui::WidgetTarget::target(self) -> u32
pub enum paperpaw_sdk::native::ui::Answer
pub paperpaw_sdk::native::ui::Answer::Accept
pub paperpaw_sdk::native::ui::Answer::Cancel
pub paperpaw_sdk::native::ui::Answer::No
pub paperpaw_sdk::native::ui::Answer::Pick(u32)
pub paperpaw_sdk::native::ui::Answer::Typing
pub paperpaw_sdk::native::ui::Answer::Yes
pub enum paperpaw_sdk::native::ui::Compose<'cb>
pub paperpaw_sdk::native::ui::Compose::StatusItem(paperpaw_sdk::native::ui::StatusHandle<'cb>)
pub paperpaw_sdk::native::ui::Compose::StatusLine(paperpaw_sdk::native::ui::StatusLineHandle<'cb>)
pub paperpaw_sdk::native::ui::Compose::Widget(paperpaw_sdk::native::ui::WidgetHandle)
pub enum paperpaw_sdk::native::ui::HintInput
pub paperpaw_sdk::native::ui::HintInput::Any
pub paperpaw_sdk::native::ui::HintInput::Buttons
pub paperpaw_sdk::native::ui::HintInput::Touch
pub enum paperpaw_sdk::native::ui::MadeWidget
pub paperpaw_sdk::native::ui::MadeWidget::Own
pub paperpaw_sdk::native::ui::MadeWidget::Widget(paperpaw_sdk::native::ui::WidgetHandle)
pub enum paperpaw_sdk::native::ui::QuestionKind
pub paperpaw_sdk::native::ui::QuestionKind::Choice
pub paperpaw_sdk::native::ui::QuestionKind::Confirm
pub paperpaw_sdk::native::ui::QuestionKind::Folder
pub paperpaw_sdk::native::ui::QuestionKind::Text
pub enum paperpaw_sdk::native::ui::StatusLine<'cb>
pub paperpaw_sdk::native::ui::StatusLine::Draw(paperpaw_sdk::native::ui::StatusLineHandle<'cb>)
pub paperpaw_sdk::native::ui::StatusLine::Own
pub enum paperpaw_sdk::native::ui::TextMode
pub paperpaw_sdk::native::ui::TextMode::Email
pub paperpaw_sdk::native::ui::TextMode::FileName
pub paperpaw_sdk::native::ui::TextMode::Number
pub paperpaw_sdk::native::ui::TextMode::Plain
pub paperpaw_sdk::native::ui::TextMode::Url
pub enum paperpaw_sdk::native::ui::TextWrite
pub paperpaw_sdk::native::ui::TextWrite::Continue
pub paperpaw_sdk::native::ui::TextWrite::Last
pub enum paperpaw_sdk::native::ui::WidgetInputKind
pub paperpaw_sdk::native::ui::WidgetInputKind::LongPress
pub paperpaw_sdk::native::ui::WidgetInputKind::Tap
pub enum paperpaw_sdk::native::ui::stages::WidgetCall
pub paperpaw_sdk::native::ui::stages::WidgetCall::Measure
pub paperpaw_sdk::native::ui::stages::WidgetCall::Measure::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::ui::stages::WidgetCall::Measure::width: u32
pub paperpaw_sdk::native::ui::stages::WidgetCall::Place
pub paperpaw_sdk::native::ui::stages::WidgetCall::Place::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::ui::stages::WidgetCall::Place::rect: paperpaw_sdk::native::callbacks::FrameRect
pub paperpaw_sdk::native::ui::stages::WidgetCall::Targets
pub paperpaw_sdk::native::ui::stages::WidgetCall::Targets::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::ui::stages::WidgetCall::Targets::rect: paperpaw_sdk::native::callbacks::FrameRect
pub fn paperpaw_sdk::native::ui::stages::WidgetCall::decode(&[u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::WidgetCall::reply_place(self, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::WidgetCall::reply_size(self, u32, u32, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::WidgetCall::reply_targets(self, &[paperpaw_sdk::native::ui::WidgetTarget], &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::ButtonHint<'a>
pub fn paperpaw_sdk::native::ui::ButtonHint<'a>::hidden(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::ButtonHint<'a>::icon(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::ButtonHint<'a>::usual(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::ButtonHint<'a>::words(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::Notify<'a>
pub const fn paperpaw_sdk::native::ui::Notify<'a>::announce(self) -> Self
pub fn paperpaw_sdk::native::ui::Notify<'a>::new(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::Open<'a>
pub const fn paperpaw_sdk::native::ui::Open<'a>::handover(self, paperpaw_sdk::native::ui::HandoverId) -> Self
pub fn paperpaw_sdk::native::ui::Open<'a>::in_slot(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Open<'a>::replace(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Open<'a>::screen(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Open<'a>::slot(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::Param<'a>
pub const fn paperpaw_sdk::native::ui::Param<'a>::key(self) -> &'a str
pub fn paperpaw_sdk::native::ui::Param<'a>::kind(self) -> core::result::Result<core::option::Option<paperpaw_sdk::native::ui::QuestionKind>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Param<'a>::new(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Param<'a>::request(self) -> core::result::Result<core::option::Option<paperpaw_sdk::native::ui::RequestId>, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::ui::Param<'a>::value(self) -> &'a str
pub struct paperpaw_sdk::native::ui::Question<'a>
pub fn paperpaw_sdk::native::ui::Question<'a>::choice(&'a str, &'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::confirm(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::confirm_labels(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::focus_yes(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::folder(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::live(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::mode(self, paperpaw_sdk::native::ui::TextMode) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::multiline(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::only_yes(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::remote(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::secret(self) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::Question<'a>::text(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::QuestionInfo<'a>
pub fn paperpaw_sdk::native::ui::QuestionInfo<'a>::choices(self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str>
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::focus_yes(self) -> bool
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::is_live(self) -> bool
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::is_multiline(self) -> bool
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::is_secret(self) -> bool
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::kind(self) -> paperpaw_sdk::native::ui::QuestionKind
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::max_bytes(self) -> u32
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::mode(self) -> paperpaw_sdk::native::ui::TextMode
pub fn paperpaw_sdk::native::ui::QuestionInfo<'a>::no_label(self) -> core::option::Option<&'a str>
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::only_yes(self) -> bool
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::text(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::QuestionInfo<'a>::title(self) -> &'a str
pub fn paperpaw_sdk::native::ui::QuestionInfo<'a>::yes_label(self) -> core::option::Option<&'a str>
pub struct paperpaw_sdk::native::ui::SpeechRequest<'a>
pub fn paperpaw_sdk::native::ui::SpeechRequest<'a>::language(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::SpeechRequest<'a>::new(u32, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::ui::SpeechRequest<'a>::queue(self) -> Self
pub fn paperpaw_sdk::native::ui::SpeechRequest<'a>::rate(self, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::StatusValue<'a>
pub const fn paperpaw_sdk::native::ui::StatusValue<'a>::draw_handle(self) -> core::option::Option<paperpaw_sdk::native::ui::StatusHandle<'a>>
pub const fn paperpaw_sdk::native::ui::StatusValue<'a>::is_hidden(self) -> bool
pub const fn paperpaw_sdk::native::ui::StatusValue<'a>::is_own(self) -> bool
pub const fn paperpaw_sdk::native::ui::StatusValue<'a>::item(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::StatusValue<'a>::text(self) -> &'a str
pub struct paperpaw_sdk::native::ui::TextPart<'a>
pub const fn paperpaw_sdk::native::ui::TextPart<'a>::data(self) -> &'a str
pub fn paperpaw_sdk::native::ui::TextPart<'a>::next_offset(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::ui::TextPart<'a>::offset(self) -> u32
pub const fn paperpaw_sdk::native::ui::TextPart<'a>::text(self) -> u32
pub const fn paperpaw_sdk::native::ui::TextPart<'a>::total(self) -> u32
pub struct paperpaw_sdk::native::ui::UiHint<'a>
pub const fn paperpaw_sdk::native::ui::UiHint<'a>::input(self) -> paperpaw_sdk::native::ui::HintInput
pub const fn paperpaw_sdk::native::ui::UiHint<'a>::owner(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::UiHint<'a>::text(self) -> &'a str
pub fn paperpaw_sdk::native::ui::UiHint<'a>::zone(self) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub struct paperpaw_sdk::native::ui::UiPage<'a, T>
pub const fn paperpaw_sdk::native::ui::UiPage<'a, T>::end(&self) -> paperpaw_sdk::native::ui::UiPageEnd
pub type paperpaw_sdk::native::ui::UiPage<'a, T>::Item = core::result::Result<T, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::UiPage<'a, T>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::ui::UiScreen<'a>
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::guards(self) -> bool
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::instance(self) -> paperpaw_sdk::native::ui::Instance
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::is_covered(self) -> bool
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::is_overlay(self) -> bool
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::is_secret(self) -> bool
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::owner(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::screen(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::slot(self) -> &'a str
pub const fn paperpaw_sdk::native::ui::UiScreen<'a>::waits_ready(self) -> bool
pub struct paperpaw_sdk::native::ui::stages::ContextParams<'a>
pub type paperpaw_sdk::native::ui::stages::ContextParams<'a>::Item = core::result::Result<paperpaw_sdk::native::ui::Param<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::ContextParams<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::ui::stages::StatusAnswer<'a>
pub fn paperpaw_sdk::native::ui::stages::StatusAnswer<'a>::drawn(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::StatusAnswer<'a>::text(&'a str, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::ui::stages::StatusCall<'a>
pub const fn paperpaw_sdk::native::ui::stages::StatusCall<'a>::context(self) -> paperpaw_sdk::native::ui::stages::ContextParams<'a>
pub fn paperpaw_sdk::native::ui::stages::StatusCall<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::ui::stages::StatusCall<'a>::items(self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str>
pub fn paperpaw_sdk::native::ui::stages::StatusCall<'a>::reply(self, &[paperpaw_sdk::native::ui::stages::StatusAnswer<'_>], &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub mod paperpaw_sdk::native::ui::stages
```
