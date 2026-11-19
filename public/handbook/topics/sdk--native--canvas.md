```rust
pub struct paperpaw_sdk::native::canvas::PartFlags(_)
pub const paperpaw_sdk::native::canvas::PartFlags::DISABLED: Self
pub const paperpaw_sdk::native::canvas::PartFlags::FOCUSED: Self
pub const paperpaw_sdk::native::canvas::PartFlags::NONE: Self
pub const paperpaw_sdk::native::canvas::PartFlags::OFF: Self
pub const paperpaw_sdk::native::canvas::PartFlags::ON: Self
pub const fn paperpaw_sdk::native::canvas::PartFlags::bits(self) -> u32
pub type paperpaw_sdk::native::canvas::PartFlags::Output = paperpaw_sdk::native::canvas::PartFlags
pub fn paperpaw_sdk::native::canvas::PartFlags::bitor(self, Self) -> Self
pub enum paperpaw_sdk::native::canvas::PartRole
pub paperpaw_sdk::native::canvas::PartRole::Button = 3
pub paperpaw_sdk::native::canvas::PartRole::Check = 7
pub paperpaw_sdk::native::canvas::PartRole::Dialog = 12
pub paperpaw_sdk::native::canvas::PartRole::Field = 9
pub paperpaw_sdk::native::canvas::PartRole::Heading = 1
pub paperpaw_sdk::native::canvas::PartRole::Image = 10
pub paperpaw_sdk::native::canvas::PartRole::Link = 11
pub paperpaw_sdk::native::canvas::PartRole::Progress = 13
pub paperpaw_sdk::native::canvas::PartRole::Radio = 8
pub paperpaw_sdk::native::canvas::PartRole::Row = 2
pub paperpaw_sdk::native::canvas::PartRole::Slider = 5
pub paperpaw_sdk::native::canvas::PartRole::Switch = 4
pub paperpaw_sdk::native::canvas::PartRole::Text = 6
pub struct paperpaw_sdk::native::canvas::Canvas<'cb>
pub fn paperpaw_sdk::native::canvas::Canvas<'_>::describe_part(&self, paperpaw_sdk::native::canvas::PartRole, &str, paperpaw_sdk::native::callbacks::FrameRect, paperpaw_sdk::native::canvas::PartFlags) -> core::result::Result<bool, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'_>::draw_image(&self, paperpaw_sdk::native::image::ImageId, paperpaw_sdk::native::callbacks::FrameRect, paperpaw_sdk::native::image::ImageStyle) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'_>::draw_image_part(&self, paperpaw_sdk::native::image::ImageId, paperpaw_sdk::native::image::ImagePart, paperpaw_sdk::native::callbacks::FrameRect, paperpaw_sdk::native::image::ImageStyle) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::clip_region(&mut self, paperpaw_sdk::native::callbacks::FrameRect) -> core::result::Result<paperpaw_sdk::native::canvas::ClipGuard<'_, 'cb>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::draw_segment(&self, paperpaw_platform::geometry::Point, paperpaw_platform::geometry::Point, u32, paperpaw_platform::pixel::Color) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::fill_checker(&self, paperpaw_sdk::native::callbacks::FrameRect, paperpaw_platform::pixel::Color, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::fill_rectangle(&self, paperpaw_sdk::native::callbacks::FrameRect, paperpaw_platform::pixel::Color) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::fill_rounded_rectangle(&self, paperpaw_sdk::native::callbacks::FrameRect, u32, paperpaw_platform::pixel::Color) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::canvas::Canvas<'cb>::frame_rect(&self) -> paperpaw_sdk::native::callbacks::FrameRect
pub fn paperpaw_sdk::native::canvas::Canvas<'cb>::stroke_rounded_rectangle(&self, paperpaw_sdk::native::callbacks::FrameRect, u32, u32, paperpaw_platform::pixel::Color) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::canvas::ClipGuard<'a, 'cb>
pub fn paperpaw_sdk::native::canvas::ClipGuard<'_, '_>::restore(self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::canvas::ClipGuard<'_, '_>::deref_mut(&mut self) -> &mut Self::Target
pub fn paperpaw_sdk::native::canvas::ClipGuard<'_, '_>::drop(&mut self)
pub type paperpaw_sdk::native::canvas::ClipGuard<'_, 'cb>::Target = paperpaw_sdk::native::canvas::Canvas<'cb>
pub fn paperpaw_sdk::native::canvas::ClipGuard<'_, 'cb>::deref(&self) -> &Self::Target
```
