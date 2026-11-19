```rust
pub struct paperpaw_sdk::native::callbacks::FrameRect
pub paperpaw_sdk::native::callbacks::FrameRect::height: u32
pub paperpaw_sdk::native::callbacks::FrameRect::width: u32
pub paperpaw_sdk::native::callbacks::FrameRect::x: i32
pub paperpaw_sdk::native::callbacks::FrameRect::y: i32
pub const fn paperpaw_sdk::native::callbacks::FrameRect::new(i32, i32, u32, u32) -> Self
pub enum paperpaw_sdk::native::callbacks::DrawPurpose
pub paperpaw_sdk::native::callbacks::DrawPurpose::InsertedBlock
pub paperpaw_sdk::native::callbacks::DrawPurpose::Other(u32)
pub paperpaw_sdk::native::callbacks::DrawPurpose::PageLayer
pub paperpaw_sdk::native::callbacks::DrawPurpose::Screen
pub paperpaw_sdk::native::callbacks::DrawPurpose::StatusItem
pub paperpaw_sdk::native::callbacks::DrawPurpose::StatusLine
pub paperpaw_sdk::native::callbacks::DrawPurpose::Widget
pub enum paperpaw_sdk::native::callbacks::InputGestureKind
pub paperpaw_sdk::native::callbacks::InputGestureKind::LongPress
pub paperpaw_sdk::native::callbacks::InputGestureKind::SwipeDown
pub paperpaw_sdk::native::callbacks::InputGestureKind::SwipeLeft
pub paperpaw_sdk::native::callbacks::InputGestureKind::SwipeRight
pub paperpaw_sdk::native::callbacks::InputGestureKind::SwipeUp
pub paperpaw_sdk::native::callbacks::InputGestureKind::Tap
pub enum paperpaw_sdk::native::callbacks::KeyState
pub paperpaw_sdk::native::callbacks::KeyState::Press
pub paperpaw_sdk::native::callbacks::KeyState::Release
pub paperpaw_sdk::native::callbacks::KeyState::Repeat
pub enum paperpaw_sdk::native::callbacks::PointerPhase
pub paperpaw_sdk::native::callbacks::PointerPhase::Cancel
pub paperpaw_sdk::native::callbacks::PointerPhase::Down
pub paperpaw_sdk::native::callbacks::PointerPhase::Move
pub paperpaw_sdk::native::callbacks::PointerPhase::Up
pub struct paperpaw_sdk::native::callbacks::DrawFrame<'a>
pub fn paperpaw_sdk::native::callbacks::DrawFrame<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::callbacks::DrawFrame<'a>::draw_canvas(&mut self) -> core::result::Result<paperpaw_sdk::native::canvas::Canvas<'_>, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::callbacks::DrawFrame<'a>::pictures_only(&self) -> bool
pub fn paperpaw_sdk::native::callbacks::DrawFrame<'_>::eq(&self, &Self) -> bool
pub paperpaw_sdk::native::callbacks::DrawFrame::clip_bottom: i32
pub paperpaw_sdk::native::callbacks::DrawFrame::clip_top: i32
pub paperpaw_sdk::native::callbacks::DrawFrame::id: u32
pub paperpaw_sdk::native::callbacks::DrawFrame::payload: &'a [u8]
pub paperpaw_sdk::native::callbacks::DrawFrame::purpose: paperpaw_sdk::native::callbacks::DrawPurpose
pub paperpaw_sdk::native::callbacks::DrawFrame::rect: paperpaw_sdk::native::callbacks::FrameRect
pub enum paperpaw_sdk::native::callbacks::Input<'a>
pub fn paperpaw_sdk::native::callbacks::Input<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub paperpaw_sdk::native::callbacks::Input::Action
pub paperpaw_sdk::native::callbacks::Input::Action::action: &'a str
pub paperpaw_sdk::native::callbacks::Input::Action::now_ms: u64
pub paperpaw_sdk::native::callbacks::Input::Gesture
pub paperpaw_sdk::native::callbacks::Input::Gesture::kind: paperpaw_sdk::native::callbacks::InputGestureKind
pub paperpaw_sdk::native::callbacks::Input::Gesture::now_ms: u64
pub paperpaw_sdk::native::callbacks::Input::Gesture::position: paperpaw_platform::geometry::Point
pub paperpaw_sdk::native::callbacks::Input::Key
pub paperpaw_sdk::native::callbacks::Input::Key::key: &'a str
pub paperpaw_sdk::native::callbacks::Input::Key::now_ms: u64
pub paperpaw_sdk::native::callbacks::Input::Key::state: paperpaw_sdk::native::callbacks::KeyState
pub paperpaw_sdk::native::callbacks::Input::Pointer
pub paperpaw_sdk::native::callbacks::Input::Pointer::contact: u32
pub paperpaw_sdk::native::callbacks::Input::Pointer::now_ms: u64
pub paperpaw_sdk::native::callbacks::Input::Pointer::phase: paperpaw_sdk::native::callbacks::PointerPhase
pub paperpaw_sdk::native::callbacks::Input::Pointer::position: paperpaw_platform::geometry::Point
pub paperpaw_sdk::native::callbacks::Input::Widget
pub paperpaw_sdk::native::callbacks::Input::Widget::instance: paperpaw_sdk::native::ui::Instance
pub paperpaw_sdk::native::callbacks::Input::Widget::kind: paperpaw_sdk::native::ui::WidgetInputKind
pub paperpaw_sdk::native::callbacks::Input::Widget::now_ms: u64
pub paperpaw_sdk::native::callbacks::Input::Widget::position: paperpaw_platform::geometry::Point
pub paperpaw_sdk::native::callbacks::Input::Widget::target: u32
```
