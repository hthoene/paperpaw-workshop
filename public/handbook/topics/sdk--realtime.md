```rust
pub struct paperpaw_sdk::realtime::FrameReport
pub const fn paperpaw_sdk::realtime::FrameReport::area(&self) -> paperpaw_platform::geometry::Rect
pub const fn paperpaw_sdk::realtime::FrameReport::at(&self) -> paperpaw_platform::input::Instant
pub const fn paperpaw_sdk::realtime::FrameReport::drawn(&self) -> core::time::Duration
pub const fn paperpaw_sdk::realtime::FrameReport::merged(&self) -> u16
pub fn paperpaw_sdk::realtime::FrameReport::mode(&self) -> core::option::Option<paperpaw_platform::display::RefreshMode>
pub const fn paperpaw_sdk::realtime::FrameReport::shown(&self) -> core::time::Duration
pub struct paperpaw_sdk::realtime::KeyEvent
pub const fn paperpaw_sdk::realtime::KeyEvent::at(&self) -> paperpaw_platform::input::Instant
pub const fn paperpaw_sdk::realtime::KeyEvent::is_press(&self) -> bool
pub const fn paperpaw_sdk::realtime::KeyEvent::name(&self) -> &'static str
pub const fn paperpaw_sdk::realtime::KeyEvent::pressed(&'static str, paperpaw_platform::input::Instant) -> Self
pub const fn paperpaw_sdk::realtime::KeyEvent::released(&'static str, paperpaw_platform::input::Instant) -> Self
pub struct paperpaw_sdk::realtime::PanelInfo
pub fn paperpaw_sdk::realtime::PanelInfo::fastest(&self) -> core::option::Option<(paperpaw_platform::display::RefreshMode, core::time::Duration)>
pub const fn paperpaw_sdk::realtime::PanelInfo::gray_levels(&self) -> u8
pub fn paperpaw_sdk::realtime::PanelInfo::last_frame(&self) -> core::option::Option<paperpaw_sdk::realtime::FrameReport>
pub const fn paperpaw_sdk::realtime::PanelInfo::new(u8) -> Self
pub const fn paperpaw_sdk::realtime::PanelInfo::overlapping(self) -> Self
pub const fn paperpaw_sdk::realtime::PanelInfo::overlaps(&self) -> bool
pub fn paperpaw_sdk::realtime::PanelInfo::refresh(self, paperpaw_platform::display::RefreshMode, core::time::Duration) -> Self
pub fn paperpaw_sdk::realtime::PanelInfo::refresh_time(&self, paperpaw_platform::display::RefreshMode) -> core::option::Option<core::time::Duration>
pub fn paperpaw_sdk::realtime::PanelInfo::default() -> Self
pub struct paperpaw_sdk::realtime::Room
pub const fn paperpaw_sdk::realtime::Room::asked(&self) -> u32
pub const fn paperpaw_sdk::realtime::Room::free(&self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::realtime::Room::is_granted(&self) -> bool
pub const fn paperpaw_sdk::realtime::Room::is_partial(&self) -> bool
pub const fn paperpaw_sdk::realtime::Room::is_refused(&self) -> bool
pub const fn paperpaw_sdk::realtime::Room::steps(&self) -> paperpaw_sdk::realtime::RoomSteps
pub struct paperpaw_sdk::realtime::RoomSteps(_)
pub const paperpaw_sdk::realtime::RoomSteps::BANDS: Self
pub const paperpaw_sdk::realtime::RoomSteps::CACHES: Self
pub const paperpaw_sdk::realtime::RoomSteps::RADIOS: Self
pub const paperpaw_sdk::realtime::RoomSteps::SCREENS: Self
pub const paperpaw_sdk::realtime::RoomSteps::SQUEEZED: Self
pub const paperpaw_sdk::realtime::RoomSteps::WORK: Self
pub const fn paperpaw_sdk::realtime::RoomSteps::contains(self, Self) -> bool
pub const fn paperpaw_sdk::realtime::RoomSteps::is_empty(self) -> bool
pub const fn paperpaw_sdk::realtime::RoomSteps::with(self, Self) -> Self
pub struct paperpaw_sdk::realtime::ScreenMode
pub const fn paperpaw_sdk::realtime::ScreenMode::awake(&self) -> core::option::Option<core::time::Duration>
pub fn paperpaw_sdk::realtime::ScreenMode::awake_for(self, core::time::Duration) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::cleans_itself(self) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::does_clean_itself(&self) -> bool
pub const fn paperpaw_sdk::realtime::ScreenMode::fastest(self) -> Self
pub fn paperpaw_sdk::realtime::ScreenMode::frame_every(self, core::time::Duration) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::frame_interval(&self) -> core::option::Option<core::time::Duration>
pub const fn paperpaw_sdk::realtime::ScreenMode::full_screen(self) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::grays(self, u8) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::grays_enough(&self) -> core::option::Option<u8>
pub const fn paperpaw_sdk::realtime::ScreenMode::is_full_screen(&self) -> bool
pub const fn paperpaw_sdk::realtime::ScreenMode::is_paced(&self) -> bool
pub fn paperpaw_sdk::realtime::ScreenMode::memory(self, u32) -> Self
pub fn paperpaw_sdk::realtime::ScreenMode::memory_in(self, paperpaw_sdk::memory::Placement, u32) -> Self
pub fn paperpaw_sdk::realtime::ScreenMode::memory_wanted(&self) -> core::option::Option<(u32, core::option::Option<paperpaw_sdk::memory::Placement>)>
pub const fn paperpaw_sdk::realtime::ScreenMode::needs_bluetooth(self) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::needs_network(self) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::new() -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::raw_keys(self) -> Self
pub const fn paperpaw_sdk::realtime::ScreenMode::takes_raw_keys(&self) -> bool
pub const fn paperpaw_sdk::realtime::ScreenMode::wants_bluetooth(&self) -> bool
pub const fn paperpaw_sdk::realtime::ScreenMode::wants_fastest(&self) -> bool
pub const fn paperpaw_sdk::realtime::ScreenMode::wants_network(&self) -> bool
pub struct paperpaw_sdk::realtime::Squeeze
pub const fn paperpaw_sdk::realtime::Squeeze::asked(&self) -> u32
pub struct paperpaw_sdk::realtime::KeysHeld<'a>
pub fn paperpaw_sdk::realtime::KeysHeld<'a>::contains(&self, &str) -> bool
pub const fn paperpaw_sdk::realtime::KeysHeld<'a>::is_empty(&self) -> bool
pub fn paperpaw_sdk::realtime::KeysHeld<'a>::iter(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'static str> + 'a
pub const paperpaw_sdk::realtime::ESCAPE_HOLD: core::time::Duration
```
