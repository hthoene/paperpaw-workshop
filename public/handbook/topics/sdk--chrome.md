```rust
pub paperpaw_sdk::chrome::Edge::Bottom
pub paperpaw_sdk::chrome::Edge::Left
pub paperpaw_sdk::chrome::Edge::Right
pub paperpaw_sdk::chrome::Edge::Top
pub paperpaw_sdk::chrome::ChromeSpec::edge: paperpaw_sdk::chrome::Edge
pub paperpaw_sdk::chrome::ChromeSpec::factory: paperpaw_sdk::ScreenFactory
pub paperpaw_sdk::chrome::ChromeSpec::id: paperpaw_sdk::Id
pub paperpaw_sdk::chrome::ChromeSpec::need: core::option::Option<paperpaw_sdk::MenuNeed>
pub paperpaw_sdk::chrome::ChromeSpec::priority: paperpaw_sdk::Priority
pub paperpaw_sdk::chrome::ChromeSpec::shown: fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::StackEntry) -> bool
pub paperpaw_sdk::chrome::ChromeSpec::size: fn(&paperpaw_sdk::Env<'_>) -> u16
pub fn paperpaw_sdk::chrome::ChromeSpec::need(self, paperpaw_sdk::MenuNeed) -> Self
pub fn paperpaw_sdk::chrome::ChromeSpec::new(paperpaw_sdk::Id, paperpaw_sdk::chrome::Edge, paperpaw_sdk::ScreenFactory) -> Self
pub fn paperpaw_sdk::chrome::ChromeSpec::priority(self, paperpaw_sdk::Priority) -> Self
pub fn paperpaw_sdk::chrome::ChromeSpec::shown(self, fn(&paperpaw_sdk::Env<'_>, &paperpaw_sdk::StackEntry) -> bool) -> Self
pub fn paperpaw_sdk::chrome::ChromeSpec::size(self, fn(&paperpaw_sdk::Env<'_>) -> u16) -> Self
pub fn paperpaw_sdk::chrome::ChromeSpec::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
```
