```rust
pub struct paperpaw_sdk::memory::Memory
pub const paperpaw_sdk::memory::Memory::NONE: Self
pub const fn paperpaw_sdk::memory::Memory::new(fn() -> core::option::Option<paperpaw_sdk::memory::MemoryUse>) -> Self
pub fn paperpaw_sdk::memory::Memory::read(&self) -> core::option::Option<paperpaw_sdk::memory::MemoryUse>
pub fn paperpaw_sdk::memory::Memory::fmt(&self, &mut core::fmt::Formatter<'_>) -> core::fmt::Result
pub struct paperpaw_sdk::memory::MemoryRegion
pub paperpaw_sdk::memory::MemoryRegion::external: bool
pub paperpaw_sdk::memory::MemoryRegion::free: u32
pub paperpaw_sdk::memory::MemoryRegion::size: u32
pub const fn paperpaw_sdk::memory::MemoryRegion::external(self) -> Self
pub const fn paperpaw_sdk::memory::MemoryRegion::new(u32, u32) -> Self
pub struct paperpaw_sdk::memory::MemoryUse
pub paperpaw_sdk::memory::MemoryUse::heap_free: u32
pub paperpaw_sdk::memory::MemoryUse::heap_size: u32
pub paperpaw_sdk::memory::MemoryUse::largest_free: core::option::Option<u32>
pub paperpaw_sdk::memory::MemoryUse::regions: [core::option::Option<paperpaw_sdk::memory::MemoryRegion>; 3]
pub paperpaw_sdk::memory::MemoryUse::stack_free: core::option::Option<u32>
pub paperpaw_sdk::memory::MemoryUse::stack_size: core::option::Option<u32>
pub const fn paperpaw_sdk::memory::MemoryUse::new(u32, u32) -> Self
pub const fn paperpaw_sdk::memory::MemoryUse::with_largest_free(self, u32) -> Self
pub fn paperpaw_sdk::memory::MemoryUse::with_region(self, paperpaw_sdk::memory::MemoryRegion) -> Self
pub const fn paperpaw_sdk::memory::MemoryUse::with_stack(self, u32, u32) -> Self
```
