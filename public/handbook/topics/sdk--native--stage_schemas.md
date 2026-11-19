```rust
pub struct paperpaw_sdk::native::stage_schemas::StageSchema
pub paperpaw_sdk::native::stage_schemas::StageSchema::input_tags: &'static [u32]
pub paperpaw_sdk::native::stage_schemas::StageSchema::key: &'static str
pub paperpaw_sdk::native::stage_schemas::StageSchema::major: u16
pub paperpaw_sdk::native::stage_schemas::StageSchema::max_input: usize
pub paperpaw_sdk::native::stage_schemas::StageSchema::max_reply: usize
pub paperpaw_sdk::native::stage_schemas::StageSchema::max_subscribers: usize
pub paperpaw_sdk::native::stage_schemas::StageSchema::reply_rows: usize
pub paperpaw_sdk::native::stage_schemas::StageSchema::reply_tags: &'static [u32]
pub paperpaw_sdk::native::stage_schemas::StageSchema::revision: u16
pub paperpaw_sdk::native::stage_schemas::StageSchema::test_only: bool
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::cursor: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::document: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::generation: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::insert: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::offset: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::section: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt::new(u32, u32, u32, u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::align: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::rows: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::span: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::vertical: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::width: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell::new(u32, u32, u32, u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::cursor: core::option::Option<u64>
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::generation: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::next: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::total: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd::new(u32, u32, u32, u32, core::option::Option<u64>) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::bytes: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::family: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::index: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont::new(u32, u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::source: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::text: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap::new(u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress::progress_ppm: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress::new(u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::start: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::style: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun::new(u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::index: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::length: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection::new(u32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes::flags: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes::new(u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::instance: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::width: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure::new(u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::height: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::instance: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::width: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::x: i32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::y: i32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace::new(u32, i32, i32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::height: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::min_height: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize::new(u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::height: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::target: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::width: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::x: i32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::y: i32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget::new(u32, i32, i32, u32, u32) -> Self
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::height: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::instance: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::width: u32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::x: i32
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::y: i32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::decode(&[u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets::new(u32, i32, i32, u32, u32) -> Self
pub enum paperpaw_sdk::native::stage_schemas::core_widget_v1::Record
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::WidgetMeasure(paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetMeasure)
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::WidgetPlace(paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetPlace)
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::WidgetSize(paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetSize)
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::WidgetTarget(paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTarget)
pub paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::WidgetTargets(paperpaw_sdk::native::stage_schemas::core_widget_v1::WidgetTargets)
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::Record::tag(&self) -> u32
pub struct paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk::badge: &'a str
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk::keys: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>::new(&'a str, &'a str, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue::icon: &'a str
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue::key: &'a str
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'_>) -> core::result::Result<(), i32>
pub enum paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record::BadgeAsk(paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeAsk<'a>)
pub paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record::BadgeValue(paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BadgeValue<'a>)
pub struct paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>::new(u32, u32, u32, u32, u32, u32, i32, u32, u32, u32, u32, u32, u32, u32, &'a str, u32, u32) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::align: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::dir: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::drop_cap: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::indent: i32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::kind: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::lang: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::level: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::line_height: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::margin_end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::margin_start: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::size: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::space: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::start: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::text_bytes: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock::writing_mode: u32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>::new(u32, u32, u32, u32, u32, u32, u32, u32, u32, u32, u64, &'a str, &'a [u8]) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::arg: &'a [u8]
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::conversion: u64
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::cover_side: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::cursor: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::document: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::generation: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::image_side: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::index: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::offset: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::op: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::section: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>::new(&'a [u8]) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns::weights: &'a [u8]
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>::new(&'a str, u32, u32, u32, u32, &'a [u8]) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::height: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::index: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::part: &'a [u8]
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::path: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage::width: u32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>::new(&'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang::lang: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>::new(&'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>::new(u32, u32, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink::end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink::href: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink::kind: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink::start: u32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>::new(&'a str, &'a str, &'a str, &'a str, u32, u32, u32, u32, u32, u32, u32) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::authors: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::description_bytes: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::direction: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::language: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::sections: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::series: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::series_index: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::subjects: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::title: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta::writing_mode: u32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>::new(&'a str, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption::key: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption::value: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>::new(u32, u32, u32, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby::end: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby::kind: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby::size: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby::start: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>::new(u32, u32, u32, i32, u32, u64, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::conversion: u64
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::document: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::format: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::progress_ppm: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::state: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState::status: i32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>::new(u32, u32, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText::index: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText::kind: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText::text: &'a str
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText::total: u32
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>::new(&'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>::new(u32, u32, u32, u32, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::index: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::level: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::offset: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::section: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc::title: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>::new(u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer::document: u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'_>) -> core::result::Result<(), i32>
pub enum paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtAt(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtAt)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtBlock(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtBlock<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtCall(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCall<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtCell(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtCell)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtColumns(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtColumns<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtEnd(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtEnd)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtFont(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtFont)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtImage(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtImage<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtInlineLang(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtInlineLang<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtLabel(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLabel<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtLink(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtLink<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtMap(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMap)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtMeta(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtMeta<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtOption(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtOption<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtProgress(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtProgress)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtRuby(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRuby<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtRun(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtRun)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtSection(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtSection)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtState(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtState<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtText(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtText<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtTextPart(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtTextPart<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtToc(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtToc<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtXpointer(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtXpointer<'a>)
pub paperpaw_sdk::native::stage_schemas::core_format_v1::Record::FmtYes(paperpaw_sdk::native::stage_schemas::core_format_v1::FmtYes)
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>::new(&'a [u8], u32) -> Self
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput::input: &'a [u8]
pub struct paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>::new(u32, &'a str, &'a [u8], &'a str, &'a str, &'a [u8]) -> Self
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::action: &'a str
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::input: &'a [u8]
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::key: &'a str
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::kind: u32
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::raise: &'a str
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict::value: &'a [u8]
pub struct paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'_>) -> core::result::Result<(), i32>
pub enum paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record::FilterInput(paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterInput<'a>)
pub paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record::FilterVerdict(paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FilterVerdict<'a>)
pub struct paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>::new(&'a str, &'a str, &'a str, u32) -> Self
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk::context: &'a str
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk::cursor: u32
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk::language: &'a str
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>::new(&'a str, &'a str, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry::opens: &'a str
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry::text: &'a str
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry::title: &'a str
pub enum paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record::LookupAsk(paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupAsk<'a>)
pub paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record::LookupEntry(paperpaw_sdk::native::stage_schemas::core_lookup_v1::LookupEntry<'a>)
pub struct paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>::new(u32, u32, u32, u32, &'a [u8], &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::height: u32
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::histogram: &'a [u8]
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::path: &'a str
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::place: u32
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk::width: u32
pub struct paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>::new(&'a [u8], u32) -> Self
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone::tone: &'a [u8]
pub enum paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::Record::PictureAsk(paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureAsk<'a>)
pub paperpaw_sdk::native::stage_schemas::core_picture_v1::Record::PictureTone(paperpaw_sdk::native::stage_schemas::core_picture_v1::PictureTone<'a>)
pub struct paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'_>) -> core::result::Result<(), i32>
pub enum paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'a>::tag(&self) -> u32
pub paperpaw_sdk::native::stage_schemas::core_status_v1::Record::StatusAsk(paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>)
pub paperpaw_sdk::native::stage_schemas::core_status_v1::Record::StatusValue(paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>)
pub struct paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'a>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'_>) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk<'a>::new(&'a str, &'a [u8]) -> Self
pub paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk::context: &'a [u8]
pub paperpaw_sdk::native::stage_schemas::core_status_v1::StatusAsk::items: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>::TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>::decode(&'a [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>::encode(&self, &mut [u8]) -> core::result::Result<usize, i32>
pub const fn paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue<'a>::new(&'a str, u32, &'a str) -> Self
pub paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue::flags: u32
pub paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue::item: &'a str
pub paperpaw_sdk::native::stage_schemas::core_status_v1::StatusValue::text: &'a str
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::InputWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_widget_v1::Record) -> core::result::Result<(), i32>
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'a>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'_>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'_>::len(&self) -> usize
pub type paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'a>::Item = core::result::Result<paperpaw_sdk::native::stage_schemas::core_widget_v1::Record, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'a>::next(&mut self) -> core::option::Option<Self::Item>
pub struct paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>::finish(self) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>::is_empty(&self) -> bool
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>::len(&self) -> usize
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>::new(&'w mut [u8]) -> core::result::Result<Self, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::ReplyWriter<'w>::push(&mut self, &paperpaw_sdk::native::stage_schemas::core_widget_v1::Record) -> core::result::Result<(), i32>
pub static paperpaw_sdk::native::stage_schemas::STAGES: &[paperpaw_sdk::native::stage_schemas::StageSchema]
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_BADGE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_KEYS_ITEM_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_KEYS_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_KEYS_MAX_ITEMS: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_KEYS_SEPARATOR: char
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_ASK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_VALUE_ICON_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_VALUE_KEY_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_VALUE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::BADGE_VALUE_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_book_badge_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_AT_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_BLOCK_LANG_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_BLOCK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_CALL_ARG_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_CALL_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_CALL_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_CELL_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_COLUMNS_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_COLUMNS_WEIGHTS_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_END_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_FONT_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_IMAGE_PART_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_IMAGE_PATH_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_IMAGE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_INLINE_LANG_LANG_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_INLINE_LANG_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_LABEL_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_LABEL_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_LINK_HREF_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_LINK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_MAP_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_META_LANGUAGE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_META_SERIES_INDEX_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_META_SERIES_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_META_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_META_TITLE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_OPTION_KEY_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_OPTION_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_OPTION_VALUE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_PROGRESS_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_RUBY_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_RUBY_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_RUN_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_SECTION_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_STATE_FORMAT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_STATE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TEXT_PART_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TEXT_PART_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TEXT_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TEXT_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TOC_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_TOC_TITLE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_XPOINTER_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_XPOINTER_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::FMT_YES_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::SERVICE_TAGS: &[(u32, u32)]
pub const paperpaw_sdk::native::stage_schemas::core_format_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_INPUT_INPUT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_INPUT_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_ACTION_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_INPUT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_KEY_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_RAISE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::FILTER_VERDICT_VALUE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_input_filter_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ASK_CONTEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ASK_LANGUAGE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ASK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ASK_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ENTRY_OPENS_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ENTRY_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ENTRY_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::LOOKUP_ENTRY_TITLE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::SERVICE_TAGS: &[(u32, u32)]
pub const paperpaw_sdk::native::stage_schemas::core_lookup_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PICTURE_ASK_HISTOGRAM_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PICTURE_ASK_PATH_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PICTURE_ASK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PICTURE_TONE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::PICTURE_TONE_TONE_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_picture_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_CONTEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_ITEMS_ITEM_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_ITEMS_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_ITEMS_MAX_ITEMS: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_ITEMS_SEPARATOR: char
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_ASK_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_VALUE_ITEM_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_VALUE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::STATUS_VALUE_TEXT_MAX_BYTES: usize
pub const paperpaw_sdk::native::stage_schemas::core_status_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::INPUT_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::KEY: &str
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::MAJOR: u16
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::MAX_INPUT: usize
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::MAX_REPLY: usize
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::MAX_SUBSCRIBERS: usize
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::REPLY_ROWS: usize
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::REPLY_TAGS: &[u32]
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::REVISION: u16
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::TEST_ONLY: bool
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WIDGET_MEASURE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WIDGET_PLACE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WIDGET_SIZE_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WIDGET_TARGETS_TAG: u32
pub const paperpaw_sdk::native::stage_schemas::core_widget_v1::WIDGET_TARGET_TAG: u32
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_book_badge_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_book_badge_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_book_badge_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_format_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_format_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_format_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_input_filter_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_input_filter_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_input_filter_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_lookup_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_lookup_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_lookup_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_picture_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_picture_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_picture_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_status_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_status_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_status_v1::Record<'_>], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::input_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::input_encode(&[paperpaw_sdk::native::stage_schemas::core_widget_v1::Record], &mut [u8]) -> core::result::Result<usize, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::reply_decode(&[u8]) -> core::result::Result<paperpaw_sdk::native::stage_schemas::core_widget_v1::RecordStream<'_>, i32>
pub fn paperpaw_sdk::native::stage_schemas::core_widget_v1::reply_encode(&[paperpaw_sdk::native::stage_schemas::core_widget_v1::Record], &mut [u8]) -> core::result::Result<usize, i32>
pub mod paperpaw_sdk::native::stage_schemas::core_book_badge_v1
pub mod paperpaw_sdk::native::stage_schemas::core_format_v1
pub mod paperpaw_sdk::native::stage_schemas::core_input_filter_v1
pub mod paperpaw_sdk::native::stage_schemas::core_lookup_v1
pub mod paperpaw_sdk::native::stage_schemas::core_picture_v1
pub mod paperpaw_sdk::native::stage_schemas::core_status_v1
pub mod paperpaw_sdk::native::stage_schemas::core_widget_v1
```
