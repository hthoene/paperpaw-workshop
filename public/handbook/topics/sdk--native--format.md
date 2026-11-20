```rust
pub struct paperpaw_sdk::native::format::FormatFeatures(_)
pub const fn paperpaw_sdk::native::format::FormatFeatures::cache_made(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::embedded_fonts(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::new() -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::page_labels(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::right_to_left(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::some_whole_pages(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::table_of_contents(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::whole_pages(self) -> Self
pub const fn paperpaw_sdk::native::format::FormatFeatures::xpointers(self) -> Self
pub struct paperpaw_sdk::native::format::FormatState
pub const fn paperpaw_sdk::native::format::FormatState::failed(paperpaw_sdk::native::Error) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::format::FormatState::preparing(u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::format::FormatState::ready() -> Self
pub struct paperpaw_sdk::native::format::PageEnd
pub const fn paperpaw_sdk::native::format::PageEnd::last(u32, u32) -> Self
pub const fn paperpaw_sdk::native::format::PageEnd::more(u32, u32, u32) -> Self
pub enum paperpaw_sdk::native::format::FormatOp
pub paperpaw_sdk::native::format::FormatOp::Block
pub paperpaw_sdk::native::format::FormatOp::Close
pub paperpaw_sdk::native::format::FormatOp::Cover
pub paperpaw_sdk::native::format::FormatOp::Fonts
pub paperpaw_sdk::native::format::FormatOp::Image
pub paperpaw_sdk::native::format::FormatOp::LinkTarget
pub paperpaw_sdk::native::format::FormatOp::Links
pub paperpaw_sdk::native::format::FormatOp::Locate
pub paperpaw_sdk::native::format::FormatOp::Meta
pub paperpaw_sdk::native::format::FormatOp::MetaText
pub paperpaw_sdk::native::format::FormatOp::Open
pub paperpaw_sdk::native::format::FormatOp::PageLabel
pub paperpaw_sdk::native::format::FormatOp::Prepare
pub paperpaw_sdk::native::format::FormatOp::Progress
pub paperpaw_sdk::native::format::FormatOp::Sections
pub paperpaw_sdk::native::format::FormatOp::Sniff
pub paperpaw_sdk::native::format::FormatOp::Toc
pub paperpaw_sdk::native::format::FormatOp::TocTarget
pub paperpaw_sdk::native::format::FormatOp::Xpointer
pub enum paperpaw_sdk::native::format::LinkKind
pub paperpaw_sdk::native::format::LinkKind::External = 1
pub paperpaw_sdk::native::format::LinkKind::File = 3
pub paperpaw_sdk::native::format::LinkKind::Footnote = 2
pub paperpaw_sdk::native::format::LinkKind::Internal = 0
pub struct paperpaw_sdk::native::format::BlockReply<'a>
pub const fn paperpaw_sdk::native::format::BlockReply<'a>::image_index(self, u32) -> Self
pub const fn paperpaw_sdk::native::format::BlockReply<'a>::last_in_section(self) -> Self
pub fn paperpaw_sdk::native::format::BlockReply<'a>::new(&'a paperpaw_document::Block) -> Self
pub const fn paperpaw_sdk::native::format::BlockReply<'a>::next(self, u32) -> Self
pub const fn paperpaw_sdk::native::format::BlockReply<'a>::whole_page(self) -> Self
pub struct paperpaw_sdk::native::format::FormatCall<'a>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_accept(&self, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_closed(&self, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_decline(&self, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_label(&self, &str, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_position(&self, u32, u32, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_progress(&self, u32, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_state(&self, &str, paperpaw_sdk::native::format::FormatState, paperpaw_sdk::native::format::FormatFeatures, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_xpointer(&self, &str, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_block(&self, &paperpaw_sdk::native::format::BlockReply<'_>, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_image(&self, &str, u32, u32, u32, bool, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::rows<'w>(&self, &'w mut [u8]) -> core::result::Result<paperpaw_sdk::native::format::FormatRows<'w>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_metadata(&self, &paperpaw_document::Metadata, u32, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatCall<'_>::reply_metadata_text(&self, &paperpaw_document::Metadata, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::background(&self) -> bool
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::claimed(&self) -> bool
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::color(&self) -> bool
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::conversion(&self) -> u64
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::cover_side(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::cursor(&self) -> u32
pub fn paperpaw_sdk::native::format::FormatCall<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::document(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::flags(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::generation(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::image_side(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::index(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::offset(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::operation(&self) -> paperpaw_sdk::native::format::FormatOp
pub fn paperpaw_sdk::native::format::FormatCall<'a>::options(&self) -> paperpaw_sdk::native::format::FormatOptions<'a>
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::publisher_styles(&self) -> bool
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::section(&self) -> u32
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::sniff_bytes(&self) -> &'a [u8]
pub const fn paperpaw_sdk::native::format::FormatCall<'a>::text(&self) -> &'a str
pub fn paperpaw_sdk::native::format::FormatCall<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::format::FormatOption<'a>(_)
pub const fn paperpaw_sdk::native::format::FormatOption<'a>::key(self) -> &'a str
pub const fn paperpaw_sdk::native::format::FormatOption<'a>::value(self) -> &'a str
pub struct paperpaw_sdk::native::format::FormatOptions<'a>(_)
pub type paperpaw_sdk::native::format::FormatOptions<'a>::Item = core::result::Result<paperpaw_sdk::native::format::FormatOption<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatOptions<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::format::FormatRows<'w>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::finish(self, paperpaw_sdk::native::format::PageEnd) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::font(&mut self, u32, u32, bool, bool, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::format::FormatRows<'_>::len(&self) -> usize
pub fn paperpaw_sdk::native::format::FormatRows<'_>::link(&mut self, u32, u32, paperpaw_sdk::native::format::LinkKind, &str) -> core::result::Result<bool, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::section(&mut self, u32, u32, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::toc(&mut self, u32, u32, u32, u32, bool, &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::format::FormatRows<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
