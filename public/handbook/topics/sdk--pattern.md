```rust
pub paperpaw_sdk::pattern::PatternError::Syntax(usize)
pub paperpaw_sdk::pattern::PatternError::TooLong
pub paperpaw_sdk::pattern::PatternError::TooManyRepeats
pub fn paperpaw_sdk::pattern::PatternError::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::pattern::Matches<'p, 't>
pub type paperpaw_sdk::pattern::Matches<'_, '_>::Item = (usize, usize)
pub fn paperpaw_sdk::pattern::Matches<'_, '_>::next(&mut self) -> core::option::Option<(usize, usize)>
pub struct paperpaw_sdk::pattern::Pattern
pub fn paperpaw_sdk::pattern::Pattern::as_str(&self) -> &str
pub fn paperpaw_sdk::pattern::Pattern::find_iter<'p, 't>(&'p self, &'t str) -> paperpaw_sdk::pattern::Matches<'p, 't>
pub fn paperpaw_sdk::pattern::Pattern::is_match(&self, &str) -> bool
pub fn paperpaw_sdk::pattern::Pattern::new(&str) -> core::result::Result<paperpaw_sdk::pattern::Pattern, paperpaw_sdk::pattern::PatternError>
pub const paperpaw_sdk::pattern::MAX_PATTERN: usize
pub const paperpaw_sdk::pattern::MAX_REPEAT: u32
```
