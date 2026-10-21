```rust
pub struct paperpaw_sdk::host::ScreenHost
pub fn paperpaw_sdk::host::ScreenHost::area(&self) -> core::option::Option<paperpaw_platform::geometry::Rect>
pub fn paperpaw_sdk::host::ScreenHost::close(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::host::ScreenHost::draw(&mut self, &mut paperpaw_graphics::canvas::Canvas<'_>, &paperpaw_sdk::Env<'_>)
pub fn paperpaw_sdk::host::ScreenHost::new() -> Self
pub fn paperpaw_sdk::host::ScreenHost::on_action(&mut self, &paperpaw_sdk::Id, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::host::ScreenHost::on_event(&mut self, &paperpaw_sdk::Id, &paperpaw_sdk::Params, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::host::ScreenHost::on_gesture(&mut self, paperpaw_sdk::Gesture, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::host::ScreenHost::on_hide(&mut self)
pub fn paperpaw_sdk::host::ScreenHost::on_pointer(&mut self, &paperpaw_platform::input::PointerEvent, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::host::ScreenHost::on_show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::host::ScreenHost::on_timer(&mut self, &mut paperpaw_sdk::Cx<'_, '_>)
pub fn paperpaw_sdk::host::ScreenHost::pass(&mut self, &mut paperpaw_sdk::Cx<'_, '_>, impl core::ops::function::FnOnce(&mut dyn paperpaw_sdk::Screen, &mut paperpaw_sdk::Cx<'_, '_>) -> paperpaw_sdk::Handled) -> paperpaw_sdk::Handled
pub fn paperpaw_sdk::host::ScreenHost::screen(&self) -> core::option::Option<&paperpaw_sdk::Id>
pub fn paperpaw_sdk::host::ScreenHost::show(&mut self, &mut paperpaw_sdk::Cx<'_, '_>, paperpaw_sdk::Id, paperpaw_sdk::Params, paperpaw_platform::geometry::Rect) -> bool
pub fn paperpaw_sdk::host::ScreenHost::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
