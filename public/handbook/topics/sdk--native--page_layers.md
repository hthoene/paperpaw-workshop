```rust
pub struct paperpaw_sdk::native::page_layers::LayerKey<'a>
pub paperpaw_sdk::native::page_layers::LayerKey::action: &'a str
pub paperpaw_sdk::native::page_layers::LayerKey::offset: u32
pub paperpaw_sdk::native::page_layers::LayerKey::section: u32
pub struct paperpaw_sdk::native::page_layers::LayerTap
pub paperpaw_sdk::native::page_layers::LayerTap::offset: u32
pub paperpaw_sdk::native::page_layers::LayerTap::on_book: bool
pub paperpaw_sdk::native::page_layers::LayerTap::section: u32
pub paperpaw_sdk::native::page_layers::LayerTap::x: i32
pub paperpaw_sdk::native::page_layers::LayerTap::y: i32
pub struct paperpaw_sdk::native::page_layers::LayerWord
pub paperpaw_sdk::native::page_layers::LayerWord::at: u16
pub paperpaw_sdk::native::page_layers::LayerWord::width: u16
pub paperpaw_sdk::native::page_layers::LayerWord::x: u16
pub struct paperpaw_sdk::native::page_layers::Spoken
pub paperpaw_sdk::native::page_layers::Spoken::end_line: u32
pub paperpaw_sdk::native::page_layers::Spoken::end_word: u32
pub paperpaw_sdk::native::page_layers::Spoken::line: u32
pub paperpaw_sdk::native::page_layers::Spoken::word: u32
pub fn paperpaw_sdk::native::page_layers::Spoken::holds(&self, u32, u32) -> bool
pub struct paperpaw_sdk::native::page_layers::TextBlock<'a>
pub paperpaw_sdk::native::page_layers::TextBlock::kind: paperpaw_sdk::native::page_layers::BlockKind
pub paperpaw_sdk::native::page_layers::TextBlock::offset: u32
pub paperpaw_sdk::native::page_layers::TextBlock::section: u32
pub paperpaw_sdk::native::page_layers::TextBlock::text: &'a str
pub struct paperpaw_sdk::native::page_layers::Tone(_)
pub const paperpaw_sdk::native::page_layers::Tone::BLACK: paperpaw_sdk::native::page_layers::Tone
pub const paperpaw_sdk::native::page_layers::Tone::NONE: paperpaw_sdk::native::page_layers::Tone
pub const fn paperpaw_sdk::native::page_layers::Tone::gray(u8) -> paperpaw_sdk::native::page_layers::Tone
pub enum paperpaw_sdk::native::page_layers::BlockKind
pub paperpaw_sdk::native::page_layers::BlockKind::Heading
pub paperpaw_sdk::native::page_layers::BlockKind::Other
pub paperpaw_sdk::native::page_layers::BlockKind::Paragraph
pub enum paperpaw_sdk::native::page_layers::GlossKind
pub paperpaw_sdk::native::page_layers::GlossKind::Gloss
pub paperpaw_sdk::native::page_layers::GlossKind::Phonetic
pub paperpaw_sdk::native::page_layers::GlossKind::Ruby
pub enum paperpaw_sdk::native::page_layers::LayerTaps
pub paperpaw_sdk::native::page_layers::LayerTaps::All
pub paperpaw_sdk::native::page_layers::LayerTaps::None
pub paperpaw_sdk::native::page_layers::LayerTaps::OffBook
pub struct paperpaw_sdk::native::page_layers::LayerAnswer<'w>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::finish(self) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::input(&mut self, paperpaw_sdk::native::page_layers::LayerTaps, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::new(&'w mut [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::rect(&mut self, (i32, i32), (u32, u32), (paperpaw_sdk::native::page_layers::Tone, paperpaw_sdk::native::page_layers::Tone), u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::region(&mut self, (u16, u16), (u16, u16)) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::segment(&mut self, (i32, i32), (i32, i32), paperpaw_sdk::native::page_layers::Tone, u32) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::taken(&mut self, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::text(&mut self, (i32, i32), (u32, paperpaw_sdk::native::page_layers::Tone, bool), &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::uses(&mut self, u64) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::LayerAnswer<'w>::uses_reading_aloud(&mut self, u64) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub enum paperpaw_sdk::native::page_layers::LayerAsk<'a>
pub fn paperpaw_sdk::native::page_layers::LayerAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub paperpaw_sdk::native::page_layers::LayerAsk::Book
pub paperpaw_sdk::native::page_layers::LayerAsk::Book::language: &'a str
pub paperpaw_sdk::native::page_layers::LayerAsk::Book::path: &'a str
pub paperpaw_sdk::native::page_layers::LayerAsk::Key(paperpaw_sdk::native::page_layers::LayerKey<'a>)
pub paperpaw_sdk::native::page_layers::LayerAsk::Page(paperpaw_sdk::native::page_layers::LayerPage<'a>)
pub paperpaw_sdk::native::page_layers::LayerAsk::Tap(paperpaw_sdk::native::page_layers::LayerTap)
pub struct paperpaw_sdk::native::page_layers::LayerLine<'a>
pub fn paperpaw_sdk::native::page_layers::LayerLine<'a>::words(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::page_layers::LayerWord> + 'a
pub paperpaw_sdk::native::page_layers::LayerLine::baseline: i32
pub paperpaw_sdk::native::page_layers::LayerLine::inserted: bool
pub paperpaw_sdk::native::page_layers::LayerLine::leading: u32
pub paperpaw_sdk::native::page_layers::LayerLine::offset: u32
pub paperpaw_sdk::native::page_layers::LayerLine::section: u32
pub paperpaw_sdk::native::page_layers::LayerLine::size: u32
pub paperpaw_sdk::native::page_layers::LayerLine::text: &'a str
pub paperpaw_sdk::native::page_layers::LayerLine::top: i32
pub paperpaw_sdk::native::page_layers::LayerLine::width: u32
pub paperpaw_sdk::native::page_layers::LayerLine::x: i32
pub struct paperpaw_sdk::native::page_layers::LayerPage<'a>
pub fn paperpaw_sdk::native::page_layers::LayerPage<'a>::lines(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::page_layers::LayerLine<'a>> + 'a
pub paperpaw_sdk::native::page_layers::LayerPage::first: u32
pub paperpaw_sdk::native::page_layers::LayerPage::height: u32
pub paperpaw_sdk::native::page_layers::LayerPage::lines: u32
pub paperpaw_sdk::native::page_layers::LayerPage::spoken: core::option::Option<paperpaw_sdk::native::page_layers::Spoken>
pub paperpaw_sdk::native::page_layers::LayerPage::width: u32
pub struct paperpaw_sdk::native::page_layers::TextAnswer<'w>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::finish(self) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::gloss(&mut self, core::ops::range::Range<u32>, paperpaw_sdk::native::page_layers::GlossKind, u16, &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::insert(&mut self, &str, u16, bool) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::new(&'w mut [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::replace(&mut self, core::ops::range::Range<u32>, &str) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::room(&mut self, u16, u16) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::page_layers::TextAnswer<'w>::uses(&mut self, u64) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub enum paperpaw_sdk::native::page_layers::TextAsk<'a>
pub fn paperpaw_sdk::native::page_layers::TextAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub paperpaw_sdk::native::page_layers::TextAsk::Block(paperpaw_sdk::native::page_layers::TextBlock<'a>)
pub paperpaw_sdk::native::page_layers::TextAsk::Book
pub paperpaw_sdk::native::page_layers::TextAsk::Book::language: &'a str
pub paperpaw_sdk::native::page_layers::TextAsk::Book::path: &'a str
pub const paperpaw_sdk::native::page_layers::LAYER_STAGE: &str
pub const paperpaw_sdk::native::page_layers::MAX_ANSWER: usize
pub const paperpaw_sdk::native::page_layers::MAX_BLOCK_TEXT: usize
pub const paperpaw_sdk::native::page_layers::MAX_GLOSS: usize
pub const paperpaw_sdk::native::page_layers::MAX_INSERTED: usize
pub const paperpaw_sdk::native::page_layers::MAX_LAYER_TEXT: usize
pub const paperpaw_sdk::native::page_layers::MAX_REPLACEMENT: usize
pub const paperpaw_sdk::native::page_layers::MAX_ROOM: u16
pub const paperpaw_sdk::native::page_layers::MAX_ROWS: usize
pub const paperpaw_sdk::native::page_layers::TEXT_STAGE: &str
pub const paperpaw_sdk::native::page_layers::WORD_BYTES: usize
```
