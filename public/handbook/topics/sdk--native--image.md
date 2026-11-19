```rust
pub struct paperpaw_sdk::native::image::ImageId(_)
pub const fn paperpaw_sdk::native::image::ImageId::get(self) -> u32
pub const fn paperpaw_sdk::native::image::ImageId::new(u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::image::ImageInfo
pub const fn paperpaw_sdk::native::image::ImageInfo::colour(&self) -> bool
pub const fn paperpaw_sdk::native::image::ImageInfo::height(&self) -> u32
pub const fn paperpaw_sdk::native::image::ImageInfo::not_decoded(&self) -> bool
pub fn paperpaw_sdk::native::image::ImageInfo::read(&paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::image::ImageId) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::image::ImageInfo::width(&self) -> u32
pub struct paperpaw_sdk::native::image::ImagePart
pub paperpaw_sdk::native::image::ImagePart::height: u32
pub paperpaw_sdk::native::image::ImagePart::width: u32
pub paperpaw_sdk::native::image::ImagePart::x: u32
pub paperpaw_sdk::native::image::ImagePart::y: u32
pub const fn paperpaw_sdk::native::image::ImagePart::new(u32, u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::image::ImageReady
pub const fn paperpaw_sdk::native::image::ImageReady::cookie(&self) -> u32
pub const fn paperpaw_sdk::native::image::ImageReady::height(&self) -> u32
pub const fn paperpaw_sdk::native::image::ImageReady::image(&self) -> core::option::Option<paperpaw_sdk::native::image::ImageId>
pub const fn paperpaw_sdk::native::image::ImageReady::luma(&self) -> core::option::Option<&[u8; 64]>
pub const fn paperpaw_sdk::native::image::ImageReady::now_ms(&self) -> u64
pub const fn paperpaw_sdk::native::image::ImageReady::status(&self) -> paperpaw_sdk::native::image::ImageStatus
pub const fn paperpaw_sdk::native::image::ImageReady::width(&self) -> u32
pub struct paperpaw_sdk::native::image::ImageStyle
pub const fn paperpaw_sdk::native::image::ImageStyle::dots(self) -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::fill(self) -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::grays(self) -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::new() -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::small(self) -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::stretch(self) -> Self
pub const fn paperpaw_sdk::native::image::ImageStyle::transparency(self, u8) -> Self
pub enum paperpaw_sdk::native::image::ImageStatus
pub paperpaw_sdk::native::image::ImageStatus::CardFailure
pub paperpaw_sdk::native::image::ImageStatus::Damaged
pub paperpaw_sdk::native::image::ImageStatus::NoMemory
pub paperpaw_sdk::native::image::ImageStatus::NotFound
pub paperpaw_sdk::native::image::ImageStatus::Ready
pub paperpaw_sdk::native::image::ImageStatus::TooLarge
pub paperpaw_sdk::native::image::ImageStatus::Unsupported
pub enum paperpaw_sdk::native::image::PrepareRoot
pub paperpaw_sdk::native::image::PrepareRoot::Bundle
pub paperpaw_sdk::native::image::PrepareRoot::Data
pub paperpaw_sdk::native::image::PrepareRoot::Library
pub enum paperpaw_sdk::native::image::picture::Place
pub paperpaw_sdk::native::image::picture::Place::ComicPage
pub paperpaw_sdk::native::image::picture::Place::Cover
pub paperpaw_sdk::native::image::picture::Place::Other
pub paperpaw_sdk::native::image::picture::Place::ReaderPage
pub paperpaw_sdk::native::image::picture::Place::SleepScreen
pub paperpaw_sdk::native::image::picture::Place::Thumbnail
pub paperpaw_sdk::native::image::picture::Place::Ui
pub struct paperpaw_sdk::native::image::PrepareImage<'a>
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::colour(self) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::new(paperpaw_sdk::native::image::PrepareRoot, &'a str, u32) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::see_through(self) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::side(self, u32) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::tone(self, &'a [u8; 256]) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::turn(self) -> Self
pub const fn paperpaw_sdk::native::image::PrepareImage<'a>::turned(self) -> Self
pub struct paperpaw_sdk::native::image::picture::Asked<'a>
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::colour(&self) -> bool
pub fn paperpaw_sdk::native::image::picture::Asked<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::height(&self) -> u32
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::histogram(&self) -> &[u8; 16]
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::path(&self) -> &'a str
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::place(&self) -> paperpaw_sdk::native::image::picture::Place
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::see_through(&self) -> bool
pub const fn paperpaw_sdk::native::image::picture::Asked<'a>::width(&self) -> u32
pub struct paperpaw_sdk::native::image::picture::Tone<'a>
pub const fn paperpaw_sdk::native::image::picture::Tone<'a>::curve(&'a [u8; 256]) -> Self
pub const fn paperpaw_sdk::native::image::picture::Tone<'a>::dots(self) -> Self
pub fn paperpaw_sdk::native::image::picture::Tone<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::image::picture::Tone<'a>::grays(self) -> Self
pub const fn paperpaw_sdk::native::image::picture::Tone<'a>::keep() -> Self
pub const paperpaw_sdk::native::image::LUMA_BYTES: usize
pub const paperpaw_sdk::native::image::PREPARED_MAX: usize
pub const paperpaw_sdk::native::image::SIDE_MAX: u32
pub const paperpaw_sdk::native::image::TONE_BYTES: usize
pub const paperpaw_sdk::native::image::WAITING_MAX: usize
pub const paperpaw_sdk::native::image::picture::HISTOGRAM_BINS: usize
pub const paperpaw_sdk::native::image::picture::STAGE: &str
pub mod paperpaw_sdk::native::image::picture
```
