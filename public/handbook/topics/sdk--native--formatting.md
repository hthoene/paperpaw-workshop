```rust
pub enum paperpaw_sdk::native::formatting::Arg<'a>
pub paperpaw_sdk::native::formatting::Arg::Count(i64)
pub paperpaw_sdk::native::formatting::Arg::Int
pub paperpaw_sdk::native::formatting::Arg::Int::name: &'a str
pub paperpaw_sdk::native::formatting::Arg::Int::value: i64
pub paperpaw_sdk::native::formatting::Arg::Text
pub paperpaw_sdk::native::formatting::Arg::Text::name: &'a str
pub paperpaw_sdk::native::formatting::Arg::Text::value: &'a str
pub struct paperpaw_sdk::native::formatting::FormatBuffers<'scratch, 'out>
pub fn paperpaw_sdk::native::formatting::FormatBuffers<'scratch, 'out>::new(&'scratch mut [u8], &'out mut [u8]) -> Self
pub paperpaw_sdk::native::formatting::FormatBuffers::out: &'out mut [u8]
pub paperpaw_sdk::native::formatting::FormatBuffers::scratch: &'scratch mut [u8]
pub const paperpaw_sdk::native::formatting::MAX_ARGUMENT_BYTES: usize
pub const paperpaw_sdk::native::formatting::MAX_DIGIT_BYTES: usize
pub const paperpaw_sdk::native::formatting::MAX_KEY_BYTES: usize
pub const paperpaw_sdk::native::formatting::MAX_MESSAGE_BYTES: usize
pub fn paperpaw_sdk::native::formatting::copy_message<'a>(&paperpaw_sdk::native::Host<'_>, impl core::convert::AsRef<str>, &'a mut [u8]) -> core::result::Result<&'a str, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::formatting::digits(&paperpaw_sdk::native::Host<'_>, impl core::convert::AsRef<str>, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::formatting::format_message(&paperpaw_sdk::native::Host<'_>, impl core::convert::AsRef<str>, &[paperpaw_sdk::native::formatting::Arg<'_>], &mut paperpaw_sdk::native::formatting::FormatBuffers<'_, '_>) -> core::result::Result<usize, paperpaw_sdk::native::Error>
```
