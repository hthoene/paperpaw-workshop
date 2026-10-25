```rust
pub struct paperpaw_sdk::usage::PluginUsage
pub paperpaw_sdk::usage::PluginUsage::awake_ms: u64
pub paperpaw_sdk::usage::PluginUsage::awake_reason: alloc::borrow::Cow<'static, str>
pub paperpaw_sdk::usage::PluginUsage::busy_us: u64
pub paperpaw_sdk::usage::PluginUsage::calls: u32
pub paperpaw_sdk::usage::PluginUsage::pixels: u64
pub paperpaw_sdk::usage::PluginUsage::plugin: paperpaw_sdk::Id
pub paperpaw_sdk::usage::PluginUsage::read: u64
pub paperpaw_sdk::usage::PluginUsage::refreshes: paperpaw_sdk::usage::Refreshes
pub paperpaw_sdk::usage::PluginUsage::refused: u32
pub paperpaw_sdk::usage::PluginUsage::requests: u32
pub paperpaw_sdk::usage::PluginUsage::shown_ms: u64
pub paperpaw_sdk::usage::PluginUsage::written: u64
pub fn paperpaw_sdk::usage::PluginUsage::new(paperpaw_sdk::Id) -> Self
pub fn paperpaw_sdk::usage::PluginUsage::default() -> Self
pub struct paperpaw_sdk::usage::Refreshes
pub paperpaw_sdk::usage::Refreshes::fast: u32
pub paperpaw_sdk::usage::Refreshes::full: u32
pub paperpaw_sdk::usage::Refreshes::partial: u32
pub const fn paperpaw_sdk::usage::Refreshes::new(u32, u32, u32) -> Self
pub fn paperpaw_sdk::usage::Refreshes::total(&self) -> u32
pub struct paperpaw_sdk::usage::Usage
pub paperpaw_sdk::usage::Usage::bluetooth_ms: u64
pub paperpaw_sdk::usage::Usage::inputs: u32
pub paperpaw_sdk::usage::Usage::panel_ms: u64
pub paperpaw_sdk::usage::Usage::pixels: u64
pub paperpaw_sdk::usage::Usage::refreshes: paperpaw_sdk::usage::Refreshes
pub paperpaw_sdk::usage::Usage::sleeps: u32
pub fn paperpaw_sdk::usage::Usage::total_refreshes(&self) -> u32
```
