```rust
pub struct paperpaw_sdk::native::keys::Revocation
pub paperpaw_sdk::native::keys::Revocation::key: [u8; 32]
pub paperpaw_sdk::native::keys::Revocation::plugin: alloc::string::String
pub paperpaw_sdk::native::keys::Revocation::signature: [u8; 64]
pub fn paperpaw_sdk::native::keys::Revocation::new(impl core::convert::Into<alloc::string::String>, [u8; 32], [u8; 64]) -> Self
pub enum paperpaw_sdk::native::keys::RevokedError
pub paperpaw_sdk::native::keys::RevokedError::Full
pub paperpaw_sdk::native::keys::RevokedError::NotKept
pub enum paperpaw_sdk::native::keys::RotationError
pub paperpaw_sdk::native::keys::RotationError::BadSignature
pub paperpaw_sdk::native::keys::RotationError::NoAuthor
pub paperpaw_sdk::native::keys::RotationError::NoRecoveryKey
pub paperpaw_sdk::native::keys::RotationError::NotKept
pub paperpaw_sdk::native::keys::RotationError::Refused
pub const paperpaw_sdk::native::keys::MAX_REVOKED: usize
pub fn paperpaw_sdk::native::keys::accept_rotation(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32], &[u8; 64]) -> core::result::Result<(), paperpaw_sdk::native::keys::RotationError>
pub fn paperpaw_sdk::native::keys::check_rotation(&dyn paperpaw_platform::storage::Storage, &str, &[u8; 32], &[u8; 64]) -> core::result::Result<(), paperpaw_sdk::native::keys::RotationError>
pub fn paperpaw_sdk::native::keys::is_revoked(&dyn paperpaw_platform::storage::Storage, &str) -> bool
pub fn paperpaw_sdk::native::keys::keep_revoked(&dyn paperpaw_platform::storage::Storage, &[paperpaw_sdk::native::keys::Revocation]) -> core::result::Result<(), paperpaw_sdk::native::keys::RevokedError>
pub fn paperpaw_sdk::native::keys::known_recovery(&dyn paperpaw_platform::storage::Storage, &str) -> core::option::Option<[u8; 32]>
pub fn paperpaw_sdk::native::keys::revocation_message(&str, &[u8; 32]) -> alloc::string::String
pub fn paperpaw_sdk::native::keys::revoked(&dyn paperpaw_platform::storage::Storage) -> alloc::vec::Vec<paperpaw_sdk::native::keys::Revocation>
pub fn paperpaw_sdk::native::keys::rotation_message(&str, &[u8; 32], &[u8; 32]) -> alloc::string::String
```
