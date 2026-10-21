```rust
pub use paperpaw_sdk::image::ColorFile
pub use paperpaw_sdk::image::ColorWriter
pub use paperpaw_sdk::image::Downscaler
pub use paperpaw_sdk::image::Fit
pub use paperpaw_sdk::image::Format
pub use paperpaw_sdk::image::GrayFile
pub use paperpaw_sdk::image::GrayWriter
pub use paperpaw_sdk::image::ImageError
pub use paperpaw_sdk::image::ImageFile
pub use paperpaw_sdk::image::ImageSink
pub use paperpaw_sdk::image::PngWriter
pub use paperpaw_sdk::image::Source
pub use paperpaw_sdk::image::decode
pub use paperpaw_sdk::image::dimensions
pub use paperpaw_sdk::image::luma
pub fn paperpaw_sdk::image::gray_from_file(&dyn paperpaw_platform::storage::Storage, &str, &str, paperpaw_image::Fit) -> core::option::Option<paperpaw_document::ImageRef>
pub fn paperpaw_sdk::image::picture_from_file(&dyn paperpaw_platform::storage::Storage, &str, &str, paperpaw_image::Fit, bool) -> core::option::Option<paperpaw_document::ImageRef>
```
