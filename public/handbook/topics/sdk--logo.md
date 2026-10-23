```rust
pub enum paperpaw_sdk::logo::Logo
pub paperpaw_sdk::logo::Logo::Drawn
pub paperpaw_sdk::logo::Logo::Picture(paperpaw_document::ImageRef)
pub fn paperpaw_sdk::logo::Logo::draw(&self, &mut paperpaw_graphics::canvas::Canvas<'_>, &dyn paperpaw_platform::storage::Storage, paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color)
pub fn paperpaw_sdk::logo::Logo::fit(&self, u16, u16) -> (u16, u16)
pub fn paperpaw_sdk::logo::Logo::read(&paperpaw_sdk::Env<'_>, u16, u16) -> paperpaw_sdk::logo::Logo
pub const paperpaw_sdk::logo::LOGO: paperpaw_sdk::setting::Setting<paperpaw_sdk::setting::Text>
pub fn paperpaw_sdk::logo::draw(&mut paperpaw_graphics::canvas::Canvas<'_>, paperpaw_platform::geometry::Rect, paperpaw_platform::pixel::Color)
```
