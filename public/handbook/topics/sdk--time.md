```rust
pub struct paperpaw_sdk::time::Clock
pub const paperpaw_sdk::time::Clock::NONE: Self
pub fn paperpaw_sdk::time::Clock::micros(&self) -> core::option::Option<u64>
pub const fn paperpaw_sdk::time::Clock::new(fn() -> u64) -> Self
pub fn paperpaw_sdk::time::Clock::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::time::Date
pub paperpaw_sdk::time::Date::day: u8
pub paperpaw_sdk::time::Date::month: u8
pub paperpaw_sdk::time::Date::year: i32
pub const fn paperpaw_sdk::time::Date::day(&self) -> u8
pub const fn paperpaw_sdk::time::Date::month(&self) -> u8
pub const fn paperpaw_sdk::time::Date::new(i32, u8, u8) -> Self
pub const fn paperpaw_sdk::time::Date::year(&self) -> i32
pub struct paperpaw_sdk::time::LocalTime
pub paperpaw_sdk::time::LocalTime::day: u8
pub paperpaw_sdk::time::LocalTime::hour: u8
pub paperpaw_sdk::time::LocalTime::minute: u8
pub paperpaw_sdk::time::LocalTime::month: u8
pub paperpaw_sdk::time::LocalTime::offset: i32
pub paperpaw_sdk::time::LocalTime::second: u8
pub paperpaw_sdk::time::LocalTime::weekday: u8
pub paperpaw_sdk::time::LocalTime::year: i32
pub fn paperpaw_sdk::time::LocalTime::from_seconds(i64) -> Self
pub fn paperpaw_sdk::time::LocalTime::from_unix(paperpaw_sdk::time::UnixTime, i32) -> Self
pub fn paperpaw_sdk::time::LocalTime::new(i32, u8, u8, u8, u8, u8) -> Self
pub fn paperpaw_sdk::time::LocalTime::to_seconds(&self) -> i64
pub fn paperpaw_sdk::time::LocalTime::unix(&self) -> paperpaw_sdk::time::UnixTime
pub const fn paperpaw_sdk::time::LocalTime::with_offset(self, i32) -> Self
pub struct paperpaw_sdk::time::Time
pub paperpaw_sdk::time::Time::hour: u8
pub paperpaw_sdk::time::Time::minute: u8
pub paperpaw_sdk::time::Time::second: u8
pub const fn paperpaw_sdk::time::Time::hour(&self) -> u8
pub const fn paperpaw_sdk::time::Time::minute(&self) -> u8
pub const fn paperpaw_sdk::time::Time::new(u8, u8) -> Self
pub const fn paperpaw_sdk::time::Time::second(&self) -> u8
pub const fn paperpaw_sdk::time::Time::with_second(self, u8) -> Self
pub struct paperpaw_sdk::time::TimeZone
pub fn paperpaw_sdk::time::TimeZone::offset_at(&self, i64) -> i32
pub fn paperpaw_sdk::time::TimeZone::parse(&str) -> core::option::Option<paperpaw_sdk::time::TimeZone>
pub struct paperpaw_sdk::time::UnixTime(_)
pub const fn paperpaw_sdk::time::UnixTime::from_millis(i64) -> Self
pub const fn paperpaw_sdk::time::UnixTime::from_secs(i64) -> Self
pub fn paperpaw_sdk::time::UnixTime::iso8601(self) -> alloc::string::String
pub fn paperpaw_sdk::time::UnixTime::local(self, i32) -> paperpaw_sdk::time::LocalTime
pub const fn paperpaw_sdk::time::UnixTime::millis(self) -> i64
pub fn paperpaw_sdk::time::UnixTime::now(&paperpaw_sdk::Env<'_>) -> core::option::Option<Self>
pub fn paperpaw_sdk::time::UnixTime::parse_http_date(&str) -> core::option::Option<Self>
pub fn paperpaw_sdk::time::UnixTime::parse_iso8601(&str) -> core::option::Option<Self>
pub const fn paperpaw_sdk::time::UnixTime::secs(self) -> i64
pub const paperpaw_sdk::time::AUTO: &str
pub const paperpaw_sdk::time::CLOCK_12H: &str
pub const paperpaw_sdk::time::CLOCK_24H: &str
pub const paperpaw_sdk::time::TIME_ZONES: &[(&str, &str)]
pub const paperpaw_sdk::time::WEEK_STARTS: &[&str]
pub fn paperpaw_sdk::time::civil_from_days(i64) -> (i32, u8, u8)
pub fn paperpaw_sdk::time::clock_of(&paperpaw_sdk::Env<'_>, u8, u8) -> alloc::string::String
pub fn paperpaw_sdk::time::clock_text(&paperpaw_sdk::Env<'_>) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::time::date_text(&paperpaw_sdk::Env<'_>) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::time::day_of_year(i32, u8, u8) -> u16
pub fn paperpaw_sdk::time::days_from_civil(i32, u8, u8) -> i64
pub fn paperpaw_sdk::time::days_in_month(i32, u8) -> u8
pub fn paperpaw_sdk::time::days_in_year(i32) -> u16
pub fn paperpaw_sdk::time::duration_text(&paperpaw_sdk::Env<'_>, u64) -> alloc::string::String
pub fn paperpaw_sdk::time::is_leap(i32) -> bool
pub fn paperpaw_sdk::time::iso_week(i32, u8, u8) -> u8
pub fn paperpaw_sdk::time::local_seconds(&paperpaw_sdk::Env<'_>, i64) -> i64
pub fn paperpaw_sdk::time::local_time(&paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_sdk::time::LocalTime>
pub fn paperpaw_sdk::time::next_minute(&paperpaw_sdk::Env<'_>) -> core::option::Option<paperpaw_platform::input::Instant>
pub fn paperpaw_sdk::time::short_date_text(&paperpaw_sdk::Env<'_>) -> core::option::Option<alloc::string::String>
pub fn paperpaw_sdk::time::twelve_hours(&paperpaw_sdk::Env<'_>) -> bool
pub fn paperpaw_sdk::time::unix_seconds(&paperpaw_sdk::Env<'_>) -> core::option::Option<i64>
pub fn paperpaw_sdk::time::week_start(&paperpaw_sdk::Env<'_>) -> u8
pub fn paperpaw_sdk::time::weekday(i32, u8, u8) -> u8
pub fn paperpaw_sdk::time::weekday_of(i64) -> u8
```
