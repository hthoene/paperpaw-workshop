```rust
pub struct paperpaw_sdk::semantics::Part
pub paperpaw_sdk::semantics::Part::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::semantics::Part::disabled: bool
pub paperpaw_sdk::semantics::Part::focused: bool
pub paperpaw_sdk::semantics::Part::label: alloc::string::String
pub paperpaw_sdk::semantics::Part::on: core::option::Option<bool>
pub paperpaw_sdk::semantics::Part::role: paperpaw_graphics::canvas::Role
pub fn paperpaw_sdk::semantics::Part::disabled(self, bool) -> Self
pub fn paperpaw_sdk::semantics::Part::focused(self, bool) -> Self
pub fn paperpaw_sdk::semantics::Part::new(paperpaw_graphics::canvas::Role, impl core::convert::Into<alloc::string::String>, paperpaw_platform::geometry::Rect) -> Self
pub fn paperpaw_sdk::semantics::Part::on(self, core::option::Option<bool>) -> Self
pub use paperpaw_sdk::semantics::Described
pub use paperpaw_sdk::semantics::Role
pub fn paperpaw_sdk::semantics::find<'a>(&'a [paperpaw_sdk::semantics::Part], &str) -> core::option::Option<&'a paperpaw_sdk::semantics::Part>
pub fn paperpaw_sdk::semantics::focused(&[paperpaw_sdk::semantics::Part]) -> core::option::Option<&paperpaw_sdk::semantics::Part>
pub fn paperpaw_sdk::semantics::role_name(paperpaw_graphics::canvas::Role) -> &'static str
```
