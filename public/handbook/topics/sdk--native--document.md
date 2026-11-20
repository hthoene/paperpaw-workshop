```rust
pub struct paperpaw_sdk::native::document::BlockCell(_)
pub fn paperpaw_sdk::native::document::BlockCell::align(&self) -> paperpaw_document::Align
pub const fn paperpaw_sdk::native::document::BlockCell::end(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockCell::rows(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockCell::span(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockCell::vertical(&self) -> paperpaw_document::table::VerticalAlign
pub const fn paperpaw_sdk::native::document::BlockCell::width(&self) -> u32
pub struct paperpaw_sdk::native::document::BlockCursor
pub const fn paperpaw_sdk::native::document::BlockCursor::start() -> Self
pub struct paperpaw_sdk::native::document::BlockImage(_)
pub const fn paperpaw_sdk::native::document::BlockImage::colour(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockImage::height(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockImage::image(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockImage::index(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockImage::pending(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockImage::turned(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockImage::width(&self) -> u32
pub struct paperpaw_sdk::native::document::BlockMap(_)
pub const fn paperpaw_sdk::native::document::BlockMap::source(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockMap::text(&self) -> u32
pub struct paperpaw_sdk::native::document::BlockRun(_)
pub const fn paperpaw_sdk::native::document::BlockRun::end(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockRun::start(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockRun::style(&self) -> paperpaw_document::TextStyle
pub struct paperpaw_sdk::native::document::DocCursor
pub const fn paperpaw_sdk::native::document::DocCursor::start() -> Self
pub struct paperpaw_sdk::native::document::DocId(_)
pub struct paperpaw_sdk::native::document::DocPageEnd
pub const fn paperpaw_sdk::native::document::DocPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::document::DocCursor>
pub const fn paperpaw_sdk::native::document::DocPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::document::DocPosition
pub paperpaw_sdk::native::document::DocPosition::offset: u32
pub paperpaw_sdk::native::document::DocPosition::section: u32
pub const fn paperpaw_sdk::native::document::DocPosition::new(u32, u32) -> Self
pub struct paperpaw_sdk::native::document::DocSpan
pub const fn paperpaw_sdk::native::document::DocSpan::new(u32, core::ops::range::Range<u32>) -> Self
pub struct paperpaw_sdk::native::document::DocTextQuery
pub const fn paperpaw_sdk::native::document::DocTextQuery::author(u32) -> Self
pub const fn paperpaw_sdk::native::document::DocTextQuery::description() -> Self
pub const fn paperpaw_sdk::native::document::DocTextQuery::from(self, u32) -> Self
pub const fn paperpaw_sdk::native::document::DocTextQuery::series() -> Self
pub const fn paperpaw_sdk::native::document::DocTextQuery::subject(u32) -> Self
pub const fn paperpaw_sdk::native::document::DocTextQuery::title() -> Self
pub struct paperpaw_sdk::native::document::Documents
pub fn paperpaw_sdk::native::document::Documents::ask_image(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, u32, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::BlockImage, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::ask_image_turned(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, u32, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::BlockImage, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::block_at<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocPosition, paperpaw_sdk::native::document::BlockCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::BlockFragment<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::close(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::locate(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &str, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPosition, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::open_book<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::document::OpenBook<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocState<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::state<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocState<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::xpointer<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocPosition, &mut [u8], &'a mut [u8]) -> core::result::Result<&'a str, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::format_for<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::Root, &str, bool, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::Format<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::formats<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::FormatCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::FormatPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::link_target(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &str, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPosition, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::links<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocSpan, paperpaw_sdk::native::document::DocCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPage<'a, paperpaw_sdk::native::document::Link<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::sections<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPage<'a, paperpaw_sdk::native::document::SectionEntry>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::toc<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPage<'a, paperpaw_sdk::native::document::TocEntry<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::toc_target(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocPosition, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::metadata<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::Metadata<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::text<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, paperpaw_sdk::native::document::DocTextQuery, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::DocTextPart<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::readers<'a>(&self, &paperpaw_sdk::native::Host<'_>, &str, paperpaw_sdk::native::document::ReaderCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::document::ReaderPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::document::Documents::report(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::document::DocId, &paperpaw_sdk::native::document::Report<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::document::FormatCursor
pub const fn paperpaw_sdk::native::document::FormatCursor::start() -> Self
pub struct paperpaw_sdk::native::document::FormatPageEnd
pub const fn paperpaw_sdk::native::document::FormatPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::document::FormatCursor>
pub const fn paperpaw_sdk::native::document::FormatPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::document::ReaderCursor
pub const fn paperpaw_sdk::native::document::ReaderCursor::start() -> Self
pub struct paperpaw_sdk::native::document::ReaderPageEnd
pub const fn paperpaw_sdk::native::document::ReaderPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::document::ReaderCursor>
pub const fn paperpaw_sdk::native::document::ReaderPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::document::SectionEntry(_)
pub const fn paperpaw_sdk::native::document::SectionEntry::index(&self) -> u32
pub const fn paperpaw_sdk::native::document::SectionEntry::length(&self) -> u32
pub const fn paperpaw_sdk::native::document::SectionEntry::whole_page_picture(&self) -> bool
pub enum paperpaw_sdk::native::document::BlockRecord<'a>
pub paperpaw_sdk::native::document::BlockRecord::Cell(paperpaw_sdk::native::document::BlockCell)
pub paperpaw_sdk::native::document::BlockRecord::Columns(paperpaw_sdk::native::document::BlockColumns<'a>)
pub paperpaw_sdk::native::document::BlockRecord::Head(paperpaw_sdk::native::document::BlockHead<'a>)
pub paperpaw_sdk::native::document::BlockRecord::Image(paperpaw_sdk::native::document::BlockImage)
pub paperpaw_sdk::native::document::BlockRecord::InlineLang(&'a str)
pub paperpaw_sdk::native::document::BlockRecord::Map(paperpaw_sdk::native::document::BlockMap)
pub paperpaw_sdk::native::document::BlockRecord::Ruby(paperpaw_sdk::native::document::BlockRuby<'a>)
pub paperpaw_sdk::native::document::BlockRecord::Run(paperpaw_sdk::native::document::BlockRun)
pub paperpaw_sdk::native::document::BlockRecord::Text(&'a str)
pub enum paperpaw_sdk::native::document::DocClosedReason
pub paperpaw_sdk::native::document::DocClosedReason::BookGone
pub paperpaw_sdk::native::document::DocClosedReason::CardRemoved
pub paperpaw_sdk::native::document::DocClosedReason::FormatStopped
pub paperpaw_sdk::native::document::DocClosedReason::Needed
pub enum paperpaw_sdk::native::document::LinkKind
pub paperpaw_sdk::native::document::LinkKind::External
pub paperpaw_sdk::native::document::LinkKind::File
pub paperpaw_sdk::native::document::LinkKind::Footnote
pub paperpaw_sdk::native::document::LinkKind::Internal
pub paperpaw_sdk::native::document::LinkKind::Other(u32)
pub enum paperpaw_sdk::native::document::Preparation
pub paperpaw_sdk::native::document::Preparation::Failed
pub paperpaw_sdk::native::document::Preparation::Preparing
pub paperpaw_sdk::native::document::Preparation::Ready
pub enum paperpaw_sdk::native::document::Root
pub paperpaw_sdk::native::document::Root::Data = 0
pub paperpaw_sdk::native::document::Root::Handed = 5
pub paperpaw_sdk::native::document::Root::Library = 1
pub struct paperpaw_sdk::native::document::BlockColumns<'a>(_)
pub const fn paperpaw_sdk::native::document::BlockColumns<'_>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockColumns<'_>::len(&self) -> usize
pub fn paperpaw_sdk::native::document::BlockColumns<'_>::weights(&self) -> impl core::iter::traits::iterator::Iterator<Item = u16> + use<'_>
pub struct paperpaw_sdk::native::document::BlockFragment<'a>
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::continuation(&self) -> core::option::Option<paperpaw_sdk::native::document::BlockCursor>
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::is_first(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::last_in_section(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::len(&self) -> usize
pub const fn paperpaw_sdk::native::document::BlockFragment<'a>::next_block(&self) -> core::option::Option<u32>
pub fn paperpaw_sdk::native::document::BlockFragment<'a>::records(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::document::BlockRecord<'a>> + use<'a>
pub struct paperpaw_sdk::native::document::BlockHead<'a>(_)
pub fn paperpaw_sdk::native::document::BlockHead<'a>::align(&self) -> paperpaw_document::Align
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::continued(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::continues(&self) -> bool
pub fn paperpaw_sdk::native::document::BlockHead<'a>::direction(&self) -> paperpaw_lang::Direction
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::drop_cap(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::end(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::first_row(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::header_row(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::indent(&self) -> core::option::Option<i32>
pub fn paperpaw_sdk::native::document::BlockHead<'a>::kind(&self) -> paperpaw_document::BlockKind
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::lang(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::last_row(&self) -> bool
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::line_height(&self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::margins(&self) -> (u32, u32)
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::size(&self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::space(&self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::start(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockHead<'a>::text_bytes(&self) -> u32
pub fn paperpaw_sdk::native::document::BlockHead<'a>::writing_mode(&self) -> paperpaw_lang::WritingMode
pub struct paperpaw_sdk::native::document::BlockRuby<'a>(_)
pub const fn paperpaw_sdk::native::document::BlockRuby<'a>::end(&self) -> u32
pub fn paperpaw_sdk::native::document::BlockRuby<'a>::kind(&self) -> paperpaw_document::AnnotationKind
pub const fn paperpaw_sdk::native::document::BlockRuby<'a>::size(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockRuby<'a>::start(&self) -> u32
pub const fn paperpaw_sdk::native::document::BlockRuby<'a>::text(&self) -> &'a str
pub struct paperpaw_sdk::native::document::DocPage<'a, T>
pub const fn paperpaw_sdk::native::document::DocPage<'a, T>::end(&self) -> paperpaw_sdk::native::document::DocPageEnd
pub const fn paperpaw_sdk::native::document::DocPage<'a, T>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocPage<'a, T>::len(&self) -> usize
pub fn paperpaw_sdk::native::document::DocPage<'a, T>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = T> + use<'a, T>
pub fn paperpaw_sdk::native::document::DocPage<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::document::DocState<'a>(_)
pub const fn paperpaw_sdk::native::document::DocState<'a>::cache_made_now(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::conversion(&self) -> u64
pub const fn paperpaw_sdk::native::document::DocState<'a>::format(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::DocState<'a>::has_fonts(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::has_page_labels(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::has_toc(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::has_xpointers(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::id(&self) -> paperpaw_sdk::native::document::DocId
pub const fn paperpaw_sdk::native::document::DocState<'a>::preparation(&self) -> paperpaw_sdk::native::document::Preparation
pub const fn paperpaw_sdk::native::document::DocState<'a>::progress_ppm(&self) -> u32
pub const fn paperpaw_sdk::native::document::DocState<'a>::right_to_left(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::some_whole_pages(&self) -> bool
pub const fn paperpaw_sdk::native::document::DocState<'a>::status(&self) -> i32
pub const fn paperpaw_sdk::native::document::DocState<'a>::whole_pages(&self) -> bool
pub struct paperpaw_sdk::native::document::DocTextPart<'a>
pub const fn paperpaw_sdk::native::document::DocTextPart<'a>::next_offset(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::document::DocTextPart<'a>::text(self) -> &'a str
pub const fn paperpaw_sdk::native::document::DocTextPart<'a>::total(self) -> u32
pub struct paperpaw_sdk::native::document::Format<'a>(_)
pub fn paperpaw_sdk::native::document::Format<'a>::extensions(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str> + use<'a>
pub const fn paperpaw_sdk::native::document::Format<'a>::id(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Format<'a>::priority(&self) -> i32
pub const fn paperpaw_sdk::native::document::Format<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::document::FormatPage<'a>
pub const fn paperpaw_sdk::native::document::FormatPage<'a>::end(&self) -> paperpaw_sdk::native::document::FormatPageEnd
pub const fn paperpaw_sdk::native::document::FormatPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::document::FormatPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::document::FormatPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::document::Format<'a>> + use<'a>
pub struct paperpaw_sdk::native::document::Link<'a>(_)
pub const fn paperpaw_sdk::native::document::Link<'a>::end(&self) -> u32
pub const fn paperpaw_sdk::native::document::Link<'a>::href(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Link<'a>::kind(&self) -> paperpaw_sdk::native::document::LinkKind
pub const fn paperpaw_sdk::native::document::Link<'a>::start(&self) -> u32
pub struct paperpaw_sdk::native::document::Metadata<'a>(_)
pub const fn paperpaw_sdk::native::document::Metadata<'a>::authors(&self) -> u32
pub const fn paperpaw_sdk::native::document::Metadata<'a>::description_bytes(&self) -> u32
pub const fn paperpaw_sdk::native::document::Metadata<'a>::language(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Metadata<'a>::right_to_left(&self) -> bool
pub const fn paperpaw_sdk::native::document::Metadata<'a>::sections(&self) -> u32
pub const fn paperpaw_sdk::native::document::Metadata<'a>::series(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Metadata<'a>::series_cut(&self) -> bool
pub const fn paperpaw_sdk::native::document::Metadata<'a>::series_index(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Metadata<'a>::subjects(&self) -> u32
pub const fn paperpaw_sdk::native::document::Metadata<'a>::title(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Metadata<'a>::title_cut(&self) -> bool
pub const fn paperpaw_sdk::native::document::Metadata<'a>::writing_mode(&self) -> u32
pub struct paperpaw_sdk::native::document::OpenBook<'a>
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::background(self) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::color(self) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::cover_side(self, u32) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::css(self, paperpaw_sdk::native::document::Root, &'a str) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::format(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::image_side(self, u32) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::new(&'a str) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::options(self, &'a [(&'a str, &'a str)]) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::publisher_styles(self) -> Self
pub const fn paperpaw_sdk::native::document::OpenBook<'a>::root(self, paperpaw_sdk::native::document::Root) -> Self
pub struct paperpaw_sdk::native::document::Reader<'a>(_)
pub fn paperpaw_sdk::native::document::Reader<'a>::formats(&self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str> + use<'a>
pub const fn paperpaw_sdk::native::document::Reader<'a>::id(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Reader<'a>::reads_every_format(&self) -> bool
pub const fn paperpaw_sdk::native::document::Reader<'a>::screen(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::Reader<'a>::title(&self) -> &'a str
pub struct paperpaw_sdk::native::document::ReaderPage<'a>
pub const fn paperpaw_sdk::native::document::ReaderPage<'a>::end(&self) -> paperpaw_sdk::native::document::ReaderPageEnd
pub const fn paperpaw_sdk::native::document::ReaderPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::document::ReaderPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::document::ReaderPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::document::Reader<'a>> + use<'a>
pub struct paperpaw_sdk::native::document::Report<'a>
pub const fn paperpaw_sdk::native::document::Report<'a>::chapter(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::chapter_left(self, u32) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::finished(self) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::insert(self, u32) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::new(paperpaw_sdk::native::document::DocPosition, u32) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::pages(self, u32, u32) -> Self
pub const fn paperpaw_sdk::native::document::Report<'a>::title(self, &'a str) -> Self
pub struct paperpaw_sdk::native::document::TocEntry<'a>(_)
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::approximate(&self) -> bool
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::index(&self) -> u32
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::level(&self) -> u32
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::position(&self) -> paperpaw_sdk::native::document::DocPosition
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::title(&self) -> &'a str
pub const fn paperpaw_sdk::native::document::TocEntry<'a>::title_cut(&self) -> bool
pub const paperpaw_sdk::native::document::MAX_OPTIONS: usize
```
