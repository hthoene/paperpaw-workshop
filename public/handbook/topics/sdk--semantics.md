```rust
pub struct paperpaw_sdk::semantics::Part
pub paperpaw_sdk::semantics::Part::area: paperpaw_platform::geometry::Rect
pub paperpaw_sdk::semantics::Part::focused: bool
pub paperpaw_sdk::semantics::Part::label: alloc::string::String
pub paperpaw_sdk::semantics::Part::on: core::option::Option<bool>
pub paperpaw_sdk::semantics::Part::role: paperpaw_graphics::canvas::Role
pub use paperpaw_sdk::semantics::Described
pub use paperpaw_sdk::semantics::Role
pub fn paperpaw_sdk::semantics::find<'a>(&'a [paperpaw_sdk::semantics::Part], &str) -> core::option::Option<&'a paperpaw_sdk::semantics::Part>
pub fn paperpaw_sdk::semantics::focused(&[paperpaw_sdk::semantics::Part]) -> core::option::Option<&paperpaw_sdk::semantics::Part>
pub fn paperpaw_sdk::semantics::parts(alloc::vec::Vec<paperpaw_graphics::canvas::Described>) -> alloc::vec::Vec<paperpaw_sdk::semantics::Part>
pub fn paperpaw_sdk::semantics::role_name(paperpaw_graphics::canvas::Role) -> &'static str
```
