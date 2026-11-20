```rust
pub struct paperpaw_sdk::native::library::AnnotationCursor
pub const fn paperpaw_sdk::native::library::AnnotationCursor::start() -> Self
pub struct paperpaw_sdk::native::library::AnnotationPageEnd
pub const fn paperpaw_sdk::native::library::AnnotationPageEnd::generation(self) -> u32
pub const fn paperpaw_sdk::native::library::AnnotationPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::library::AnnotationCursor>
pub const fn paperpaw_sdk::native::library::AnnotationPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::library::AnnotationTextQuery
pub const fn paperpaw_sdk::native::library::AnnotationTextQuery::from(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationTextQuery::new(u32, paperpaw_sdk::native::library::AnnotationTextKind) -> Self
pub struct paperpaw_sdk::native::library::BookTextQuery
pub const fn paperpaw_sdk::native::library::BookTextQuery::author() -> Self
pub const fn paperpaw_sdk::native::library::BookTextQuery::field(u32) -> Self
pub const fn paperpaw_sdk::native::library::BookTextQuery::from(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::BookTextQuery::series() -> Self
pub const fn paperpaw_sdk::native::library::BookTextQuery::tag(u32) -> Self
pub const fn paperpaw_sdk::native::library::BookTextQuery::title() -> Self
pub struct paperpaw_sdk::native::library::CatalogCursor
pub const fn paperpaw_sdk::native::library::CatalogCursor::start() -> Self
pub struct paperpaw_sdk::native::library::CatalogState(_)
pub const fn paperpaw_sdk::native::library::CatalogState::books(self) -> u32
pub const fn paperpaw_sdk::native::library::CatalogState::generation(self) -> u32
pub const fn paperpaw_sdk::native::library::CatalogState::phase(self) -> paperpaw_sdk::native::library::CatalogPhase
pub const fn paperpaw_sdk::native::library::CatalogState::walk_ppm(self) -> u32
pub struct paperpaw_sdk::native::library::Committed
pub const fn paperpaw_sdk::native::library::Committed::added(&self) -> u32
pub const fn paperpaw_sdk::native::library::Committed::annotation_generation(&self) -> u32
pub const fn paperpaw_sdk::native::library::Committed::edits(&self) -> u32
pub const fn paperpaw_sdk::native::library::Committed::transaction(&self) -> u32
pub struct paperpaw_sdk::native::library::Cover
pub const fn paperpaw_sdk::native::library::Cover::image(&self) -> paperpaw_sdk::native::image::ImageId
pub const fn paperpaw_sdk::native::library::Cover::info(&self) -> paperpaw_sdk::native::image::ImageInfo
pub struct paperpaw_sdk::native::library::FieldCursor(_)
pub const fn paperpaw_sdk::native::library::FieldCursor::start() -> Self
pub struct paperpaw_sdk::native::library::FieldPageEnd(_)
pub const fn paperpaw_sdk::native::library::FieldPageEnd::generation(self) -> u32
pub fn paperpaw_sdk::native::library::FieldPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::library::FieldCursor>
pub const fn paperpaw_sdk::native::library::FieldPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::library::Library
pub fn paperpaw_sdk::native::library::Library::anchors<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, paperpaw_sdk::native::library::AnnotationCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::AnchorPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::annotation_text<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, paperpaw_sdk::native::library::AnnotationTextQuery, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::AnnotationTextPart<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::annotations<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, paperpaw_sdk::native::library::AnnotationCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::AnnotationPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::book<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Book<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::next_in_series<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Entry<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::open(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::query<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::library::Query<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::LibraryPage<'a, paperpaw_sdk::native::library::Entry<'a>>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::set_favourite(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::set_field(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &str, &str, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::set_finished(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::state(&self, &paperpaw_sdk::native::Host<'_>, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::CatalogState, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::book_key<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::BookKey<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::position<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Position<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::set_position(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &paperpaw_sdk::native::library::PositionWrite<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::book_text<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, paperpaw_sdk::native::library::BookTextQuery, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::BookTextPart<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::can_delete<'a>(&self, &paperpaw_sdk::native::Host<'_>, &[&str], &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::DeleteReport<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::delete<'a>(&self, &paperpaw_sdk::native::Host<'_>, &[&str], bool, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::DeleteReport<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::import<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::library::Import<'_>, &mut [u8], &'a mut [u8]) -> core::result::Result<&'a str, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::move_to(&self, &paperpaw_sdk::native::Host<'_>, &str, &str, bool, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::cover(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Cover, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::edit_abort(&self, &paperpaw_sdk::native::Host<'_>, &mut paperpaw_sdk::native::library::Transaction, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::edit_add(&self, &paperpaw_sdk::native::Host<'_>, &mut paperpaw_sdk::native::library::Transaction, &[paperpaw_sdk::native::library::AnnotationEdit<'_>], &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::edit_begin(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, u32, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Transaction, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::edit_commit(&self, &paperpaw_sdk::native::Host<'_>, &mut paperpaw_sdk::native::library::Transaction, &mut [u8], &mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::Committed, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::edit_receipt<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::library::Committed, paperpaw_sdk::native::library::ReceiptCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::ReceiptPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::facets<'a>(&self, &paperpaw_sdk::native::Host<'_>, &paperpaw_sdk::native::library::Query<'_>, paperpaw_sdk::native::library::Facet, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::FacetPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::fields<'a>(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, paperpaw_sdk::native::library::FieldCursor, &mut [u8], &'a mut [u8]) -> core::result::Result<paperpaw_sdk::native::library::FieldPage<'a>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Library::provide(&self, &paperpaw_sdk::native::Host<'_>, paperpaw_sdk::native::library::BookRef<'_>, &paperpaw_sdk::native::library::Provided<'_>, &mut [u8], &mut [u8]) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::library::LibraryPageEnd
pub const fn paperpaw_sdk::native::library::LibraryPageEnd::generation(self) -> u32
pub const fn paperpaw_sdk::native::library::LibraryPageEnd::next(self) -> core::option::Option<paperpaw_sdk::native::library::CatalogCursor>
pub const fn paperpaw_sdk::native::library::LibraryPageEnd::total(self) -> u32
pub struct paperpaw_sdk::native::library::Position<'a>
pub paperpaw_sdk::native::library::Position::conversion: core::option::Option<u64>
pub paperpaw_sdk::native::library::Position::from_sync: bool
pub paperpaw_sdk::native::library::Position::insert: u32
pub paperpaw_sdk::native::library::Position::offset: u32
pub paperpaw_sdk::native::library::Position::progress_ppm: u32
pub paperpaw_sdk::native::library::Position::section: u32
pub paperpaw_sdk::native::library::Position::updated: u64
pub paperpaw_sdk::native::library::Position::xpointer: core::option::Option<&'a str>
pub struct paperpaw_sdk::native::library::Receipt(_)
pub const fn paperpaw_sdk::native::library::Receipt::action(&self) -> paperpaw_sdk::native::library::ReceiptAction
pub const fn paperpaw_sdk::native::library::Receipt::edit(&self) -> u32
pub const fn paperpaw_sdk::native::library::Receipt::id(&self) -> u32
pub struct paperpaw_sdk::native::library::ReceiptCursor(_)
pub const fn paperpaw_sdk::native::library::ReceiptCursor::start() -> Self
pub struct paperpaw_sdk::native::library::Transaction
pub const fn paperpaw_sdk::native::library::Transaction::edits(&self) -> u32
pub enum paperpaw_sdk::native::library::AnnotationKind
pub paperpaw_sdk::native::library::AnnotationKind::Bookmark
pub paperpaw_sdk::native::library::AnnotationKind::Highlight
pub paperpaw_sdk::native::library::AnnotationKind::Other(u32)
pub enum paperpaw_sdk::native::library::AnnotationTextKind
pub paperpaw_sdk::native::library::AnnotationTextKind::Note
pub paperpaw_sdk::native::library::AnnotationTextKind::Text
pub enum paperpaw_sdk::native::library::CatalogPhase
pub paperpaw_sdk::native::library::CatalogPhase::Empty
pub paperpaw_sdk::native::library::CatalogPhase::Failed
pub paperpaw_sdk::native::library::CatalogPhase::Ready
pub paperpaw_sdk::native::library::CatalogPhase::Unknown(u32)
pub paperpaw_sdk::native::library::CatalogPhase::Walking
pub enum paperpaw_sdk::native::library::Existing
pub paperpaw_sdk::native::library::Existing::FreeName
pub paperpaw_sdk::native::library::Existing::Refuse
pub paperpaw_sdk::native::library::Existing::Replace
pub enum paperpaw_sdk::native::library::Facet
pub paperpaw_sdk::native::library::Facet::Authors
pub paperpaw_sdk::native::library::Facet::Folders
pub paperpaw_sdk::native::library::Facet::Letters
pub paperpaw_sdk::native::library::Facet::Series
pub paperpaw_sdk::native::library::Facet::Tags
pub enum paperpaw_sdk::native::library::ReceiptAction
pub paperpaw_sdk::native::library::ReceiptAction::Added
pub paperpaw_sdk::native::library::ReceiptAction::Other(u32)
pub paperpaw_sdk::native::library::ReceiptAction::Removed
pub paperpaw_sdk::native::library::ReceiptAction::Replaced
pub paperpaw_sdk::native::library::ReceiptAction::Updated
pub enum paperpaw_sdk::native::library::Show
pub paperpaw_sdk::native::library::Show::All
pub paperpaw_sdk::native::library::Show::Favourites
pub paperpaw_sdk::native::library::Show::Finished
pub paperpaw_sdk::native::library::Show::New
pub paperpaw_sdk::native::library::Show::Opened
pub paperpaw_sdk::native::library::Show::Reading
pub paperpaw_sdk::native::library::Show::Unread
pub enum paperpaw_sdk::native::library::Sort
pub paperpaw_sdk::native::library::Sort::Added
pub paperpaw_sdk::native::library::Sort::Author
pub paperpaw_sdk::native::library::Sort::RecentlyOpened
pub paperpaw_sdk::native::library::Sort::Series
pub paperpaw_sdk::native::library::Sort::Title
pub struct paperpaw_sdk::native::library::Anchor<'a>(_)
pub const fn paperpaw_sdk::native::library::Anchor<'a>::conversion(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::library::Anchor<'a>::id(&self) -> u32
pub const fn paperpaw_sdk::native::library::Anchor<'a>::xpointers(&self) -> core::option::Option<(&'a str, &'a str)>
pub struct paperpaw_sdk::native::library::AnchorPage<'a>
pub const fn paperpaw_sdk::native::library::AnchorPage<'a>::end(&self) -> paperpaw_sdk::native::library::AnnotationPageEnd
pub const fn paperpaw_sdk::native::library::AnchorPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::AnchorPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::AnchorPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::library::Anchor<'a>> + use<'a>
pub struct paperpaw_sdk::native::library::Annotation<'a>(_)
pub const fn paperpaw_sdk::native::library::Annotation<'a>::client_key(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Annotation<'a>::conversion(self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::native::library::Annotation<'a>::has_xpointers(self) -> bool
pub const fn paperpaw_sdk::native::library::Annotation<'a>::kind(self) -> paperpaw_sdk::native::library::AnnotationKind
pub const fn paperpaw_sdk::native::library::Annotation<'a>::note_cut(self) -> bool
pub const fn paperpaw_sdk::native::library::Annotation<'a>::noted(self) -> bool
pub const fn paperpaw_sdk::native::library::Annotation<'a>::text_cut(self) -> bool
pub const fn paperpaw_sdk::native::library::Annotation<'a>::created(self) -> u64
pub const fn paperpaw_sdk::native::library::Annotation<'a>::end_offset(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::end_section(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::id(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::note(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Annotation<'a>::percent(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::start_offset(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::start_section(self) -> u32
pub const fn paperpaw_sdk::native::library::Annotation<'a>::text(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Annotation<'a>::updated(self) -> u64
pub struct paperpaw_sdk::native::library::AnnotationEdit<'a>
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::add(paperpaw_sdk::native::library::AnnotationKind, (u32, u32), (u32, u32)) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::client_key(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::conversion(self, u64) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::note(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::percent(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::remove(u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::replace(u32, paperpaw_sdk::native::library::AnnotationKind, (u32, u32), (u32, u32)) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::text(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::times(self, u64, u64) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::upsert(&'a str, paperpaw_sdk::native::library::AnnotationKind, (u32, u32), (u32, u32)) -> Self
pub const fn paperpaw_sdk::native::library::AnnotationEdit<'a>::xpointers(self, &'a str, &'a str) -> Self
pub struct paperpaw_sdk::native::library::AnnotationPage<'a>
pub const fn paperpaw_sdk::native::library::AnnotationPage<'a>::end(&self) -> paperpaw_sdk::native::library::AnnotationPageEnd
pub const fn paperpaw_sdk::native::library::AnnotationPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::AnnotationPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::AnnotationPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = core::result::Result<paperpaw_sdk::native::library::Annotation<'a>, paperpaw_sdk::native::Error>> + 'a
pub struct paperpaw_sdk::native::library::AnnotationTextPart<'a>
pub const fn paperpaw_sdk::native::library::AnnotationTextPart<'a>::next_offset(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::library::AnnotationTextPart<'a>::text(self) -> &'a str
pub const fn paperpaw_sdk::native::library::AnnotationTextPart<'a>::total(self) -> u32
pub struct paperpaw_sdk::native::library::Book<'a>(_)
pub const fn paperpaw_sdk::native::library::Book<'_>::favourite(self) -> bool
pub const fn paperpaw_sdk::native::library::Book<'_>::finished(self) -> bool
pub const fn paperpaw_sdk::native::library::Book<'_>::is_new(self) -> bool
pub const fn paperpaw_sdk::native::library::Book<'_>::opened(self) -> bool
pub fn paperpaw_sdk::native::library::Book<'_>::progress(self) -> core::option::Option<u8>
pub const fn paperpaw_sdk::native::library::Book<'_>::missing(self) -> bool
pub const fn paperpaw_sdk::native::library::Book<'a>::added(self) -> u32
pub const fn paperpaw_sdk::native::library::Book<'a>::author(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Book<'a>::fields(self) -> u32
pub const fn paperpaw_sdk::native::library::Book<'a>::format(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Book<'a>::generation(self) -> u32
pub const fn paperpaw_sdk::native::library::Book<'a>::key(self) -> u32
pub const fn paperpaw_sdk::native::library::Book<'a>::number(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Book<'a>::path(self) -> &'a str
pub fn paperpaw_sdk::native::library::Book<'a>::reference(self) -> core::result::Result<paperpaw_sdk::native::library::BookRef<'a>, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::library::Book<'a>::series(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Book<'a>::size(self) -> u64
pub const fn paperpaw_sdk::native::library::Book<'a>::tags(self) -> u32
pub const fn paperpaw_sdk::native::library::Book<'a>::title(self) -> &'a str
pub struct paperpaw_sdk::native::library::BookKey<'a>(_)
pub const fn paperpaw_sdk::native::library::BookKey<'a>::fingerprint(&self) -> &'a str
pub const fn paperpaw_sdk::native::library::BookKey<'a>::key(&self) -> &'a str
pub const fn paperpaw_sdk::native::library::BookKey<'a>::size(&self) -> u64
pub struct paperpaw_sdk::native::library::BookRef<'a>(_)
pub fn paperpaw_sdk::native::library::BookRef<'a>::catalog(u32, u32) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::BookRef<'a>::path(&'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::library::BookTextPart<'a>
pub const fn paperpaw_sdk::native::library::BookTextPart<'a>::next_offset(self) -> core::option::Option<u32>
pub const fn paperpaw_sdk::native::library::BookTextPart<'a>::text(self) -> &'a str
pub const fn paperpaw_sdk::native::library::BookTextPart<'a>::total(self) -> u32
pub struct paperpaw_sdk::native::library::DeleteReport<'a>(_)
pub const fn paperpaw_sdk::native::library::DeleteReport<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::DeleteReport<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::DeleteReport<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::library::DeleteRow<'a>> + 'a
pub struct paperpaw_sdk::native::library::DeleteRow<'a>(_)
pub const fn paperpaw_sdk::native::library::DeleteRow<'a>::has_annotations(&self) -> bool
pub const fn paperpaw_sdk::native::library::DeleteRow<'a>::has_book_data(&self) -> bool
pub const fn paperpaw_sdk::native::library::DeleteRow<'a>::has_position(&self) -> bool
pub const fn paperpaw_sdk::native::library::DeleteRow<'a>::path(&self) -> &'a str
pub fn paperpaw_sdk::native::library::DeleteRow<'a>::status(&self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::library::Entry<'a>(_)
pub const fn paperpaw_sdk::native::library::Entry<'_>::favourite(self) -> bool
pub const fn paperpaw_sdk::native::library::Entry<'_>::finished(self) -> bool
pub const fn paperpaw_sdk::native::library::Entry<'_>::is_new(self) -> bool
pub const fn paperpaw_sdk::native::library::Entry<'_>::opened(self) -> bool
pub fn paperpaw_sdk::native::library::Entry<'_>::progress(self) -> core::option::Option<u8>
pub const fn paperpaw_sdk::native::library::Entry<'a>::added(self) -> u32
pub const fn paperpaw_sdk::native::library::Entry<'a>::author(self) -> &'a str
pub fn paperpaw_sdk::native::library::Entry<'a>::badges(self) -> impl core::iter::traits::iterator::Iterator<Item = &'a str>
pub const fn paperpaw_sdk::native::library::Entry<'a>::key(self) -> u32
pub const fn paperpaw_sdk::native::library::Entry<'a>::number(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Entry<'a>::series(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Entry<'a>::title(self) -> &'a str
pub struct paperpaw_sdk::native::library::FacetPage<'a>(_)
pub const fn paperpaw_sdk::native::library::FacetPage<'a>::end(&self) -> paperpaw_sdk::native::library::LibraryPageEnd
pub const fn paperpaw_sdk::native::library::FacetPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::FacetPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::FacetPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = core::result::Result<paperpaw_sdk::native::library::FacetRow<'a>, paperpaw_sdk::native::Error>> + 'a
pub struct paperpaw_sdk::native::library::FacetRow<'a>(_)
pub const fn paperpaw_sdk::native::library::FacetRow<'a>::count(self) -> u32
pub const fn paperpaw_sdk::native::library::FacetRow<'a>::first(self) -> u32
pub const fn paperpaw_sdk::native::library::FacetRow<'a>::text(self) -> &'a str
pub struct paperpaw_sdk::native::library::Field<'a>(_)
pub const fn paperpaw_sdk::native::library::Field<'a>::id(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Field<'a>::title(self) -> &'a str
pub const fn paperpaw_sdk::native::library::Field<'a>::value(self) -> &'a str
pub struct paperpaw_sdk::native::library::FieldPage<'a>(_)
pub const fn paperpaw_sdk::native::library::FieldPage<'a>::end(&self) -> paperpaw_sdk::native::library::FieldPageEnd
pub const fn paperpaw_sdk::native::library::FieldPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::FieldPage<'a>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::FieldPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = core::result::Result<paperpaw_sdk::native::library::Field<'a>, paperpaw_sdk::native::Error>> + 'a
pub struct paperpaw_sdk::native::library::Import<'a>
pub const fn paperpaw_sdk::native::library::Import<'a>::existing(self, paperpaw_sdk::native::library::Existing) -> Self
pub const fn paperpaw_sdk::native::library::Import<'a>::folder(self, &'a str) -> Self
pub const fn paperpaw_sdk::native::library::Import<'a>::new(&'a str, &'a str) -> Self
pub struct paperpaw_sdk::native::library::LibraryPage<'a, T>
pub const fn paperpaw_sdk::native::library::LibraryPage<'a, T>::end(&self) -> paperpaw_sdk::native::library::LibraryPageEnd
pub const fn paperpaw_sdk::native::library::LibraryPage<'a, T>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::LibraryPage<'a, T>::len(&self) -> usize
pub fn paperpaw_sdk::native::library::LibraryPage<'a, T>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = core::result::Result<T, paperpaw_sdk::native::Error>> + 'a
pub fn paperpaw_sdk::native::library::LibraryPage<'_, T>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::native::library::PositionWrite<'a>
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::confirmed(self) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::conversion(self, u64) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::insert(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::new(u32, u32) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::progress_ppm(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::sync(self) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::updated(self, u64) -> Self
pub const fn paperpaw_sdk::native::library::PositionWrite<'a>::xpointer(self, &'a str) -> Self
pub struct paperpaw_sdk::native::library::Provided<'a>
pub fn paperpaw_sdk::native::library::Provided<'a>::author(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::library::Provided<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::Provided<'a>::new() -> Self
pub fn paperpaw_sdk::native::library::Provided<'a>::number(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Provided<'a>::series(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Provided<'a>::tags(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Provided<'a>::title(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub struct paperpaw_sdk::native::library::Query<'a>
pub const fn paperpaw_sdk::native::library::Query<'a>::added_since(self, u32) -> Self
pub const fn paperpaw_sdk::native::library::Query<'a>::cursor(self, paperpaw_sdk::native::library::CatalogCursor) -> Self
pub const fn paperpaw_sdk::native::library::Query<'a>::descending(self, bool) -> Self
pub const fn paperpaw_sdk::native::library::Query<'a>::exclude_archive(self, bool) -> Self
pub const fn paperpaw_sdk::native::library::Query<'a>::new() -> Self
pub fn paperpaw_sdk::native::library::Query<'a>::show(self, paperpaw_sdk::native::library::Show) -> Self
pub fn paperpaw_sdk::native::library::Query<'a>::sort(self, paperpaw_sdk::native::library::Sort) -> Self
pub fn paperpaw_sdk::native::library::Query<'a>::author(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Query<'a>::folder(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Query<'a>::series(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Query<'a>::tag(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Query<'a>::words(self, &'a str) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::library::Query<'_>::default() -> Self
pub struct paperpaw_sdk::native::library::ReceiptPage<'a>
pub const fn paperpaw_sdk::native::library::ReceiptPage<'a>::is_empty(&self) -> bool
pub const fn paperpaw_sdk::native::library::ReceiptPage<'a>::len(&self) -> usize
pub const fn paperpaw_sdk::native::library::ReceiptPage<'a>::next(&self) -> core::option::Option<paperpaw_sdk::native::library::ReceiptCursor>
pub fn paperpaw_sdk::native::library::ReceiptPage<'a>::rows(&self) -> impl core::iter::traits::iterator::Iterator<Item = paperpaw_sdk::native::library::Receipt> + use<'a>
pub const fn paperpaw_sdk::native::library::ReceiptPage<'a>::total(&self) -> u32
pub const paperpaw_sdk::native::library::MAX_DELETE_PATHS: usize
pub const paperpaw_sdk::native::library::MAX_EDITS_PER_CALL: usize
pub const paperpaw_sdk::native::library::NOTE_MAX_BYTES: usize
```
