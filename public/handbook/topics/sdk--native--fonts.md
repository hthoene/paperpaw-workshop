```rust
pub struct paperpaw_sdk::native::fonts::IconGlyph
pub fn paperpaw_sdk::native::fonts::IconGlyph::as_str(&self) -> &str
pub fn paperpaw_sdk::native::fonts::IconGlyph::named(&paperpaw_sdk::native::Host<'_>, impl core::convert::AsRef<str>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::IconGlyph::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::fonts::Ink
pub const fn paperpaw_sdk::native::fonts::Ink::extra(self, u32) -> Self
pub const fn paperpaw_sdk::native::fonts::Ink::new() -> Self
pub const fn paperpaw_sdk::native::fonts::Ink::sharp(self) -> Self
pub const fn paperpaw_sdk::native::fonts::Ink::tone(self, [u8; 16]) -> Self
pub struct paperpaw_sdk::native::fonts::InkBounds
pub paperpaw_sdk::native::fonts::InkBounds::bottom: i32
pub paperpaw_sdk::native::fonts::InkBounds::left: i32
pub paperpaw_sdk::native::fonts::InkBounds::right: i32
pub paperpaw_sdk::native::fonts::InkBounds::top: i32
pub const fn paperpaw_sdk::native::fonts::InkBounds::new(i32, i32, i32, i32) -> Self
pub struct paperpaw_sdk::native::fonts::TextOrigin
pub paperpaw_sdk::native::fonts::TextOrigin::baseline: i32
pub paperpaw_sdk::native::fonts::TextOrigin::x: f32
pub const fn paperpaw_sdk::native::fonts::TextOrigin::new(f32, i32) -> Self
pub enum paperpaw_sdk::native::fonts::FontRole
pub paperpaw_sdk::native::fonts::FontRole::Reading
pub paperpaw_sdk::native::fonts::FontRole::ReadingBold
pub paperpaw_sdk::native::fonts::FontRole::ReadingBoldItalic
pub paperpaw_sdk::native::fonts::FontRole::ReadingItalic
pub paperpaw_sdk::native::fonts::FontRole::Status
pub paperpaw_sdk::native::fonts::FontRole::Ui
pub struct paperpaw_sdk::native::fonts::Font<'cb>
pub fn paperpaw_sdk::native::fonts::Font<'_>::covers(&self, impl core::convert::AsRef<str>) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'_>::ink(&self, f32, impl core::convert::AsRef<str>) -> core::result::Result<core::option::Option<paperpaw_sdk::native::fonts::InkBounds>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'_>::read_line_metrics(&self, f32) -> core::result::Result<paperpaw_text::font::LineMetrics, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::acquire(&'cb paperpaw_sdk::native::Host<'cb>, impl core::convert::AsRef<str>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::acquire_data(&'cb paperpaw_sdk::native::Host<'cb>, impl core::convert::AsRef<str>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::acquire_role(&'cb paperpaw_sdk::native::Host<'cb>, paperpaw_sdk::native::fonts::FontRole) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::draw_inked(&self, &paperpaw_sdk::native::canvas::Canvas<'_>, f32, paperpaw_sdk::native::fonts::TextOrigin, paperpaw_platform::pixel::Color, impl core::convert::AsRef<str>, paperpaw_sdk::native::fonts::Ink) -> core::result::Result<f32, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::measure_text(&self, f32, impl core::convert::AsRef<str>) -> core::result::Result<f32, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::release(self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'cb>::render_text(&self, &paperpaw_sdk::native::canvas::Canvas<'_>, f32, paperpaw_sdk::native::fonts::TextOrigin, paperpaw_platform::pixel::Color, impl core::convert::AsRef<str>) -> core::result::Result<f32, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::fonts::Font<'_>::drop(&mut self)
```
