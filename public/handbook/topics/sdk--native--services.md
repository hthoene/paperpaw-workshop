```rust
pub struct paperpaw_sdk::native::services::PageEnd
pub paperpaw_sdk::native::services::PageEnd::generation: u32
pub paperpaw_sdk::native::services::PageEnd::left_out: bool
pub paperpaw_sdk::native::services::PageEnd::next: u32
pub paperpaw_sdk::native::services::PageEnd::total: u32
pub paperpaw_sdk::native::services::PageEnd::truncated: bool
pub struct paperpaw_sdk::native::services::Service
pub fn paperpaw_sdk::native::services::Service::call(&self, &paperpaw_sdk::native::Host<'_>, u32, &[u8], &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::Service::has_op(&self, u32) -> bool
pub fn paperpaw_sdk::native::services::Service::max_reply(&self, u32) -> core::option::Option<usize>
pub fn paperpaw_sdk::native::services::Service::open(&paperpaw_sdk::native::Host<'_>, &str, u16, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::Service::open_newest(&paperpaw_sdk::native::Host<'_>, &str, u16) -> core::result::Result<Self, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::Service::release(self, &paperpaw_sdk::native::Host<'_>) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub const fn paperpaw_sdk::native::services::Service::revision(&self) -> u16
pub struct paperpaw_sdk::native::services::ServicePluginUsage<'a>
pub paperpaw_sdk::native::services::ServicePluginUsage::awake_ms: u64
pub paperpaw_sdk::native::services::ServicePluginUsage::awake_reason: &'a str
pub paperpaw_sdk::native::services::ServicePluginUsage::busy_us: u64
pub paperpaw_sdk::native::services::ServicePluginUsage::calls: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::fast: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::full: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::partial: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::pixels: u64
pub paperpaw_sdk::native::services::ServicePluginUsage::plugin: &'a str
pub paperpaw_sdk::native::services::ServicePluginUsage::read: u64
pub paperpaw_sdk::native::services::ServicePluginUsage::refused: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::requests: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::shown_ms: u64
pub paperpaw_sdk::native::services::ServicePluginUsage::syncs: u32
pub paperpaw_sdk::native::services::ServicePluginUsage::written: u64
pub struct paperpaw_sdk::native::services::ServiceUsage
pub paperpaw_sdk::native::services::ServiceUsage::bluetooth_ms: u64
pub paperpaw_sdk::native::services::ServiceUsage::fast: u32
pub paperpaw_sdk::native::services::ServiceUsage::full: u32
pub paperpaw_sdk::native::services::ServiceUsage::inputs: u32
pub paperpaw_sdk::native::services::ServiceUsage::panel_ms: u64
pub paperpaw_sdk::native::services::ServiceUsage::partial: u32
pub paperpaw_sdk::native::services::ServiceUsage::pixels: u64
pub paperpaw_sdk::native::services::ServiceUsage::sleeps: u32
pub struct paperpaw_sdk::native::services::Blob<'cb>
pub fn paperpaw_sdk::native::services::Blob<'_>::read(&self, u64, &mut [u8]) -> core::result::Result<usize, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::Blob<'_>::release(self) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::Blob<'_>::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub fn paperpaw_sdk::native::services::Blob<'_>::drop(&mut self)
pub fn paperpaw_sdk::native::services::device_usage(&paperpaw_sdk::native::Host<'_>) -> core::result::Result<paperpaw_sdk::native::services::ServiceUsage, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::for_each_plugin_usage(&paperpaw_sdk::native::Host<'_>, &mut dyn core::ops::function::FnMut(&paperpaw_sdk::native::services::ServicePluginUsage<'_>)) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::plugin_name(&paperpaw_sdk::native::Host<'_>, &str, impl core::ops::function::FnOnce(&str)) -> core::result::Result<(), paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::plugin_usage_page(&paperpaw_sdk::native::Host<'_>, u32, &mut dyn core::ops::function::FnMut(&paperpaw_sdk::native::services::ServicePluginUsage<'_>)) -> core::result::Result<paperpaw_sdk::native::services::PageEnd, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::query<'cb>(&'cb paperpaw_sdk::native::Host<'cb>, &str, u16, u16) -> core::result::Result<paperpaw_sdk::native::services::Blob<'cb>, paperpaw_sdk::native::Error>
pub fn paperpaw_sdk::native::services::work_note(&paperpaw_sdk::native::Host<'_>, &str, impl core::ops::function::FnOnce(u64, &str)) -> core::result::Result<(), paperpaw_sdk::native::Error>
```
