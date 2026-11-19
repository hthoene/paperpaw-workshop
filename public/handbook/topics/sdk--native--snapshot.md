```rust
pub struct paperpaw_sdk::native::snapshot::Snapshot
pub const fn paperpaw_sdk::native::snapshot::Snapshot::battery_millivolts(&self) -> core::option::Option<u16>
pub const fn paperpaw_sdk::native::snapshot::Snapshot::battery_percent(&self) -> core::option::Option<u8>
pub const fn paperpaw_sdk::native::snapshot::Snapshot::display_dpi(&self) -> u16
pub const fn paperpaw_sdk::native::snapshot::Snapshot::display_gray_levels(&self) -> core::option::Option<u16>
pub const fn paperpaw_sdk::native::snapshot::Snapshot::display_height(&self) -> u16
pub const fn paperpaw_sdk::native::snapshot::Snapshot::display_is_colour(&self) -> bool
pub const fn paperpaw_sdk::native::snapshot::Snapshot::display_width(&self) -> u16
pub const fn paperpaw_sdk::native::snapshot::Snapshot::has_touch(&self) -> bool
pub const fn paperpaw_sdk::native::snapshot::Snapshot::hints_shown(&self) -> bool
pub const fn paperpaw_sdk::native::snapshot::Snapshot::instant(&self) -> paperpaw_platform::input::Instant
pub const fn paperpaw_sdk::native::snapshot::Snapshot::is_charging(&self) -> bool
pub const fn paperpaw_sdk::native::snapshot::Snapshot::is_power_saving(&self) -> bool
pub const fn paperpaw_sdk::native::snapshot::Snapshot::unix_seconds(&self) -> core::option::Option<i64>
pub const fn paperpaw_sdk::native::snapshot::Snapshot::utc_offset_minutes(&self) -> core::option::Option<i16>
pub fn paperpaw_sdk::native::snapshot::capture_snapshot(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<paperpaw_sdk::native::snapshot::Snapshot, paperpaw_sdk::native::Error>
```
